import React from 'react';
import { UploadCloud, Sparkles, Download, CheckCircle, Sliders, Shield, Award } from 'lucide-react';

export const InfoSection: React.FC = () => {
  return (
    <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* 3 Step Process */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold block mb-2">
          Precision Workflow
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
          How the AI Cropping Engine Works
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 mt-3 leading-relaxed">
          Combining deterministic golden-ratio math with interactive client-side 60fps controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {/* Step 1 */}
        <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-4 font-bold text-lg">
              01
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              Upload & Instant Validation
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Drag and drop any JPEG, PNG, or WebP portrait. Instant client-side validation enforces a safe 10 MB payload ceiling and verifies pixel decode integrity before processing.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <CheckCircle className="w-4 h-4" /> Zero Server Latency
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center mb-4 font-bold text-lg">
              02
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              AI Upper-Third Heuristic
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              The engine automatically calculates the optimal crop rectangle based on source aspect ratios, centering the subject’s eye line along the upper horizontal third rule.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs font-semibold text-amber-700">
            <Sparkles className="w-4 h-4" /> Golden-Ratio Framing
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mb-4 font-bold text-lg">
              03
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              Interactive Fine-Tune & Export
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Adjust crop boundaries freely with 8 high-contrast resize handles, inspect real-time avatar previews, and export directly via HTML5 Canvas API at full native resolution.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs font-semibold text-neutral-900">
            <Download className="w-4 h-4" /> Lossless Native Output
          </div>
        </div>
      </div>

      {/* AI Heuristics Deep-Dive Box */}
      <div id="ai-heuristics" className="rounded-3xl bg-neutral-900 text-white p-8 sm:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-amber-400 text-xs font-semibold mb-4 border border-neutral-700">
            <Award className="w-3.5 h-3.5" />
            <span>Deterministic Headshot Geometry</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
            Why the Upper-Third Placement Makes Portraits Stand Out
          </h3>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-6 font-normal">
            Psychological eye-tracking research shows human observers instinctively lock onto eyes when viewing professional portraits. Placing the subject's eye-line along the upper 33% grid-line creates natural presence, balances headroom without excessive negative space, and maintains strong shoulder stability for bio and avatar displays.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-800 text-xs">
            <div>
              <span className="text-neutral-400 block mb-1">Crown Headroom</span>
              <span className="text-base font-bold text-white">8% – 12%</span>
              <p className="text-[11px] text-neutral-400 mt-0.5">Prevents cramping while maximizing facial scale</p>
            </div>
            <div>
              <span className="text-neutral-400 block mb-1">Eye-Line Alignment</span>
              <span className="text-base font-bold text-amber-400">33.3% Third</span>
              <p className="text-[11px] text-neutral-400 mt-0.5">Classical rule-of-thirds focal balance</p>
            </div>
            <div>
              <span className="text-neutral-400 block mb-1">Canvas Pixel Fidelity</span>
              <span className="text-base font-bold text-emerald-400">100% Uncompressed</span>
              <p className="text-[11px] text-neutral-400 mt-0.5">Extracts directly from original bitmap data</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
