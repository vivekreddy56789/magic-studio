import React, { useRef, useEffect } from 'react';
import { CropRect, AspectRatioType } from '../../types/crop';
import { getPixelCrop } from '../../utils/canvasUtils';
import { Eye, CheckCircle2, User } from 'lucide-react';

interface LivePreviewProps {
  imageSrc: string;
  crop: CropRect;
  naturalWidth: number;
  naturalHeight: number;
  aspectRatioType: AspectRatioType;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  imageSrc,
  crop,
  naturalWidth,
  naturalHeight,
  aspectRatioType,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const avatarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute live pixel dimensions
  const pixelCrop = getPixelCrop(crop, naturalWidth, naturalHeight);

  // Draw real-time canvas preview
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 1. Rectangular Preview
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = pixelCrop.width;
          canvas.height = pixelCrop.height;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(
            img,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
          );
        }
      }

      // 2. Circular Avatar Preview
      if (avatarCanvasRef.current) {
        const aCanvas = avatarCanvasRef.current;
        const aCtx = aCanvas.getContext('2d');
        if (aCtx) {
          const side = Math.min(pixelCrop.width, pixelCrop.height);
          aCanvas.width = side;
          aCanvas.height = side;
          aCtx.imageSmoothingEnabled = true;
          aCtx.imageSmoothingQuality = 'high';

          // Center square slice
          const offsetX = pixelCrop.x + (pixelCrop.width - side) / 2;
          const offsetY = pixelCrop.y + (pixelCrop.height - side) * 0.15; // slightly upper for avatar face

          aCtx.drawImage(
            img,
            offsetX,
            offsetY,
            side,
            side,
            0,
            0,
            side,
            side
          );
        }
      }
    };
    img.src = imageSrc;
  }, [imageSrc, crop, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height]);

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-neutral-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            Live Headshot Preview
          </h3>
        </div>
        <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Real-time 60fps
        </span>
      </div>

      {/* Previews Layout: Portrait Frame + Circular Avatar */}
      <div className="grid grid-cols-2 gap-4 items-center">
        {/* 1. Main Portrait Framing Card */}
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-[140px] aspect-[3/4] bg-neutral-100 rounded-2xl overflow-hidden border-2 border-neutral-300/80 shadow-xs flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[10px] font-semibold text-neutral-500 mt-2">
            Bio / Team Frame
          </span>
        </div>

        {/* 2. Circular Avatar Frame */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 rounded-full bg-neutral-100 overflow-hidden border-2 border-neutral-300/80 shadow-xs flex items-center justify-center ring-4 ring-neutral-100">
            <canvas
              ref={avatarCanvasRef}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[10px] font-semibold text-neutral-500 mt-2">
            LinkedIn / Avatar
          </span>
        </div>
      </div>

      {/* Output Pixel Specs */}
      <div className="pt-3 border-t border-neutral-100 text-xs text-neutral-600 flex flex-col gap-1.5 font-mono">
        <div className="flex justify-between items-center">
          <span className="text-neutral-400">Crop Dimensions</span>
          <span className="font-semibold text-neutral-900">
            {pixelCrop.width} × {pixelCrop.height} px
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-400">Aspect Ratio</span>
          <span className="font-semibold text-neutral-900 capitalize">
            {aspectRatioType}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-400">Framing</span>
          <span className="text-emerald-600 font-semibold">
            Upper-Third Eye Alignment
          </span>
        </div>
      </div>
    </div>
  );
};
