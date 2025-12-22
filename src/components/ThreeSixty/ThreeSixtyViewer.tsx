"use client";

import { useRef, useState, Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Scene, WebGLRenderer, Color } from "three";
import ThreeSixtyImageMesh from "./ThreeSixtyImageMesh";
import Hotspot from "./Hotspot";
import { HotspotData } from "@/types/hotspot";

const VIEWER_CONSTANTS = {
  CAMERA_FOV: 75,
  CAMERA_NEAR: 0.1,
  CAMERA_FAR: 1000,
  CURSOR_STYLE: "grab",
  CURSOR_GRABBING_STYLE: "grabbing",
  BLACK_COLOUR: new Color(0x000000),
};

interface ThreeSixtyViewerProps {
  imageUrl: string;
  hotspots?: HotspotData[];
  selectedHotspotId?: string | null;
  onHotspotClick?: (hotspot: HotspotData) => void;
  onHotspotDrag?: (hotspotId: string, position: { x: number; y: number; z: number }) => void;
}

const convertToSpherePosition = (
  x: number,
  y: number,
  z: number,
  radius = 4
): [number, number, number] => {
  const imageWidth = 6000;
  const imageHeight = 3000;

  const isPixelCoordinate = x > imageWidth * 0.01 || y > imageHeight * 0.01;

  if (!isPixelCoordinate && x !== 0 && y !== 0 && z !== 0) {
    const length = Math.sqrt(x * x + y * y + z * z);
    if (length === 0) return [0, 0, -radius];
    const scale = radius / length;
    return [x * scale, y * scale, z * scale];
  }

  const theta = (x / imageWidth) * 2 * Math.PI - Math.PI;
  const phi = (y / imageHeight) * Math.PI;

  const sphereX = radius * Math.sin(phi) * Math.sin(theta);
  const sphereY = radius * Math.cos(phi);
  const sphereZ = -radius * Math.sin(phi) * Math.cos(theta);

  return [sphereX, sphereY, sphereZ];
};

export default function ThreeSixtyViewer({
  imageUrl,
  hotspots = [],
  selectedHotspotId,
  onHotspotClick,
  onHotspotDrag,
}: ThreeSixtyViewerProps) {
  const aspectRatioRef = useRef(0);
  const [cursorStyle, setCursorStyle] = useState(VIEWER_CONSTANTS.CURSOR_STYLE);
  const [isDraggingHotspot, setIsDraggingHotspot] = useState(false);

  const onPointerDown = () => {
    setCursorStyle(VIEWER_CONSTANTS.CURSOR_GRABBING_STYLE);
  };

  const onPointerUp = () => {
    setCursorStyle(VIEWER_CONSTANTS.CURSOR_STYLE);
  };

  const onCanvasCreated = ({
    gl,
    scene,
  }: {
    gl: WebGLRenderer;
    scene: Scene;
  }) => {
    scene.background = VIEWER_CONSTANTS.BLACK_COLOUR;
    gl.setClearColor(VIEWER_CONSTANTS.BLACK_COLOUR);

    gl.domElement.addEventListener("mousedown", onPointerDown);
    gl.domElement.addEventListener("mouseup", onPointerUp);

    aspectRatioRef.current =
      gl.domElement.clientWidth / gl.domElement.clientHeight;
  };

  return (
    <Canvas
      style={{ cursor: cursorStyle, width: "100%", height: "100%" }}
      camera={{
        fov: VIEWER_CONSTANTS.CAMERA_FOV,
        near: VIEWER_CONSTANTS.CAMERA_NEAR,
        far: VIEWER_CONSTANTS.CAMERA_FAR,
        position: [0, 0, 0.1],
      }}
      onCreated={onCanvasCreated}
    >
      {hotspots.map((hotspot) => {
        const pos = convertToSpherePosition(
          hotspot.position.x,
          hotspot.position.y,
          hotspot.position.z
        );
        return (
          <Hotspot
            key={hotspot.id}
            title={hotspot.title}
            position={pos}
            isSelected={hotspot.id === selectedHotspotId}
            onDragStart={() => setIsDraggingHotspot(true)}
            onDragEnd={() => setIsDraggingHotspot(false)}
            onDrag={(position) => onHotspotDrag?.(hotspot.id, position)}
            onClick={() => onHotspotClick?.(hotspot)}
          />
        );
      })}

      <Suspense fallback={null}>
        <ThreeSixtyImageMesh imageUrl={imageUrl} />
        <OrbitControls
          enabled={!isDraggingHotspot}
          enableZoom={true}
          enablePan={false}
          rotateSpeed={-0.5}
          minDistance={0.1}
          maxDistance={100}
        />
      </Suspense>
    </Canvas>
  );
}
