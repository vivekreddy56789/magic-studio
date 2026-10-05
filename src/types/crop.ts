export type AspectRatioType = 'free' | '1:1' | '3:4' | '4:5' | '16:9' | '2:3';

export interface CropRect {
  /** X position in percentage (0 to 100) or relative to natural/displayed image */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ResizeHandle = 
  | 'nw' | 'n' | 'ne' 
  | 'w'  |       'e' 
  | 'sw' | 's' | 'se';

export interface ImageMeta {
  url: string;
  name: string;
  type: string;
  sizeBytes: number;
  naturalWidth: number;
  naturalHeight: number;
}

export interface AspectPreset {
  id: AspectRatioType;
  label: string;
  ratio: number | null; // width / height, null for free
  description: string;
  badge?: string;
}

export interface ExportOptions {
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number; // 0.1 to 1.0
  customWidth?: number;
  customHeight?: number;
}

export interface AICropSuggestionResult {
  crop: CropRect;
  confidence: number;
  method: 'heuristic-upper-third' | 'gemini-ai' | 'density-face-detector';
  faceCenter?: { x: number; y: number };
  explanation: string;
}

export interface CropHistoryState {
  crop: CropRect;
  aspectRatioType: AspectRatioType;
  label?: string;
  timestamp?: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
