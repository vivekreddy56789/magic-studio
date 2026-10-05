import { useState, useRef, useCallback, useEffect } from 'react';
import { CropRect, ResizeHandle, AspectRatioType } from '../types/crop';
import { ASPECT_RATIO_PRESETS } from '../utils/constants';

interface UseCropBoxProps {
  initialCrop?: CropRect;
  aspectRatioType: AspectRatioType;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCropChangeEnd?: (newCrop: CropRect, actionLabel: string) => void;
}

export function useCropBox({
  initialCrop = { x: 15, y: 10, width: 70, height: 75 },
  aspectRatioType,
  imageNaturalWidth,
  imageNaturalHeight,
  containerRef,
  onCropChangeEnd,
}: UseCropBoxProps) {
  const [crop, setCrop] = useState<CropRect>(initialCrop);
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | 'move' | null>(null);

  // Store drag start coordinates
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
    containerWidth: number;
    containerHeight: number;
    handle: ResizeHandle | 'move';
  } | null>(null);

  // Ref to hold current crop for access in event handlers without stale closures
  const currentCropRef = useRef<CropRect>(crop);
  currentCropRef.current = crop;

  const keyNudgeTimeoutRef = useRef<number | null>(null);

  // Keep track of the target numerical aspect ratio (width / height)
  const currentRatio =
    ASPECT_RATIO_PRESETS.find((p) => p.id === aspectRatioType)?.ratio ?? null;

  // Whenever aspect ratio type changes, adjust current crop to match ratio while preserving center
  useEffect(() => {
    if (!currentRatio || imageNaturalWidth <= 0 || imageNaturalHeight <= 0) return;

    setCrop((prev) => {
      // Calculate current center in percentage
      const centerX = prev.x + prev.width / 2;
      const centerY = prev.y + prev.height / 2;

      const imageAspect = imageNaturalWidth / imageNaturalHeight; // W_img / H_img
      const pctRatioMultiplier = currentRatio / imageAspect; // w_pct / h_pct

      let newWidthPct = prev.width;
      let newHeightPct = newWidthPct / pctRatioMultiplier;

      // If new height exceeds bounds, clamp and scale width
      if (newHeightPct > 95) {
        newHeightPct = 95;
        newWidthPct = newHeightPct * pctRatioMultiplier;
      }
      if (newWidthPct > 95) {
        newWidthPct = 95;
        newHeightPct = newWidthPct / pctRatioMultiplier;
      }

      // Re-center around previous center
      let newX = centerX - newWidthPct / 2;
      let newY = centerY - newHeightPct / 2;

      // Clamp to [0, 100 - size]
      newX = Math.max(0, Math.min(100 - newWidthPct, newX));
      newY = Math.max(0, Math.min(100 - newHeightPct, newY));

      const updatedCrop = {
        x: Number(newX.toFixed(2)),
        y: Number(newY.toFixed(2)),
        width: Number(newWidthPct.toFixed(2)),
        height: Number(newHeightPct.toFixed(2)),
      };

      currentCropRef.current = updatedCrop;
      return updatedCrop;
    });
  }, [aspectRatioType, currentRatio, imageNaturalWidth, imageNaturalHeight]);

  // Pointer Down handler
  const handlePointerDown = useCallback(
    (
      e: React.PointerEvent<HTMLElement>,
      handle: ResizeHandle | 'move'
    ) => {
      e.preventDefault();
      e.stopPropagation();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Capture pointer for smooth 60fps tracking even outside container
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Fallback
      }

      dragStartRef.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        cropX: crop.x,
        cropY: crop.y,
        cropWidth: crop.width,
        cropHeight: crop.height,
        containerWidth: rect.width,
        containerHeight: rect.height,
        handle,
      };

      setIsInteracting(true);
      setActiveHandle(handle);
    },
    [crop, containerRef]
  );

  // Pointer Move handler
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!isInteracting || !dragStartRef.current || !activeHandle) return;

      const {
        pointerX,
        pointerY,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        containerWidth,
        containerHeight,
      } = dragStartRef.current;

      const deltaPixelX = e.clientX - pointerX;
      const deltaPixelY = e.clientY - pointerY;

      // Convert delta to percentage of container
      const deltaPctX = (deltaPixelX / containerWidth) * 100;
      const deltaPctY = (deltaPixelY / containerHeight) * 100;

      const MIN_SIZE_PCT = 12; // Minimum crop dimension percentage

      // Ratio multiplier: w_pct / h_pct = ratio * (naturalHeight / naturalWidth)
      const imageAspect = imageNaturalWidth / (imageNaturalHeight || 1);
      const pctRatioMultiplier = currentRatio ? currentRatio / imageAspect : null;

      if (activeHandle === 'move') {
        let newX = cropX + deltaPctX;
        let newY = cropY + deltaPctY;

        // Clamp inside bounds
        newX = Math.max(0, Math.min(100 - cropWidth, newX));
        newY = Math.max(0, Math.min(100 - cropHeight, newY));

        const updated = {
          x: Number(newX.toFixed(2)),
          y: Number(newY.toFixed(2)),
          width: cropWidth,
          height: cropHeight,
        };
        currentCropRef.current = updated;
        setCrop(updated);
        return;
      }

      // Handle Resizing
      let newX = cropX;
      let newY = cropY;
      let newWidth = cropWidth;
      let newHeight = cropHeight;

      const isLeft = activeHandle.includes('w');
      const isRight = activeHandle.includes('e');
      const isTop = activeHandle.includes('n');
      const isBottom = activeHandle.includes('s');

      // 1. Calculate unconstrained tentative bounds
      if (isRight) {
        newWidth = Math.max(MIN_SIZE_PCT, Math.min(100 - cropX, cropWidth + deltaPctX));
      } else if (isLeft) {
        const potentialWidth = cropWidth - deltaPctX;
        if (potentialWidth >= MIN_SIZE_PCT) {
          const potentialX = cropX + deltaPctX;
          if (potentialX >= 0) {
            newX = potentialX;
            newWidth = potentialWidth;
          } else {
            newX = 0;
            newWidth = cropX + cropWidth;
          }
        }
      }

      if (isBottom) {
        newHeight = Math.max(MIN_SIZE_PCT, Math.min(100 - cropY, cropHeight + deltaPctY));
      } else if (isTop) {
        const potentialHeight = cropHeight - deltaPctY;
        if (potentialHeight >= MIN_SIZE_PCT) {
          const potentialY = cropY + deltaPctY;
          if (potentialY >= 0) {
            newY = potentialY;
            newHeight = potentialHeight;
          } else {
            newY = 0;
            newHeight = cropY + cropHeight;
          }
        }
      }

      // 2. If aspect ratio is locked, preserve aspect ratio
      if (pctRatioMultiplier !== null) {
        if (activeHandle === 'e' || activeHandle === 'w') {
          newHeight = newWidth / pctRatioMultiplier;
          newY = cropY + (cropHeight - newHeight) / 2;
          if (newY < 0) {
            newY = 0;
            newHeight = Math.min(100, newWidth / pctRatioMultiplier);
            newWidth = newHeight * pctRatioMultiplier;
          } else if (newY + newHeight > 100) {
            newHeight = 100 - newY;
            newWidth = newHeight * pctRatioMultiplier;
          }
        } else if (activeHandle === 'n' || activeHandle === 's') {
          newWidth = newHeight * pctRatioMultiplier;
          newX = cropX + (cropWidth - newWidth) / 2;
          if (newX < 0) {
            newX = 0;
            newWidth = Math.min(100, newHeight * pctRatioMultiplier);
            newHeight = newWidth / pctRatioMultiplier;
          } else if (newX + newWidth > 100) {
            newWidth = 100 - newX;
            newHeight = newWidth / pctRatioMultiplier;
          }
        } else {
          if (Math.abs(deltaPctX) > Math.abs(deltaPctY)) {
            newHeight = newWidth / pctRatioMultiplier;
            if (isTop) {
              newY = cropY + cropHeight - newHeight;
            }
          } else {
            newWidth = newHeight * pctRatioMultiplier;
            if (isLeft) {
              newX = cropX + cropWidth - newWidth;
            }
          }
        }
      }

      // Final boundary clamp
      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX + newWidth > 100) {
        newWidth = 100 - newX;
        if (pctRatioMultiplier !== null) newHeight = newWidth / pctRatioMultiplier;
      }
      if (newY + newHeight > 100) {
        newHeight = 100 - newY;
        if (pctRatioMultiplier !== null) newWidth = newHeight * pctRatioMultiplier;
      }

      const updated = {
        x: Number(newX.toFixed(2)),
        y: Number(newY.toFixed(2)),
        width: Number(Math.max(MIN_SIZE_PCT, newWidth).toFixed(2)),
        height: Number(Math.max(MIN_SIZE_PCT, newHeight).toFixed(2)),
      };
      currentCropRef.current = updated;
      setCrop(updated);
    },
    [
      isInteracting,
      activeHandle,
      currentRatio,
      imageNaturalWidth,
      imageNaturalHeight,
    ]
  );

  // Pointer Up handler
  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (isInteracting) {
        try {
          if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
          }
        } catch {
          // Ignore
        }

        // Check if crop changed from dragStart to push history
        if (dragStartRef.current && onCropChangeEnd) {
          const { cropX, cropY, cropWidth, cropHeight, handle } = dragStartRef.current;
          const current = currentCropRef.current;
          const tol = 0.05;
          const hasChanged =
            Math.abs(current.x - cropX) > tol ||
            Math.abs(current.y - cropY) > tol ||
            Math.abs(current.width - cropWidth) > tol ||
            Math.abs(current.height - cropHeight) > tol;

          if (hasChanged) {
            const label =
              handle === 'move'
                ? 'Reposition crop area'
                : `Resize handle (${handle.toUpperCase()})`;
            onCropChangeEnd(current, label);
          }
        }

        setIsInteracting(false);
        setActiveHandle(null);
        dragStartRef.current = null;
      }
    },
    [isInteracting, onCropChangeEnd]
  );

  // Keyboard navigation & nudging for accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 2 : 0.5;

      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else return;

      e.preventDefault();

      setCrop((prev) => {
        const nextX = Math.max(0, Math.min(100 - prev.width, prev.x + dx));
        const nextY = Math.max(0, Math.min(100 - prev.height, prev.y + dy));
        const nextCrop = {
          ...prev,
          x: Number(nextX.toFixed(2)),
          y: Number(nextY.toFixed(2)),
        };

        currentCropRef.current = nextCrop;

        // Debounce history recording for continuous arrow key nudges
        if (onCropChangeEnd) {
          if (keyNudgeTimeoutRef.current) {
            window.clearTimeout(keyNudgeTimeoutRef.current);
          }
          keyNudgeTimeoutRef.current = window.setTimeout(() => {
            onCropChangeEnd(nextCrop, 'Nudge crop area (Arrow keys)');
          }, 350);
        }

        return nextCrop;
      });
    },
    [onCropChangeEnd]
  );

  return {
    crop,
    setCrop,
    isInteracting,
    activeHandle,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleKeyDown,
  };
}
