import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { SAMPLE_PORTRAITS, SamplePortrait } from '../utils/constants';

interface PresetShowcaseProps {
  onSelectSample: (sample: SamplePortrait) => void;
  selectedSampleId: string | null;
}

export const PresetShowcase: React.FC<PresetShowcaseProps> = ({
  onSelectSample,
  selectedSampleId,
}) => {
  return (
    <section id="treatments" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
      {/* Tilted Cards Showcase from Magic Studio Screenshot */}
      <div className="relative flex items-center justify-center gap-4 sm:gap-6 py-6 overflow-hidden">
        {SAMPLE_PORTRAITS.slice(0, 3).map((sample, index) => {
          const isSelected = selectedSampleId === sample.id;

          // Rotation angles matching the Magic Studio screenshot:
          // index 0 -> left tilted (-rotate-3 or -rotate-6)
          // index 1 -> center upright (rotate-0, slightly higher z-index)
          // index 2 -> right tilted (rotate-3 or rotate-6)
          const tiltClasses = [
            '-rotate-3 sm:-rotate-6 hover:rotate-0 translate-y-3 sm:translate-y-4',
            'rotate-0 z-20 hover:scale-105',
            'rotate-3 sm:rotate-6 hover:rotate-0 translate-y-3 sm:translate-y-4',
          ][index];

          return (
            <div
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSample(sample);
                }
              }}
              style={{ backgroundColor: sample.accentBg }}
              className={`group relative w-36 sm:w-60 md:w-72 aspect-[3/4] rounded-3xl p-3 sm:p-4 text-white overflow-hidden cursor-pointer transition-all duration-300 shadow-xl flex flex-col justify-between ${tiltClasses} ${
                isSelected
                  ? 'ring-4 ring-neutral-900 ring-offset-2'
                  : 'hover:shadow-2xl'
              }`}
            >
              {/* Top tag & circular badge */}
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-xs text-white/90">
                  {sample.tag}
                </span>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/25 flex items-center justify-center text-white group-hover:bg-white group-hover:text-neutral-950 transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              {/* Photo framing matching Magic Studio */}
              <div className="relative mt-2 flex-1 rounded-2xl overflow-hidden bg-black/20">
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-[11px] sm:text-xs">
                  <span className="font-bold truncate">{sample.name}</span>
                  <span className="text-[9px] sm:text-[10px] bg-white/30 px-1.5 py-0.5 rounded font-mono">
                    Try Style
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-neutral-400 font-medium mt-2">
        Click any portrait style to instantly apply professional AI headshot framing
      </p>
    </section>
  );
};
