import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Menu,
  X,
  ArrowRight,
  LogOut,
  User as UserIcon,
  FolderHeart,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { User } from '../services/tempAuthDatabase';

interface HeaderProps {
  onUploadClick: () => void;
  hasActiveImage: boolean;
  currentUser: User | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
  onOpenSavedCrops: () => void;
  savedCropsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onUploadClick,
  hasActiveImage,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenSavedCrops,
  savedCropsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Close user dropdown if clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="w-full">
      {/* Top Banner - Magic Studio screenshot */}
      <div className="w-full bg-[#0D1117] text-white py-2 px-4 flex items-center justify-center text-xs font-medium border-b border-neutral-800">
        <a
          href="#studio"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="text-neutral-300">InstaHeadshots is</span>
          <div className="w-4 h-4 rounded bg-neutral-900 border border-neutral-700 flex items-center justify-center">
            <span className="text-[10px] leading-none">✨</span>
          </div>
          <span className="font-bold text-white tracking-tight">Magic Studio</span>
          <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
        </a>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo matching Magic Studio */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-xl p-1"
            >
              {/* Magic Studio Mascot Glyph */}
              <div className="w-10 h-10 rounded-2xl bg-neutral-950 p-[2px] shadow-sm flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-[14px] bg-neutral-900 flex items-center justify-center relative">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-2.5 bg-white rounded-full"></span>
                    <span className="text-xs">✨</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-[1px]"></div>
                </div>
              </div>

              {/* Brand Typography */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black tracking-tight text-neutral-950 lowercase font-sans">
                    magic<span className="text-neutral-900">studio</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded font-mono font-semibold uppercase">
                    AI Crop
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 font-medium">
                  AI-Powered Headshot Cropping Tool
                </span>
              </div>
            </a>
          </div>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Upload action */}
            {hasActiveImage && (
              <button
                onClick={onUploadClick}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-100 text-neutral-800 text-xs font-semibold hover:bg-neutral-200 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>
            )}

            {/* If logged in: User Profile Menu */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 transition-all text-xs font-semibold text-neutral-800 shadow-2xs"
                >
                  <img
                    src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=18181b&color=ffffff`}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-neutral-200"
                  />
                  <span className="truncate max-w-[120px]">{currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 py-1.5 z-50 animate-in fade-in-50 slide-in-from-top-1">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-xs font-bold text-neutral-900 truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenSavedCrops();
                      }}
                      className="w-full px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center justify-between text-left font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <FolderHeart className="w-4 h-4 text-emerald-600" />
                        Saved Headshots
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-600">
                        {savedCropsCount}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-left font-medium border-t border-neutral-100 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Sign up */}
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-2 rounded-full text-neutral-700 hover:text-neutral-950 text-xs font-semibold hover:bg-neutral-50 transition-colors"
                >
                  Sign Up
                </button>

                {/* Log In Pill Button as in Magic Studio */}
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-5 py-2 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Log in
                </button>
              </div>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser && (
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-8 h-8 rounded-full overflow-hidden border border-neutral-200"
              >
                <img
                  src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=18181b&color=ffffff`}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-neutral-800 hover:bg-neutral-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-3">
            {currentUser ? (
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <p className="text-xs font-bold text-neutral-900">{currentUser.name}</p>
                  <p className="text-[11px] text-neutral-500">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSavedCrops();
                  }}
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-neutral-100 text-xs font-semibold text-neutral-800"
                >
                  <span className="flex items-center gap-2">
                    <FolderHeart className="w-4 h-4 text-emerald-600" />
                    Saved Headshots
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-bold">
                    {savedCropsCount}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-semibold"
                >
                  Log in to Studio
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="w-full py-2.5 rounded-xl bg-neutral-100 text-neutral-900 text-xs font-semibold"
                >
                  Create Free Account
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onUploadClick();
              }}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-800 text-xs font-semibold"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Portrait (iPhone / Android)</span>
            </button>
          </div>
        )}
      </header>
    </div>
  );
};
