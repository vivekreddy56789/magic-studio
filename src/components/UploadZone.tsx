import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  AlertTriangle,
  X,
  CheckCircle,
  Smartphone,
  Loader2,
} from 'lucide-react';
import { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from '../utils/constants';
import { formatBytes, isHeicFile, convertHeicToJpeg } from '../utils/canvasUtils';
import { ImageMeta } from '../types/crop';

interface UploadZoneProps {
  onImageSelected: (file: File, meta: ImageMeta) => void;
  currentImageMeta: ImageMeta | null;
  onClearImage: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onImageSelected,
  currentImageMeta,
  onClearImage,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConvertingHeic, setIsConvertingHeic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validateAndProcessFile = useCallback(
    async (rawFile: File) => {
      setErrorMessage(null);

      // Check for iPhone HEIC / HEIF format
      let fileToProcess = rawFile;
      if (isHeicFile(rawFile)) {
        setIsConvertingHeic(true);
        try {
          fileToProcess = await convertHeicToJpeg(rawFile);
        } catch (err) {
          console.error('HEIC conversion failed:', err);
          setErrorMessage('Could not decode iPhone HEIC image. Please upload JPEG, PNG, or WebP.');
          setIsConvertingHeic(false);
          return;
        } finally {
          setIsConvertingHeic(false);
        }
      }

      // 1. Validate File Type
      const isValidType =
        ALLOWED_MIME_TYPES.includes(fileToProcess.type) ||
        ALLOWED_MIME_TYPES.includes(rawFile.type) ||
        /\.(jpe?g|png|webp|heic|heif)$/i.test(rawFile.name);

      if (!isValidType) {
        setErrorMessage(
          `Invalid file format "${rawFile.type || rawFile.name.split('.').pop()}". Supported: JPEG, PNG, WebP, and iPhone HEIC / HEIF.`
        );
        return;
      }

      // 2. Validate Payload Size (max 10 MB)
      if (rawFile.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(
          `File size (${formatBytes(rawFile.size)}) exceeds the maximum allowed payload of 10 MB.`
        );
        return;
      }

      // 3. Instant client-side preview via ObjectURL & image dimension extraction
      const objectUrl = URL.createObjectURL(fileToProcess);
      const img = new Image();

      img.onload = () => {
        const meta: ImageMeta = {
          url: objectUrl,
          name: rawFile.name,
          type: fileToProcess.type,
          sizeBytes: rawFile.size,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        };
        onImageSelected(fileToProcess, meta);
      };

      img.onerror = () => {
        setErrorMessage('Failed to decode the selected photo. Please verify image integrity.');
        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;
    },
    [onImageSelected]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  return (
    <div className="w-full">
      {/* Inline Validation Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm animate-in fade-in"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold">Upload Validation Error</p>
              <p className="text-xs text-rose-700">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 rounded-md text-rose-600 hover:bg-rose-100"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isConvertingHeic && fileInputRef.current?.click()}
        className={`relative rounded-3xl border-2 border-dashed p-6 sm:p-8 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center ${
          isDragOver
            ? 'border-neutral-900 bg-neutral-100/90 scale-[0.99]'
            : 'border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/heic,image/heif"
          className="hidden"
          onChange={handleFileInputChange}
          aria-label="Upload portrait photo"
        />

        {/* Icon & instructions */}
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800 mb-3 group-hover:scale-105 transition-transform">
          {isConvertingHeic ? (
            <Loader2 className="w-7 h-7 text-neutral-900 animate-spin" />
          ) : (
            <UploadCloud className="w-7 h-7 text-neutral-900" />
          )}
        </div>

        <h3 className="text-base font-bold text-neutral-900 mb-1">
          {isConvertingHeic
            ? 'Converting iPhone HEIC photo...'
            : 'Drop your portrait photo here, or browse'}
        </h3>
        <p className="text-xs text-neutral-500 max-w-sm mb-3">
          Compatible with iPhone (HEIC/HEIF), Android & desktop formats up to 10 MB
        </p>

        {/* Format chips including iPhone HEIC and Android */}
        <div className="flex items-center flex-wrap justify-center gap-1.5 text-[11px] font-medium text-neutral-500">
          <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">JPEG</span>
          <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">PNG</span>
          <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">WebP</span>
          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold flex items-center gap-1">
            <Smartphone className="w-3 h-3" /> HEIC / HEIF (iPhone)
          </span>
          <span>·</span>
          <span>Max 10 MB</span>
        </div>
      </div>

      {/* Active Thumbnail Info Card */}
      {currentImageMeta && (
        <div className="mt-4 flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
              <img
                src={currentImageMeta.url}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                {currentImageMeta.name}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                <span>{currentImageMeta.naturalWidth} × {currentImageMeta.naturalHeight} px</span>
                <span>·</span>
                <span>{formatBytes(currentImageMeta.sizeBytes)}</span>
                <span>·</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Ready for AI
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              Change
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearImage();
              }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              aria-label="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
