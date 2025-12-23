"use client";

import { useState, useRef, useEffect } from "react";
import { Billboard, Circle, Ring, Text, useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface HotspotProps {
  title: string;
  position: [number, number, number];
  isSelected?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrag?: (position: { x: number; y: number; z: number }) => void;
  onClick?: () => void;
}

function AnimatedText({ hovered, title }: { hovered: boolean; title: string }) {
  const animatedY = useRef(0.2);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!hovered && Math.abs(animatedY.current - 0.2) < 0.001) return;

    const speed = 8;
    const targetY = hovered ? 0.32 : 0.2;

    animatedY.current = THREE.MathUtils.lerp(
      animatedY.current,
      targetY,
      delta * speed
    );

    if (groupRef.current) {
      groupRef.current.position.y = animatedY.current;
    }
  });

  if (!hovered) return null;

  return (
    <group ref={groupRef} position={[0, animatedY.current, 0]}>
      <Text fontSize={0.18} color="white" anchorX="center" anchorY="middle">
        {title}
      </Text>
    </group>
  );
}

const SPHERE_RADIUS = 4;

function projectToSphere(direction: THREE.Vector3, radius: number): THREE.Vector3 {
  return direction.clone().normalize().multiplyScalar(radius);
}

export default function Hotspot({
  title,
  position,
  isSelected,
  onDragStart,
  onDragEnd,
  onDrag,
  onClick,
}: HotspotProps) {
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const ringRef = useRef<THREE.MeshBasicMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const isDraggingRef = useRef(false);
  const { camera, raycaster, pointer, gl } = useThree();

  const canDrag = isSelected;

  useCursor(hovered && !!canDrag, "grab");
  useCursor(isDragging, "grabbing");

  useEffect(() => {
    if (!canDrag) return;

    const canvas = gl.domElement;

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !groupRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const newPosition = projectToSphere(raycaster.ray.direction, SPHERE_RADIUS);

      groupRef.current.position.copy(newPosition);

      onDrag?.({
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
      });
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDraggingRef.current && groupRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        canvas.style.cursor = "";
        canvas.releasePointerCapture(e.pointerId);
        
        const finalPos = groupRef.current.position;
        onDrag?.({
          x: finalPos.x,
          y: finalPos.y,
          z: finalPos.z,
        });
        onDragEnd?.();
      }
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
    };
  }, [canDrag, camera, raycaster, gl, onDrag, onDragEnd]);

  const getOuterRingColor = () => {
    if (isDragging) return "#22c55e";
    if (isSelected) return "#3b82f6";
    if (hovered) return "#b0b0b0";
    return "#909090";
  };

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 3) * 0.3 + 0.7;
      ringRef.current.opacity = pulse;
    }
  });

  const handlePointerDown = (e: any) => {
    if (!canDrag) return;
    e.stopPropagation();
    isDraggingRef.current = true;
    setIsDragging(true);
    gl.domElement.style.cursor = "grabbing";
    gl.domElement.setPointerCapture(e.pointerId);
    onDragStart?.();
  };

  return (
    <group ref={groupRef} position={position}>
      <Billboard>
        <Ring
          args={[0.16, 0.18, 64]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => !isDragging && setHovered(false)}
          onPointerDown={handlePointerDown}
          onClick={onClick}
        >
          <meshBasicMaterial
            ref={ringRef}
            color={getOuterRingColor()}
            transparent
            opacity={1}
            toneMapped={false}
          />
        </Ring>
        <Ring
          args={[0.08, 0.16, 64]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => !isDragging && setHovered(false)}
          onPointerDown={handlePointerDown}
          onClick={onClick}
        >
          <meshBasicMaterial
            color="#505050"
            transparent
            opacity={0.65}
            toneMapped={false}
          />
        </Ring>
        <Circle
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => !isDragging && setHovered(false)}
          onPointerDown={handlePointerDown}
          onClick={onClick}
          args={[0.08, 64]}
        >
          <meshBasicMaterial
            color={hovered ? "#ffffff" : "#e8e8e8"}
            transparent
            opacity={0.95}
            toneMapped={false}
          />
        </Circle>
        <AnimatedText hovered={hovered || isDragging} title={title} />
      </Billboard>
    </group>
  );
}
