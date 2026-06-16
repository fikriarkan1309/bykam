import React, { useState, useMemo, useEffect } from 'react';
import {
  BookingDetails,
  COMPLAINTS_DATA,
  CUPPING_POINTS,
  SERVICE_PACKAGES,
  ADDONS_DATA,
  MOCK_THERAPISTS,
  TRIAGE_QUESTIONS,
  Therapist,
} from '../types';
import AnatomyMap from './AnatomyMap';
import {
  Activity,
  Heart,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Download,
  Flame,
  ArrowLeft,
  ArrowRight,
  Phone,
  User,
  Sparkles,
  Award,
  CircleHelp,
  Receipt,
  UserCheck,
  Compass,
  Navigation,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GoogleMapsPicker from './GoogleMapsPicker';

// Safely fetch system Google Maps Platform API Key
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY.trim() !== '';

interface BookingFormProps {
  onBackToLanding: () => void;
}

export default function BookingForm({ onBackToLanding }: BookingFormProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // User details for tracking (recorded persistently in localStorage)
  const [fullName, setFullName] = useState<string>(() => localStorage.getItem('bykam_fullName') || '');
  const [phone, setPhone] = useState<string>(() => localStorage.getItem('bykam_phone') || '');
  const [gender, setGender] = useState<'pria' | 'wanita'>(() => (localStorage.getItem('bykam_gender') as 'pria' | 'wanita') || 'pria');
  
  // Persistent booking history for customer tracking
  const [bookingHistory, setBookingHistory] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('bykam_bookings') || '[]');
    } catch {
      return [];
    }
  });

  // Form State
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [triageAnswers, setTriageAnswers] = useState<Record<string, boolean>>({});
  const [selectedPackageId, setSelectedPackageId] = useState<string>('standard');
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-17'); // Default to a sunnah day
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('08:00');
  const [address, setAddress] = useState<string>('');
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});

  // Distance simulation state
  const [distance, setDistance] = useState<number>(0);
  const [destinationName, setDestinationName] = useState<string>('');
  const [mapCoords, setMapCoords] = useState<{ x: number; y: number } | null>(null);
  const [showInteractiveMap, setShowInteractiveMap] = useState<boolean>(true);
  const [mapMode, setMapMode] = useState<'radar' | 'gmp'>(hasValidKey ? 'gmp' : 'radar');

  const handleGoogleLocationSelected = (selectedAddr: string, distKm: number) => {
    setAddress(selectedAddr);
    setDistance(distKm);
    setDestinationName(selectedAddr);
  };

  // Floating PDF preview state
  const [showPdfMock, setShowPdfMock] = useState(false);

  // Computed recommended points from active complaints
  const recommendedPoints = useMemo(() => {
    const points = new Set<string>();
    selectedComplaints.forEach((id) => {
      const complaintComp = COMPLAINTS_DATA.find((c) => c.id === id);
      if (complaintComp) {
        complaintComp.recommendedPoints.forEach((p) => points.add(p));
      }
    });
    return Array.from(points);
  }, [selectedComplaints]);

  // Sync selectedPoints with recommendedPoints dynamically based on complaints
  useEffect(() => {
    setSelectedPoints(recommendedPoints);
  }, [recommendedPoints]);

  // Handle setting complaint
  const handleToggleComplaint = (id: string) => {
    setSelectedComplaints((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Toggle single anatomy point
  const handleTogglePoint = (pointId: string) => {
    setSelectedPoints((prev) => {
      if (prev.includes(pointId)) {
        return prev.filter((id) => id !== pointId);
      } else {
        return [...prev, pointId];
      }
    });
  };

  // Check if triage triggers warnings
  const hasTriageRisk = useMemo(() => {
    return (
      triageAnswers['darah_rendah'] === true ||
      triageAnswers['pengencer_darah'] === true ||
      triageAnswers['wanita_khusus'] === true ||
      triageAnswers['luka_terbuka'] === true
    );
  }, [triageAnswers]);

  // Determine ideal package based on safety: redirect or warning
  const shouldRecommendDry = useMemo(() => {
    return (
      triageAnswers['darah_rendah'] === true ||
      triageAnswers['pengencer_darah'] === true
    );
  }, [triageAnswers]);

  // Predefined geographic zones relative to Bykam Cileungsi Office (50, 50)
  const POPULAR_MAP_REGIONS = useMemo(() => [
    { name: 'Puri Cileungsi (Kantor Pusat Bykam)', x: 50, y: 50, km: 0.1, desc: 'Puri Cileungsi Blok E9, Gandoang' },
    { name: 'Gandoang, Cileungsi, Bogor 16820', x: 55, y: 53, km: 1.5, desc: 'Gandoang Raya' },
    { name: 'Metland Transyogi, Cileungsi, Bogor 16820', x: 44, y: 47, km: 3.5, desc: 'Perumahan Metland Cileungsi' },
    { name: 'Harvest City, Cileungsi, Bogor 16820', x: 58, y: 41, km: 4.2, desc: 'Cluster Harvest City' },
    { name: 'Kota Wisata Cibubur, Ciangsana, Bogor', x: 30, y: 35, km: 8.5, desc: 'Kawasan Elite Kota Wisata' },
    { name: 'Gunung Putri, Wanaherang, Bogor 16965', x: 25, y: 56, km: 11.2, desc: 'Kawasan Gn. Putri / Wanaherang' },
    { name: 'Jonggol Center, Bogor 16830', x: 72, y: 65, km: 12.8, desc: 'Jonggol Raya' },
    { name: 'Taman Buah Mekarsari, Cileungsi, Bogor', x: 52, y: 37, km: 3.8, desc: 'Mekarsari Raya' },
    { name: 'Cibubur Junction, Jl. Jambore, Jakarta Timur', x: 15, y: 20, km: 18.2, desc: 'Area Cibubur & Akses Tol' },
    { name: 'Setu, Bekasi, Jawa Barat 17320', x: 64, y: 22, km: 16.5, desc: 'Setu Bekasi Raya' },
  ], []);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Find closest popular region to fill the address name
    let closestRegion = POPULAR_MAP_REGIONS[0];
    let minD = Infinity;
    POPULAR_MAP_REGIONS.forEach((r) => {
      const d = Math.sqrt(Math.pow(x - r.x, 2) + Math.pow(y - r.y, 2));
      if (d < minD) {
        minD = d;
        closestRegion = r;
      }
    });
    
    // Calculate Euclidean distance in coordinates and map it to km
    const dx = x - 50;
    const dy = y - 50;
    const rawDist = Math.sqrt(dx * dx + dy * dy);
    
    let calculatedKm = parseFloat((rawDist * 0.45 + 0.1).toFixed(1));
    if (calculatedKm < 0.5) {
      calculatedKm = 0.5;
    }
    
    setMapCoords({ x, y });
    setDistance(calculatedKm);
    
    const generatedAddress = `${closestRegion.name}`;
    setAddress(generatedAddress);
    setDestinationName(generatedAddress);
  };

  // Address simulation handler
  const handleAddressChange = (val: string) => {
    setAddress(val);
    if (val.trim().length > 3) {
      if (distance === 0) {
        setDistance(2.0); // Default to a free radius distance initially (2.0 km)
      }
      setDestinationName(val);
    } else {
      setDistance(0);
      setDestinationName('');
    }
  };

  // Transport fee calculation (dynamic: Rp 4,000 per km, free for 3 km and under)
  const transportFee = useMemo(() => {
    if (distance <= 3) return 0;
    return Math.round(distance * 4000);
  }, [distance]);

  // AddOn counter change
  const handleAddOnChange = (id: string, dir: 'inc' | 'dec') => {
    setSelectedAddOns((prev) => {
      const current = prev[id] || 0;
      const next = dir === 'inc' ? current + 1 : Math.max(0, current - 1);
      return { ...prev, [id]: next };
    });
  };

  // WhatsApp formatted string URL generator with Invoice and Aftercare Guides
  const getWhatsAppUrl = (toAdmin: boolean = false) => {
    let urlPhone = '';
    if (toAdmin) {
      urlPhone = '6285177872260';
    } else {
      const formattedPhone = phone.replace(/[^0-9]/g, '');
      urlPhone = formattedPhone.startsWith('0') ? '62' + formattedPhone.substring(1) : formattedPhone;
    }
    const pkgName = SERVICE_PACKAGES.find(pkg => pkg.id === selectedPackageId)?.name || 'Bekam Premium';
    const complaintsLabel = selectedComplaints.map(id => COMPLAINTS_DATA.find(c => c.id === id)?.label).join(', ') || 'Pemeriksaan Rutin';
    
    const text = `*BYKAM - INVOICE & AFTERCARE HOME SERVICE* 🩺✨

Rincian Pesanan Bekam Anda berhasil direkam dalam sistem:
=====================================
👤 *Nama Pelanggan:* ${fullName}
⚧️ *Gender Sesi:* ${gender === 'pria' ? 'Pria (Ikhwan)' : 'Wanita (Akhwat)'}
🏡 *Alamat Kunjungan:* ${address}
📅 *Tanggal Terapi:* ${selectedDate}
⏰ *Waktu Mulai:* ${selectedTimeSlot} WIB
🏥 *Terapis Utama:* ${assignedTherapist.name}
📦 *Paket Terapi:* ${pkgName}
📝 *Keluhan Medis:* ${complaintsLabel}

=====================================
💵 *RINCIAN BIAYA BIJAKSANA:*
• Biaya Paket: ${formatPrice(basePackagePrice)}
• Transport: ${transportFee === 0 ? 'Gratis (<3km)' : formatPrice(transportFee)}
• Produk Herbal: ${formatPrice(addOnTotal)}
💰 *GRAND TOTAL:* ${formatPrice(grandTotal)}

-------------------------------------
🌿 *PANDUAN PRA-BEKAM (SUNNAH):*
1. Puasa makan berat minimal 2-3 jam sebelum bekam (lambung kosong optimal).
2. Minumlah air putih secukupnya sebelum kedatangan terapis.
3. Informasikan kembali kondisi kesehatan aktual pada terapis setiba di rumah.

🛁 *PANDUAN AFTERCARE PASCA-BEKAM (SUNNAH & AMAN):*
1. Hindari mandi air dingin ekstrem selama 24 jam pertama demi regenerasi pori kulit.
2. Minumlah air hangat bercampur madu murni yang dibawakan terapis pasca-terapi.
3. Olesi tipis-tipis sisa pori bekam menggunakan Minyak Zaitun murni bila terasa agak gatal/kering.

Hubungi admin jika ada kendala rute atau keluhan mendadak. Semoga kesembuhan Anda dimudahkan oleh Allah SWT! Syukron. 🤲🏼`;

    return `https://wa.me/${urlPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleConfirmBooking = () => {
    const newBooking = {
      id: `BK-${(Math.random() * 10000).toFixed(0)}`,
      fullName,
      phone,
      gender,
      selectedDate,
      selectedTimeSlot,
      address,
      selectedPackageId,
      addOns: selectedAddOns,
      price: grandTotal,
      timestamp: new Date().toUTCString(),
    };
    const nextHistory = [newBooking, ...bookingHistory];
    setBookingHistory(nextHistory);
    localStorage.setItem('bykam_bookings', JSON.stringify(nextHistory));
    setStep(4);
  };

  // Assigned Therapist
  const assignedTherapist: Therapist = useMemo(() => {
    const pool = MOCK_THERAPISTS[gender];
    // deterministically pick based on selected package or time slot
    const idx = (selectedTimeSlot.charCodeAt(0) + selectedPackageId.charCodeAt(0)) % pool.length;
    return pool[idx];
  }, [gender, selectedTimeSlot, selectedPackageId]);

  const isStep1Valid = useMemo(() => {
    return fullName.trim().length > 0 && phone.trim().length >= 8 && selectedComplaints.length > 0;
  }, [fullName, phone, selectedComplaints]);

  // Pricing calculations
  const basePackagePrice = useMemo(() => {
    const pkg = SERVICE_PACKAGES.find((p) => p.id === selectedPackageId);
    return pkg ? pkg.price : 0;
  }, [selectedPackageId]);

  const addOnTotal = useMemo(() => {
    let tot = 0;
    ADDONS_DATA.forEach((item) => {
      const count = selectedAddOns[item.id] || 0;
      tot += count * item.price;
    });
    return tot;
  }, [selectedAddOns]);

  const grandTotal = useMemo(() => {
    return basePackagePrice + transportFee + addOnTotal;
  }, [basePackagePrice, transportFee, addOnTotal]);

  // Helper to convert Gregorian Date into Hijri details dynamically (17, 19, 21 Hijriah sunnah)
  const getHijriDetails = (date: Date) => {
    try {
      const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const parts = formatter.formatToParts(date);
      const day = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
      const monthName = parts.find(p => p.type === 'month')?.value || 'Muharram';
      const yearName = parts.find(p => p.type === 'year')?.value || '1448';
      
      return {
        day,
        monthName,
        yearName,
        text: `${day} ${monthName} ${yearName} H`,
        isSunnah: [17, 19, 21].includes(day)
      };
    } catch {
      // Precise fallback offset calibration around June 2026 (1 Muharram 1448 AH is approx June 16, 2026)
      const baseEpoch = new Date('2026-06-16').getTime();
      const currentEpoch = date.getTime();
      const diffDays = Math.floor((currentEpoch - baseEpoch) / (1000 * 60 * 60 * 24));
      const fallbackDay = ((30 + diffDays) % 30) + 1;
      return {
        day: fallbackDay,
        monthName: 'Muharram',
        yearName: '1448',
        text: `${fallbackDay} Muharram 1448 H`,
        isSunnah: [17, 19, 21].includes(fallbackDay)
      };
    }
  };

  // Dynamically generate calendarDates from June 15, 2026 for 21 days with dynamic Hijri calculations
  const calendarDates = useMemo(() => {
    const start = new Date('2026-06-15');
    const datesList = [];
    const idDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    
    for (let i = 0; i < 21; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      
      const yr = current.getFullYear();
      const mo = String(current.getMonth() + 1).padStart(2, '0');
      const dy = String(current.getDate()).padStart(2, '0');
      const fullStr = `${yr}-${mo}-${dy}`;
      const dayName = idDays[current.getDay()];
      
      const hijri = getHijriDetails(current);
      
      datesList.push({
        dayName,
        num: String(current.getDate()),
        full: fullStr,
        sunnah: hijri.isSunnah,
        hijriDay: hijri.day,
        hijriText: hijri.text,
        label: hijri.isSunnah ? `${hijri.day} Hijriah (Puncak Sunnah)` : `${hijri.day} Hijriah`
      });
    }
    return datesList;
  }, []);

  // Time Slots hourly from 08:00 to 21:00
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:05', '19:00', '20:00', '21:00'
  ];

  // Simulated existing bookings on other clients to trigger real conflict situations
  // and prevent double booking within 2 hours of a slots setup
  const simulatedBookings = useMemo(() => {
    const initialConflicts: Record<string, number[]> = {
      '2026-06-15': [9, 14],
      '2026-06-16': [11, 16],
      '2026-06-17': [8, 15],  // 8 is booked, blocks 8 and 9
      '2026-06-18': [10, 17],
      '2026-06-19': [12, 19],
      '2026-06-20': [10, 15, 20],
      '2026-06-21': [9, 14, 21],
      '2026-06-22': [11, 17],
      '2026-06-23': [8, 16],
    };

    // Integrate user's own confirmed history
    bookingHistory.forEach((b) => {
      if (b.selectedDate && b.selectedTimeSlot) {
        const hour = parseInt(b.selectedTimeSlot.split(':')[0], 10);
        if (!isNaN(hour)) {
          if (!initialConflicts[b.selectedDate]) {
            initialConflicts[b.selectedDate] = [];
          }
          initialConflicts[b.selectedDate].push(hour);
        }
      }
    });

    return initialConflicts;
  }, [bookingHistory]);

  // Determine which specific slots are locked on the selected date
  const blockedTimeSlots = useMemo(() => {
    const bookedHours = simulatedBookings[selectedDate] || [];
    const blockedSet = new Set<string>();
    
    bookedHours.forEach((hour) => {
      // Current slot (e.g. H)
      blockedSet.add(`${String(hour).padStart(2, '0')}:00`);
      // Next 1 hour slot is ALSO blocked (H+1) to ensure 2 hours therapy buffer
      blockedSet.add(`${String(hour + 1).padStart(2, '0')}:00`);
    });
    
    return Array.from(blockedSet);
  }, [selectedDate, simulatedBookings]);

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p);
  };

  return (
    <div className="pt-24 pb-32 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Wizard Header Stepper */}
        <div id="booking-stepper-header" className="mb-10 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="grid grid-cols-4 gap-2 text-center relative">
            
            {/* Step 1 */}
            <button
              type="button"
              id="stepper-step-1"
              onClick={() => step !== 4 && setStep(1)}
              disabled={step === 4}
              className={`flex flex-col items-center gap-1.5 focus:outline-hidden group ${step >= 1 ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                  step === 1
                    ? 'bg-primary text-white ring-4 ring-primary/10'
                    : step > 1
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                }`}
              >
                1
              </div>
              <span className={`text-[10px] sm:text-xs font-semibold ${step === 1 ? 'text-primary dark:text-primary-light' : 'text-slate-400 dark:text-slate-500'}`}>
                Data & Keluhan
              </span>
            </button>

            {/* Step 2 */}
            <button
              type="button"
              id="stepper-step-2"
              onClick={() => step !== 4 && isStep1Valid && setStep(2)}
              disabled={step === 4 || !isStep1Valid}
              className={`flex flex-col items-center gap-1.5 focus:outline-hidden group ${step >= 2 ? 'cursor-pointer' : 'disabled:cursor-not-allowed'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                  step === 2
                    ? 'bg-primary text-white ring-4 ring-primary/10'
                    : step > 2
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                }`}
              >
                2
              </div>
              <span className={`text-[10px] sm:text-xs font-semibold ${step === 2 ? 'text-primary dark:text-primary-light' : 'text-slate-400 dark:text-slate-500'}`}>
                Smart Triage
              </span>
            </button>

            {/* Step 3 */}
            <button
              type="button"
              id="stepper-step-3"
              onClick={() => step !== 4 && isStep1Valid && setStep(3)}
              disabled={step === 4 || !isStep1Valid}
              className={`flex flex-col items-center gap-1.5 focus:outline-hidden group ${step >= 3 ? 'cursor-pointer' : 'disabled:cursor-not-allowed'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                  step === 3
                    ? 'bg-primary text-white ring-4 ring-primary/10'
                    : step > 3
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                }`}
              >
                3
              </div>
              <span className={`text-[10px] sm:text-xs font-semibold ${step === 3 ? 'text-primary dark:text-primary-light' : 'text-slate-400 dark:text-slate-500'}`}>
                Paket & Jadwal
              </span>
            </button>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-1.5 select-none text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                  step === 4
                    ? 'bg-primary text-white ring-4 ring-primary/10 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                }`}
              >
                4
              </div>
              <span className={`text-[10px] sm:text-xs font-semibold ${step === 4 ? 'text-primary dark:text-primary-light' : 'text-slate-400 dark:text-slate-500'}`}>
                Dasbor Sukses
              </span>
            </div>

          </div>
        </div>

        {/* Multi-Tab Contents */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: DATA DIRI & KELUHAN UTAMA */}
          {step === 1 && (
            <motion.div
              key="tab1"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
              id="tab-user-complaint-wrapper"
            >
              {/* Back Link */}
              <button
                type="button"
                id="tab1-back-to-landing"
                onClick={onBackToLanding}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Batal & Kembali ke Beranda</span>
              </button>

              {/* SECTION A: REGISTRASI DATA DIRI (TRACKING CUSTOMER) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
                <div>
                  <h2 className="font-sans font-bold text-lg text-slate-900 dark:text-white">
                    Langkah 1: Identitas Klien & Gender Layanan
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Isi data diri Anda terlebih dahulu. Sesuai syariat, terapis pria hanya melayani pria, dan terapis wanita melayani wanita (Muhrim).
                  </p>
                </div>

                <div className="h-[1px] bg-slate-100 dark:bg-slate-850" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* FULL NAME INPUT */}
                  <div className="space-y-1.5">
                    <label htmlFor="fullname-input" className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Nama Lengkap Klien
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        id="fullname-input"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          localStorage.setItem('bykam_fullName', e.target.value);
                        }}
                        placeholder="Contoh: Arfan Fauzi"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* PHONE (WHATSAPP) INPUT */}
                  <div className="space-y-1.5">
                    <label htmlFor="phone-input" className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Nomor WA Aktif (Untuk Tiket/Invoice)
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        id="phone-input"
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9+]/g, '');
                          setPhone(val);
                          localStorage.setItem('bykam_phone', val);
                        }}
                        placeholder="Contoh: 081234567890"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* GENDER LAYANAN TOGGLE */}
                  <div className="space-y-1.5">
                    <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Gender Sesi Terapi (Sesuai Syariat)
                    </span>
                    <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl gap-1 h-[42px] items-center">
                      <button
                        type="button"
                        id="gender-pria-btn"
                        onClick={() => {
                          setGender('pria');
                          localStorage.setItem('bykam_gender', 'pria');
                          setTriageAnswers(prev => ({ ...prev, wanita_khusus: false }));
                        }}
                        className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          gender === 'pria'
                            ? 'bg-primary text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        Pria (Ikhwan)
                      </button>
                      <button
                        type="button"
                        id="gender-wanita-btn"
                        onClick={() => {
                          setGender('wanita');
                          localStorage.setItem('bykam_gender', 'wanita');
                        }}
                        className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          gender === 'wanita'
                            ? 'bg-primary text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        Wanita (Akhwat)
                      </button>
                    </div>
                  </div>
                </div>

                {gender === 'wanita' && (
                  <div className="mt-4 p-4 bg-rose-500/10 border border-rose-250/30 dark:border-rose-950/40 rounded-2xl text-xs text-rose-750 dark:text-rose-300 leading-relaxed font-semibold shadow-xs flex items-start gap-2.5">
                    <span className="text-rose-500 text-base">⚠️</span>
                    <div>
                      <p className="font-bold text-rose-800 dark:text-rose-200">Terapis Akhwat (Wanita) Belum Tersedia</p>
                      <p className="mt-1 font-normal text-slate-650 dark:text-slate-400 leading-relaxed">
                        Saat ini terapis Akhwat resmi Bykam sedang dalam proses persiapan (belum tersedia). Anda tetap dapat melanjutkan pengisian data dan berkonsultasi/antre prioritas secara langsung melalui WhatsApp Admin Utama (<a href="https://wa.me/6285177872260" target="_blank" rel="noreferrer" className="underline font-bold text-primary hover:text-primary-hover">085177872260</a>) agar dicatat sebagai antrean utama saat slot terapis wanita siap melayani.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION B: GEJALA ATAU KELUHAN YANG BANYAK (GRID DETAIL) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
                <div>
                  <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white">
                    Langkah 2: Pilih Keluhan & Gangguan Tubuh Anda
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Silakan centang satu atau lebih keluhan di bawah ini. Tim medis Bykam akan mendistribusikan pola titik sayatan bekam sunnah secara akurat sesuai data keluhan Anda.
                  </p>
                </div>

                <div className="h-[1px] bg-slate-100 dark:bg-slate-850 my-5" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {COMPLAINTS_DATA.map((complaint) => {
                    const isSelected = selectedComplaints.includes(complaint.id);
                    const isDetoks = complaint.id === 'detoks';
                    return (
                      <div
                        key={complaint.id}
                        id={`complaint-card-${complaint.id}`}
                        onClick={() => handleToggleComplaint(complaint.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 text-left items-start relative overflow-hidden ${
                          isSelected
                            ? 'bg-primary/10 dark:bg-primary/5 border-primary shadow-md ring-1 ring-primary/30'
                            : isDetoks
                            ? 'bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-500/5 border-amber-400/80 dark:border-amber-900/60 shadow-xs ring-1 ring-amber-400/20 hover:shadow-xs hover:border-amber-500'
                            : 'bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/80'
                        }`}
                      >
                        {isDetoks && (
                          <div className="absolute top-1 right-2 bg-amber-500/20 text-amber-850 dark:text-amber-400 text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-0.5 z-10">
                            <span>★ UTAMA & SUNNAH</span>
                          </div>
                        )}
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded-md border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer accent-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className={`font-sans text-xs sm:text-xs font-bold text-slate-900 dark:text-white ${isDetoks ? 'text-amber-800 dark:text-amber-300 pr-20' : ''}`}>
                            {complaint.label}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-normal">
                            {complaint.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Continue Nav */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-4 rounded-xl shadow-xs">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {fullName.trim() && phone.trim().length >= 8 && selectedComplaints.length > 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Data klien lengkap, lanjut ke tahap skrining medis.
                    </span>
                  ) : (
                    <span className="text-amber-500 font-medium">
                      {!fullName.trim() ? '*Harap isi Nama' : !phone.trim() || phone.trim().length < 8 ? '*Harap isi Nomor WA valid' : '*Pilih minimal 1 keluhan'}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  id="tab1-next-btn"
                  onClick={() => setStep(2)}
                  disabled={!fullName.trim() || phone.trim().length < 8 || selectedComplaints.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-primary-hover hover:scale-[1.01] disabled:from-slate-250 disabled:to-slate-250 dark:disabled:from-slate-800 dark:disabled:to-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-600 rounded-xl text-xs font-semibold cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-md shadow-primary/10"
                >
                  <span>Lanjut ke Skrining Medis</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </motion.div>
          )}

          {/* TAB 2: SMART TRIAGE (SKRINiNG KEAMANAN) */}
          {step === 2 && (
            <motion.div
              key="tab2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
              id="tab-triage-wrapper"
            >
              {/* Back link */}
              <button
                type="button"
                id="tab2-back-btn"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Kembali ke Pilih Titik</span>
              </button>

              {/* Title Header Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
                <h2 className="font-sans font-bold text-2xl text-slate-900 dark:text-white">
                  Smart Triage & Skrining Keamanan Medis
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                  Bykam menerapkan sistem deteksi kontraindikasi berbasis standar klinis. Harap jawab kuesioner medis berikut secara akurat demi keselamatan Anda.
                </p>

                <div className="h-[1px] bg-slate-100 dark:bg-slate-850 my-6" />

                {/* Questions layout */}
                <div className="space-y-5">
                  {TRIAGE_QUESTIONS.map((q) => {
                    // Filter if target gender exists
                    if (q.targetGender && q.targetGender !== gender) return null;

                    const hasAnswer = triageAnswers[q.id] !== undefined;
                    const answerValue = triageAnswers[q.id];

                    return (
                      <div
                        key={q.id}
                        id={`triage-card-${q.id}`}
                        className={`p-5 rounded-2xl border transition-all duration-300 ${
                          answerValue === true
                            ? 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/40'
                            : answerValue === false
                            ? 'bg-emerald-50/20 dark:bg-emerald-950/5 border-emerald-100/50 dark:border-emerald-900/20'
                            : 'bg-slate-50/50 dark:bg-slate-900/35 border-slate-100 dark:border-slate-850'
                        } flex flex-col md:flex-row md:items-center justify-between gap-4`}
                      >
                        <div className="max-w-xl">
                          <p className="font-sans font-semibold text-slate-900 dark:text-slate-50 text-[14px]">
                            {q.text}
                          </p>
                        </div>

                        {/* Large Dual Action Buttons Instead of Tiny Radios */}
                        <div className="grid grid-cols-2 gap-2 w-full md:w-[160px] shrink-0">
                          <button
                            type="button"
                            id={`triage-yes-${q.id}`}
                            onClick={() => setTriageAnswers({ ...triageAnswers, [q.id]: true })}
                            className={`py-2 px-4 rounded-xl text-xs font-semibold border transition-all ${
                              answerValue === true
                                ? 'bg-red-500 hover:bg-red-400 border-red-500 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850'
                            }`}
                          >
                            Ya
                          </button>
                          <button
                            type="button"
                            id={`triage-no-${q.id}`}
                            onClick={() => setTriageAnswers({ ...triageAnswers, [q.id]: false })}
                            className={`py-2 px-4 rounded-xl text-xs font-semibold border transition-all ${
                              answerValue === false
                                ? 'bg-emerald-500 hover:bg-emerald-400 border-emerald-500 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850'
                            }`}
                          >
                            Tidak
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Reactive Warnings Block */}
              <AnimatePresence>
                {hasTriageRisk && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row gap-4 items-start">
                      <div className="p-2 sm:p-3 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="space-y-3 flex-1">
                        <h3 className="font-sans font-bold text-amber-800 dark:text-amber-400 text-base">
                          Rekomendasi Pemulihan Aman Terdeteksi
                        </h3>
                        <p className="font-sans text-xs sm:text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                          Berdasarkan kuesioner medis, tubuh Anda kurang disarankan untuk tindakan <span className="font-bold text-rose-500">Bekam Basah (Surgical Cupping)</span> saat ini demi menghindari pembekuan abnormal atau pusing ekstrim.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div className="p-3 bg-white/70 dark:bg-slate-950/70 border border-amber-200 dark:border-amber-900/40 rounded-xl">
                            <span className="font-bold text-xs text-primary dark:text-primary-light block mb-1">
                              ✓ Auto-Saran Paket:
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              Layanan dialihkan otomatis ke <span className="font-semibold text-slate-800 dark:text-slate-200">Bekam Kering & Pijat Cedera</span> (Tanpa jarum dan sayatan).
                            </span>
                          </div>
                          <div className="p-3 bg-white/70 dark:bg-slate-950/70 border border-amber-200 dark:border-amber-900/40 rounded-xl">
                            <span className="font-bold text-xs text-rose-600 dark:text-rose-400 block mb-1">
                              ☎ Konsultasi Dokter Bykam:
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              Konsultasikan kondisi khusus Anda ke tim medis kami di WhatsApp sekarang.
                            </span>
                          </div>
                        </div>

                        {/* WA Consultation Option inside form */}
                        <div className="pt-2 flex flex-wrap gap-3">
                          <a
                            href="https://wa.me/6285177872260?text=Halo%2520Bykam,%2520saya%252520terindikasi%252520risiko%252520skrining%252520dan%252520ingin%252520berkonsultasi..."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                          >
                            <Phone size={13} />
                            Hubungi WA Dokter Bykam
                          </a>
                          <button
                            type="button"
                            id="accept-dry-btn"
                            onClick={() => {
                              setSelectedPackageId('dry_only');
                              // Automatically accept dry cupping as recommendation
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white dark:text-slate-100 rounded-xl text-xs font-semibold transition-all"
                          >
                            <span>Ubah Paket ke Bekam Kering ({formatPrice(100000)})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stepper Wizard Control buttons */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-4 rounded-xl shadow-xs">
                <button
                  type="button"
                  id="tab2-prev-btn"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-semibold cursor-pointer"
                >
                  Sebelumnya
                </button>

                <button
                  type="button"
                  id="tab2-next-btn"
                  onClick={() => {
                    // If user is low-blood-pressure and hasn't changed package, force dry package
                    if (shouldRecommendDry && selectedPackageId !== 'dry_only') {
                      setSelectedPackageId('dry_only');
                    }
                    setStep(3);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-primary-hover hover:scale-[1.01] text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/10"
                >
                  <span>Lanjut ke Paket & Jadwal</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </motion.div>
          )}

          {/* TAB 3: JADWAL, LAYANAN, CROSS-SELLING & ALAMAT */}
          {step === 3 && (
            <motion.div
              key="tab3"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
              id="tab-scheduling-wrapper"
            >
              {/* Back Link */}
              <button
                type="button"
                id="tab3-prev-nav"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Kembali ke Skrining</span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Area: Service Package & Dynamic Address (2 Cols) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Package Selector */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
                    <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white mb-1">
                      Pilihan Paket Terapi Bykam
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      Tentukan paket yang sesuai kebutuhan pemulihan tubuh Anda saat ini.
                    </p>

                    <div className="space-y-3">
                      {SERVICE_PACKAGES.map((pkg) => {
                        const isSelected = selectedPackageId === pkg.id;
                        const isSuggested = shouldRecommendDry && pkg.id === 'dry_only';
                        const isBlocked = shouldRecommendDry && pkg.id !== 'dry_only';

                        return (
                          <div
                            key={pkg.id}
                            id={`package-card-${pkg.id}`}
                            onClick={() => {
                              if (isBlocked) return;
                              setSelectedPackageId(pkg.id);
                            }}
                            className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-primary/10 dark:bg-primary/5 border-primary'
                                : isBlocked
                                ? 'opacity-40 border-slate-100 dark:border-slate-850 cursor-not-allowed bg-red-500/5'
                                : 'border-slate-200/50 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-sans font-bold text-slate-900 dark:text-white text-[15px]">
                                    {pkg.name}
                                  </h4>
                                  {isSuggested && (
                                    <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase animate-pulse">
                                      Disarankan Sesuai Hasil Skrining
                                    </span>
                                  )}
                                  {isBlocked && (
                                    <span className="text-[9px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                                      Konsultasi Medis Diperlukan
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 lines-clamp-2">
                                  {pkg.description}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-mono font-bold text-primary dark:text-primary-light text-base">
                                  {formatPrice(pkg.price)}
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                                  ⏱ {pkg.duration} mnt
                                </span>
                              </div>
                            </div>

                            {/* Package details bullet breakdown if selected */}
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 pt-3 border-t border-primary/10 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300"
                              >
                                {pkg.benefits.map((b, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5">
                                    <span className="text-emerald-500 font-bold">✓</span>
                                    <span>{b}</span>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Address Form + Custom Interactive Route Calculator */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-5">
                    <div>
                      <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white mb-1">
                        Lokasi Kunjungan Home Service
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Terapis akan membawa seluruh ranjang lipat, sterilisator portable, dan kit bekam langsung ke alamat Anda.
                      </p>
                    </div>

                    {/* Map Mode Selector Tabs */}
                    <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-900/80">
                      <button
                        type="button"
                        onClick={() => setMapMode('gmp')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          mapMode === 'gmp'
                            ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                      >
                        <Compass size={14} className={mapMode === 'gmp' ? 'animate-pulse' : ''} />
                        <span>Google Maps Resmi (Akurat)</span>
                        {!hasValidKey && (
                          <span className="text-[8px] bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded-md uppercase font-black tracking-wide">
                            KLIK
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapMode('radar')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          mapMode === 'radar'
                            ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                      >
                        <Navigation size={13} />
                        <span>Radar Bykam (Offline)</span>
                      </button>
                    </div>

                    {mapMode === 'gmp' ? (
                      <GoogleMapsPicker
                        currentAddress={address}
                        currentDistance={distance}
                        onLocationSelected={handleGoogleLocationSelected}
                      />
                    ) : (
                      /* Interactive Map Picker Container */
                      <div className="border border-slate-150 dark:border-slate-805/80 rounded-2xl overflow-hidden bg-slate-950 text-slate-100 shadow-md">
                        {/* Map Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-900 border-b border-slate-800 gap-2">
                          <div className="flex items-center gap-2">
                            <Compass className="text-primary animate-spin" size={16} style={{ animationDuration: '6s' }} />
                            <div className="text-left">
                              <span className="text-xs font-black tracking-wider uppercase text-slate-200 block">MAP LOCKER BYKAM SQUAD</span>
                              <span className="text-[9px] text-slate-400 block -mt-0.5">Ketuk langsung di peta radar untuk menghitung jarak & tarif</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded-full uppercase font-black tracking-wide self-start sm:self-auto animate-pulse">
                            📍 RADAR AKTIF
                          </span>
                        </div>

                        {/* Map Grid Area */}
                        <div 
                          onClick={handleMapClick}
                          className="h-64 sm:h-72 w-full relative cursor-crosshair overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 select-none border-b border-slate-900"
                        >
                          {/* Radar Range Helper Rings centered at (50, 50) */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] rounded-full border border-slate-800/60 pointer-events-none flex items-center justify-center">
                            <span className="text-[8px] font-mono text-slate-650/80">3 km (Gratis)</span>
                          </div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-dashed border-slate-805/45 pointer-events-none flex items-start justify-center pt-1.5">
                            <span className="text-[8px] font-mono text-slate-650/80">10 km</span>
                          </div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-slate-800/25 pointer-events-none flex items-start justify-center pt-3">
                            <span className="text-[8px] font-mono text-slate-650/80">20 km</span>
                          </div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-slate-800/15 pointer-events-none flex items-start justify-center pt-5">
                            <span className="text-[8px] font-mono text-slate-650/80">30 km</span>
                          </div>

                          {/* Technical crosshairs for clinical aesthetics */}
                          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-slate-900 pointer-events-none opacity-40" />
                          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-slate-900 pointer-events-none opacity-40" />

                          {/* Compass Rose */}
                          <div className="absolute top-4 right-4 text-slate-800 text-[10px] font-mono flex flex-col items-center pointer-events-none select-none">
                            <span className="text-[11px] font-bold text-slate-700">N</span>
                            <span className="text-slate-900">▲</span>
                          </div>

                          {/* Rendering Landmark Cities */}
                          {POPULAR_MAP_REGIONS.map((reg, idx) => {
                            const isCenter = idx === 0;
                            return (
                              <button
                                key={reg.name}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMapCoords({ x: reg.x, y: reg.y });
                                  setDistance(reg.km);
                                  setAddress(reg.name);
                                  setDestinationName(reg.name);
                                }}
                                className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer ${
                                  isCenter ? 'z-20' : 'z-10'
                                }`}
                                style={{ left: `${reg.x}%`, top: `${reg.y}%` }}
                              >
                                {isCenter ? (
                                  <>
                                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center animate-ping absolute" />
                                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-white flex items-center justify-center shadow-lg shadow-amber-500/50">
                                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                                    </div>
                                    <span className="text-[9px] font-black text-amber-400 bg-slate-900/90 py-0.5 px-1.5 border border-amber-500/20 rounded-md shadow-md mt-1 whitespace-nowrap tracking-wide">
                                      KANTOR BYKAM (START)
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700 group-hover:bg-primary transition-colors border border-slate-950 shadow-xs" />
                                    <span className="text-[8px] font-semibold text-slate-400 group-hover:text-white transition-colors bg-slate-900/70 px-1 py-0.5 rounded-sm mt-0.5 whitespace-nowrap">
                                      {reg.name.split(',')[0]}
                                    </span>
                                  </>
                                )}
                              </button>
                            );
                          })}

                          {/* Connector Line from Bykam Office to Pin */}
                          {mapCoords && (
                            <svg className="absolute inset-0 w-full h-full pointer-events-none select-none z-10">
                              <defs>
                                <linearGradient id="glow-grad-picker" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
                                </linearGradient>
                              </defs>
                              <line 
                                x1="50%" 
                                y1="50%" 
                                x2={`${mapCoords.x}%`} 
                                y2={`${mapCoords.y}%`} 
                                stroke="url(#glow-grad-picker)"
                                strokeWidth="2.5"
                                strokeDasharray="6,4"
                              />
                            </svg>
                          )}

                          {/* Customer Live Pointer */}
                          {mapCoords && (
                            <motion.div 
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute -translate-x-1/2 -translate-y-12 z-30 flex flex-col items-center pointer-events-none"
                              style={{ left: `${mapCoords.x}%`, top: `${mapCoords.y}%` }}
                            >
                              <div className="bg-gradient-to-r from-sky-450 to-indigo-550 text-white font-extrabold text-[8px] px-2 py-1 rounded-lg shadow-lg border border-sky-300/40 flex items-center gap-1 whitespace-nowrap animate-bounce leading-none">
                                <MapPin size={8} className="fill-current" />
                                <span>Rumah Anda (~{distance.toFixed(1)} km)</span>
                              </div>
                              <div className="w-3 h-3 bg-indigo-500 border-2 border-white rounded-full mt-1 animate-pulse shadow-md" />
                            </motion.div>
                          )}

                          {/* Static Watermark Instruction */}
                          <div className="absolute bottom-2.5 left-3 text-[9px] text-slate-500 font-medium pointer-events-none bg-slate-900/60 py-1 px-2.5 rounded-lg border border-slate-800/50">
                            🎯 Klik langsung di area peta di atas untuk geser Pin Lokasi Anda
                          </div>
                        </div>

                        {/* Map Shortcuts */}
                        <div className="p-3 bg-slate-900/90 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mr-1">Preset Kecamatan:</span>
                          {POPULAR_MAP_REGIONS.slice(1, 7).map((reg) => (
                            <button
                              key={reg.name}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMapCoords({ x: reg.x, y: reg.y });
                                setDistance(reg.km);
                                setAddress(reg.name);
                                setDestinationName(reg.name);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-[10px] text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-750/30 font-medium cursor-pointer"
                            >
                              📍 {reg.name.split(',')[0]} ({~~reg.km} km)
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Standard text Input Field for manual details like flat, block, etc */}
                    <div className="space-y-2">
                      <label htmlFor="address-input" className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Detail Alamat Rumah & Nomor Rumah / Blok / Apartemen
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 text-slate-400 animate-pulse" size={17} />
                        <input
                          type="text"
                          id="address-input"
                          value={address}
                          onChange={(e) => handleAddressChange(e.target.value)}
                          placeholder="Ketik alamat lengkap atau lengkapi hasil ketukan peta di sini..."
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary font-medium"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        *Anda dapat mengetik alamat manual ataupun langsung mengetuk peta interaktif Bykam di atas untuk mengisi jalan utama secara otomatis.
                      </p>
                    </div>

                    {/* Cost, Distance, and Google Maps Route Transparency Indicator */}
                    {address && (
                      <div className="mt-4 p-4.5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850/80">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200/50 dark:border-slate-800/40">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                              TRANSPARANSI RUTE & JARAK
                            </p>
                            <h4 className="text-xs font-bold text-slate-750 dark:text-slate-350 mt-1">
                              Konfirmasi Jarak dari Kantor Bykam Cileungsi
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                              Terapis berangkat dari Puri Cileungsi Blok E9 Gandoang. Silakan sesuaikan slider jika jarak asli di lapangan berbeda.
                            </p>
                          </div>
                          
                          <a
                            href={`https://www.google.com/maps/dir/Puri+Cileungsi,+Gandoang,+Cileungsi,+Bogor/${encodeURIComponent(address)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 dark:bg-slate-800 dark:border-slate-755 hover:bg-primary hover:border-primary text-white dark:text-slate-200 rounded-xl text-[10px] sm:text-xs font-extrabold shadow-xs whitespace-nowrap transition-colors self-start sm:self-center"
                          >
                            <span>Cek Rute Google Maps ↗</span>
                          </a>
                        </div>

                        {/* Interactive Distance Selector Slider */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider">
                                Jarak Aktual Rumah Anda:
                              </span>
                              <span className="text-sm font-mono font-black text-primary dark:text-primary-light">
                                {distance.toFixed(1)} km
                              </span>
                            </div>
                            
                            <input
                              type="range"
                              min="0"
                              max="35"
                              step="0.5"
                              value={distance}
                              onChange={(e) => setDistance(parseFloat(e.target.value))}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-505 font-mono">
                              <span>0 km (Gratis)</span>
                              <span>12 km</span>
                              <span>24 km</span>
                              <span>35 km</span>
                            </div>
                          </div>

                          <div className="flex flex-col justify-center bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-805/60">
                            <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-850 pb-2 mb-2">
                              <span className="text-slate-550 dark:text-slate-405 font-medium">Ongkos Kedatangan:</span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {transportFee === 0 ? 'Gratis (<3km)' : formatPrice(transportFee)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                              <span>Estimasi Waktu Tiba:</span>
                              <span className="font-mono">{Math.round(distance * 3 + 12)} menit</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mini Cart / Premium Herbal Products Recommendation */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles size={18} className="text-primary animate-pulse" />
                      <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white">
                        Herbal Kedatangan Pendukung Pemulihan Sunnah
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      Terapis Bykam membawa perbekalan herbal steril asli bersegel untuk segera diminum pasca-terapi demi meningkatkan revitalisasi hemoglobin & imunitas tubuh.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {ADDONS_DATA.map((addon) => {
                        const count = selectedAddOns[addon.id] || 0;
                        
                        // Premium visual placeholder asset based on product id
                        let productImgPlaceholder = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?fit=crop&w=300&h=200&q=80';
                        if (addon.id === 'habba') {
                          productImgPlaceholder = 'https://images.unsplash.com/photo-1611070973770-b1a672610042?fit=crop&w=300&h=200&q=80'; // Herbal pills capsules bottle
                        } else if (addon.id === 'madu') {
                          productImgPlaceholder = 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?fit=crop&w=300&h=200&q=80'; // Honey jar organic
                        } else if (addon.id === 'zaitun') {
                          productImgPlaceholder = 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?fit=crop&w=300&h=200&q=80'; // Olive oil glass bottle
                        }

                        return (
                          <div
                            key={addon.id}
                            id={`addon-card-${addon.id}`}
                            className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between overflow-hidden group hover:shadow-xs transition-all"
                          >
                            {/* Product Image Placeholder as requested by user */}
                            <div className="w-full h-28 rounded-xl bg-slate-100 dark:bg-slate-950 mb-3 overflow-hidden relative border border-slate-200/10">
                              <img
                                src={productImgPlaceholder}
                                alt={addon.name}
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-95"
                              />
                              <div className="absolute top-2 right-2 bg-slate-900/85 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-bold text-white uppercase tracking-wider">
                                Sealed
                              </div>
                            </div>

                            <div>
                              <h4 className="font-sans font-semibold text-slate-900 dark:text-white text-xs sm:text-xs md:text-[13px] leading-tight group-hover:text-primary transition-colors">
                                {addon.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                                {addon.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-4 border-t border-slate-100 dark:border-slate-850 pt-3">
                              <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-300">
                                {formatPrice(addon.price)}
                              </span>

                              {/* Interactive Increment/Decrement Selector */}
                              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                                <button
                                  type="button"
                                  id={`addon-dec-${addon.id}`}
                                  onClick={() => handleAddOnChange(addon.id, 'dec')}
                                  disabled={count === 0}
                                  className="p-1 px-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="font-sans text-[11px] font-bold px-2 text-slate-800 dark:text-slate-100 font-mono">
                                  {count}
                                </span>
                                <button
                                  type="button"
                                  id={`addon-inc-${addon.id}`}
                                  onClick={() => handleAddOnChange(addon.id, 'inc')}
                                  className="p-1 px-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden cursor-pointer"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Right Area: Date Picker, Slots, and Invoice (1 Col) */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Calendar Widget */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
                    <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white mb-1">
                      Kalender Kehadiran & Puncak Sunnah Hijriah
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3.5 leading-relaxed">
                      Lencana bintang emas ★ menunjukkan tanggal sunnah utama (17, 19, 21 Hijriah) setiap bulannya.
                    </p>

                    {/* Date picker grid layout */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {calendarDates.map((cd) => {
                        const isSelected = selectedDate === cd.full;
                        return (
                          <button
                            type="button"
                            key={cd.full}
                            id={`calendar-date-${cd.num}`}
                            onClick={() => setSelectedDate(cd.full)}
                            className={`p-2 rounded-xl flex flex-col items-center justify-center relative cursor-pointer group transition-all border ${
                              isSelected
                                ? 'bg-primary border-primary text-white shadow-md'
                                : cd.sunnah
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-900/40 font-semibold'
                                : 'bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-250 border-slate-200/50 dark:border-slate-800/80'
                            }`}
                          >
                            <span className={`text-[9px] uppercase leading-none ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                              {cd.dayName}
                            </span>
                            <span className="font-mono text-xs font-bold leading-none mt-1">
                              {cd.num}
                            </span>
                            <span className={`text-[8px] leading-tight font-serif mt-1 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                              {cd.hijriDay} {cd.hijriDay === 17 || cd.hijriDay === 19 || cd.hijriDay === 21 ? 'Sunnah' : ''}
                            </span>

                            {/* Little gold indicator representing Islamic Sunnah dates strictly requested by user */}
                            {cd.sunnah && (
                              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full flex items-center justify-center text-[8px] bg-amber-500 text-slate-950 font-bold ${isSelected ? 'ring-2 ring-white dark:ring-slate-900' : ''}`}>
                                ★
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Sunnah message box */}
                    {calendarDates.find((cd) => cd.full === selectedDate)?.sunnah && (
                      <div className="mt-3 p-2 bg-amber-500/15 rounded-lg text-[10px] text-amber-750 dark:text-amber-350 flex gap-1.5 items-center font-medium leading-snug">
                        <Sparkles size={11} className="shrink-0 animate-bounce text-amber-500" />
                        <span>Tanggal Sunnah Terpilih ({calendarDates.find((cd) => cd.full === selectedDate)?.hijriText})! Cupping di tanggal sunnah memiliki efektivitas penyembuhan klinis tertinggi sesuai sabda Nabi Muhammad SAW.</span>
                      </div>
                    )}
                  </div>

                  {/* Time Slots Widget */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
                    <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white mb-1">
                      Pendaftaran Jam Tersedia
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 leading-normal">
                      Jam yang telah di-booking klien lain akan bertuliskan <span className="text-red-500 font-semibold">Penuh</span> dan memblokir pilihan 2 jam setelahnya demi kenyamanan sesi terapi.
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((ts) => {
                        const isBlocked = blockedTimeSlots.includes(ts);
                        const isSelected = selectedTimeSlot === ts;
                        return (
                          <button
                            type="button"
                            key={ts}
                            id={`time-slot-${ts}`}
                            disabled={isBlocked}
                            onClick={() => !isBlocked && setSelectedTimeSlot(ts)}
                            className={`p-2 rounded-xl text-center text-xs font-semibold border transition-all relative ${
                              isBlocked
                                ? 'bg-slate-100 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/80 text-slate-400 dark:text-slate-600 cursor-not-allowed line-through'
                                : isSelected
                                ? 'bg-primary border-primary text-white shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800'
                            }`}
                          >
                            <span>{ts}</span>
                            {isBlocked && (
                              <span className="block text-[8px] leading-none text-rose-500/80 mt-0.5 uppercase tracking-wide font-semibold">
                                Penuh
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Receipt Breakdown Invoice */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-4">
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-white font-bold border-b border-slate-100 dark:border-slate-850 pb-3">
                      <Receipt size={16} className="text-primary" />
                      <h3 className="font-sans text-sm">
                        Rincian Invoice Layanan
                      </h3>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Base Package */}
                      <div className="flex justify-between text-slate-650 dark:text-slate-400">
                        <span>Paket Terapi ({selectedPackageId === 'standard' ? 'Standard' : selectedPackageId === 'plus_massage' ? 'Royal' : 'Kering'})</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">{formatPrice(basePackagePrice)}</span>
                      </div>

                      {/* Distance fee */}
                      <div className="flex justify-between text-slate-650 dark:text-slate-450">
                        <span>Ongkos Kirim ({distance.toFixed(1)} km)</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                          {transportFee === 0 ? 'Gratis' : formatPrice(transportFee)}
                        </span>
                      </div>

                      {/* Add-ons */}
                      {addOnTotal > 0 && (
                        <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-850">
                          <span className="text-[10px] text-slate-405 block uppercase tracking-wider font-bold">
                            Herbal Tambahan:
                          </span>
                          {ADDONS_DATA.map((item) => {
                            const cnt = selectedAddOns[item.id] || 0;
                            if (cnt === 0) return null;
                            return (
                              <div key={item.id} className="flex justify-between text-slate-500 pl-1.5 text-[11px]">
                                <span>{item.name} &times; {cnt}</span>
                                <span className="font-mono">{formatPrice(item.price * cnt)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Total */}
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Total Pembayaran
                        </span>
                        <span className="font-mono font-extrabold text-primary dark:text-primary-light text-lg">
                          {formatPrice(grandTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Submit Order Booking */}
                    <button
                      type="button"
                      id="confirm-booking-btn"
                      disabled={!address.trim()}
                      onClick={handleConfirmBooking}
                      className="w-full text-center py-3 bg-gradient-to-r from-primary to-primary-hover hover:scale-[1.01] disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-800 text-white disabled:text-slate-400 rounded-xl text-xs font-bold tracking-wider cursor-pointer disabled:cursor-not-allowed uppercase shadow-lg shadow-primary/15 flex items-center justify-center gap-1.5"
                    >
                      <UserCheck size={14} />
                      <span>Konfirmasi Booking Terapis</span>
                    </button>

                    {!address.trim() && (
                      <p className="text-[10px] text-center text-rose-500 italic font-medium">
                        *Harap masukkan alamat jemput di kiri agar terapis bisa dihitung transportasinya.
                      </p>
                    )}
                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: CLIENT DASHBOARD (SUCCESS STATE & AFTERCARE / RETENTION) */}
          {step === 4 && (
            <motion.div
              key="tab4"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
              id="tab-success-dashboard"
            >
                    {/* Confetti Banner */}
               <div className="bg-gradient-to-r from-primary to-primary-hover p-8 rounded-3xl text-white text-center shadow-lg relative overflow-hidden select-none">
                 <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-6 opacity-10">
                   <span className="text-[120px] font-sans font-extrabold">BYKAM</span>
                 </div>

                 <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/30 animate-pulse">
                   <CheckCircle2 size={32} className="text-white" />
                 </div>

                 <h2 className="font-sans font-bold text-2xl sm:text-3xl leading-snug">
                   Booking Berhasil & Terkonfirmasi!
                 </h2>
                 <p className="font-sans text-xs sm:text-sm text-white/90 mt-2 max-w-xl mx-auto leading-relaxed">
                   Terapis profesional Bykam kami telah dipersiapkan khusus sesuai gender, membawa kit medis antiseptik murni.
                 </p>
               </div>

               {/* Grid 2 Columns: Boarding pass ticket + Medical Tracker */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                 
                 {/* Boarding Pass Style Digital Ticket */}
                 <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-md overflow-hidden relative">
                   
                   {/* Decorative circular notches in the sides representing old retro transit tickets */}
                   <div className="absolute top-1/2 left-0 w-4 h-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 -translate-x-1/2 -translate-y-1/2 rounded-r-full z-10 hidden sm:block" />
                   <div className="absolute top-1/2 right-0 w-4 h-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 translate-x-1/2 -translate-y-1/2 rounded-l-full z-10 hidden sm:block" />

                   {/* Ticket Header */}
                   <div className="bg-slate-950 text-white p-5 flex justify-between items-center border-b border-dashed border-white/10">
                     <div>
                       <span className="text-[9px] font-mono tracking-widest text-primary-light font-bold uppercase">
                         TIKET HOME SERVICE
                       </span>
                       <h4 className="font-sans font-bold text-base tracking-tight text-white mt-0.5">
                         BYKAM CO-TRANSACT
                       </h4>
                     </div>
                     <span className="font-mono text-xs bg-primary/10 text-primary-light border border-primary/20 px-3 py-1 rounded-full uppercase">
                       ID: BK-{(Math.random() * 10000).toFixed(0)}
                     </span>
                   </div>

                  {/* Body Info */}
                  <div className="p-6 space-y-6">
                    
                    {/* Destination Row */}
                    <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-850 pb-5">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                          WAKTU JEMPUT
                        </span>
                        <span className="font-sans text-sm font-semibold text-slate-900 dark:text-white mt-1 block">
                          {selectedDate} &bull; {selectedTimeSlot} WIB
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                          NAMA TERAPIS (MANDATORY)
                        </span>
                        <span className="font-sans text-sm font-semibold text-slate-900 dark:text-white mt-1 block">
                          {assignedTherapist.name}
                        </span>
                      </div>
                    </div>

                    {/* Mid segment details */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-b border-slate-100 dark:border-slate-850 pb-5">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                          PAKET DIKUNJUNGI
                        </span>
                        <span className="font-sans text-xs text-slate-800 dark:text-slate-300 mt-1 block font-medium">
                          {SERVICE_PACKAGES.find((pkg) => pkg.id === selectedPackageId)?.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                          TITIK ANATOMIS TERAPI
                        </span>
                        <span className="font-sans text-xs text-slate-800 dark:text-slate-300 mt-1 block font-mono font-medium max-h-[36px] overflow-y-auto">
                          {selectedPoints.map(p => CUPPING_POINTS.find(cp => cp.id === p)?.name).join(', ')}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                          ALAMAT JEMPUT JALUR JALAN
                        </span>
                        <span className="font-sans text-xs text-slate-700 dark:text-slate-300 mt-1 block font-medium lines-clamp-1">
                          {address}
                        </span>
                      </div>
                    </div>

                    {/* Price and Action Download */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                          ESTIMASI BIAYA ADIL
                        </span>
                        <span className="font-mono text-xl font-black text-primary dark:text-primary-light">
                          {formatPrice(grandTotal)}
                        </span>
                      </div>

                      {/* Download Medical Document - PDF Mock Integration */}
                      <button
                        type="button"
                        id="download-medical-btn"
                        onClick={() => setShowPdfMock(true)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors border border-slate-200/50 dark:border-slate-700/50"
                      >
                        <Download size={14} />
                        <span>Unduh Medis Summary</span>
                      </button>
                    </div>

                    {/* WhatsApp Invoice Direct Sender */}
                    <div className="mt-4 pt-4 border-t border-slate-150 dark:border-slate-850 space-y-3">
                      <a
                        href={getWhatsAppUrl(true)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-center py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold tracking-wider cursor-pointer transition-colors shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 uppercase"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.298 1.448 4.86 1.449 5.481 0 9.94-4.457 9.943-9.94.002-2.654-1.03-5.15-2.906-7.028C16.671 1.758 14.184.723 11.536.723c-5.485 0-9.944 4.459-9.948 9.942-.001 1.83.483 3.619 1.4 5.178l-1.02 3.73 3.823-.998z" />
                        </svg>
                        <span>Kirim Pemesanan Ke WhatsApp Admin</span>
                      </a>

                      <a
                        href={getWhatsAppUrl(false)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-center py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-2 uppercase border border-slate-200/50 dark:border-slate-700/50"
                      >
                        <span>Simpan Salinan Ke WhatsApp Pribadi</span>
                      </a>
                      
                      <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 leading-normal">
                        Silakan klik tombol hijau untuk mengirim rincian invoice & konfirmasi jadwal langsung ke WhatsApp Admin Utama (<strong>085177872260</strong>). Klik tombol abu untuk menyimpan salinan invoice & instruksi aftercare medis ke nomor WhatsApp Anda (*{phone}).
                      </p>
                    </div>

                  </div>
                </div>

                {/* Loyalty Tracker & Retention Frame */}
                <div className="space-y-6">
                  
                  {/* Loyalty Tracker */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                      <Award size={18} className="text-amber-500 shrink-0" />
                      <h3 className="font-sans font-bold text-base">
                        Customer Loyalty & Retention Tracker
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      Kembalikan vitalitas bodi Anda secara istiqomah. Selesaikan sesi berkala untuk klaim diskon istimewa gratis pijat.
                    </p>

                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Sesi Ke-2 dari 5 Sesi
                        </span>
                        <span className="font-bold text-primary dark:text-primary-light">
                          40% Tercapai
                        </span>
                      </div>

                      {/* Cool Progress Bar strictly requested by user */}
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary-hover rounded-full"
                          style={{ width: '40%' }}
                        />
                      </div>

                      <p className="text-[10px] text-slate-400 italic">
                        ★ Tiga sesi terapi bekam berkala lagi untuk mendapatkan bonus gratis 1x Pijat Relaksasi seluruh tubuh!
                      </p>
                    </div>
                  </div>

                  {/* Safe Medical Aftercare Tips */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-3">
                    <div className="flex items-center gap-2">
                      <CircleHelp size={17} className="text-primary dark:text-primary-light shrink-0" />
                      <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white">
                        Panduan Aftercare Pasca Bekam
                      </h3>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                      <div className="flex gap-2 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <p>Hindari mandi air dingin ekstrem selama 24 jam pertama demi regenerasi pori kulit yang tenang.</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <p>Minumlah air hangat bercampur madu murni yang dibawa oleh terapis pasca-bekam untuk mendongkrak besi darah merah.</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <p>Olesi tipis-tipis pori-pori bekam menggunakan Minyak Zaitun yang disediakan jika dirasa agak gatal/kering.</p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Reset booking state button to make testing easy */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  id="reset-booking-btn"
                  onClick={() => {
                    setSelectedComplaints([]);
                    setSelectedPoints([]);
                    setTriageAnswers({});
                    setSelectedPackageId('standard');
                    setAddress('');
                    setSelectedAddOns({});
                    setDistance(0);
                    setStep(1);
                  }}
                  className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 font-semibold rounded-xl text-xs hover:opacity-90 max-w-xs transition-opacity cursor-pointer shadow-xs"
                >
                  Buat Pesanan Baru / Simulasi Reset
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* FLOATING POPUP OVERLAY REPRESENTING GENERATED PDF PRINTOUT */}
      <AnimatePresence>
        {showPdfMock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-250 dark:border-slate-800"
            >
              
              {/* Header print visual */}
              <div className="bg-slate-100 dark:bg-slate-900 p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-830">
                <div>
                  <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white">
                    BYKAM MEDICAL SUMMARY REPORT & RECORD
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Dokumen hasil ekspor medis fungsional &bull; Diproduksi Juni 2026
                  </p>
                </div>
                <button
                  type="button"
                  id="pdf-close-btn"
                  onClick={() => setShowPdfMock(false)}
                  className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Tutup [X]
                </button>
              </div>

              {/* Clinical summary content body */}
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto font-mono text-[11px] leading-relaxed">
                
                <div className="border-b border-slate-150 dark:border-slate-850 pb-4">
                  <p className="font-bold text-xs uppercase mb-2">I. DATA UTAMA KLIEN</p>
                  <p>Nama Pelanggan  : {gender === 'pria' ? 'Arfan Fauzi' : 'Siti Humairah'} ({gender === 'pria' ? 'Pria' : 'Wanita'})</p>
                  <p>Alamat Jemput  : {address || 'Alamat tidak diinput'}</p>
                  <p>Tanggal Terapi  : {selectedDate} &bull; {selectedTimeSlot} WIB</p>
                  <p>Terapis Utama  : {assignedTherapist.name} ({assignedTherapist.specialty})</p>
                </div>

                <div className="border-b border-slate-150 dark:border-slate-850 pb-4">
                  <p className="font-bold text-xs uppercase mb-2">II. KONSULTASI KELUHAN & GEJALA TERUKUR</p>
                  <p>Gejala Dipilih  : {selectedComplaints.length > 0 ? selectedComplaints.map(id => COMPLAINTS_DATA.find(c => c.id === id)?.label).join(', ') : 'Keluhan Kebugaran Umum (Sunnah)'}</p>
                  <p>Titik Terapi    : {selectedPoints.length > 0 ? selectedPoints.map(id => {
                    const pt = CUPPING_POINTS.find(cp => cp.id === id);
                    return `${pt?.name} (${pt?.localName})`;
                  }).join(', ') : 'Tidak ada titik dipilih'}</p>
                </div>

                <div className="border-b border-slate-150 dark:border-slate-850 pb-4">
                  <p className="font-bold text-xs uppercase mb-2">III. SCREENING CLINICAL SMART TRIAGE REPORT</p>
                  <p>Tekanan Darah   : {triageAnswers['darah_rendah'] ? 'Tensi Rendah (<90/60 mmHg)' : 'Normal Sehat'}</p>
                  <p>Pengencer Darah  : {triageAnswers['pengencer_darah'] ? 'Terdeteksi Obat Pengencer' : 'Bebas Obat Pengencer'}</p>
                  <p>Area Luka Kulit  : {triageAnswers['luka_terbuka'] ? 'Terdeteksi Luka Terbuka di Punggung' : 'Bebas dari Luka Terbuka'}</p>
                  {hasTriageRisk ? (
                    <p className="text-amber-600 dark:text-amber-400 font-bold mt-2">
                      [⚠️ WARNING/ALERT]: Sistem Bykam mendeteksi adanya risiko klinis atau obat pengencer. Pemilihan bekam medis basah secara langsung dibatalkan dan dialihkan ke terapi bekam kering murni/pijat yang paling aman.
                    </p>
                  ) : (
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-2">
                      [✓ VERIFIED SAFE]: Klien memenuhi seluruh kriteria kelayakan aman untuk melakukan tindakan bekam basah (surgical cupping) steril di rumah.
                    </p>
                  )}
                </div>

                <div className="pb-4">
                  <p className="font-bold text-xs uppercase mb-2">IV. RINCIAN HARGA ADIL (BILLING SUMMARY)</p>
                  <p>Layanan Utama   : {SERVICE_PACKAGES.find(pkg => pkg.id === selectedPackageId)?.name} - {formatPrice(basePackagePrice)}</p>
                  <p>Ongkos Kirim    : {transportFee === 0 ? 'Gratis' : formatPrice(transportFee)}</p>
                  {addOnTotal > 0 && (
                    <p>Herbal Tambahan  : {formatPrice(addOnTotal)}</p>
                  )}
                  <p className="font-bold text-slate-900 dark:text-white mt-1.5">GRAND TOTAL HARGA MEDIS: {formatPrice(grandTotal)}</p>
                </div>

                <div className="text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4 leading-normal">
                  Dokumen rekam klinis ini sah dihasilkan secara aman dari server-side Bykam Core Indonesia. Harap simpan dokumen digital ini untuk diserahkan ke dokter penanggungjawab kesehatan pribadi bila diperlukan.
                </div>

              </div>

              {/* Bottom Print Action Buttons */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                <button
                  type="button"
                  id="pdf-print-action-btn"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Cetak Rekor Medis / Simpan PDF
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
