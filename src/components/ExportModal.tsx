import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Copy,
  Check,
  X,
  FileCheck,
  Maximize2,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { CropRect, ExportOptions } from '../types/crop';
import {
  getCroppedCanvas,
  canvasToBlob,
  triggerDownload,
  copyCanvasToClipboard,
  formatBytes,
  getPixelCrop,
} from '../utils/canvasUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageName: string;
  crop: CropRect;
  naturalWidth: number;
  naturalHeight: number;
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  onSaveToDatabase?: (dataUrl: string, width: number, height: number, format: string) => void;
  isLoggedIn?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  imageName,
  crop,
  naturalWidth,
  naturalHeight,
  onShowToast,
  onSaveToDatabase,
  isLoggedIn,
}) => {
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.92);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSavedToDb, setIsSavedToDb] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<number>(0);
  const canvasHolderRef = useRef<HTMLCanvasElement | null>(null);

  const pixelCrop = getPixelCrop(crop, naturalWidth, naturalHeight);

  // Generate the canvas and preview blob whenever format or quality changes
  useEffect(() => {
    if (!isOpen) {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
        setPreviewBlobUrl(null);
      }
      return;
    }

    let isCancelled = false;

    const generatePreview = async () => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageSrc;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = await getCroppedCanvas(img, crop);
        if (isCancelled) return;

        canvasHolderRef.current = canvas;

        const blob = await canvasToBlob(canvas, { format, quality });
        if (isCancelled) return;

        setEstimatedSize(blob.size);
        const url = URL.createObjectURL(blob);
        setPreviewBlobUrl(url);
      } catch (err) {
        console.error('Error generating export preview:', err);
      }
    };

    generatePreview();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, imageSrc, crop, format, quality]);

  if (!isOpen) return null;

  // Handle immediate browser download trigger
  const handleDownload = async () => {
    if (!canvasHolderRef.current) return;
    setIsExporting(true);
    try {
      const blob = await canvasToBlob(canvasHolderRef.current, { format, quality });
      const extension = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
      const cleanBaseName = imageName.replace(/\.[^/.]+$/, '');
      const filename = `${cleanBaseName}_cropped_${pixelCrop.width}x${pixelCrop.height}.${extension}`;

      triggerDownload(blob, filename);

      onShowToast(
        'Export Successful',
        `Saved "${filename}" (${formatBytes(blob.size)}) directly to your downloads.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      onShowToast('Export Error', 'Failed to generate image file for download.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle copy to clipboard
  const handleCopyClipboard = async () => {
    if (!canvasHolderRef.current) return;
    const success = await copyCanvasToClipboard(canvasHolderRef.current);
    if (success) {
      setCopied(true);
      onShowToast('Copied to Clipboard', 'High-res cropped headshot is ready to paste anywhere.', 'success');
      setTimeout(() => setCopied(false), 2500);
    } else {
      onShowToast(
        'Clipboard Notice',
        'Direct image copy is not supported in this browser. Please use Download.',
        'info'
      );
    }
  };

  const handleSaveToLibrary = () => {
    if (!canvasHolderRef.current || !onSaveToDatabase) return;
    try {
      const dataUrl = canvasHolderRef.current.toDataURL(format, quality);
      onSaveToDatabase(dataUrl, pixelCrop.width, pixelCrop.height, format);
      setIsSavedToDb(true);
      onShowToast(
        'Saved to Studio Library',
        `Headshot (${pixelCrop.width}×${pixelCrop.height} px) saved to your collection.`,
        'success'
      );
    } catch (e) {
      console.error(e);
      onShowToast('Save Error', 'Failed to save headshot to your library.', 'error');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div>
            <h2 id="export-modal-title" className="text-lg font-bold text-neutral-900 tracking-tight">
              Export Cropped Headshot
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Client-side HTML5 canvas pixel extraction at original native resolution
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-colors"
            aria-label="Close export dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Cropped Preview Display */}
          <div className="flex flex-col items-center">
            <div className="relative max-h-72 w-auto rounded-2xl overflow-hidden border-2 border-neutral-200 shadow-md bg-neutral-950 flex items-center justify-center">
              {previewBlobUrl ? (
                <img
                  src={previewBlobUrl}
                  alt="Cropped headshot preview"
                  className="max-h-64 max-w-full object-contain"
                />
              ) : (
                <div className="p-12 text-neutral-400 text-xs flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                  Generating pixel canvas...
                </div>
              )}
            </div>

            {/* Spec details row */}
            <div className="mt-3 flex items-center gap-4 text-xs font-mono text-neutral-600">
              <span className="flex items-center gap-1 font-semibold text-neutral-900">
                <Maximize2 className="w-3.5 h-3.5 text-neutral-400" />
                {pixelCrop.width} × {pixelCrop.height} px
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-neutral-400" />
                {formatBytes(estimatedSize)}
              </span>
              <span>·</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                Lossless Ratio Preserved
              </span>
            </div>
          </div>

          {/* Export Controls Configuration */}
          <div className="space-y-4 pt-2 border-t border-neutral-100">
            {/* Format Selector */}
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                Output Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'image/jpeg', label: 'JPEG (.jpg)', desc: 'Best for bio/portraits' },
                  { id: 'image/png', label: 'PNG (.png)', desc: 'Lossless & transparent' },
                  { id: 'image/webp', label: 'WebP (.webp)', desc: 'Modern web optimized' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormat(item.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      format === item.id
                        ? 'border-neutral-950 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className={`text-[10px] mt-0.5 ${format === item.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider (for JPEG / WebP) */}
            {format !== 'image/png' && (
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="flex items-center gap-1.5 text-neutral-700">
                    <Sliders className="w-3.5 h-3.5" /> Compression Quality
                  </span>
                  <span className="font-mono text-neutral-900 font-bold">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.02"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                  <span>Balanced (Smaller file)</span>
                  <span>Maximum Fidelity (Studio Quality)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyClipboard}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-xs font-semibold text-neutral-800 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-neutral-600" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            {onSaveToDatabase && (
              <button
                onClick={handleSaveToLibrary}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                  isSavedToDb
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800'
                }`}
              >
                {isSavedToDb ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saved to Library</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Save to Library</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isExporting ? 'Exporting...' : 'Download Image'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
