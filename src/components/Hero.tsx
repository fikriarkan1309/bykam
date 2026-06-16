import React from 'react';
import { Calendar, ChevronRight,ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onStartBooking: () => void;
}

export default function Hero({ onStartBooking }: HeroProps) {
  // Use our beautifully generated premium banner
  const heroImgUrl = '/public/hero-banner.jpg';

  return (
    <section id="bykam-hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 pb-20">
      {/* Background Image with adaptive premium overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImgUrl}
          alt="Premium Cupping Setting"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.7] dark:brightness-[0.45] transition-all duration-700 scale-105"
        />
        {/* Soft color-graded vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/40 dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-900/30 to-slate-900/80" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white select-none my-auto">
        {/* Banner Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 backdrop-blur-md mb-8"
        >
          <Sparkles size={13} className="text-primary animate-pulse" />
          <span className="font-sans font-medium text-xs text-primary-light tracking-wide uppercase">
            REKOR TERAPIS SERTIFIKASI & STERIL 100%
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-sans font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.12] mb-6 max-w-4xl mx-auto text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-300"
        >
          Pulihkan Tubuh di Kenyamanan Rumah Anda
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-sans text-base sm:text-lg md:text-xl text-slate-300 font-normal max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Layanan bekam medis sunnah & pijat kebugaran premium langsung datang ke rumah Anda. Praktis, higienis, menggunakan peralatan steril sekali pakai standar klinik.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
        >
          <button
            type="button"
            id="hero-booking-btn"
            onClick={onStartBooking}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold tracking-wide bg-gradient-to-r from-primary to-primary-hover hover:scale-[1.01] text-white transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 group border border-primary/20"
          >
            <Calendar size={16} />
            <span>Booking Terapis Sekarang</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Trust Badges Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-20 sm:mt-24 pt-8 pb-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 max-w-3xl mx-auto text-xs text-slate-300 font-sans tracking-wide"
        >
          <div className="flex items-center justify-center gap-2 bg-white/5 backdrop-blur-xs py-2 px-4 rounded-xl border border-white/5">
            <ShieldCheck size={16} className="text-primary shrink-0" />
            <span>Peralatan Steril 100% Sekali Pakai</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-white/5 backdrop-blur-xs py-2 px-4 rounded-xl border border-white/5">
            <MapPin size={16} className="text-primary shrink-0" />
            <span>Terapis Tiba di Lokasi Anda</span>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 bg-white/5 backdrop-blur-xs py-2 px-4 rounded-xl border border-white/5">
            <Calendar size={16} className="text-primary shrink-0" />
            <span>Sesuai Kalender Sunnah Hijriah</span>
          </div>
        </motion.div>
      </div>

      {/* Down arrow decorator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce text-slate-400 opacity-60">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
