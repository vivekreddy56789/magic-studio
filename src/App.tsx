import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { PresetShowcase } from './components/PresetShowcase';
import { UploadZone } from './components/UploadZone';
import { CropCanvas } from './components/CropEditor/CropCanvas';
import { CropToolbar } from './components/CropEditor/CropToolbar';
import { LivePreview } from './components/CropEditor/LivePreview';
import { ExportModal } from './components/ExportModal';
import { AuthModal } from './components/AuthModal';
import { MyCropsModal } from './components/MyCropsModal';
import { ToastContainer } from './components/Toast';
import { InfoSection } from './components/InfoSection';
import { Footer } from './components/Footer';
import { TempAuthDatabase, User, SavedCropItem } from './services/tempAuthDatabase';

import { ImageMeta, AspectRatioType, ToastMessage, CropRect, CropHistoryState } from './types/crop';
import { SAMPLE_PORTRAITS, SamplePortrait } from './utils/constants';
import { useFaceDetection } from './hooks/useFaceDetection';
import { useCropBox } from './hooks/useCropBox';
import { useCropHistory } from './hooks/useCropHistory';
import { Sparkles, RefreshCw, Undo2, Redo2 } from 'lucide-react';

export default function App() {
  // Main Image State
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(SAMPLE_PORTRAITS[0].id);

  // Aspect Ratio State
  const [aspectRatioType, setAspectRatioType] = useState<AspectRatioType>('3:4');

  // Display and Guides
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showFaceGuide, setShowFaceGuide] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isMyCropsModalOpen, setIsMyCropsModalOpen] = useState<boolean>(false);

  // User Authentication & Library State
  const [currentUser, setCurrentUser] = useState<User | null>(() => TempAuthDatabase.getCurrentUser());
  const [savedCrops, setSavedCrops] = useState<SavedCropItem[]>(() => {
    const user = TempAuthDatabase.getCurrentUser();
    return TempAuthDatabase.getUserCrops(user?.id || 'guest');
  });

  // Keep saved crops in sync whenever user changes
  useEffect(() => {
    if (currentUser) {
      setSavedCrops(TempAuthDatabase.getUserCrops(currentUser.id));
    } else {
      setSavedCrops([]);
    }
  }, [currentUser]);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Workspace container ref
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const uploadSectionRef = useRef<HTMLDivElement | null>(null);

  // AI & Face Detection Hook
  const { aiSuggestion, setAiSuggestion, generateSuggestion, isAnalyzing } = useFaceDetection();

  // History State Manager Hook
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    pushState,
    resetHistory,
    undoCount,
    redoCount,
  } = useCropHistory();

  // Flag to avoid recording history when undo/redo itself modifies crop
  const isHistoryTraversingRef = useRef<boolean>(false);

  // Helper to show toasts
  const addToast = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Callback when a user finishes adjusting crop boundaries (drag or keyboard nudge)
  const handleCropChangeEnd = useCallback(
    (newCrop: CropRect, actionLabel: string) => {
      if (isHistoryTraversingRef.current) return;
      pushState({
        crop: newCrop,
        aspectRatioType,
        label: actionLabel,
      });
    },
    [aspectRatioType, pushState]
  );

  // Crop Box Hook
  const {
    crop,
    setCrop,
    isInteracting,
    activeHandle,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleKeyDown,
  } = useCropBox({
    initialCrop: { x: 15, y: 8, width: 70, height: 75 },
    aspectRatioType,
    imageNaturalWidth: imageMeta?.naturalWidth || 1000,
    imageNaturalHeight: imageMeta?.naturalHeight || 1000,
    containerRef: canvasContainerRef,
    onCropChangeEnd: handleCropChangeEnd,
  });

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    isHistoryTraversingRef.current = true;
    const prev = undo();
    if (prev) {
      setCrop(prev.crop);
      setAspectRatioType(prev.aspectRatioType);
      addToast('Undone', prev.label ? `Reverted: ${prev.label}` : 'Restored previous crop boundary', 'info');
    }
    setTimeout(() => {
      isHistoryTraversingRef.current = false;
    }, 50);
  }, [canUndo, undo, setCrop, addToast]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    isHistoryTraversingRef.current = true;
    const next = redo();
    if (next) {
      setCrop(next.crop);
      setAspectRatioType(next.aspectRatioType);
      addToast('Redone', next.label ? `Re-applied: ${next.label}` : 'Restored crop adjustment', 'info');
    }
    setTimeout(() => {
      isHistoryTraversingRef.current = false;
    }, 50);
  }, [canRedo, redo, setCrop, addToast]);

  // Keyboard shortcut listener for Undo (Cmd/Ctrl + Z) and Redo (Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (!modifier) return;

      const key = e.key.toLowerCase();

      // Redo: Cmd+Shift+Z or Ctrl+Shift+Z or Ctrl+Y
      if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Undo: Cmd+Z or Ctrl+Z
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleUndo, handleRedo]);

  // Load a portrait into the cropping tool
  const loadPortrait = useCallback(
    async (url: string, name: string, sampleId: string | null = null, sizeBytes = 1500000) => {
      setSelectedSampleId(sampleId);
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = async () => {
        const meta: ImageMeta = {
          url,
          name,
          type: 'image/jpeg',
          sizeBytes,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        };
        setImageMeta(meta);

        // Calculate AI suggestion based on source dimensions
        const suggestion = await generateSuggestion(img, 3 / 4);
        setCrop(suggestion.crop);
        setAspectRatioType('3:4');
        setZoomLevel(1.0);
        setRotationAngle(0);

        // Initialize history stack with initial state
        resetHistory({
          crop: suggestion.crop,
          aspectRatioType: '3:4',
          label: 'Initial AI upper-third framing',
        });

        addToast(
          'AI Headshot Framing Applied',
          'Heuristic upper-third framing calculated based on source dimensions.',
          'info'
        );
      };

      img.onerror = () => {
        addToast('Load Error', 'Failed to load sample portrait image.', 'error');
      };

      img.src = url;
    },
    [generateSuggestion, setCrop, resetHistory, addToast]
  );



  // Handle User Upload
  const handleUserUpload = (file: File, meta: ImageMeta) => {
    setImageMeta(meta);
    setSelectedSampleId(null);

    const img = new Image();
    img.onload = async () => {
      const suggestion = await generateSuggestion(img, 3 / 4);
      setCrop(suggestion.crop);
      setAspectRatioType('3:4');
      setZoomLevel(1.0);
      setRotationAngle(0);

      // Reset history for the newly uploaded photo
      resetHistory({
        crop: suggestion.crop,
        aspectRatioType: '3:4',
        label: 'Upload initial crop',
      });

      addToast(
        'Upload Successful',
        `Analyzed ${meta.naturalWidth}×${meta.naturalHeight}px photo. Optimal crop suggested.`,
        'success'
      );
    };
    img.src = meta.url;
  };

  // Aspect ratio change wrapper to record in history
  const handleSelectAspectRatio = (newRatio: AspectRatioType) => {
    if (newRatio === aspectRatioType) return;
    setAspectRatioType(newRatio);
    pushState({
      crop,
      aspectRatioType: newRatio,
      label: `Aspect ratio preset: ${newRatio.toUpperCase()}`,
    });
  };

  // Reset to AI Suggestion (Required in Spec 2.3)
  const handleResetToAI = () => {
    if (!imageMeta) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const targetRatio = aspectRatioType === 'free' ? 3 / 4 : 3 / 4;
      const suggestion = await generateSuggestion(img, targetRatio);
      setCrop(suggestion.crop);
      setZoomLevel(1.0);
      setRotationAngle(0);

      // Push reset action to history
      pushState({
        crop: suggestion.crop,
        aspectRatioType,
        label: 'Reset to AI recommendation',
      });

      addToast(
        'Reset to AI Coordinates',
        'Crop boundaries restored to initial deterministic upper-third recommendation.',
        'success'
      );
    };
    img.src = imageMeta.url;
  };

  const handleClearImage = () => {
    setImageMeta(null);
    setSelectedSampleId(null);
    addToast('Photo Cleared', 'Upload a photo or choose a preset to begin cropping.', 'info');
  };

  const scrollToUpload = () => {
    const studioSection = document.getElementById('studio');
    if (studioSection) {
      studioSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setSavedCrops(TempAuthDatabase.getUserCrops(user.id));
    addToast(
      'Signed In Successfully',
      `Welcome back, ${user.name}!`,
      'success'
    );
  };

  const handleLogout = () => {
    TempAuthDatabase.logout();
    setCurrentUser(null);
    setSavedCrops([]);
    addToast('Signed Out', 'You have been safely signed out.', 'info');
  };

  const handleSaveCropToDatabase = (dataUrl: string, width: number, height: number, format: string) => {
    const userId = currentUser ? currentUser.id : 'guest';
    const newCrop = TempAuthDatabase.saveCrop({
      userId,
      thumbnailDataUrl: dataUrl,
      width,
      height,
      format,
    });
    setSavedCrops((prev) => [newCrop, ...prev]);
  };

  const handleDeleteCrop = (cropId: string) => {
    TempAuthDatabase.deleteCrop(cropId);
    setSavedCrops((prev) => prev.filter((c) => c.id !== cropId));
    addToast('Headshot Removed', 'Photo removed from your library.', 'info');
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col selection:bg-neutral-900 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Global Header */}
      <Header
        onUploadClick={scrollToUpload}
        hasActiveImage={!!imageMeta}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenSavedCrops={() => setIsMyCropsModalOpen(true)}
        savedCropsCount={savedCrops.length}
      />

      <main className="flex-1">
        {/* Editorial Hero Section matching user screenshot */}
        <HeroSection
          onQuickUpload={scrollToUpload}
          activeImagePresent={!!imageMeta}
        />



        {/* Interactive Headshot Studio Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="studio">
          <div className="bg-white rounded-[32px] border border-neutral-200/90 shadow-sm p-4 sm:p-8">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-neutral-100 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                    Interactive Headshot Cropper
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                  Studio Crop Workspace
                </h2>
              </div>

              {/* Status, History Quick Badge and Method Indicator */}
              <div className="flex items-center gap-3">
                {/* Active History Status indicator */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200/70 text-xs text-neutral-600">
                  <span className="text-neutral-400 font-medium">History:</span>
                  <span className="font-semibold text-neutral-800">
                    {undoCount} {undoCount === 1 ? 'step' : 'steps'}
                  </span>
                  <span className="text-neutral-300">·</span>
                  <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-600">
                    ⌘Z / Ctrl+Z
                  </kbd>
                </div>

                <button
                  onClick={handleResetToAI}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors"
                  title="Re-run deterministic framing heuristic"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>Re-analyze</span>
                </button>
              </div>
            </div>

            {/* If an image is loaded, display the full dual-column Editor workspace */}
            {imageMeta ? (
              <div className="space-y-6">
                {/* Responsive Dual Column: Left = Main Canvas, Right = Controls & Live Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Interactive Canvas (8 Cols on Desktop) */}
                  <div className="lg:col-span-8 flex flex-col gap-4">
                    <CropCanvas
                      imageSrc={imageMeta.url}
                      imageAlt={imageMeta.name}
                      crop={crop}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onKeyDown={handleKeyDown}
                      containerRef={canvasContainerRef}
                      showGrid={showGrid}
                      showFaceGuide={showFaceGuide}
                      aiSuggestion={aiSuggestion}
                      zoomLevel={zoomLevel}
                      rotationAngle={rotationAngle}
                    />

                    {/* Toolbar directly beneath canvas with Undo/Redo */}
                    <CropToolbar
                      currentAspectRatio={aspectRatioType}
                      onSelectAspectRatio={handleSelectAspectRatio}
                      onResetToAI={handleResetToAI}
                      isResetDisabled={isAnalyzing}
                      canUndo={canUndo}
                      canRedo={canRedo}
                      undoCount={undoCount}
                      redoCount={redoCount}
                      onUndo={handleUndo}
                      onRedo={handleRedo}
                      showGrid={showGrid}
                      onToggleGrid={() => setShowGrid(!showGrid)}
                      showFaceGuide={showFaceGuide}
                      onToggleFaceGuide={() => setShowFaceGuide(!showFaceGuide)}
                      zoomLevel={zoomLevel}
                      onZoomChange={setZoomLevel}
                      rotationAngle={rotationAngle}
                      onRotate={() => setRotationAngle((prev) => (prev + 90) % 360)}
                      onExportClick={() => setIsExportModalOpen(true)}
                    />
                  </div>

                  {/* Right Column: Live Previews & Details (4 Cols on Desktop) */}
                  <div className="lg:col-span-4 flex flex-col gap-4">
                    {/* Live Preview Card */}
                    <LivePreview
                      imageSrc={imageMeta.url}
                      crop={crop}
                      naturalWidth={imageMeta.naturalWidth}
                      naturalHeight={imageMeta.naturalHeight}
                      aspectRatioType={aspectRatioType}
                    />

                    {/* AI Suggestion Insight Card */}
                    <div className="p-5 rounded-3xl bg-neutral-50 border border-neutral-200/80 text-xs">
                      <div className="flex items-center gap-2 mb-2 font-bold text-neutral-900">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>AI Suggestion Rationale</span>
                      </div>
                      <p className="text-neutral-600 leading-relaxed mb-3">
                        {aiSuggestion?.explanation ||
                          'Framing centers the subject within the upper-third vertical band, reserving headroom and retaining natural shoulder balance.'}
                      </p>
                      <div className="space-y-1.5 pt-2 border-t border-neutral-200/70 text-[11px] text-neutral-500">
                        <div className="flex justify-between">
                          <span>Algorithm:</span>
                          <span className="font-semibold text-neutral-800">
                            Deterministic Geometry
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Eye-line Guideline:</span>
                          <span className="font-semibold text-neutral-800">
                            33.3% Top Line
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>History States:</span>
                          <span className="font-semibold text-neutral-800">
                            {undoCount} undoable / {redoCount} redoable
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Upload / Replace Box */}
                    <div ref={uploadSectionRef} className="pt-2">
                      <UploadZone
                        onImageSelected={handleUserUpload}
                        currentImageMeta={imageMeta}
                        onClearImage={handleClearImage}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state / Prompt to upload */
              <div ref={uploadSectionRef} className="max-w-xl mx-auto py-10">
                <UploadZone
                  onImageSelected={handleUserUpload}
                  currentImageMeta={null}
                  onClearImage={handleClearImage}
                />
              </div>
            )}
          </div>
        </section>

        {/* Process, AI Heuristics & Golden Ratio Architecture Section */}
        <InfoSection />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Client-Side Export Modal (HTML5 Canvas API) */}
      {imageMeta && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          imageSrc={imageMeta.url}
          imageName={imageMeta.name}
          crop={crop}
          naturalWidth={imageMeta.naturalWidth}
          naturalHeight={imageMeta.naturalHeight}
          onShowToast={addToast}
          onSaveToDatabase={handleSaveCropToDatabase}
          isLoggedIn={!!currentUser}
        />
      )}

      {/* Temporary Database Authentication Modal (Login & Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Temporary Database Saved Crops Gallery Modal */}
      <MyCropsModal
        isOpen={isMyCropsModalOpen}
        onClose={() => setIsMyCropsModalOpen(false)}
        crops={savedCrops}
        onDeleteCrop={handleDeleteCrop}
      />
    </div>
  );
}
