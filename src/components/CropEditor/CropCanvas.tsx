import React, { useRef, useEffect } from 'react';
import { CropRect, ResizeHandle, AICropSuggestionResult } from '../../types/crop';
import { Sparkles, Move, Eye } from 'lucide-react';

interface CropCanvasProps {
  imageSrc: string;
  imageAlt?: string;
  crop: CropRect;
  onPointerDown: (e: React.PointerEvent<HTMLElement>, handle: ResizeHandle | 'move') => void;
  onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  showGrid: boolean;
  showFaceGuide: boolean;
  aiSuggestion: AICropSuggestionResult | null;
  zoomLevel: number;
  rotationAngle: number;
}

export const CropCanvas: React.FC<CropCanvasProps> = ({
  imageSrc,
  imageAlt = 'Portrait crop source',
  crop,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKeyDown,
  containerRef,
  showGrid,
  showFaceGuide,
  aiSuggestion,
  zoomLevel,
  rotationAngle,
}) => {
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Focusable for keyboard navigation
  useEffect(() => {
    containerRef.current?.focus();
  }, [containerRef]);

  // Corner and Edge handle specifications
  const handles: { id: ResizeHandle; cursor: string; style: React.CSSProperties; label: string }[] = [
    // Corners
    { id: 'nw', cursor: 'nwse-resize', style: { top: -6, left: -6 }, label: 'Resize top left' },
    { id: 'ne', cursor: 'nesw-resize', style: { top: -6, right: -6 }, label: 'Resize top right' },
    { id: 'sw', cursor: 'nesw-resize', style: { bottom: -6, left: -6 }, label: 'Resize bottom left' },
    { id: 'se', cursor: 'nwse-resize', style: { bottom: -6, right: -6 }, label: 'Resize bottom right' },
    // Edges
    { id: 'n', cursor: 'ns-resize', style: { top: -6, left: '50%', transform: 'translateX(-50%)' }, label: 'Resize top edge' },
    { id: 's', cursor: 'ns-resize', style: { bottom: -6, left: '50%', transform: 'translateX(-50%)' }, label: 'Resize bottom edge' },
    { id: 'w', cursor: 'ew-resize', style: { left: -6, top: '50%', transform: 'translateY(-50%)' }, label: 'Resize left edge' },
    { id: 'e', cursor: 'ew-resize', style: { right: -6, top: '50%', transform: 'translateY(-50%)' }, label: 'Resize right edge' },
  ];

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Interactive crop editor canvas. Use arrow keys to nudge, drag to move or resize."
      onKeyDown={onKeyDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="relative w-full h-[460px] sm:h-[540px] md:h-[600px] select-none rounded-3xl overflow-hidden bg-neutral-950 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-neutral-400 touch-none shadow-inner"
    >
      {/* Background checkerboard for transparency */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #555 10%, transparent 11%)`,
          backgroundSize: '16px 16px',
        }}
      />

      {/* Scaled/Rotated Image Container */}
      <div
        className="relative max-w-full max-h-full transition-transform duration-75 flex items-center justify-center"
        style={{
          transform: `scale(${zoomLevel}) rotate(${rotationAngle}deg)`,
        }}
      >
        <img
          ref={imageRef}
          src={imageSrc}
          alt={imageAlt}
          className="max-h-[440px] sm:max-h-[520px] md:max-h-[580px] w-auto max-w-full object-contain pointer-events-none rounded-xl"
          draggable={false}
        />

        {/* ============================================================== */}
        {/* SEMI-TRANSPARENT DARK SCRIM OUTSIDE CROP AREA (Spec 2.3)       */}
        {/* We use 4 scrim panels surrounding the active crop rectangle     */}
        {/* ============================================================== */}

        {/* Top Scrim */}
        <div
          className="absolute left-0 right-0 top-0 bg-black/65 backdrop-blur-[0.5px] pointer-events-none transition-[height] duration-75"
          style={{ height: `${crop.y}%` }}
        />

        {/* Bottom Scrim */}
        <div
          className="absolute left-0 right-0 bottom-0 bg-black/65 backdrop-blur-[0.5px] pointer-events-none transition-[height] duration-75"
          style={{ height: `${100 - (crop.y + crop.height)}%` }}
        />

        {/* Left Scrim */}
        <div
          className="absolute left-0 bg-black/65 backdrop-blur-[0.5px] pointer-events-none transition-[width,top,height] duration-75"
          style={{
            top: `${crop.y}%`,
            height: `${crop.height}%`,
            width: `${crop.x}%`,
          }}
        />

        {/* Right Scrim */}
        <div
          className="absolute right-0 bg-black/65 backdrop-blur-[0.5px] pointer-events-none transition-[width,top,height] duration-75"
          style={{
            top: `${crop.y}%`,
            height: `${crop.height}%`,
            width: `${100 - (crop.x + crop.width)}%`,
          }}
        />

        {/* ============================================================== */}
        {/* INTERACTIVE BOUNDING BOX (Spec 2.3)                            */}
        {/* ============================================================== */}
        <div
          className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.85)] cursor-move group transition-[top,left,width,height] duration-75"
          style={{
            left: `${crop.x}%`,
            top: `${crop.y}%`,
            width: `${crop.width}%`,
            height: `${crop.height}%`,
          }}
          onPointerDown={(e) => onPointerDown(e, 'move')}
          role="slider"
          aria-label="Crop window"
        >
          {/* Subtle Inner Highlight */}
          <div className="absolute inset-0 ring-1 ring-inset ring-white/30 pointer-events-none" />

          {/* Center Grab Handle & Drag indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium flex items-center gap-1.5 shadow-md">
              <Move className="w-3.5 h-3.5" />
              <span>Drag to reposition</span>
            </div>
          </div>

          {/* AI Recommended Badge Guide (Spec 2.2) */}
          <div className="absolute -top-7 left-0 pointer-events-none flex items-center gap-1.5 bg-neutral-900/90 text-white text-[10px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full border border-neutral-700 shadow-md">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>AI Headshot Guide</span>
          </div>

          {/* ============================================================== */}
          {/* RULE OF THIRDS GRID (Upper-third eye line emphasized)        */}
          {/* ============================================================== */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
              {/* Horizontal lines */}
              <div className="col-span-3 border-b border-white/40 shadow-xs relative">
                {/* Visual marker for optimal eye placement (Upper-Third) */}
                <div className="absolute right-2 -bottom-2 text-[9px] font-mono text-amber-300/90 bg-black/40 px-1 rounded">
                  Eye-line
                </div>
              </div>
              <div className="col-span-3 border-b border-white/40 shadow-xs" />
              {/* Vertical lines */}
              <div className="row-span-3 border-r border-white/40 shadow-xs absolute inset-y-0 left-1/3" />
              <div className="row-span-3 border-r border-white/40 shadow-xs absolute inset-y-0 left-2/3" />
            </div>
          )}

          {/* ============================================================== */}
          {/* FACIAL CONTOUR GUIDE OVERLAY (Spec 2.2)                        */}
          {/* ============================================================== */}
          {showFaceGuide && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-start pt-6">
              {/* Head oval */}
              <div className="w-[52%] h-[56%] rounded-[50%_50%_45%_45%] border border-dashed border-amber-300/80 bg-amber-300/5 shadow-[0_0_12px_rgba(251,191,36,0.15)] flex flex-col items-center justify-center">
                {/* Eye level bar */}
                <div className="w-3/4 h-[1px] bg-amber-300/60 my-2" />
                {/* Nose / vertical symmetry bar */}
                <div className="w-[1px] h-1/2 bg-amber-300/60" />
              </div>
              {/* Shoulder curve indicator */}
              <div className="w-4/5 h-16 border-t-2 border-dotted border-white/30 rounded-t-[50%] mt-2" />
            </div>
          )}

          {/* ============================================================== */}
          {/* 8 HIGH-CONTRAST INTERACTIVE RESIZE HANDLES (Spec 2.3)          */}
          {/* ============================================================== */}
          {handles.map((h) => (
            <button
              key={h.id}
              type="button"
              aria-label={h.label}
              onPointerDown={(e) => onPointerDown(e, h.id)}
              style={{
                ...h.style,
                cursor: h.cursor,
              }}
              className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white border-2 border-neutral-950 rounded-xs shadow-md hover:scale-125 active:scale-130 transition-transform z-30 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
