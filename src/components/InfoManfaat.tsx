import React from 'react';
import { Heart, Shield, Activity, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function InfoManfaat() {
  const benefits = [
    {
      id: 'detox',
      title: 'Detoksifikasi Alami',
      desc: 'Mengeluarkan tumpukan darah kotor (sel darah merah mati/toksin metabolik), sisa bahan kimia atau racun dalam tubuh secara optimal.',
      icon: Shield,
      color: 'text-primary dark:text-primary-light',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/15',
      borderColor: 'border-emerald-100/50 dark:border-emerald-900/20',
    },
    {
      id: 'pain',
      title: 'Pereda Nyeri & Kaku',
      desc: 'Membantu merangsang pelepasan zat endorfin alami yang ampuh meredakan ketegangan otot leher, asam urat, migrain, dan pegal kronis.',
      icon: Activity,
      color: 'text-primary dark:text-primary-light',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/15',
      borderColor: 'border-emerald-100/50 dark:border-emerald-900/20',
    },
    {
      id: 'sunnah',
      title: 'Menghidupkan Sunnah',
      desc: 'Mengikuti salah satu terapi medis terbaik yang sangat disarankan oleh Rasulullah SAW bagi umatnya untuk menjaga kebugaran jasmani.',
      icon: Sparkles,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50/50 dark:bg-amber-950/15',
      borderColor: 'border-amber-100/50 dark:border-amber-900/20',
    },
    {
      id: 'cardio',
      title: 'Melancarkan Sirkulasi',
      desc: 'Mengurangi adhesi pembuluh darah, membantu menurunkan tekanan darah (hipertensi) secara alami, serta meringankan beban kolesterol.',
      icon: Heart,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50/50 dark:bg-rose-950/15',
      borderColor: 'border-rose-100/50 dark:border-rose-900/20',
    },
  ];

  return (
    <section id="manfaat-bekam" className="py-24 bg-white dark:bg-[#0c110d]/50 transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-sans font-medium text-xs text-primary dark:text-primary-light tracking-widest uppercase mb-3">
            MANFAAT MEDIS & THERAPEUTIC
          </h2>
          <p className="font-sans font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight leading-tight">
            Kenapa Tubuh Anda Membutuhkan Bekam Secara Rutin?
          </p>
          <div className="w-12 h-1 bg-primary rounded-full mx-auto mt-4" />
        </div>

        {/* Grid Cards layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-6 rounded-2xl border ${item.borderColor} ${item.bgColor} flex flex-col justify-between hover:shadow-md hover:translate-y-[-2px] transition-all duration-300`}
              >
                <div>
                  {/* Icon Frame */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-white dark:bg-slate-900 shadow-xs`}>
                    <IconComponent className={`w-6 h-6 ${item.color}`} strokeWidth={1.5} />
                  </div>

                  <h3 className="font-sans font-semibold text-lg text-slate-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
