import { AspectPreset } from '../types/crop';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit as specified in PDF
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

export const ASPECT_RATIO_PRESETS: AspectPreset[] = [
  {
    id: '3:4',
    label: '3:4',
    ratio: 3 / 4,
    description: 'Executive portrait & bio headshot (Standard)',
    badge: 'Recommended',
  },
  {
    id: '4:5',
    label: '4:5',
    ratio: 4 / 5,
    description: 'Modern editorial & social profile',
  },
  {
    id: '1:1',
    label: '1:1',
    ratio: 1,
    description: 'LinkedIn, Slack & circular avatars',
  },
  {
    id: 'free',
    label: 'Free',
    ratio: null,
    description: 'Custom unconstrained framing',
  },
  {
    id: '16:9',
    label: '16:9',
    ratio: 16 / 9,
    description: 'Keynote banner & video splash',
  },
  {
    id: '2:3',
    label: '2:3',
    ratio: 2 / 3,
    description: 'Classic vertical 35mm photo',
  },
];

export interface SamplePortrait {
  id: string;
  name: string;
  role: string;
  tag: string;
  accentBg: string; // card background color matching Magic Studio screenshot
  accentPill: string;
  url: string;
  description: string;
}

export const SAMPLE_PORTRAITS: SamplePortrait[] = [
  {
    id: 'sample-magic-1',
    name: 'Sarah Jenkins',
    role: 'Executive Headshot',
    tag: 'Studio Lighting',
    accentBg: '#1B4D3E', // Forest green matching Magic Studio showcase
    accentPill: 'text-emerald-300 bg-emerald-950/40',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
    description: 'Golden hour studio portrait matching Magic Studio aesthetic',
  },
  {
    id: 'sample-magic-2',
    name: 'Elena Rostova',
    role: 'Founder & CEO',
    tag: 'Outdoor Natural',
    accentBg: '#9C6D3F', // Warm cedar/wood tone matching Magic Studio
    accentPill: 'text-amber-200 bg-amber-950/40',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1200&q=80',
    description: 'Warm natural light portrait with soft background depth',
  },
  {
    id: 'sample-magic-3',
    name: 'David Chen',
    role: 'Engineering Lead',
    tag: 'Tech & Keynote',
    accentBg: '#1E2D3D', // Deep navy slate
    accentPill: 'text-sky-200 bg-sky-950/40',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
    description: 'High contrast profile with clear facial landmarks',
  },
  {
    id: 'sample-magic-4',
    name: 'Amara Okafor',
    role: 'Creative Director',
    tag: 'Editorial Bio',
    accentBg: '#4A3B32', // Espresso warmth
    accentPill: 'text-orange-200 bg-orange-950/40',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    description: 'Expressive editorial portrait with golden ratio symmetry',
  },
];
