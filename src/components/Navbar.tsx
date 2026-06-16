import React, { useEffect, useState } from 'react';
import { Page } from '../types';
import { Sun, Moon, Sparkles, PhoneCall, CalendarRange } from 'lucide-react';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function Navbar({
  currentPage,
  setCurrentPage,
  darkMode,
  setDarkMode,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      id="bykam-navbar"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40 shadow-xs py-3'
          : 'bg-slate-950/45 backdrop-blur-xs border-b border-white/5 py-4'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* LOGO */}
        <button
          type="button"
          id="nav-logo-btn"
          onClick={() => setCurrentPage('landing')}
          className="flex items-center gap-2 group text-left cursor-pointer focus:outline-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center text-white shadow-md shadow-primary/10 group-hover:scale-105 transition-transform duration-300">
            <span className="font-sans font-bold text-lg tracking-wider">BK</span>
          </div>
          <div>
            <h1 className="font-sans font-bold text-xl leading-none text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
              BYKAM
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block animate-pulse" />
            </h1>
            <p className="font-mono text-[9px] tracking-widest text-slate-500 dark:text-slate-400 mt-0.5 uppercase">
              Bekam Ke Rumah
            </p>
          </div>
        </button>

        {/* MID NAVIGATION (Clean text links) */}
        <div className="hidden md:flex items-center gap-7">
          <button
            type="button"
            id="nav-link-landing"
            onClick={() => setCurrentPage('landing')}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              currentPage === 'landing'
                ? 'text-primary dark:text-primary-light font-semibold'
                : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            Beranda
          </button>
          <button
            type="button"
            id="nav-link-booking"
            onClick={() => setCurrentPage('booking')}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              currentPage === 'booking'
                ? 'text-primary dark:text-primary-light font-semibold'
                : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            Sistem Booking
          </button>
          <a
            href="https://wa.me/6285177872260"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            <PhoneCall size={14} className="text-primary" />
            Konsultasi WA
          </a>
        </div>

        {/* RIGHT AREA ACTIONS */}
        <div className="flex items-center gap-3">
          {/* THEME TOGGLE SWITCH */}
          <button
            type="button"
            id="nav-theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Theme Mode"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer focus:outline-hidden border border-slate-200/50 dark:border-slate-700/50"
          >
            {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
          </button>

          {/* QUICK CTA */}
          <button
            type="button"
            id="nav-cta-btn"
            onClick={() => setCurrentPage(currentPage === 'landing' ? 'booking' : 'landing')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-xs border ${
              currentPage === 'landing'
                ? 'bg-gradient-to-r from-primary to-primary-hover hover:from-primary-light hover:to-primary text-white border-transparent hover:shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            {currentPage === 'landing' ? (
              <>
                <CalendarRange size={14} />
                <span>Pesan Sekarang</span>
              </>
            ) : (
              <>
                <span>Kembali ke Beranda</span>
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
