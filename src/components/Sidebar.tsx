"use client";

import { useState } from "react";
import HotspotList from "./HotspotList";
import SqlGenerator from "./SqlGenerator";
import { HotspotData, FileWithHotspots } from "@/types/hotspot";

type Tab = "files" | "hotspots" | "sql";

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
  isPositioningMode: boolean;
  onTogglePositioningMode: () => void;
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
  isPositioningMode,
  onTogglePositioningMode,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>("files");

  return (
    <aside className="flex flex-col h-full bg-gray-800">
      <div className="p-3 border-b border-gray-700">
        <button
          onClick={onTogglePositioningMode}
          className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
            isPositioningMode
              ? "bg-green-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
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
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
          {isPositioningMode ? "Exit Positioning Mode" : "Positioning Mode"}
        </button>
        {isPositioningMode && (
          <p className="mt-2 text-xs text-gray-400 text-center">
            Select a hotspot and drag to reposition
          </p>
        )}
      </div>
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
      </div>
    </aside>
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
