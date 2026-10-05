import { CropRect, PixelCrop, ExportOptions } from '../types/crop';
import heic2any from 'heic2any';

/**
 * Checks if a file is an iPhone HEIC/HEIF photo
 */
export function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    type === 'image/heic' ||
    type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
}

/**
 * Converts iPhone HEIC/HEIF photo to standard JPEG Blob for canvas and browser compatibility
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    const conversionResult = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.95,
    });

    const blob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
    const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');

    return new File([blob], newFileName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn('HEIC conversion warning, attempting direct browser decode:', error);
    return file;
  }
}

/**
 * Converts percentage-based crop (0..100) to actual natural image pixel dimensions
 */
export function getPixelCrop(
  crop: CropRect,
  naturalWidth: number,
  naturalHeight: number
): PixelCrop {
  const x = Math.max(0, Math.round((crop.x / 100) * naturalWidth));
  const y = Math.max(0, Math.round((crop.y / 100) * naturalHeight));
  const width = Math.min(
    naturalWidth - x,
    Math.round((crop.width / 100) * naturalWidth)
  );
  const height = Math.min(
    naturalHeight - y,
    Math.round((crop.height / 100) * naturalHeight)
  );

  return { x, y, width: Math.max(1, width), height: Math.max(1, height) };
}

/**
 * Extracts the cropped area directly from an HTMLImageElement using HTML5 Canvas API
 */
export async function getCroppedCanvas(
  image: HTMLImageElement,
  crop: CropRect,
  options?: { customWidth?: number; customHeight?: number }
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Could not obtain 2D rendering context from HTML5 Canvas');
  }

  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;

  const pixelCrop = getPixelCrop(crop, naturalWidth, naturalHeight);

  const targetWidth = options?.customWidth || pixelCrop.width;
  const targetHeight = options?.customHeight || pixelCrop.height;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return canvas;
}

/**
 * Generates an image Blob from a canvas with format and quality options
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  options: ExportOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to generate image blob from canvas'));
          return;
        }
        resolve(blob);
      },
      options.format,
      options.quality
    );
  });
}

/**
 * Triggers an immediate browser download for the given Blob
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}

/**
 * Copies a PNG blob to the system clipboard
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) {
      return false;
    }
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    );
    if (!blob) return false;
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    return true;
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    return false;
  }
}

/**
 * Formats byte size into human readable string (e.g. 1.4 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
