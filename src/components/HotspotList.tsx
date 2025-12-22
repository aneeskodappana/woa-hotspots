"use client";

import { useState } from "react";
import { HotspotData } from "@/types/hotspot";

const IMAGE_WIDTH = 6000;
const IMAGE_HEIGHT = 3000;
const SPHERE_RADIUS = 4;

function sphereToPixel(x: number, y: number, z: number): { px: number; py: number; pz: number } {
  const length = Math.sqrt(x * x + y * y + z * z);
  if (length === 0) return { px: 0, py: 0, pz: 0 };

  const nx = x / length;
  const ny = y / length;
  const nz = z / length;

  const phi = Math.acos(ny);
  const theta = Math.atan2(nx, -nz);

  const px = ((theta + Math.PI) / (2 * Math.PI)) * IMAGE_WIDTH;
  const py = (phi / Math.PI) * IMAGE_HEIGHT;
  const pz = 0;

  return { px, py, pz };
}

interface HotspotListProps {
  hotspots: HotspotData[];
  selectedId: string | null;
  onSelect: (hotspot: HotspotData) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

export default function HotspotList({
  hotspots,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onRename,
}: HotspotListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  return (
    <div className="space-y-3">
      <button
        onClick={onAdd}
        className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        + Add Hotspot
      </button>
      <ul className="space-y-2">
        {hotspots.map((hotspot) => (
          <li
            key={hotspot.id}
            onClick={() => onSelect(hotspot)}
            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
              selectedId === hotspot.id
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {editingId === hotspot.id ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => {
                  if (editValue.trim()) {
                    onRename(hotspot.id, editValue.trim());
                  }
                  setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (editValue.trim()) {
                      onRename(hotspot.id, editValue.trim());
                    }
                    setEditingId(null);
                  } else if (e.key === "Escape") {
                    setEditingId(null);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="text-sm text-white bg-gray-600 px-1 py-0.5 rounded border border-gray-500 outline-none focus:border-blue-500 w-full"
              />
            ) : (
              <span
                className="text-sm text-gray-200 cursor-text"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingId(hotspot.id);
                  setEditValue(hotspot.title);
                }}
              >
                {hotspot.title}
              </span>
            )}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onMouseEnter={() => setHoveredId(hotspot.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                {hoveredId === hotspot.id && (() => {
                    const pixel = sphereToPixel(hotspot.position.x, hotspot.position.y, hotspot.position.z);
                    return (
                      <div className="absolute right-0 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap z-10">
                        <div className="text-gray-400">Sphere</div>
                        <div className="text-white">
                          x: {hotspot.position?.x?.toFixed(2) ?? 'N/A'}, y: {hotspot.position?.y?.toFixed(2) ?? 'N/A'}, z: {hotspot.position?.z?.toFixed(2) ?? 'N/A'}
                        </div>
                        <div className="text-gray-400 mt-1">Pixel</div>
                        <div className="text-white">
                          x: {pixel.px.toFixed(0)}, y: {pixel.py.toFixed(0)}, z: {pixel.pz.toFixed(0)}
                        </div>
                      </div>
                    );
                  })()}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(hotspot.id);
                }}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </li>
        ))}
        {hotspots.length === 0 && (
          <li className="px-3 py-2 text-sm text-gray-400 text-center">
            No hotspots available
          </li>
        )}
      </ul>
    </div>
  );
}
