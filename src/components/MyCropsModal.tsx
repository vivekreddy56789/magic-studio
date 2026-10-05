import React from 'react';
import { X, Download, Trash2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { SavedCropItem, TempAuthDatabase } from '../services/tempAuthDatabase';
import { triggerDownload } from '../utils/canvasUtils';

interface MyCropsModalProps {
  isOpen: boolean;
  onClose: () => void;
  crops: SavedCropItem[];
  onDeleteCrop: (id: string) => void;
  onSelectCropToPreview?: (crop: SavedCropItem) => void;
}

export const MyCropsModal: React.FC<MyCropsModalProps> = ({
  isOpen,
  onClose,
  crops,
  onDeleteCrop,
}) => {
  if (!isOpen) return null;

  const handleDownload = (crop: SavedCropItem) => {
    // Convert data URL to Blob and download
    fetch(crop.thumbnailDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        triggerDownload(
          blob,
          `magicstudio-saved-headshot-${crop.width}x${crop.height}.${crop.format.replace('image/', '')}`
        );
      });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900">
                Saved Headshots Gallery
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                {crops.length} {crops.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Your saved high-resolution headshots and crops
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {crops.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-3">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800">No saved headshots yet</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                Crop any portrait photo and click Save to store it in your studio gallery.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {crops.map((crop) => (
                <div
                  key={crop.id}
                  className="group relative rounded-2xl border border-neutral-200 overflow-hidden bg-neutral-50 flex flex-col"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-900">
                    <img
                      src={crop.thumbnailDataUrl}
                      alt="Saved crop"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3 bg-white flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {crop.width} × {crop.height} px
                      </p>
                      <p className="text-[10px] text-neutral-400 uppercase font-mono">
                        {crop.format.replace('image/', '')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDownload(crop)}
                        className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                        title="Download image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteCrop(crop.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Delete headshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
