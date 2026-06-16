import React from 'react';
import { ClipboardList, ShieldAlert, Car, CalendarCheck2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface TimelineProps {
  onStartBooking: () => void;
}

export default function Timeline({ onStartBooking }: TimelineProps) {
  const steps = [
    {
      num: '01',
      title: 'Pilih Keluhan & Titik',
      desc: 'Masukkan keluhan kesehatan Anda di peta anatomi interaktif kami. Sistem otomatis merekomendasikan titik bekam utama.',
      icon: ClipboardList,
      color: 'text-primary dark:text-primary-light',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/15',
    },
    {
      num: '02',
      title: 'Skrining Smart Triage',
      desc: 'Isi kuesioner medis singkat untuk memastikan bekam aman bagi tubuh Anda atau dialihkan ke paket terapi kering/pijat.',
      icon: ShieldAlert,
      color: 'text-primary dark:text-primary-light',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/15',
    },
    {
      num: '03',
      title: 'Atur Jadwal & Alamat',
      desc: 'Pilih slot tanggal (tersedia penanda Kalender Sunnah) dan paket yang cocok. Masukkan alamat untuk dipetakan ke terapis.',
      icon: CalendarCheck2,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    },
    {
      num: '04',
      title: 'Terapis Datang Melayani',
      desc: 'Terapis berpengalaman kami langsung meluncur ke lokasi Anda membawa alat bekam steril tersegel & melakukan perawatan.',
      icon: Car,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/20',
    },
  ];

  return (
    <section id="alur-booking" className="py-24 bg-[#f0faf7]/40 dark:bg-[#0c110d]/50 border-y border-emerald-100/30 dark:border-emerald-950/20 transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-sans font-medium text-xs text-primary dark:text-primary-light tracking-widest uppercase mb-3">
            KEMUDAHAN LAYANAN
          </h2>
          <p className="font-sans font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight leading-tight">
            Bagaimana Bykam Menyiapkan Terapi Anda?
          </p>
          <p className="font-sans text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Hanya butuh 2 menit untuk melakukan kustomisasi sesi bekam steril di rumah Anda.
          </p>
        </div>

        {/* Steps Layout (Horizontal on large screens, vertical stack on small screens) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line for large screens */}
          <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-[1.5px] bg-slate-200 dark:bg-slate-800 -z-0" />

          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="flex flex-col items-center lg:items-start text-center lg:text-left relative z-10 group"
              >
                {/* Step Number & Icon */}
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.bgColor} text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-800 scale-100 group-hover:scale-105 transition-transform duration-300`}>
                    <IconComponent className={`w-6 h-6 ${step.color}`} strokeWidth={1.5} />
                  </div>
                  <span className="font-mono font-bold text-3xl text-slate-300 dark:text-slate-700 select-none">
                    {step.num}
                  </span>
                </div>

                <h3 className="font-sans font-semibold text-lg text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="font-sans text-xs sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Block */}
        <div className="mt-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block p-8 rounded-3xl bg-white dark:bg-[#0c110d] border border-emerald-100/40 dark:border-emerald-950/40 max-w-3xl shadow-xs"
          >
            <h4 className="font-sans font-bold text-xl text-slate-800 dark:text-white leading-snug mb-3">
              Mulai Sesi Pemulihan Sekarang
            </h4>
            <p className="font-sans text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xl mx-auto leading-relaxed">
              Dapatkan tubuh bugar bebas toksin langsung di kenyamanan rumah Anda tanpa perlu mengantre di klinik bekam.
            </p>
            <button
              type="button"
              id="timeline-start-btn"
              onClick={onStartBooking}
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-hover hover:scale-[1.01] shadow-md shadow-primary/10 cursor-pointer flex items-center gap-2 mx-auto tracking-wide group transition-all"
            >
              <span>Booking Terapis Sekarang</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
