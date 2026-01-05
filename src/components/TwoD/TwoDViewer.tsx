"use client";

import { useRef, useState, useCallback } from "react";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { HotspotData } from "@/types/hotspot";

interface TwoDViewerProps {
  imageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  hotspots?: HotspotData[];
  selectedHotspotId?: string | null;
  onHotspotClick?: (hotspot: HotspotData) => void;
  onHotspotDrag?: (
    hotspotId: string,
    position: { x: number; y: number; z: number }
  ) => void;
}

export default function TwoDViewer({
  imageUrl,
  imageWidth,
  imageHeight,
  hotspots = [],
  selectedHotspotId,
  onHotspotClick,
  onHotspotDrag,
}: TwoDViewerProps) {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [draggingHotspotId, setDraggingHotspotId] = useState<string | null>(null);

  const handleHotspotMouseDown = useCallback(
    (e: React.MouseEvent, hotspot: HotspotData) => {
      e.stopPropagation();
      e.preventDefault();
      setDraggingHotspotId(hotspot.id);
      onHotspotClick?.(hotspot);
    },
    [onHotspotClick]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingHotspotId || !imageRef.current || !transformRef.current) return;

      const state = transformRef.current.instance.transformState;
      const scale = state.scale;
      const imgRect = imageRef.current.getBoundingClientRect();

      const renderedWidth = imgRect.width / scale;
      const renderedHeight = imgRect.height / scale;

      const relativeX = (e.clientX - imgRect.left) / scale;
      const relativeY = (e.clientY - imgRect.top) / scale;

      const logicalWidth = imageWidth || imageRef.current.naturalWidth;
      const logicalHeight = imageHeight || imageRef.current.naturalHeight;

      const x = (relativeX / renderedWidth) * logicalWidth;
      const y = (relativeY / renderedHeight) * logicalHeight;

      onHotspotDrag?.(draggingHotspotId, { x, y, z: 0 });
    },
    [draggingHotspotId, onHotspotDrag, imageWidth, imageHeight]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingHotspotId(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-black relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.1}
        maxScale={10}
        centerOnInit
        limitToBounds={false}
        panning={{ disabled: draggingHotspotId !== null }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "100%", height: "100%" }}
        >
          <div className="relative inline-block">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="2D View"
              className="max-w-none"
              draggable={false}
              width={imageWidth}
              height={imageHeight}
              style={{ pointerEvents: "none" }}
            />
            {hotspots.map((hotspot) => (
              <Marker
                key={hotspot.id}
                hotspot={hotspot}
                imageWidth={imageWidth}
                imageHeight={imageHeight}
                isSelected={hotspot.id === selectedHotspotId}
                isDragging={hotspot.id === draggingHotspotId}
                onMouseDown={(e) => handleHotspotMouseDown(e, hotspot)}
              />
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

interface MarkerProps {
  hotspot: HotspotData;
  imageWidth?: number;
  imageHeight?: number;
  isSelected: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

function Marker({ hotspot, imageWidth, imageHeight, isSelected, isDragging, onMouseDown }: MarkerProps) {
  const xPercent = imageWidth ? (hotspot.position.x / imageWidth) * 100 : undefined;
  const yPercent = imageHeight ? (hotspot.position.y / imageHeight) * 100 : undefined;

  return (
    <div
      className={`absolute flex flex-col items-center cursor-grab select-none ${
        isDragging ? "z-50 cursor-grabbing" : "z-10"
      }`}
      style={{
        left: xPercent !== undefined ? `${xPercent}%` : hotspot.position.x,
        top: yPercent !== undefined ? `${yPercent}%` : hotspot.position.y,
        transform: "translate(-50%, -100%)",
        pointerEvents: "auto",
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e);
      }}
    >
      <div
        className={`px-2 py-1 rounded text-xs whitespace-nowrap mb-1 transition-colors ${
          isSelected
            ? "bg-blue-500 text-white"
            : "bg-gray-800 text-white bg-opacity-80"
        }`}
      >
        {hotspot.title}
      </div>
      <div
        className={`w-4 h-4 rounded-full border-2 transition-colors ${
          isSelected
            ? "bg-blue-500 border-white"
            : "bg-red-500 border-white"
        }`}
      />
      <div
        className={`w-0.5 h-3 ${isSelected ? "bg-blue-500" : "bg-red-500"}`}
      />
    </div>
  );
}
