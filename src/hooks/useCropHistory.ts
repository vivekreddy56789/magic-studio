import { useState, useCallback, useRef } from 'react';
import { CropRect, AspectRatioType, CropHistoryState } from '../types/crop';

const MAX_HISTORY_LENGTH = 50;

function isSameCropState(a: CropHistoryState, b: CropHistoryState): boolean {
  if (a.aspectRatioType !== b.aspectRatioType) return false;
  const tol = 0.05;
  return (
    Math.abs(a.crop.x - b.crop.x) < tol &&
    Math.abs(a.crop.y - b.crop.y) < tol &&
    Math.abs(a.crop.width - b.crop.width) < tol &&
    Math.abs(a.crop.height - b.crop.height) < tol
  );
}

export function useCropHistory(initialState?: CropHistoryState) {
  const [history, setHistory] = useState<CropHistoryState[]>(
    initialState ? [initialState] : []
  );
  const [currentIndex, setCurrentIndex] = useState<number>(
    initialState ? 0 : -1
  );

  // Keep a ref to the latest state for fast checks
  const historyRef = useRef<CropHistoryState[]>(history);
  historyRef.current = history;
  const currentIndexRef = useRef<number>(currentIndex);
  currentIndexRef.current = currentIndex;

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  /**
   * Reset the history stack with a new initial state (e.g. on new image load)
   */
  const resetHistory = useCallback((state: CropHistoryState) => {
    const freshState: CropHistoryState = {
      ...state,
      timestamp: Date.now(),
      label: state.label || 'Initial framing',
    };
    setHistory([freshState]);
    setCurrentIndex(0);
  }, []);

  /**
   * Push a new state onto the history stack (truncating any redo branch)
   */
  const pushState = useCallback((newState: CropHistoryState) => {
    setHistory((prevHistory) => {
      const activeIdx = currentIndexRef.current;
      const currentEntry = prevHistory[activeIdx];

      // If identical to the current active entry, don't create a redundant state
      if (currentEntry && isSameCropState(currentEntry, newState)) {
        return prevHistory;
      }

      // Discard future redo history
      const nextHistory = prevHistory.slice(0, activeIdx + 1);

      // Append new entry with timestamp
      const entryWithMeta: CropHistoryState = {
        ...newState,
        timestamp: Date.now(),
        label: newState.label || 'Crop adjustment',
      };

      // Cap at MAX_HISTORY_LENGTH
      if (nextHistory.length >= MAX_HISTORY_LENGTH) {
        nextHistory.shift();
      }

      const updated = [...nextHistory, entryWithMeta];
      setCurrentIndex(updated.length - 1);
      return updated;
    });
  }, []);

  /**
   * Undo to previous state
   */
  const undo = useCallback((): CropHistoryState | null => {
    const activeIdx = currentIndexRef.current;
    if (activeIdx <= 0) return null;

    const targetIdx = activeIdx - 1;
    setCurrentIndex(targetIdx);
    return historyRef.current[targetIdx] ?? null;
  }, []);

  /**
   * Redo to next state
   */
  const redo = useCallback((): CropHistoryState | null => {
    const activeIdx = currentIndexRef.current;
    const stack = historyRef.current;
    if (activeIdx >= stack.length - 1) return null;

    const targetIdx = activeIdx + 1;
    setCurrentIndex(targetIdx);
    return stack[targetIdx] ?? null;
  }, []);

  return {
    history,
    currentIndex,
    canUndo,
    canRedo,
    undo,
    redo,
    pushState,
    resetHistory,
    undoCount: Math.max(0, currentIndex),
    redoCount: Math.max(0, history.length - 1 - currentIndex),
    currentState: history[currentIndex] || null,
  };
}
