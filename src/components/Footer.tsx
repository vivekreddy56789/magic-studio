import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-200/80 bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-neutral-950 flex items-center justify-center text-white font-bold text-xs tracking-tight">
            <span>✨</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-neutral-900 text-sm tracking-tight lowercase">
                magicstudio
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-neutral-100 text-neutral-600 rounded font-mono font-semibold">
                STUDIO
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              AI-Powered Headshot Cropping Tool
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-neutral-600 font-medium">
          <a href="#studio" className="hover:text-neutral-950 transition-colors">
            Crop Studio
          </a>
          <a href="#how-it-works" className="hover:text-neutral-950 transition-colors">
            Heuristics Math
          </a>
        </div>

        {/* Copyright */}
        <div className="text-xs text-neutral-400">
          iOS HEIC/HEIF & Android Responsive
        </div>
      </div>
    </footer>
  );
};
