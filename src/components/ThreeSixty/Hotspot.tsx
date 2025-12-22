"use client";

import { useState, useRef, useEffect } from "react";
import { Billboard, Circle, Ring, Text, useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface HotspotProps {
  title: string;
  position: [number, number, number];
  isSelected?: boolean;
  isPositioningMode?: boolean;
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

function projectToSphere(point: THREE.Vector3, radius: number): THREE.Vector3 {
  const length = point.length();
  if (length === 0) return new THREE.Vector3(0, 0, -radius);
  return point.clone().multiplyScalar(radius / length);
}

export default function Hotspot({
  title,
  position,
  isSelected,
  isPositioningMode = false,
  onDrag,
  onClick,
}: HotspotProps) {
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const ringRef = useRef<THREE.MeshBasicMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const isDraggingRef = useRef(false);
  const lastPropPosition = useRef<[number, number, number]>([...position]);
  const { camera, raycaster, pointer } = useThree();

  const canDrag = isPositioningMode && isSelected;

  useCursor(hovered && !!canDrag, "grab");
  useCursor(isDragging, "grabbing");

  useEffect(() => {
    if (!groupRef.current || isDraggingRef.current) return;
    
    const positionChanged =
      lastPropPosition.current[0] !== position[0] ||
      lastPropPosition.current[1] !== position[1] ||
      lastPropPosition.current[2] !== position[2];
    
    if (positionChanged) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      lastPropPosition.current = [...position];
    }
  }, [position[0], position[1], position[2]]);

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

    if (isDraggingRef.current && groupRef.current) {
      raycaster.setFromCamera(pointer, camera);
      const direction = raycaster.ray.direction.clone();
      const newPosition = projectToSphere(direction, SPHERE_RADIUS);
      
      groupRef.current.position.copy(newPosition);
      
      lastPropPosition.current = [newPosition.x, newPosition.y, newPosition.z];
      
      onDrag?.({
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
      });
    }
  });

  const handlePointerDown = (e: any) => {
    if (!canDrag) return;
    e.stopPropagation?.();
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current && groupRef.current) {
      const finalPos = groupRef.current.position;
      lastPropPosition.current = [finalPos.x, finalPos.y, finalPos.z];
      
      onDrag?.({
        x: finalPos.x,
        y: finalPos.y,
        z: finalPos.z,
      });
      
      isDraggingRef.current = false;
      setIsDragging(false);
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
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
