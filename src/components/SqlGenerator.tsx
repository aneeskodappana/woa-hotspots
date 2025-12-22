"use client";

import { useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { FileWithHotspots } from "@/types/hotspot";

interface SqlGeneratorProps {
  files: FileWithHotspots[];
}

function generateSql(files: FileWithHotspots[], hotspotGroupId: string): string {
  if (!hotspotGroupId) {
    return "";
  }

  const allStatements: string[] = [];
  let globalIndex = 0;

  for (const file of files) {
    const baseName = file.fileName
      .replace(/\.(webp|jpg|jpeg)$/i, "")
      .replace(/[^a-zA-Z0-9_]/g, "_");

    const mediaUrl = `/${file.fileName}`;

    for (const hotspot of file.hotspots) {
      const id = uuidv4();
      const name = `${baseName}_${hotspot.title.replace(/\s+/g, "_")}`;
      const positionJson = JSON.stringify({
        X: hotspot.position.x,
        Y: hotspot.position.y,
        Z: hotspot.position.z,
      });

      allStatements.push(
        `insert into "Hotspots" ("CameraSettingsJson", "DefaultCameraRotationJson", "HotspotGroupId", "HotspotIndex", "Id", "IsExplorable", "IsVisible", "MediaThumbnailUrl", "MediaThumbnailVersion", "MediaUrl", "MediaVersion", "Name", "OffsetRotationJson", "PositionJson") values ('{"default": {"fov": 90}, "version": 1}', '{"X":0,"Y":0,"Z":0,"W":1}', '${hotspotGroupId}', ${globalIndex}, '${id}', true, true, '', 1, '${mediaUrl}', 1, '${name}', '{"X":0,"Y":0,"Z":0}', '${positionJson}');`
      );
      globalIndex++;
    }
  }

  return allStatements.join("\n\n");
}

export default function SqlGenerator({ files }: SqlGeneratorProps) {
  const [hotspotGroupId, setHotspotGroupId] = useState("");
  const [copied, setCopied] = useState(false);

  const totalHotspots = files.reduce((sum, f) => sum + f.hotspots.length, 0);

  const sql = useMemo(
    () => generateSql(files, hotspotGroupId),
    [files, hotspotGroupId]
  );

  const handleCopy = async () => {
    if (sql) {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Hotspot Group UUID
        </label>
        <input
          type="text"
          value={hotspotGroupId}
          onChange={(e) => setHotspotGroupId(e.target.value)}
          placeholder="Enter UUID..."
          className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <div>
          <span className="font-medium">Files:</span> {files.length}
        </div>
        <div>
          <span className="font-medium">Total Hotspots:</span> {totalHotspots}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-400">Generated SQL</label>
          <button
            onClick={handleCopy}
            disabled={!sql}
            className="px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <textarea
          readOnly
          value={sql}
          placeholder={
            !hotspotGroupId
              ? "Enter a Hotspot Group UUID to generate SQL..."
              : totalHotspots === 0
              ? "Add hotspots to files to generate SQL..."
              : ""
          }
          className="flex-1 w-full px-3 py-2 text-xs font-mono bg-gray-900 border border-gray-600 rounded-md text-gray-300 resize-none focus:outline-none"
        />
      </div>
    </div>
  );
}
