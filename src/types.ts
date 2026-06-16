export type Page = 'landing' | 'booking';

export interface Complaint {
  id: string;
  label: string;
  description: string;
  recommendedPoints: string[]; // List of CuppingPoint IDs
}

export interface CuppingPoint {
  id: string;
  name: string;
  localName: string;
  x: number; // percentage coordinate x (0-100) on body silhouette
  y: number; // percentage coordinate y (0-100) on body silhouette
  side: 'front' | 'back';
  benefits: string;
}

export interface TriageQuestion {
  id: string;
  text: string;
  warning: string;
  requiresWarning: boolean; // if 'true', a 'Yes' triggers warning
  targetGender?: 'wanita' | 'pria';
}

export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description: string;
  benefits: string[];
}

export interface AddOnItem {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface BookingDetails {
  complaints: string[];
  selectedPoints: string[];
  triageAnswers: Record<string, boolean>;
  gender: 'pria' | 'wanita';
  date: Date | null;
  timeSlot: string;
  packageId: string;
  address: string;
  addOns: Record<string, number>;
  fullName: string;
  phone: string;
}

export interface Therapist {
  name: string;
  avatar: string;
  rating: number;
  specialty: string;
}

// Global Static Data to keep pages clean and modular
export const COMPLAINTS_DATA: Complaint[] = [
  {
    id: 'pegal_linu',
    label: 'Pegal Linu & Nyeri Otot',
    description: 'Rasa kaku, tegang, dan pegal pada area punggung, pinggang, atau bahu akibat kelelahan atau aktivitas fisik.',
    recommendedPoints: ['al_kahil', 'al_katifain_l', 'al_katifain_r', 'al_warik_l', 'al_warik_r'],
  },
  {
    id: 'migrain',
    label: 'Migrain & Sakit Kepala',
    description: 'Sakit kepala berdenyut, pusing, vertigo, atau stres emosional yang memicu ketegangan leher.',
    recommendedPoints: ['al_kamah', 'al_kahil', 'al_akhda_l', 'al_akhda_r'],
  },
  {
    id: 'hipertensi',
    label: 'Hipertensi (Darah Tinggi)',
    description: 'Membantu sirkulasi darah dan menurunkan tekanan darah tinggi secara alami melalui stimulasi titik meridian.',
    recommendedPoints: ['al_kahil', 'al_katifain_l', 'al_katifain_r', 'al_akhda_l', 'al_akhda_r'],
  },
  {
    id: 'asam_urat',
    label: 'Asam Urat & Sendi',
    description: 'Nyeri hebat atau pembengkakan di persendian akibat penumpukan zat purin/alkaloid darah.',
    recommendedPoints: ['al_kahil', 'al_warik_l', 'al_warik_r', 'dzatil_warik_l', 'dzatil_warik_r'],
  },
  {
    id: 'kolesterol',
    label: 'Kolesterol Tinggi',
    description: 'Rasa berat di pundak dan tengkuk kepala belakang akibat tumpukan lipid/toksin dalam darah.',
    recommendedPoints: ['al_kahil', 'al_katifain_l', 'al_katifain_r'],
  },
  {
    id: 'detoks',
    label: 'Detoksifikasi Umum (Sunnah)',
    description: 'Menjaga stamina, mengeluarkan sel darah mati, racun sisa metabolisme medis, dan mengikuti anjuran sunnah Nabi.',
    recommendedPoints: ['al_kahil', 'al_katifain_l', 'al_katifain_r'],
  },
  {
    id: 'masuk_angin',
    label: 'Masuk Angin & Kembung',
    description: 'Perasaan tidak nyaman, meriang, perut kembung, begah, sendawa berlebih, atau lesu.',
    recommendedPoints: ['al_kahil', 'al_ma’idah', 'al_warik_l', 'al_warik_r'],
  },
  {
    id: 'insomnia',
    label: 'Insomnia & Gangguan Tidur',
    description: 'Sulit tidur nyenyak, sering terbangun, atau kecemasan pikiran berlebih di malam hari.',
    recommendedPoints: ['al_kamah', 'al_kahil', 'al_katifain_l', 'al_katifain_r'],
  },
  {
    id: 'stres_lelah',
    label: 'Stres & Kelelahan Kronis',
    description: 'Tubuh terasa lelah berkepanjangan (burnout), kurang energi, dan ketegangan mental kerja.',
    recommendedPoints: ['al_kamah', 'al_kahil', 'al_shodr_l', 'al_shodr_r'],
  },
  {
    id: 'sakit_pinggang',
    label: 'Sakit Pinggang Kronis (LBP)',
    description: 'Nyeri tumpul atau tajam di punggung bawah akibat duduk terlalu lama atau salah posisi angkat beban.',
    recommendedPoints: ['al_warik_l', 'al_warik_r', 'dzatil_warik_l', 'dzatil_warik_r'],
  },
  {
    id: 'kesemutan',
    label: 'Sering Kesemutan / Kebas',
    description: 'Sering merasa mati rasa, baal, atau kesemutan di ujung-ujung tangan atau kaki akibat sirkulasi kurang lancar.',
    recommendedPoints: ['al_kahil', 'al_katifain_l', 'al_katifain_r', 'al_warik_l', 'al_warik_r'],
  },
  {
    id: 'imun_lemah',
    label: 'Imunitas Lemah / Sering Flu',
    description: 'Tubuh rentan terserang flu, batuk, pilek, sensitif perubahan cuaca, dan stamina drop.',
    recommendedPoints: ['al_kahil', 'al_katifain_l', 'al_katifain_r', 'al_shodr_r'],
  },
  {
    id: 'pencernaan_maag',
    label: 'Maag Kronis & Masalah Perut',
    description: 'Asam lambung (GERD) sering naik, perih di ulu hati, kembung, atau mual berulang.',
    recommendedPoints: ['al_kahil', 'al_ma’idah', 'al_warik_l', 'al_warik_r'],
  },
  {
    id: 'vertigo_kliyengan',
    label: 'Vertigo & Kepala Kliyengan',
    description: 'Sensasi berputar, labil berdiri, atau pandangan berbayang saat bangun mendadak.',
    recommendedPoints: ['al_kamah', 'al_kahil', 'al_akhda_l', 'al_akhda_r'],
  },
  {
    id: 'sendi_kaku',
    label: 'Sendi Kaku & Pengapuran',
    description: 'Kekakuan persendian atau peradangan linu yang menguras kelenturan gerak otot bodi.',
    recommendedPoints: ['al_kahil', 'dzatil_warik_l', 'dzatil_warik_r'],
  }
];

export const CUPPING_POINTS: CuppingPoint[] = [
  // BACK POINTS
  {
    id: 'al_kahil',
    name: 'Al-Kahil',
    localName: 'Punuk Leher',
    x: 50,
    y: 20,
    side: 'back',
    benefits: 'Titik pusat saraf, meringankan pusing, flu, asma, stroke, nyeri pundak/leher, dan menurunkan kolesterol.',
  },
  {
    id: 'al_katifain_l',
    name: 'Al-Katifain (Kiri)',
    localName: 'Bahu Kiri',
    x: 35,
    y: 25,
    side: 'back',
    benefits: 'Mengobati nyeri pundak, kekakuan otot leher, mengalirkan darah ke paru-paru dan lengan kiri.',
  },
  {
    id: 'al_katifain_r',
    name: 'Al-Katifain (Kanan)',
    localName: 'Bahu Kanan',
    x: 65,
    y: 25,
    side: 'back',
    benefits: 'Mengatasi bahu membeku, stres fisik, melancarkan aliran darah dari jantung ke kepala dan lengan kanan.',
  },
  {
    id: 'al_akhda_l',
    name: 'Al-Akhda’in (Kiri)',
    localName: 'Urat Leher Kiri',
    x: 43,
    y: 12,
    side: 'back',
    benefits: 'Meredakan pusing, migrain, sakit gigi, radang tenggorokan, telinga berdenging, dan ketegangan rahang.',
  },
  {
    id: 'al_akhda_r',
    name: 'Al-Akhda’in (Kanan)',
    localName: 'Urat Leher Kanan',
    x: 57,
    y: 12,
    side: 'back',
    benefits: 'Mengobati sakit kepala sebelah kanan, gangguan penglihatan, dan kekakuan tengkuk belakang.',
  },
  {
    id: 'al_warik_l',
    name: 'Al-Warik (Kiri)',
    localName: 'Pinggang Atas Kiri',
    x: 38,
    y: 52,
    side: 'back',
    benefits: 'Membantu organ ginjal, melancarkan kencing, mengatasi nyeri pinggang bawah (lumbago) dan kelelahan kronis.',
  },
  {
    id: 'al_warik_r',
    name: 'Al-Warik (Kanan)',
    localName: 'Pinggang Atas Kanan',
    x: 62,
    y: 52,
    side: 'back',
    benefits: 'Melancarkan kerja hati (liver), kantung empedu, meredakan nyeri pinggang kanan dan pegal linu.',
  },
  {
    id: 'dzatil_warik_l',
    name: 'Dzatil Warik (Kiri)',
    localName: 'Pantat/Pinggul Kiri',
    x: 35,
    y: 69,
    side: 'back',
    benefits: 'Mengatasi nyeri sendi panggul, sciatica (syaraf terjepit), dan nyeri penumpukan asam urat kaki kiri.',
  },
  {
    id: 'dzatil_warik_r',
    name: 'Dzatil Warik (Kanan)',
    localName: 'Pantat/Pinggul Kanan',
    x: 65,
    y: 69,
    side: 'back',
    benefits: 'Mengatasi sciatica kaki kanan, nyeri bokong, pegal panggul, dan nyeri sendi lutut kanan.',
  },

  // FRONT POINTS
  {
    id: 'al_kamah',
    name: 'Al-Kamah',
    localName: 'Puncak Kepala',
    x: 50,
    y: 6,
    side: 'front',
    benefits: 'Mengatasi migrain, mempertajam ingatan, menyembuhkan vertigo, stroke, stres berat, dan depresi.',
  },
  {
    id: 'al_shodr_l',
    name: 'Al-Shodr (Kiri)',
    localName: 'Dada Kiri',
    x: 38,
    y: 30,
    side: 'front',
    benefits: 'Membantu menstabilkan detak jantung, sesak napas ringan, batuk kronis, dan kekhawatiran berlebih.',
  },
  {
    id: 'al_shodr_r',
    name: 'Al-Shodr (Kanan)',
    localName: 'Dada Kanan',
    x: 62,
    y: 30,
    side: 'front',
    benefits: 'Membantu kesehatan paru-paru kanan, pernapasan tersumbat, dan memperkuat daya tahan tubuh alami.',
  },
  {
    id: 'al_ma’idah',
    name: 'Al-Ma’idah',
    localName: 'Lambung/Ulu Hati',
    x: 50,
    y: 44,
    side: 'front',
    benefits: 'Mengatasi gangguan asam lambung (GERD), kembung, maag, mual kronis, dan memperlancar pencernaan.',
  },
];

export const TRIAGE_QUESTIONS: TriageQuestion[] = [
  {
    id: 'darah_rendah',
    text: 'Apakah tekanan darah Anda biasanya di bawah 90/60 mmHg (Darah Rendah) atau di atas 180/120 mmHg (Darah Sangat Tinggi)?',
    warning: 'Tekanan darah rendah ekstrim atau darah tinggi ekstrim berisiko pusing hebat/penurunan sirkulasi pasca bekam basah. Disarankan beralih ke Bekam Kering atau Pijat Relaksasi.',
    requiresWarning: true,
  },
  {
    id: 'pengencer_darah',
    text: 'Apakah Anda sedang aktif mengonsumsi obat pengencer darah (Aspirin, Warfarin, Clopidogrel, Heparin)?',
    warning: 'Obat pengencer darah aktif menghambat pembekuan luka sayat bekam basah. Demi keamanan klinis, Layanan dialihkan ke Bekam Kering atau Pijat Relaksasi.',
    requiresWarning: true,
  },
  {
    id: 'wanita_khusus',
    text: 'Apakah Anda sedang dalam masa haid, sedang hamil, atau baru melahirkan (< 40 hari)?',
    warning: 'Kondisi hormonal & rahim wanita fluktuatif selama masa ini. Terapis wanita kami akan melayani Anda khusus dengan teknik Pijat Lembut atau Bekam Kering tanpa jarum.',
    requiresWarning: true,
    targetGender: 'wanita',
  },
  {
    id: 'luka_terbuka',
    text: 'Apakah ada luka terbuka, infeksi kulit aktif, bisul, herpes, atau eksim basah di area penempatan punggung Anda?',
    warning: 'Bekam basah langsung di atas kulit bermasalah sangat dilarang untuk mencegah penyebaran bakteri/infeksi. Titik bekam akan disesuaikan menjauh dari area tersebut.',
    requiresWarning: true,
  },
  {
    id: 'heart_pacemaker',
    text: 'Apakah Anda memiliki riwayat sakit penyakit jantung kronis berat atau menggunakan alat pacu jantung (pacemaker)?',
    warning: 'Stimulasi bekam basah dapat memicu perubahan ritme detak jantung mendadak. Anda disarankan melakukan Bekam Kering saja demi keamanan prima.',
    requiresWarning: true,
  },
  {
    id: 'pembekuan_darah',
    text: 'Apakah Anda memiliki riwayat gangguan pembekuan darah bawaan (Hemofilia / Anemia Defisiensi parah)?',
    warning: 'Hemofilia berisiko pendarahan tidak berhenti. Pelayanan bekam basah dilarang total; Anda hanya diperbolehkan mendapatkan Pijat Kebugaran Lembut tanpa sayatan.',
    requiresWarning: true,
  },
  {
    id: 'hemodialisa',
    text: 'Apakah Anda sedang menderita gagal ginjal kronis atau rutin menjalani cuci darah (Hemodialisa)?',
    warning: 'Suhu dan keseimbangan elektrolit penderita hemodialisa sangat sensitif. Bekam basah ditiadakan demi keamanan medis, silakan pilih Pijat Relaksasi ringan.',
    requiresWarning: true,
  },
  {
    id: 'penyakit_menular',
    text: 'Apakah Anda menderita penyakit infeksius menular melalui media darah (Hepatitis B / Hepatitis C / HIV)?',
    warning: 'Demi protokol keselamatan medis terapis, bekas peralatan sekali pakai harus dibuang dengan pengawasan limbah medis B3 khusus. Harap konfirmasi agar kami siapkan wadah klinis khusus.',
    requiresWarning: true,
  },
  {
    id: 'diabetes_luka',
    text: 'Apakah Anda menderita penyakit diabetes melitus parah dengan riwayat luka basah yang sulit sembuh?',
    warning: 'Luka kecil sekalipun pada pasien diabetes tidak terkontrol berisiko infeksi meluas. Dianjurkan melakukan Bekam Kering lembut atau konsultasi dokter dahulu.',
    requiresWarning: true,
  },
  {
    id: 'makan_kenang',
    text: 'Apakah Anda baru saja makan berat kurang dari 1 jam yang lalu, atau sebaliknya belum makan sama sekali (lemas)?',
    warning: 'Bekam saat pencernaan sedang aktif (lambung penuh) atau perut kosong ekstrem berisiko mual hebat atau pingsan. Disarankan istirahat dahulu minimal 1 jam pasca makan.',
    requiresWarning: true,
  }
];

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'standard',
    name: 'Standard Cupping (Bekam Basah + Pijat Ringan)',
    price: 150000,
    duration: 60,
    description: 'Terapi bekam basah steril menggunakan jarum medis sekali pakai (disposable). Sudah termasuk pengecekan tensi/gula darah, pijat pemanasan ringan, pembekaman, pengeluaran darah kotor, dan sterilisasi antiseptik.',
    benefits: [
      'Pengecekan Tensi Darah awal',
      'Pijat rileksasi pemanasan punggung (10 menit)',
      'Terapi bekam basah (maksimal 9 titik)',
      'Peralatan steril sekali pakai premium',
      'Desinfeksi & Aftercare herbal dengan Minyak Zaitun',
    ],
  },
  {
    id: 'plus_massage',
    name: 'Bykam Royal (Bekam + Pijat Relaksasi)',
    price: 220000,
    duration: 90,
    description: 'Kombinasi terapi maksimal untuk kebugaran total. Dimulai dengan pijat pijat tradisional seluruh punggung dan pundak menggunakan minyak aromaterapi premium, dilanjutkan bekam basah steril menyeluruh.',
    benefits: [
      'Pengecekan Tensi & Konsultasi keluhan',
      'Full-body back massage traditional (30 menit)',
      'Minyak pijat aromaterapi kelapa hangat',
      'Terapi bekam basah intensif (maksimal 11 titik)',
      'Desinfeksi, pembersihan steril, & olesan minyak habbatussauda',
    ],
  },
  {
    id: 'dry_only',
    name: 'Dry Cupping Only (Bekam Kering dan Seluncur Tanpa Sayat)',
    price: 100000,
    duration: 45,
    description: 'Terapi hisapan angin kering tanpa pembedahan/pengeluaran darah, dipadukan pijat pelenturan fascia otot. Sangat ideal untuk peredaran darah cepat, klien dengan darah rendah, atau takut jarum.',
    benefits: [
      'Pengecekan kesehatan awal',
      'Pijat cedera/kelelahan otot intensif',
      'Terapi bekam angin (dry cupping) di seluruh titik pusat',
      'Minyak esensial kayu putih/jahe hangat',
      'Cocok untuk lansia atau riwayat tensi rendah',
    ],
  },
];

export const ADDONS_DATA: AddOnItem[] = [
  {
    id: 'habba',
    name: 'Kapsul Habbatussauda Premium (Isi 15)',
    price: 35000,
    description: 'Herbal jintan hitam kaya zat thymoquinone untuk memulihkan stamina dan imunitas pasca bekam.',
  },
  {
    id: 'madu',
    name: 'Madu Randu Asli Organik (150ml)',
    price: 45000,
    description: 'Madu mentah murni tanpa pemanis buatan untuk mendongkrak sel darah merah & energi instan.',
  },
  {
    id: 'zaitun',
    name: 'Minyak Zaitun Ruqyah Extra Virgin (100ml)',
    price: 38000,
    description: 'Minyak zaitun murni berkah yang bagus untuk perawatan kulit luar dan mempercepat regenerasi pori bekam.',
  },
];

export const MOCK_THERAPISTS: Record<'pria' | 'wanita', Therapist[]> = {
  pria: [
    {
      name: 'Fikri Muhammad Arkanuddin Rohmat, M.H.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=crop&w=200&h=200&q=80',
      rating: 5.0,
      specialty: 'Pembina & Terapis Utama Bykam Squad (Ikhwan)',
    },
  ],
  wanita: [],
};
