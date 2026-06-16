/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import InfoManfaat from './components/InfoManfaat';
import Timeline from './components/Timeline';
import BookingForm from './components/BookingForm';
import { Page } from './types';
import { ShieldCheck, Phone, Mail, Instagram, MapPin } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Synchronize Dark Mode Class on Root Document Tag
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Scroll to top on Page Transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-natural-bg dark:bg-[#0c110d] text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans">
      
      {/* Floating Header Navbar */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Pages Switchboard */}
      <main id="bykam-main-content">
        {currentPage === 'landing' ? (
          <>
            {/* View 1: Landing Page (Front-Etalase) */}
            <Hero onStartBooking={() => setCurrentPage('booking')} />
            <InfoManfaat />
            <Timeline onStartBooking={() => setCurrentPage('booking')} />
          </>
        ) : (
          /* View 2: Form Pemesanan (The Engine Stepper Form) */
          <BookingForm onBackToLanding={() => setCurrentPage('landing')} />
        )}
      </main>

      {/* Clinico-Legal Premium Footer */}
      <footer id="bykam-footer" className="bg-white dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-900/60 transition-colors duration-300 py-10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Column 1: Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
                  <span className="font-sans font-bold text-base tracking-widest">BK</span>
                </div>
                <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  BYKAM
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Pelopor layanan bekam sunnah & medis premium berkelayakan home-service pertama yang mengedepankan asas higienitas 100% steril standar rumah sakit.
              </p>
              <div className="flex gap-3 pt-1">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition-all">
                  <Instagram size={14} />
                </a>
                <a href="https://wa.me/6285177872260" target="_blank" rel="noreferrer" className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition-all" title="Hubungi WhatsApp Admin Bykam">
                  <Phone size={14} />
                </a>
                <a href="mailto:info@bykam.com" className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition-all">
                  <Mail size={14} />
                </a>
              </div>
            </div>

            {/* Column 2: Legal compliance standards */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                STANDAR LAYANAN & SERTIFIKASI
              </h4>
              
              <div className="space-y-3.5 text-xs text-slate-650 dark:text-slate-400">
                <div className="flex gap-2 items-start">
                  <ShieldCheck size={16} className="text-primary shrink-0" />
                  <p>Terapis Berlisensi Resmi Perkumpulan Bekam Indonesia (PBI).</p>
                </div>
                <div className="flex gap-2 items-start">
                  <ShieldCheck size={16} className="text-primary shrink-0 text-amber-500" />
                  <p>Sertifikat Layanan Kompeten: <strong className="font-semibold text-slate-800 dark:text-slate-200">LK ILSA NO: 000112-CB/I/2026</strong></p>
                </div>
                <div className="flex gap-2 items-start">
                  <ShieldCheck size={16} className="text-primary shrink-0" />
                  <p>Kit Bekam Steril & Penanganan Higienis Limbah Medis B3.</p>
                </div>
              </div>
            </div>

            {/* Column 3: Jam Operasional & Layanan */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                KANTOR UTAMA & CAKUPAN
              </h4>
              <div className="text-xs text-slate-650 dark:text-slate-400 space-y-3">
                {/* Embedded Office Google Map */}
                <div className="w-full h-36 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 relative group shadow-sm bg-slate-100 dark:bg-slate-950">
                  <iframe 
                    title="Google Map Kantor Bykam"
                    src="https://maps.google.com/maps?q=-6.419875,107.028682&z=15&output=embed" 
                    className="w-full h-full border-0 grayscale dark:invert-[0.9] dark:hue-rotate-180 opacity-80 group-hover:grayscale-0 transition-all duration-300"
                    allowFullScreen={false}
                    loading="lazy"
                  ></iframe>
                  {/* Invisible Overlay to force 100% correct map redirect */}
                  <a 
                    href="https://maps.app.goo.gl/jnNHQuDaiiraJYjTA" 
                    target="_blank" 
                    rel="noreferrer"
                    className="absolute inset-0 z-10 cursor-pointer block"
                    title="Buka Peta Lokasi Kantor Bykam Cileungsi"
                  />
                  <a 
                    href="https://maps.app.goo.gl/jnNHQuDaiiraJYjTA" 
                    target="_blank" 
                    rel="noreferrer"
                    className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-900/90 hover:bg-primary text-[9px] text-white font-bold rounded-lg shadow-md transition-colors flex items-center gap-1 uppercase z-20"
                  >
                    <span>Google Maps ↗</span>
                  </a>
                </div>

                <div className="flex gap-2 items-start">
                  <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Puri Cileungsi, Perum No.09 Blok E9, Gandoang, Kec. Cileungsi, Kabupaten Bogor, Jawa Barat 16280
                  </span>
                </div>
                <p>Hari Operasional: <span className="font-semibold text-slate-700 dark:text-slate-350">Setiap Hari (Senin - Minggu)</span></p>
                <p>Jam Kunjungan: <span className="font-semibold text-slate-700 dark:text-slate-350">07:00 - 22:00 WIB</span></p>
                <p className="text-[10px] text-amber-500/95 font-medium leading-normal pt-1 bg-amber-500/5 px-2.5 py-1.5 rounded-lg border border-amber-500/10">
                  ⚠️ Pemesanan slot pada hari Sunnah (17, 19, 21 Hijriah) dianjurkan dipesan minimal 2 hari sebelumnya.
                </p>
              </div>
            </div>

          </div>

          <div className="h-[1px] bg-slate-100 dark:bg-slate-900 my-6" />

          {/* Copyrights + Medical Disclaimer */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 text-center lg:text-left">
            <div className="max-w-2xl leading-relaxed">
              <p className="font-semibold text-slate-600 dark:text-slate-400">DISCLAIMER LAYANAN MEDIS:</p>
              <p className="mt-1">
                Layanan bekam Bykam adalah sarana preventif kebugaran komplementer-tradisional. Konsultasikan dengan dokter spesialis Anda jika Anda memiliki keluhan medis jantung kronis, hemodialisa aktif, atau stroke berat sebelum melangsungkan sesi bekam.
              </p>
            </div>
            <div className="shrink-0 text-slate-400 dark:text-slate-600">
              <p>&copy; 2026 BYKAM Indonesia. All rights reserved.</p>
              <p className="mt-0.5 tracking-wider font-mono">CRAFTED STANDARDS &bull; TERAPIS HOME SERVICE</p>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
