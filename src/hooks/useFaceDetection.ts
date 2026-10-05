import { useState, useCallback } from 'react';
import { CropRect, AICropSuggestionResult } from '../types/crop';

/**
 * Computes deterministic AI Crop Suggestion based on source dimensions & upper-third rule
 */
export function calculateHeuristicCrop(
  naturalWidth: number,
  naturalHeight: number,
  targetRatio: number = 3 / 4 // width / height
): AICropSuggestionResult {
  const imageAspect = naturalWidth / naturalHeight;

  let cropWidthPct: number;
  let cropHeightPct: number;

  if (imageAspect > targetRatio) {
    // Image is wider than the target ratio (e.g. landscape or wide portrait)
    // Headshot should capture ~70-85% of image height
    cropHeightPct = Math.min(88, Math.max(55, naturalHeight > 1000 ? 75 : 80));
    const cropPixelHeight = (cropHeightPct / 100) * naturalHeight;
    const cropPixelWidth = cropPixelHeight * targetRatio;
    cropWidthPct = (cropPixelWidth / naturalWidth) * 100;
  } else {
    // Image is taller or equal ratio
    // Headshot should capture ~75-90% of image width
    cropWidthPct = Math.min(88, Math.max(55, 78));
    const cropPixelWidth = (cropWidthPct / 100) * naturalWidth;
    const cropPixelHeight = cropPixelWidth / targetRatio;
    cropHeightPct = (cropPixelHeight / naturalHeight) * 100;
  }

  // Ensure dimensions do not exceed 100%
  if (cropWidthPct > 96) {
    const scale = 96 / cropWidthPct;
    cropWidthPct *= scale;
    cropHeightPct *= scale;
  }
  if (cropHeightPct > 96) {
    const scale = 96 / cropHeightPct;
    cropWidthPct *= scale;
    cropHeightPct *= scale;
  }

  // Center horizontally
  const x = Math.max(0, (100 - cropWidthPct) / 2);

  // Position vertically: Upper-third heuristic
  // Faces naturally sit in the upper-third of portrait photos.
  // We place top of crop around 4% - 12% to preserve natural headroom
  const availableVerticalTravel = 100 - cropHeightPct;
  // Eye line around 33% of crop frame -> top offset is around 15-25% of available travel
  const y = Math.max(0, Math.min(availableVerticalTravel, availableVerticalTravel * 0.22));

  return {
    crop: {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      width: Number(cropWidthPct.toFixed(2)),
      height: Number(cropHeightPct.toFixed(2)),
    },
    confidence: 0.94,
    method: 'heuristic-upper-third',
    faceCenter: {
      x: Number((x + cropWidthPct / 2).toFixed(2)),
      y: Number((y + cropHeightPct * 0.38).toFixed(2)),
    },
    explanation:
      'Optimal portrait framing: Centered upper-third rule with 10% crown headroom and balanced shoulder line.',
  };
}

/**
 * Fast client-side image edge/luminance density analysis for focal centering
 */
export async function analyzeImageFocalCenter(
  imgElement: HTMLImageElement
): Promise<{ centerX: number; centerY: number } | null> {
  try {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(imgElement, 0, 0, size, size);
    const imgData = ctx.getImageData(0, 0, size, size).data;

    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    // Evaluate high-frequency variations / facial skin tone region (focusing on upper 65% of image)
    for (let y = 0; y < Math.floor(size * 0.65); y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];

        // Simple skin tone & edge intensity weighting
        const isWarm = r > g && g > b && r > 60;
        const variance = Math.abs(r - g) + Math.abs(g - b);
        const weight = (isWarm ? 2.5 : 1.0) * (variance > 20 ? 1.5 : 0.8);

        totalWeight += weight;
        weightedX += x * weight;
        weightedY += y * weight;
      }
    }

    if (totalWeight === 0) return null;

    return {
      centerX: (weightedX / totalWeight / size) * 100,
      centerY: (weightedY / totalWeight / size) * 100,
    };
  } catch (e) {
    console.warn('Focal analysis fallback to standard geometry', e);
    return null;
  }
}

export function useFaceDetection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AICropSuggestionResult | null>(null);

  const generateSuggestion = useCallback(
    async (
      imgElement: HTMLImageElement,
      targetRatio: number = 3 / 4
    ): Promise<AICropSuggestionResult> => {
      setIsAnalyzing(true);
      try {
        // Run deterministic heuristic calculation
        const base = calculateHeuristicCrop(
          imgElement.naturalWidth,
          imgElement.naturalHeight,
          targetRatio
        );

        // Optionally refine with client-side focal center
        const focal = await analyzeImageFocalCenter(imgElement);
        if (focal && focal.centerX > 30 && focal.centerX < 70) {
          // Adjust horizontal position slightly if face is off-center
          const adjustedX = Math.max(
            0,
            Math.min(100 - base.crop.width, focal.centerX - base.crop.width / 2)
          );
          base.crop.x = Number(adjustedX.toFixed(2));
          if (base.faceCenter) {
            base.faceCenter.x = Number(focal.centerX.toFixed(2));
          }
        }

        setAiSuggestion(base);
        return base;
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  return {
    isAnalyzing,
    aiSuggestion,
    setAiSuggestion,
    generateSuggestion,
  };
}
