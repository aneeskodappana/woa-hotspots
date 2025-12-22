"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Leva, useControls, folder } from "leva";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { ThreeSixtyViewer } from "@/components/ThreeSixty";
import { HotspotData, FileWithHotspots } from "@/types/hotspot";

export default function Home() {
  const [files, setFiles] = useState<FileWithHotspots[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotData | null>(null);
  const [isPositioningMode, setIsPositioningMode] = useState(false);

  const activeFile = files.find((f) => f.id === activeFileId) ?? null;

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    const newFile: FileWithHotspots = {
      id: uuidv4(),
      fileName: file.name,
      imageUrl: url,
      hotspots: [],
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setSelectedHotspot(null);
  };

  const handleSelectFile = useCallback((fileId: string) => {
    setActiveFileId(fileId);
    setSelectedHotspot(null);
  }, []);

  const handleDeleteFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (activeFileId === fileId) {
      setActiveFileId(null);
      setSelectedHotspot(null);
    }
  }, [activeFileId]);

  const handleAddHotspot = useCallback(() => {
    if (!activeFileId) return;
    const currentFile = files.find((f) => f.id === activeFileId);
    const newHotspot: HotspotData = {
      id: uuidv4(),
      title: `Hotspot ${(currentFile?.hotspots.length ?? 0) + 1}`,
      position: { x: 0, y: 0, z: -4 },
    };
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId
          ? { ...f, hotspots: [...f.hotspots, newHotspot] }
          : f
      )
    );
    setSelectedHotspot(newHotspot);
  }, [activeFileId, files]);

  const handleSelectHotspot = useCallback((hotspot: HotspotData) => {
    setSelectedHotspot(hotspot);
  }, []);

  const handleDeleteHotspot = useCallback((id: string) => {
    if (!activeFileId) return;
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId
          ? { ...f, hotspots: f.hotspots.filter((h) => h.id !== id) }
          : f
      )
    );
    if (selectedHotspot?.id === id) {
      setSelectedHotspot(null);
    }
  }, [activeFileId, selectedHotspot?.id]);

  const handleUpdateHotspotPosition = useCallback(
    (position: { x: number; y: number; z: number }) => {
      if (!selectedHotspot || !activeFileId) return;
      setFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId
            ? {
                ...f,
                hotspots: f.hotspots.map((h) =>
                  h.id === selectedHotspot.id ? { ...h, position } : h
                ),
              }
            : f
        )
      );
      setSelectedHotspot((prev) => (prev ? { ...prev, position } : null));
    },
    [selectedHotspot, activeFileId]
  );

  const handleHotspotDrag = useCallback(
    (hotspotId: string, position: { x: number; y: number; z: number }) => {
      if (!activeFileId) return;
      setFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId
            ? {
                ...f,
                hotspots: f.hotspots.map((h) =>
                  h.id === hotspotId ? { ...h, position } : h
                ),
              }
            : f
        )
      );
      if (selectedHotspot?.id === hotspotId) {
        setSelectedHotspot((prev) => (prev ? { ...prev, position } : null));
      }
    },
    [activeFileId, selectedHotspot?.id]
  );

  const handleRenameHotspot = useCallback(
    (id: string, newTitle: string) => {
      if (!activeFileId) return;
      setFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId
            ? {
                ...f,
                hotspots: f.hotspots.map((h) =>
                  h.id === id ? { ...h, title: newTitle } : h
                ),
              }
            : f
        )
      );
      if (selectedHotspot?.id === id) {
        setSelectedHotspot((prev) => (prev ? { ...prev, title: newTitle } : null));
      }
    },
    [activeFileId, selectedHotspot?.id]
  );

  return (
    <div className="flex h-screen bg-gray-900">
      <main className="flex flex-col w-4/5">
        <Navbar title="WOA Hotspot Mapper" onFileSelect={handleFileSelect} />
        <div className="flex-1 relative">
          {activeFile ? (
            <div className="absolute inset-0">
              <ThreeSixtyViewer
                imageUrl={activeFile.imageUrl}
                hotspots={activeFile.hotspots}
                selectedHotspotId={selectedHotspot?.id}
                isPositioningMode={isPositioningMode}
                onHotspotClick={handleSelectHotspot}
                onHotspotDrag={handleHotspotDrag}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select an image to view
            </div>
          )}
        </div>
      </main>
      <div className="w-1/5 border-l border-gray-700 flex flex-col">
        <Sidebar
          files={files}
          activeFileId={activeFileId}
          onSelectFile={handleSelectFile}
          onDeleteFile={handleDeleteFile}
          hotspots={activeFile?.hotspots ?? []}
          selectedHotspot={selectedHotspot}
          onSelectHotspot={handleSelectHotspot}
          onAddHotspot={handleAddHotspot}
          onDeleteHotspot={handleDeleteHotspot}
          onRenameHotspot={handleRenameHotspot}
          isPositioningMode={isPositioningMode}
          onTogglePositioningMode={() => setIsPositioningMode((prev) => !prev)}
        />
        {selectedHotspot && (
          <div className="border-t border-gray-700 p-3">
            <HotspotPositionControls
              hotspot={selectedHotspot}
              onUpdate={handleUpdateHotspotPosition}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function HotspotPositionControls({
  hotspot,
  onUpdate,
}: {
  hotspot: HotspotData;
  onUpdate: (position: { x: number; y: number; z: number }) => void;
}) {
  const POSITION_MIN = -100;
  const POSITION_MAX = 100;
  const isInternalChange = useRef(false);
  const currentPosition = useRef({ ...hotspot.position });

  useEffect(() => {
    currentPosition.current = { ...hotspot.position };
  }, [hotspot.position.x, hotspot.position.y, hotspot.position.z]);

  const [, set] = useControls(
    hotspot.title,
    () => ({
      x: {
        value: hotspot.position.x,
        min: POSITION_MIN,
        max: POSITION_MAX,
        step: 0.1,
        onChange: (x: number) => {
          if (isInternalChange.current) return;
          currentPosition.current.x = x;
          onUpdate({ ...currentPosition.current });
        },
      },
      y: {
        value: hotspot.position.y,
        min: POSITION_MIN,
        max: POSITION_MAX,
        step: 0.1,
        onChange: (y: number) => {
          if (isInternalChange.current) return;
          currentPosition.current.y = y;
          onUpdate({ ...currentPosition.current });
        },
      },
      z: {
        value: hotspot.position.z,
        min: POSITION_MIN,
        max: POSITION_MAX,
        step: 0.1,
        onChange: (z: number) => {
          if (isInternalChange.current) return;
          currentPosition.current.z = z;
          onUpdate({ ...currentPosition.current });
        },
      },
    }),
    [hotspot.id]
  );

  useEffect(() => {
    isInternalChange.current = true;
    set({
      x: hotspot.position.x,
      y: hotspot.position.y,
      z: hotspot.position.z,
    });
    requestAnimationFrame(() => {
      isInternalChange.current = false;
    });
  }, [hotspot.position.x, hotspot.position.y, hotspot.position.z, set]);

  return <Leva fill flat titleBar={false} />;
}
