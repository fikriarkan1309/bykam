import React, { useState } from 'react';
import { CUPPING_POINTS, CuppingPoint } from '../types';
import { Info, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnatomyMapProps {
  selectedPoints: string[];
  recommendedPoints: string[];
  onTogglePoint: (pointId: string) => void;
  gender: 'pria' | 'wanita';
}

export default function AnatomyMap({
  selectedPoints,
  recommendedPoints,
  onTogglePoint,
  gender,
}: AnatomyMapProps) {
  const [activeSide, setActiveSide] = useState<'back' | 'front'>('back');
  const [hoveredPoint, setHoveredPoint] = useState<CuppingPoint | null>(null);
  const [selectedInfoPoint, setSelectedInfoPoint] = useState<CuppingPoint | null>(
    CUPPING_POINTS.find(p => p.id === 'al_kahil') || null
  );

  const filteredPoints = CUPPING_POINTS.filter((p) => p.side === activeSide);

  // Stylized Human Body Silhouette SVG
  const renderSilhouette = (side: 'front' | 'back') => {
    return (
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full text-slate-300 dark:text-slate-700 transition-colors duration-300"
        id={`silhouette-${side}`}
      >
        {/* Background glow behind silhouette */}
        <defs>
          <radialGradient id="bodyGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary-light)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer ambient glow */}
        <ellipse cx="50" cy="50" rx="35" ry="45" fill="url(#bodyGlow)" opacity="0.6" />

        {/* Human Silhouette Path */}
        <path
          d={
            side === 'back'
              ? // Back outline: stylized neck, wide shoulders, torso, pelvic line, legs, arms
                "M50,14 C54,14 56,12 55.5,6 C54.5,1 45.5,1 44.5,6 C44,12 46,14 50,14 Z " + // Head
                "M47,14 L53,14 L54,17 L46,17 Z " + // Neck
                "M46,17 C38,17 32,20 28,24 C24,28 20,40 19,48 C18.5,52 20.5,52 21,50 C22,46 25,32 28,28 L28,68 C28,70 29.5,70.5 30,68 L32.5,28 " + // Left Arm & Shoulder
                "L34,60 C34,61.5 35.5,61.5 36,60 L38.5,29 L38.5,78 C38.5,115 47.5,115 47.5,78 L47.5,46 L52.5,46 L52.5,78 C52.5,115 61.5,115 61.5,78 L61.5,29 L64,60 C64.5,61.5 66,61.5 66,60 L67.5,28 " + // Legs & Lower Torso
                "L72,68 C72.5,70.5 74,70 74,68 L74,28 C77,32 80,46 81,50 C81.5,52 83.5,52 83,48 C82,40 78,28 74,24 C70,20 64,17 56,17 Z" // Right Arm & Shoulder
              : // Front outline: same silhouette shape but slightly different chest lines
                "M50,14 C54,14 56,12 55.5,6 C54.5,1 45.5,1 44.5,6 C44,12 46,14 50,14 Z " +
                "M47,14 L53,14 L54,17 L46,17 Z " +
                "M46,17 C38,17 32,20 28,24 C24,28 20,40 19,48 C18.5,52 20.5,52 21,50 C22,46 25,32 28,28 L28,68 C28,70 29.5,70.5 30,68 L32.5,28 " +
                "L34,60 C34,61.5 35.5,61.5 36,60 L38.5,29 L38.5,78 C38.5,115 47.5,115 47.5,78 L47.5,46 L52.5,46 L52.5,78 C52.5,115 61.5,115 61.5,78 L61.5,29 L64,60 C64.5,61.5 66,61.5 66,60 L67.5,28 " +
                "L72,68 C72.5,70.5 74,70 74,68 L74,28 C77,32 80,46 81,50 C81.5,52 83.5,52 83,48 C82,40 78,28 74,24 C70,20 64,17 56,17 Z"
          }
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Anatomical skeletal lines for medical feeling */}
        <g stroke="currentColor" strokeWidth="0.3" strokeDasharray="1,1" opacity="0.4">
          <line x1="50" y1="16" x2="50" y2="85" /> {/* Spinal Cord Line */}
          {side === 'back' ? (
            <>
              {/* Rib cage outlines / Back grids */}
              <path d="M42,26 C45,28 55,28 58,26" />
              <path d="M40,31 C45,34 55,34 60,31" />
              <path d="M39,36 C45,39 55,39 61,36" />
              <path d="M40,41 C45,44 55,44 60,41" />
              <path d="M43,48 C46,50 54,50 57,48" />
            </>
          ) : (
            <>
              {/* Collar bone & Chest line */}
              <path d="M34,20 C42,22 47,23 50,23 C53,23 58,22 66,20" />
              <ellipse cx="50" cy="44" rx="2" ry="2" fill="none" /> {/* stomach circle */}
            </>
          )}
        </g>

        {/* Interactive Cupping Hotspots */}
        {filteredPoints.map((point) => {
          const isSelected = selectedPoints.includes(point.id);
          const isRecommended = recommendedPoints.includes(point.id);

          return (
            <g
              key={point.id}
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePoint(point.id);
                setSelectedInfoPoint(point);
              }}
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Pulsing Backlight for Recommended or Hovered Points */}
              {(isRecommended || isSelected) && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="6.5"
                  className={`animate-ping origin-center duration-1000 ${
                    isSelected
                      ? 'text-emerald-500/30'
                      : 'text-amber-500/30'
                  }`}
                  fill="currentColor"
                  style={{ transformOrigin: `${point.x}px ${point.y}px` }}
                />
              )}

              {/* Outer interactive hover ring */}
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                className="fill-transparent stroke-transparent group-hover:stroke-primary group-hover:fill-primary/5 transition-all duration-300"
                strokeWidth={1}
              />

              {/* Point Node Circle */}
              <circle
                cx={point.x}
                cy={point.y}
                r={isSelected ? '3.5' : isRecommended ? '3' : '2.5'}
                className={`transition-all duration-300 ${
                  isSelected
                    ? 'fill-emerald-600 dark:fill-emerald-400 stroke-white dark:stroke-slate-900 stroke-[1.5px]'
                    : isRecommended
                    ? 'fill-amber-500 dark:fill-amber-400 stroke-white dark:stroke-slate-900 stroke-[1.5px] scale-110'
                    : 'fill-slate-400 dark:fill-slate-500 hover:fill-slate-600 dark:hover:fill-slate-300'
                }`}
              />

              {/* Small Indicator if recommended */}
              {isRecommended && !isSelected && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="1"
                  className="fill-slate-950 dark:fill-slate-50"
                />
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div id="anatomy-map-container" className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
      {/* Selection Left Sidebar on Large Screens */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-sans font-medium text-slate-800 dark:text-slate-100">
            Peta Anatomi Titik Bekam
          </h3>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-500 dark:text-slate-400 font-mono">
            Tipe Bodi: {gender === 'pria' ? 'Maskulin' : 'Feminin'}
          </span>
        </div>

        {/* Silhouette Orientation Toggle */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl gap-1">
          <button
            type="button"
            id="anatomy-toggle-back"
            onClick={() => {
              setActiveSide('back');
              const firstBack = CUPPING_POINTS.find(p => p.side === 'back');
              if (firstBack) setSelectedInfoPoint(firstBack);
            }}
            className={`py-2 text-xs font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
              activeSide === 'back'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sisi Punggung (Utama)
            {recommendedPoints.some((pId) => CUPPING_POINTS.find((cp) => cp.id === pId)?.side === 'back') && (
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            )}
          </button>
          <button
            type="button"
            id="anatomy-toggle-front"
            onClick={() => {
              setActiveSide('front');
              const firstFront = CUPPING_POINTS.find(p => p.side === 'front');
              if (firstFront) setSelectedInfoPoint(firstFront);
            }}
            className={`py-2 text-xs font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
              activeSide === 'front'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sisi Depan / Dada
            {recommendedPoints.some((pId) => CUPPING_POINTS.find((cp) => cp.id === pId)?.side === 'front') && (
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {/* Selected / Tooltip Details */}
        <AnimatePresence mode="wait">
          {selectedInfoPoint && (
            <motion.div
              key={selectedInfoPoint.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-sans font-semibold text-slate-900 dark:text-slate-50 text-base">
                    {selectedInfoPoint.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nama Lokal: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedInfoPoint.localName}</span>
                  </p>
                </div>

                <button
                  type="button"
                  id={`anatomy-select-${selectedInfoPoint.id}`}
                  onClick={() => onTogglePoint(selectedInfoPoint.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 transition-all ${
                    selectedPoints.includes(selectedInfoPoint.id)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-primary/10 hover:bg-primary/20 text-primary dark:text-teal-400'
                  }`}
                >
                  {selectedPoints.includes(selectedInfoPoint.id) ? (
                    <>
                      <Check size={12} />
                      Terpilih
                    </>
                  ) : (
                    <>
                      + Ambil Titik
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-100/60 dark:border-slate-800/80">
                <div className="flex gap-2 items-start">
                  <Info size={14} className="text-primary mt-0.5 shrink-0" />
                  <p>{selectedInfoPoint.benefits}</p>
                </div>
              </div>

              {recommendedPoints.includes(selectedInfoPoint.id) && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/5 px-2.5 py-1.5 rounded-lg font-medium">
                  <Sparkles size={13} className="shrink-0 animate-spin-slow" />
                  <span>Sangat direkomendasikan untuk keluhan Anda!</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Point Checklist Summary */}
        <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            Titik Terpilih Anda ({selectedPoints.length} titik)
          </p>
          {selectedPoints.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              Belum ada titik yang dipilih. Klik area bodi untuk memilih secara manual atau gunakan rekomendasi keluhan di atas.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
              {selectedPoints.map((pointId) => {
                const pt = CUPPING_POINTS.find((p) => p.id === pointId);
                if (!pt) return null;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => {
                      onTogglePoint(pt.id);
                      setSelectedInfoPoint(pt);
                    }}
                    className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 font-medium hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-100 transition-all cursor-pointer"
                  >
                    {pt.name} ({pt.side === 'back' ? 'B' : 'D'}) &times;
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Silhouette Central Visual in SVG */}
      <div className="lg:col-span-3 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-900/65 rounded-2xl p-6 border border-slate-100/80 dark:border-slate-800 relative min-h-[380px] select-none">
        {/* Floating Tooltips on Hover */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute pointer-events-none z-20 bg-slate-900/90 dark:bg-slate-950 border border-slate-700/50 backdrop-blur-md text-white text-xs py-2 px-3 rounded-lg shadow-md max-w-[200px] text-center"
              style={{
                top: `${hoveredPoint.side === activeSide ? hoveredPoint.y * 0.75 + 10 : 40}%`,
                left: `${hoveredPoint.side === activeSide ? hoveredPoint.x * 0.8 + 10 : 50}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <p className="font-semibold">{hoveredPoint.name}</p>
              <p className="text-[10px] text-slate-300 mt-0.5">{hoveredPoint.localName}</p>
              {recommendedPoints.includes(hoveredPoint.id) && (
                <p className="text-[10px] text-amber-400 font-medium mt-1">★ Rekomendasi Keluhan</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Silhouette Display with Animation */}
        <div className="w-full max-w-[280px] h-auto aspect-[3/4] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSide}
              initial={{ opacity: 0, scale: 0.95, rotateY: activeSide === 'front' ? -45 : 45 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.95, rotateY: activeSide === 'front' ? 45 : -45 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full h-full"
            >
              {renderSilhouette(activeSide)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500 inline-block" />
            <span>Titik Standar</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-amber-500 inline-block animate-pulse" />
            <span>Sesuai Keluhan Anda</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm" />
            <span>Titik Terpilih</span>
          </div>
        </div>
      </div>
    </div>
  );
}
