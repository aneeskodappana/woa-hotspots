export interface HotspotData {
  id: string;
  title: string;
  position: { x: number; y: number; z: number };
}

export interface FileWithHotspots {
  id: string;
  fileName: string;
  imageUrl: string;
  hotspots: HotspotData[];
}
