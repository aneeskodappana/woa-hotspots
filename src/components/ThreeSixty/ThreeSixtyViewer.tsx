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
  referenceImageUrl?: string | null;
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
  referenceImageUrl,
  hotspots = [],
  selectedHotspotId,
  onHotspotClick,
  onHotspotDrag,
}: ThreeSixtyViewerProps) {
  const aspectRatioRef = useRef(0);
  const [cursorStyle, setCursorStyle] = useState(VIEWER_CONSTANTS.CURSOR_STYLE);
  const [isDraggingHotspot, setIsDraggingHotspot] = useState(false);
  const [viewMode, setViewMode] = useState<"main" | "reference" | "blend">("main");
  const [referenceOpacity, setReferenceOpacity] = useState(0.5);

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
    <div className="relative w-full h-full">
      {referenceImageUrl && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-gray-800 bg-opacity-80 rounded-lg p-2">
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("main")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                viewMode === "main"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Main
            </button>
            <button
              onClick={() => setViewMode("reference")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                viewMode === "reference"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Reference
            </button>
            <button
              onClick={() => setViewMode("blend")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                viewMode === "blend"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Blend
            </button>
          </div>
          {viewMode === "blend" && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-400">Ref</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={referenceOpacity}
                onChange={(e) => setReferenceOpacity(parseFloat(e.target.value))}
                className="w-20 h-1 accent-blue-500"
              />
              <span className="text-xs text-gray-300 w-8">{Math.round(referenceOpacity * 100)}%</span>
            </div>
          )}
        </div>
      )}
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
        {(viewMode === "main" || viewMode === "blend") && (
          <ThreeSixtyImageMesh imageUrl={imageUrl} opacity={viewMode === "blend" ? 1 - referenceOpacity : 1} />
        )}
        {referenceImageUrl && (viewMode === "reference" || viewMode === "blend") && (
          <ThreeSixtyImageMesh imageUrl={referenceImageUrl} opacity={viewMode === "blend" ? referenceOpacity : 1} />
        )}
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
    </div>
  );
}
