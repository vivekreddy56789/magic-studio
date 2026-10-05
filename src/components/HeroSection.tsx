import React from 'react';
import { ChevronRight, Sparkles, Smartphone, Check } from 'lucide-react';

interface HeroSectionProps {
  onQuickUpload: () => void;
  activeImagePresent: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onQuickUpload,
  activeImagePresent,
}) => {
  return (
    <section className="pt-12 pb-6 text-center px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Product Tag */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-100/90 border border-neutral-200/80 rounded-full mb-6">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-xs font-semibold text-neutral-800">
          Studio Grade AI Headshot Cropping & Precision Framing
        </span>
      </div>

      {/* Headline matching Magic Studio typography with italic emphasis */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-neutral-950 tracking-tight leading-[1.08] mb-5 font-sans">
        Your <span className="font-serif italic font-normal text-neutral-800">personal</span> AI photographer
      </h1>

      {/* Subhead matching the screenshot */}
      <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal mb-8">
        Upload a portrait photo once. Receive an optimal AI headshot crop suggestion in seconds,
        interactively adjust framing at 60 fps, and export full native pixels.
      </p>

      {/* CTA Button matching Magic Studio */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onQuickUpload}
          className="group flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-98"
        >
          <span>Create your photos for free</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* iPhone & Android compatibility tag */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium px-4 py-2">
          <Smartphone className="w-4 h-4 text-neutral-700" />
          <span>iOS HEIC/HEIF & Android ready</span>
        </div>
      </div>
    </section>
  );
};
