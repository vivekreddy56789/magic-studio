import React from 'react';
import { AspectRatioType } from '../../types/crop';
import { ASPECT_RATIO_PRESETS } from '../../utils/constants';
import {
  RotateCw,
  Sparkles,
  Grid3X3,
  UserCheck,
  ZoomIn,
  ZoomOut,
  Download,
  Undo2,
  Redo2,
} from 'lucide-react';

interface CropToolbarProps {
  currentAspectRatio: AspectRatioType;
  onSelectAspectRatio: (ratio: AspectRatioType) => void;
  onResetToAI: () => void;
  isResetDisabled?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  undoCount?: number;
  redoCount?: number;
  onUndo?: () => void;
  onRedo?: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showFaceGuide: boolean;
  onToggleFaceGuide: () => void;
  zoomLevel: number;
  onZoomChange: (val: number) => void;
  rotationAngle: number;
  onRotate: () => void;
  onExportClick: () => void;
}

export const CropToolbar: React.FC<CropToolbarProps> = ({
  currentAspectRatio,
  onSelectAspectRatio,
  onResetToAI,
  isResetDisabled,
  canUndo = false,
  canRedo = false,
  undoCount = 0,
  redoCount = 0,
  onUndo,
  onRedo,
  showGrid,
  onToggleGrid,
  showFaceGuide,
  onToggleFaceGuide,
  zoomLevel,
  onZoomChange,
  rotationAngle,
  onRotate,
  onExportClick,
}) => {
  return (
    <div className="w-full bg-white rounded-3xl border border-neutral-200/80 p-3 sm:p-4 shadow-sm flex flex-col gap-4">
      {/* Top Row: Aspect Ratio Preset Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Aspect Ratio
          </span>
          <span className="text-[10px] text-neutral-400 hidden sm:inline">
            (Locks bounding box proportions)
          </span>
        </div>

        {/* Preset Buttons */}
        <div className="flex items-center flex-wrap gap-1.5 p-1 bg-neutral-100/90 rounded-2xl">
          {ASPECT_RATIO_PRESETS.map((preset) => {
            const isActive = currentAspectRatio === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectAspectRatio(preset.id)}
                className={`relative px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60'
                }`}
                title={preset.description}
              >
                <span>{preset.label}</span>
                {preset.badge && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle/Bottom Row: AI Reset, Undo/Redo, Guides, Zoom & Export CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Reset to AI Suggestion & Undo/Redo & Visual Guides */}
        <div className="flex flex-wrap items-center gap-2">
          {/* History Controls: Undo and Redo */}
          <div className="flex items-center bg-neutral-100/90 p-1 rounded-xl border border-neutral-200/70 shadow-2xs">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 hover:text-neutral-950 hover:bg-white transition-all disabled:opacity-35 disabled:pointer-events-none active:scale-95"
              title="Undo previous crop adjustment (Ctrl+Z or ⌘Z)"
              aria-label="Undo crop change"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Undo</span>
              {undoCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700">
                  {undoCount}
                </span>
              )}
            </button>

            <div className="w-[1px] h-4 bg-neutral-300 mx-1" />

            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 hover:text-neutral-950 hover:bg-white transition-all disabled:opacity-35 disabled:pointer-events-none active:scale-95"
              title="Redo previous crop adjustment (Ctrl+Shift+Z or ⌘⇧Z / Ctrl+Y)"
              aria-label="Redo crop change"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Redo</span>
              {redoCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700">
                  {redoCount}
                </span>
              )}
            </button>
          </div>

          {/* Reset to AI Suggestion Button (Required by Spec 2.3) */}
          <button
            onClick={onResetToAI}
            disabled={isResetDisabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none"
            title="Reset crop to AI optimal upper-third recommendation"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Reset to AI</span>
          </button>

          {/* Toggle Rule of Thirds Grid */}
          <button
            onClick={onToggleGrid}
            aria-pressed={showGrid}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showGrid
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
            }`}
            title="Toggle Rule of Thirds guidelines"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>

          {/* Toggle Face Framing Guide */}
          <button
            onClick={onToggleFaceGuide}
            aria-pressed={showFaceGuide}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showFaceGuide
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
            }`}
            title="Toggle Face Oval & Eye-line guidance"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Face Guide</span>
          </button>

          {/* Rotate 90 Degrees */}
          <button
            onClick={onRotate}
            className="p-1.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors"
            title={`Rotate image (Currently ${rotationAngle}°)`}
            aria-label="Rotate image 90 degrees"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Side: Zoom Controls and Primary Export Button */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Zoom Slider */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-neutral-100/80 rounded-xl border border-neutral-200/60 text-xs text-neutral-600">
            <button
              onClick={() => onZoomChange(Math.max(0.6, zoomLevel - 0.1))}
              className="p-1 hover:text-neutral-900"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="0.6"
              max="2.0"
              step="0.05"
              value={zoomLevel}
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              aria-label="Zoom scale"
            />
            <button
              onClick={() => onZoomChange(Math.min(2.0, zoomLevel + 0.1))}
              className="p-1 hover:text-neutral-900"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] w-8 text-right">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          {/* Primary Export Cropped Image CTA Button (Spec 2.4) */}
          <button
            onClick={onExportClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-neutral-950 text-white font-bold text-xs sm:text-sm hover:bg-neutral-800 active:scale-98 transition-all shadow-md hover:shadow-lg"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Cropped Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};
