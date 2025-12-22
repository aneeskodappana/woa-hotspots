"use client";

import { useState } from "react";
import HotspotList from "./HotspotList";
import SqlGenerator from "./SqlGenerator";
import { HotspotData, FileWithHotspots } from "@/types/hotspot";

type Tab = "files" | "hotspots" | "sql" | "csv";

const IMAGE_WIDTH = 6000;
const IMAGE_HEIGHT = 3000;

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

interface SidebarProps {
  files: FileWithHotspots[];
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  hotspots: HotspotData[];
  selectedHotspot: HotspotData | null;
  onSelectHotspot: (hotspot: HotspotData) => void;
  onAddHotspot: () => void;
  onDeleteHotspot: (id: string) => void;
  onRenameHotspot: (id: string, newTitle: string) => void;
}

export default function Sidebar({
  files,
  activeFileId,
  onSelectFile,
  onDeleteFile,
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  onAddHotspot,
  onDeleteHotspot,
  onRenameHotspot,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>("files");

  return (
    <aside className="flex flex-col h-full bg-gray-800">
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab("files")}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
            activeTab === "files"
              ? "text-white border-b-2 border-blue-500 bg-gray-700"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          Files
        </button>
        <button
          onClick={() => setActiveTab("hotspots")}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
            activeTab === "hotspots"
              ? "text-white border-b-2 border-blue-500 bg-gray-700"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          Hotspots
        </button>
        <button
          onClick={() => setActiveTab("sql")}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
            activeTab === "sql"
              ? "text-white border-b-2 border-blue-500 bg-gray-700"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          SQL
        </button>
        <button
          onClick={() => setActiveTab("csv")}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
            activeTab === "csv"
              ? "text-white border-b-2 border-blue-500 bg-gray-700"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          CSV
        </button>
      </div>
      <div className="flex-1 p-3 overflow-y-auto">
        {activeTab === "files" && (
          <FileList
            files={files}
            activeFileId={activeFileId}
            onSelect={onSelectFile}
            onDelete={onDeleteFile}
          />
        )}
        {activeTab === "hotspots" && (
          <HotspotList
            hotspots={hotspots}
            selectedId={selectedHotspot?.id ?? null}
            onSelect={onSelectHotspot}
            onAdd={onAddHotspot}
            onDelete={onDeleteHotspot}
            onRename={onRenameHotspot}
          />
        )}
        {activeTab === "sql" && <SqlGenerator files={files} />}
        {activeTab === "csv" && <CsvTable hotspots={hotspots} />}
      </div>
    </aside>
  );
}

function CsvTable({ hotspots }: { hotspots: HotspotData[] }) {
  if (hotspots.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center py-4">
        No hotspots to display
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead className="text-gray-400 border-b border-gray-700">
          <tr>
            <th className="py-2 px-1">Title</th>
            <th className="py-2 px-1 text-right">Sphere X</th>
            <th className="py-2 px-1 text-right">Sphere Y</th>
            <th className="py-2 px-1 text-right">Sphere Z</th>
            <th className="py-2 px-1 text-right">Pixel X</th>
            <th className="py-2 px-1 text-right">Pixel Y</th>
            <th className="py-2 px-1 text-right">Pixel Z</th>
          </tr>
        </thead>
        <tbody className="text-gray-200">
          {hotspots.map((hotspot) => {
            const pixel = sphereToPixel(
              hotspot.position.x,
              hotspot.position.y,
              hotspot.position.z
            );
            return (
              <tr key={hotspot.id} className="border-b border-gray-700/50 hover:bg-gray-700/50">
                <td className="py-2 px-1 truncate max-w-[80px]" title={hotspot.title}>
                  {hotspot.title}
                </td>
                <td className="py-2 px-1 text-right">{hotspot.position.x.toFixed(2)}</td>
                <td className="py-2 px-1 text-right">{hotspot.position.y.toFixed(2)}</td>
                <td className="py-2 px-1 text-right">{hotspot.position.z.toFixed(2)}</td>
                <td className="py-2 px-1 text-right">{pixel.px.toFixed(0)}</td>
                <td className="py-2 px-1 text-right">{pixel.py.toFixed(0)}</td>
                <td className="py-2 px-1 text-right">{pixel.pz.toFixed(0)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FileList({
  files,
  activeFileId,
  onSelect,
  onDelete,
}: {
  files: FileWithHotspots[];
  activeFileId: string | null;
  onSelect: (fileId: string) => void;
  onDelete: (fileId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {files.length === 0 && (
        <div className="text-sm text-gray-400 text-center py-4">
          No files loaded. Use "Select File" to add images.
        </div>
      )}
      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => onSelect(file.id)}
          className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
            activeFileId === file.id
              ? "bg-blue-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-200 truncate">{file.fileName}</div>
            <div className="text-xs text-gray-400">
              {file.hotspots.length} hotspot{file.hotspots.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file.id);
            }}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors ml-2"
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
      ))}
    </div>
  );
}
