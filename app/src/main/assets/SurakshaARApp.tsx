import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Gauge,
  HardHat,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Download,
  Languages,
  LogOut,
  User,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  WifiOff,
  Sparkles,
  ArrowLeft,
  Award,
  Database,
  Camera,
  Layers,
  Crosshair,
  Power,
  Lock,
  Wind,
  Volume2,
  VolumeX,
  Zap,
  ShieldAlert,
  Play,
  RotateCcw,
  Check,
  FileCheck
} from 'lucide-react';

// ==========================================
// 1. DATA MODELS & TYPES
// ==========================================

export type Language = 'en' | 'hi' | 'sat';
export type AppTab = 'modules' | 'ar_camera' | 'assessment' | 'certificate';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  trade: string;
  isOffline: boolean;
}

export interface SafetyModule {
  id: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  category: 'FIRE' | 'GAS' | 'PPE';
  iconName: string;
  badge: string;
}

export interface AssessmentQuestion {
  id: number;
  question: Record<Language, string>;
  options: Record<Language, string>[];
  correctIndex: number;
  explanation: Record<Language, string>;
}

export interface CertificateData {
  certId: string;
  traineeName: string;
  workerId: string;
  courseName: string;
  score: number;
  percentage: number;
  issueDate: string;
  verificationUrl: string;
}

// ==========================================
// 2. CURATED MODULES & ASSESSMENT DATA
// ==========================================

const SAFETY_MODULES: SafetyModule[] = [
  {
    id: 'module_fire',
    category: 'FIRE',
    iconName: 'flame',
    badge: 'DGMS Reg 139 & OSHA 1910.157',
    title: {
      en: 'Fire Safety & Live AR Drill',
      hi: 'अग्नि सुरक्षा एवं लाइव ए.आर. ड्रिल',
      sat: 'ᱥᱮᱸᱜᱮᱞ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱟᱨ ᱞᱟᱭᱤᱵᱷ AR'
    },
    subtitle: {
      en: 'Real-time camera PASS protocol: 440V isolation, pull pin, base aim, CO2 spray.',
      hi: 'वास्तविक कैमरा PASS विधि: 440V पावर कट, पिन निकालना, जड़ पर निशाना, CO2 स्प्रे।',
      sat: 'ᱠᱮᱢᱨᱟ PASS ᱦᱚᱨᱟ: ᱔᱔᱐V ᱵᱚᱸᱫᱽ, ᱯᱤᱱ ᱚᱰᱚᱠ, ᱵᱩᱰᱟᱹ ᱨᱮ ᱱᱤᱥᱟᱱᱟ, CO2 ᱥᱯᱨᱮ᱾'
    }
  },
  {
    id: 'module_gas',
    category: 'GAS',
    iconName: 'gauge',
    badge: 'OSHA 1910.146 Confined Space',
    title: {
      en: 'Gas Safety & 4-Gas Sniffer',
      hi: 'गैस सुरक्षा एवं 4-गैस डिटेक्टर',
      sat: 'ᱜᱮᱥ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱟᱨ ᱔-ᱜᱮᱥ ᱰᱤᱴᱮᱠᱴᱟᱨ'
    },
    subtitle: {
      en: 'Underground sump atmosphere: O2 deficiency, CH4 explosive limits, toxic H2S/CO.',
      hi: 'सम्प/हौज परीक्षण: O2 कमी, मीथेन (CH4) विस्फोट सीमा, तथा विषैली H2S/CO गैस।',
      sat: 'ᱥᱟᱢᱯ ᱴᱮᱥᱴ: O2 ᱠᱚᱢ, CH4 ᱵᱚᱢᱵᱽ ᱥᱤᱢᱟᱹ, ᱟᱨ H2S/CO ᱵᱤᱥ ᱜᱮᱥ ᱡᱚᱠᱷᱟ᱾'
    }
  },
  {
    id: 'module_ppe',
    category: 'PPE',
    iconName: 'hardhat',
    badge: 'DGMS Standard Schedule II',
    title: {
      en: 'Mining PPE Readiness',
      hi: 'खनन सुरक्षा उपकरण (PPE)',
      sat: 'ᱠᱷᱟᱫᱟᱱ PPE ᱥᱟᱯᱲᱟᱣ'
    },
    subtitle: {
      en: 'Step-by-step mining boiler suit, cap-lamp chin-strap helmet, steel-toe boots.',
      hi: 'बॉयलर सूट, कैप-लैंप स्ट्रैप हेलमेट, तथा स्टील-टो सुरक्षा बूट्स का अनुपालन।',
      sat: 'ᱦᱮᱞᱢᱮᱴ, ᱥᱴᱤᱞ-ᱴᱳ ᱵᱩᱴ, ᱟᱨ ᱥᱩᱴ ᱴᱷᱤᱠ ᱦᱚᱨᱚᱜ ᱦᱚᱨᱟ᱾'
    }
  }
];

const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    question: {
      en: 'What is the mandatory first step before fighting a switchgear fire?',
      hi: 'विद्युत स्विचगियर में आग बुझाने से पहले अनिवार्य पहला कदम क्या है?',
      sat: 'ᱵᱤᱡᱞᱤ ᱥᱮᱸᱜᱮᱞ ᱤᱬᱤᱡ ᱢᱟᱬᱟᱝ ᱨᱮ ᱯᱩᱭᱞᱩ ᱪᱮᱫ ᱠᱟᱹᱢᱤ?'
    },
    options: [
      { en: 'Pour water over live cables', hi: 'चालू केबलों पर पानी डालें', sat: 'ᱫᱟᱜ ᱫᱩᱞ' },
      { en: 'Isolate 440V Main Electrical Power', hi: 'मुख्य 440V पावर लाइन बंद (Isolate) करें', sat: '᱔᱔᱐V ᱵᱤᱡᱞᱤ ᱞᱟᱭᱤᱱ ᱵᱚᱸᱫᱽ ᱢᱮ' },
      { en: 'Run without raising alarm', hi: 'बिना बताए भागें', sat: 'ᱫᱟᱹᱲ' },
      { en: 'Fan the fire with clothes', hi: 'कपड़े से हवा दें', sat: 'ᱦᱚᱭ ᱮᱢ' }
    ],
    correctIndex: 1,
    explanation: {
      en: 'Water or touching live energized panels creates fatal electrocution risk. Cut power first.',
      hi: 'बिजली चालू रहने पर पानी डालना या छूना जानलेवा करंट लगा सकता है। पहले पावर आइसोलेट करें।',
      sat: 'ᱵᱤᱡᱞᱤ ᱪᱟᱹᱞᱩ ᱛᱟᱦᱮᱸᱱ ᱠᱷᱟᱱ ᱠᱟᱨᱮᱱᱴ ᱵᱟᱡᱟᱣ ᱫᱟᱲᱮᱭᱟᱜᱼᱟ, ᱯᱩᱭᱞᱩ ᱵᱚᱸᱫᱽ ᱢᱮ᱾'
    }
  },
  {
    id: 2,
    question: {
      en: 'In the P.A.S.S. protocol, where should the extinguisher nozzle be aimed?',
      hi: 'P.A.S.S. विधि में अग्निशामक का नोज़ल कहाँ लक्षित होना चाहिए?',
      sat: 'P.A.S.S. ᱦᱚᱨᱟ ᱨᱮ ᱱᱚᱡᱚᱞ ᱚᱠᱟ ᱥᱮᱫ ᱱᱤᱥᱟᱱᱟ ᱞᱟᱹᱠᱛᱤᱭᱟ?'
    },
    options: [
      { en: 'At the root / base of the flames', hi: 'आग की जड़ (आधार) पर', sat: 'ᱥᱮᱸᱜᱮᱞ ᱨᱮᱭᱟᱜ ᱵᱩᱰᱟᱹ ᱨᱮ' },
      { en: 'High into the rising smoke', hi: 'ऊपर उठते धुएं पर', sat: 'ᱪᱮᱛᱟᱱ ᱫᱷᱩᱶᱟᱹ ᱨᱮ' },
      { en: 'Directly at co-workers', hi: 'साथी कर्मचारियों पर', sat: 'ᱜᱟᱛᱮ ᱪᱮᱛᱟᱱ' },
      { en: 'At the mine roof', hi: 'खदान की छत पर', sat: 'ᱪᱷᱟᱛ ᱨᱮ' }
    ],
    correctIndex: 0,
    explanation: {
      en: 'Aiming at the fuel base smothers the reaction. Spraying into upper smoke is ineffective.',
      hi: 'आग की जड़ पर स्प्रे करने से ईंधन को ऑक्सीजन नहीं मिलती और आग तुरंत बुझ जाती है।',
      sat: 'ᱵᱩᱰᱟᱹ ᱨᱮ ᱥᱯᱨᱮ ᱞᱮᱠᱷᱟᱱ ᱥᱮᱸᱜᱮᱞ ᱞᱚᱜᱚᱱ ᱤᱬᱤᱡᱚᱜᱼᱟ᱾'
    }
  },
  {
    id: 3,
    question: {
      en: 'What is the safe atmospheric Oxygen (O2) level for confined space entry?',
      hi: 'सीमित स्थान (सम्प/हौज) में प्रवेश हेतु सुरक्षित ऑक्सीजन (O2) का स्तर क्या है?',
      sat: 'ᱥᱟᱢᱯ ᱨᱮ ᱵᱚᱞᱚᱱ ᱞᱟᱹᱜᱤᱫ ᱥᱟᱹᱦᱤᱫ O2 ᱛᱤᱱᱟᱹᱜ?'
    },
    options: [
      { en: 'Below 14%', hi: '14% से कम', sat: '14% ᱠᱷᱚᱱ ᱠᱚᱢ' },
      { en: 'Between 19.5% and 23.5%', hi: '19.5% से 23.5% के बीच', sat: '19.5% ᱠᱷᱚᱱ 23.5%' },
      { en: 'Above 40%', hi: '40% से अधिक', sat: '40% ᱠᱷᱚᱱ ᱡᱟᱹᱥᱛᱤ' },
      { en: 'Zero percent', hi: 'शून्य प्रतिशत', sat: '᱐%' }
    ],
    correctIndex: 1,
    explanation: {
      en: 'OSHA & DGMS mandate atmospheric O2 between 19.5% and 23.5% before any human entry.',
      hi: 'DGMS और OSHA के अनुसार 19.5% से कम ऑक्सीजन जानलेवा दमघोंटू वातावरण होता है।',
      sat: '19.5% ᱠᱷᱚᱱ 23.5% O2 ᱜᱮ ᱢᱟᱹᱱᱢᱤ ᱵᱚᱞᱚᱱ ᱞᱟᱹᱜᱤᱫ ᱴᱷᱤᱠ ᱛᱟᱦᱮᱸᱱᱟ᱾'
    }
  }
];

// ==========================================
// 3. MAIN COMPONENT ARCHITECTURE
// ==========================================

export const SurakshaARApp: React.FC = () => {
  // Navigation & Localization
  const [currentTab, setCurrentTab] = useState<AppTab>('modules');
  const [language, setLanguage] = useState<Language>('en');

  // Trainee Profile
  const [userProfile] = useState<UserProfile>({
    id: 'WKR-4491',
    name: 'Rajesh Gope',
    email: 'rajesh.gope@mining.sih26',
    trade: 'Haulage Attendant (Shaft 2)',
    isOffline: false
  });

  // ----------------------------------------
  // HARDWARE CAMERA & AR STATE MACHINE
  // ----------------------------------------
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'CAMERA_AR' | 'CANVAS_2D'>('CAMERA_AR');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Procedural PASS State Machine
  const [passStep, setPassStep] = useState<number>(1);
  const [powerIsolated, setPowerIsolated] = useState<boolean>(false);
  const [pinRemoved, setPinRemoved] = useState<boolean>(false);
  const [targetLocked, setTargetLocked] = useState<boolean>(false);
  const [isSpraying, setIsSpraying] = useState<boolean>(false);
  const [fireIntensity, setFireIntensity] = useState<number>(100);
  const [fireSuppressed, setFireSuppressed] = useState<boolean>(false);
  const [ambientTemp, setAmbientTemp] = useState<number>(58);
  const [coPpm, setCoPpm] = useState<number>(380);
  const [electricalRiskAlert, setElectricalRiskAlert] = useState<string | null>(null);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);

  // ----------------------------------------
  // 4-GAS SIMULATOR STATE
  // ----------------------------------------
  const [gasSimRunning, setGasSimRunning] = useState<boolean>(false);
  const [o2Level, setO2Level] = useState<number>(20.9);
  const [ch4Level, setCh4Level] = useState<number>(0.1);
  const [h2sLevel, setH2sLevel] = useState<number>(2);
  const [blowerActive, setBlowerActive] = useState<boolean>(false);
  const [gasDecision, setGasDecision] = useState<string | null>(null);

  // ----------------------------------------
  // PPE CHECK DRILL STATE
  // ----------------------------------------
  const [helmetSecured, setHelmetSecured] = useState<boolean>(false);
  const [suitEquipped, setSuitEquipped] = useState<boolean>(false);
  const [bootsVerified, setBootsVerified] = useState<boolean>(false);

  // ----------------------------------------
  // ASSESSMENT & CERTIFICATION STATE
  // ----------------------------------------
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [assessmentSubmitted, setAssessmentSubmitted] = useState<boolean>(false);
  const [assessmentScore, setAssessmentScore] = useState<number>(0);
  const [certificateModalOpen, setCertificateModalOpen] = useState<boolean>(false);
  const [currentCertificate, setCurrentCertificate] = useState<CertificateData | null>(null);

  // ==========================================
  // BULLETPROOF HARDWARE CAMERA HOOK
  // ==========================================
  const startCamera = async () => {
    setCameraError(null);
    try {
      // Clean previous stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API unsupported in this environment');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Fallback constraint if environment lens is unavailable
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setViewMode('CAMERA_AR');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown camera error';
      console.warn('Camera initialization failed, switching to 2D Fallback:', errorMessage);
      setCameraError('Camera access unavailable. Switched to 2D Industrial Simulation.');
      setViewMode('CANVAS_2D');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Lifecycle stream cleanup
  useEffect(() => {
    if (currentTab === 'ar_camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [currentTab]);

  // Speech guidance
  const speakGuidance = (textHi: string, textSat: string, textEn: string) => {
    if (audioMuted) return;
    const utteranceText = language === 'hi' ? textHi : language === 'sat' ? textSat : textEn;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(utteranceText);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // PASS Protocol Actions
  const handlePowerToggle = () => {
    if (!powerIsolated) {
      setPowerIsolated(true);
      setElectricalRiskAlert(null);
      setPassStep(2);
      speakGuidance(
        'बिजली बंद हो गई है। अब अग्निशामक की पिन निकालें!',
        'ᱵᱤᱡᱞᱤ ᱵᱚᱸᱫᱽ ᱮᱱᱟ᱾ ᱱᱤᱛᱚᱜ ᱯᱤᱱ ᱚᱨ ᱢᱮ!',
        '440V Main power isolated. Pull the extinguisher safety pin now.'
      );
    }
  };

  const handleRemovePin = () => {
    if (!powerIsolated) {
      triggerElectricalViolation();
      return;
    }
    setPinRemoved(true);
    setPassStep(3);
    speakGuidance(
      'पिन निकल गई है। अब आग की जड़ पर निशाना साधें!',
      'ᱯᱤᱱ ᱚᱰᱚᱠ ᱮᱱᱟ᱾ ᱥᱮᱸᱜᱮᱞ ᱵᱩᱰᱟᱹ ᱨᱮ ᱱᱤᱥᱟᱱᱟ ᱢᱮ!',
      'Pin removed. Aim the crosshair at the base of the fire.'
    );
  };

  const handleLockTarget = () => {
    if (!pinRemoved) return;
    setTargetLocked(true);
    setPassStep(4);
    speakGuidance(
      'निशाना लॉक हुआ। अब लीवर दबाकर CO2 गैस स्प्रे करें!',
      'ᱱᱤᱥᱟᱱᱟ ᱞᱚᱠ ᱮᱱᱟ᱾ ᱱᱤᱛᱚᱜ ᱜᱮᱥ ᱥᱯᱨᱮ ᱢᱮ!',
      'Target locked at fire base. Hold down Spray button to extinguish.'
    );
  };

  const handleStartSpray = () => {
    if (!powerIsolated) {
      triggerElectricalViolation();
      return;
    }
    if (!pinRemoved) {
      alert('Extinguisher safety pin is still locked!');
      return;
    }

    setIsSpraying(true);
    const interval = setInterval(() => {
      setFireIntensity(prev => {
        const next = Math.max(0, prev - 20);
        if (next === 0) {
          clearInterval(interval);
          setIsSpraying(false);
          setFireSuppressed(true);
          speakGuidance(
            'आग पूरी तरह बुझ गई है! बहुत अच्छा काम किया।',
            'ᱥᱮᱸᱜᱮᱞ ᱤᱬᱤᱡ ᱮᱱᱟ! ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ᱾',
            'Fire suppressed successfully! Candidate verified.'
          );
        }
        return next;
      });
      setAmbientTemp(prev => Math.max(25, prev - 6));
      setCoPpm(prev => Math.max(12, prev - 45));
    }, 400);
  };

  const handleStopSpray = () => {
    setIsSpraying(false);
  };

  const triggerElectricalViolation = () => {
    setElectricalRiskAlert(
      language === 'hi'
        ? 'गंभीर चेतावनी: 440V लाइन चालू है! पहले मेन पावर कट करें, वरना करंट लग सकता है!'
        : language === 'sat'
        ? 'ᱵᱚᱛᱚᱨ: ᱔᱔᱐V ᱞᱟᱭᱤᱱ ᱪᱟᱹᱞᱩ ᱢᱮᱱᱟᱜᱼᱟ! ᱯᱩᱭᱞᱩ ᱵᱚᱸᱫᱽ ᱢᱮ!'
        : 'CRITICAL ALERT: 440V Energized Panel! Isolate main electrical power first to prevent electrocution.'
    );
    speakGuidance(
      'रुको! बिजली चालू है, पहले पावर कट करें!',
      'ᱛᱤᱸᱜᱩᱱ ᱢᱮ! ᱵᱤᱡᱞᱤ ᱪᱟᱹᱞᱩ ᱢᱮᱱᱟᱜᱼᱟ, ᱯᱩᱭᱞᱩ ᱵᱚᱸᱫᱽ ᱢᱮ!',
      'Danger! Electrical shock hazard! Cut main power first!'
    );
  };

  const resetFireDrill = () => {
    setPassStep(1);
    setPowerIsolated(false);
    setPinRemoved(false);
    setTargetLocked(false);
    setIsSpraying(false);
    setFireIntensity(100);
    setFireSuppressed(false);
    setAmbientTemp(58);
    setCoPpm(380);
    setElectricalRiskAlert(null);
  };

  // Assessment Handlers
  const handleSelectAnswer = (qIndex: number, optIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmitAssessment = () => {
    let score = 0;
    ASSESSMENT_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    setAssessmentScore(score);
    setAssessmentSubmitted(true);
  };

  const generateCertificate = () => {
    const cert: CertificateData = {
      certId: `CERT-SURAKSHA-${Math.floor(100000 + Math.random() * 900000)}`,
      traineeName: userProfile.name,
      workerId: userProfile.id,
      courseName: 'Industrial Mine Fire, Gas & PPE Safety (DGMS CMR 2017)',
      score: assessmentScore,
      percentage: Math.round((assessmentScore / ASSESSMENT_QUESTIONS.length) * 100),
      issueDate: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      verificationUrl: `https://suraksha.gov.in/verify?cert_id=CERT-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setCurrentCertificate(cert);
    setCertificateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased flex flex-col justify-between max-w-md mx-auto shadow-2xl relative border-x border-[#E2E8F0]">
      {/* ====================================================
          1. TOP APP BAR (LIGHT INDUSTRIAL HIGH CONTRAST)
          ==================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-xs">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-slate-900">SurakshaAR</span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                KHANSUAR
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              DGMS CMR 2017 & OSHA Industrial Safety
            </p>
          </div>
        </div>

        {/* Multilingual Selector */}
        <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          {(['en', 'hi', 'sat'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                language === lang
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिंदी' : 'ᱥᱟᱱ'}
            </button>
          ))}
        </div>
      </header>

      {/* ====================================================
          2. MAIN TAB CONTENT ROUTER
          ==================================================== */}
      <main className="flex-1 overflow-y-auto pb-24">
        {/* --------------------------------------------------
            TAB 1: 3 CORE TRAINING MODULES (DASHBOARD)
            -------------------------------------------------- */}
        {currentTab === 'modules' && (
          <div className="p-4 space-y-4">
            {/* Trainee Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-amber-800">
                  <User className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{userProfile.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {userProfile.id} • {userProfile.trade}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                Certified
              </span>
            </div>

            {/* Quick Live AR Drill Hero Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-2xl p-4 text-slate-950 shadow-md flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 bg-black/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <Camera className="w-3 h-3 text-yellow-300" />
                  <span>Real-Time AR Camera Assistant</span>
                </div>
                <h3 className="text-sm font-black text-slate-950 leading-tight">
                  Live Fire Response Drill
                </h3>
                <p className="text-[11px] text-slate-900 font-medium">
                  Scan environment, pull pin, aim at base, and extinguish live fire.
                </p>
              </div>

              <button
                onClick={() => setCurrentTab('ar_camera')}
                className="shrink-0 h-11 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition"
              >
                <span>Launch AR</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            <div className="flex items-center justify-between px-1 pt-1">
              <h2 className="text-xs font-black tracking-wider uppercase text-slate-500">
                Core Safety Curriculums
              </h2>
              <span className="text-[11px] font-semibold text-amber-700">3 Verified Modules</span>
            </div>

            {/* 3 Core Cards */}
            <div className="space-y-3">
              {/* Module 1: Fire Safety */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-amber-400 transition flex flex-col justify-between space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                    <Flame className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-slate-900 leading-tight mb-1">
                      {SAFETY_MODULES[0].title[language]}
                    </h3>
                    <span className="inline-block text-[10px] bg-slate-100 text-slate-700 font-mono font-semibold px-1.5 py-0.5 rounded border border-slate-200 mb-1">
                      {SAFETY_MODULES[0].badge}
                    </span>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {SAFETY_MODULES[0].subtitle[language]}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Camera AR Required</span>
                  <button
                    onClick={() => setCurrentTab('ar_camera')}
                    className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
                  >
                    <span>Start AR Drill</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Module 2: Gas Safety */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-amber-400 transition flex flex-col justify-between space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <Gauge className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-slate-900 leading-tight mb-1">
                      {SAFETY_MODULES[1].title[language]}
                    </h3>
                    <span className="inline-block text-[10px] bg-slate-100 text-slate-700 font-mono font-semibold px-1.5 py-0.5 rounded border border-slate-200 mb-1">
                      {SAFETY_MODULES[1].badge}
                    </span>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {SAFETY_MODULES[1].subtitle[language]}
                    </p>
                  </div>
                </div>

                {/* Inline 4-Gas Sniffer Mini-Lab */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 font-mono">4-GAS DETECTOR TELEMETRY</span>
                    <button
                      onClick={() => {
                        setGasSimRunning(!gasSimRunning);
                        if (!gasSimRunning) {
                          setO2Level(18.2); // Deficient
                          setCh4Level(1.4);
                          setH2sLevel(14); // Hazard!
                        } else {
                          setO2Level(20.9);
                          setCh4Level(0.1);
                          setH2sLevel(2);
                        }
                      }}
                      className="text-[10px] font-bold text-amber-700 underline"
                    >
                      {gasSimRunning ? 'Reset Gases' : 'Simulate Leak'}
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono">
                    <div className={`p-1.5 rounded-lg border ${o2Level < 19.5 ? 'bg-red-50 border-red-300 text-red-700 font-bold' : 'bg-white border-slate-200 text-slate-800'}`}>
                      <div className="text-[9px] text-slate-500 font-sans">O2</div>
                      <div>{o2Level}%</div>
                    </div>
                    <div className={`p-1.5 rounded-lg border ${ch4Level > 1.0 ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold' : 'bg-white border-slate-200 text-slate-800'}`}>
                      <div className="text-[9px] text-slate-500 font-sans">CH4</div>
                      <div>{ch4Level}%</div>
                    </div>
                    <div className={`p-1.5 rounded-lg border ${h2sLevel > 10 ? 'bg-red-50 border-red-300 text-red-700 font-bold' : 'bg-white border-slate-200 text-slate-800'}`}>
                      <div className="text-[9px] text-slate-500 font-sans">H2S</div>
                      <div>{h2sLevel}ppm</div>
                    </div>
                    <div className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-800">
                      <div className="text-[9px] text-slate-500 font-sans">CO</div>
                      <div>5ppm</div>
                    </div>
                  </div>

                  {h2sLevel > 10 && (
                    <div className="text-[11px] text-red-700 font-bold bg-red-100/80 p-2 rounded-lg border border-red-300 flex items-center justify-between">
                      <span>⚠️ High H2S Hazard Detected!</span>
                      <button
                        onClick={() => setGasDecision('ESCALATED_SAFE')}
                        className="px-2 py-1 rounded bg-red-600 text-white font-bold text-[10px]"
                      >
                        DO NOT ENTER (Escalate)
                      </button>
                    </div>
                  )}

                  {gasDecision === 'ESCALATED_SAFE' && (
                    <div className="text-[11px] text-emerald-800 font-bold bg-emerald-100 p-2 rounded-lg border border-emerald-300">
                      ✓ Target Safe Outcome Achieved: Locked out and escalated to Sirdar.
                    </div>
                  )}
                </div>
              </div>

              {/* Module 3: PPE Safety */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-amber-400 transition flex flex-col justify-between space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                    <HardHat className="w-6 h-6 text-sky-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-slate-900 leading-tight mb-1">
                      {SAFETY_MODULES[2].title[language]}
                    </h3>
                    <span className="inline-block text-[10px] bg-slate-100 text-slate-700 font-mono font-semibold px-1.5 py-0.5 rounded border border-slate-200 mb-1">
                      {SAFETY_MODULES[2].badge}
                    </span>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {SAFETY_MODULES[2].subtitle[language]}
                    </p>
                  </div>
                </div>

                {/* Step-by-Step PPE Checklist */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">MANDATORY PRE-SHIFT PPE CHECK</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {[helmetSecured, suitEquipped, bootsVerified].filter(Boolean).length} / 3 Ready
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <button
                      onClick={() => setHelmetSecured(!helmetSecured)}
                      className={`w-full p-2 rounded-lg border flex items-center justify-between transition ${helmetSecured ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-700'}`}
                    >
                      <span>1. Cap-Lamp Helmet with Chin Strap Fastened</span>
                      {helmetSecured ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                    </button>

                    <button
                      onClick={() => setSuitEquipped(!suitEquipped)}
                      className={`w-full p-2 rounded-lg border flex items-center justify-between transition ${suitEquipped ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-700'}`}
                    >
                      <span>2. High-Visibility Reflective Boiler Suit</span>
                      {suitEquipped ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                    </button>

                    <button
                      onClick={() => setBootsVerified(!bootsVerified)}
                      className={`w-full p-2 rounded-lg border flex items-center justify-between transition ${bootsVerified ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-700'}`}
                    >
                      <span>3. Steel-Toe Puncture Resistant Safety Boots</span>
                      {bootsVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------
            TAB 2: REAL-TIME AR FIRE GUIDANCE OVERLAY (KHANSUAR)
            -------------------------------------------------- */}
        {currentTab === 'ar_camera' && (
          <div className="relative h-[calc(100vh-140px)] min-h-[580px] bg-slate-950 text-white flex flex-col justify-between overflow-hidden">
            {/* Viewport: Live Camera Feed or 2D Industrial Fallback */}
            <div className="absolute inset-0 z-0">
              {viewMode === 'CAMERA_AR' && cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                /* 2D Canvas Fallback */
                <div className="w-full h-full relative bg-radial from-slate-800 via-slate-900 to-black flex items-center justify-center p-4">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:20px_20px]" />

                  {/* Simulated Electrical Switchgear Cabinet */}
                  <div className="relative z-10 w-72 h-80 bg-slate-950/85 rounded-2xl border-2 border-slate-700 p-4 shadow-2xl flex flex-col justify-between backdrop-blur-xs">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        440V SWITCHGEAR
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${powerIsolated ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-red-950 text-red-300 border border-red-600'}`}>
                        {powerIsolated ? 'POWER ISOLATED' : 'LIVE ENERGIZED'}
                      </span>
                    </div>

                    {/* Animated Flame Object */}
                    <div className="relative h-44 flex items-end justify-center">
                      {fireIntensity > 0 ? (
                        <div className="relative flex flex-col items-center">
                          <div
                            className="relative transition-all duration-300 flex items-end"
                            style={{
                              transform: `scale(${fireIntensity / 100})`,
                              transformOrigin: 'bottom center'
                            }}
                          >
                            <Flame className="w-24 h-24 text-amber-500 fill-amber-500 animate-bounce" />
                            <Flame className="w-16 h-16 text-red-600 fill-red-600 absolute bottom-0 -left-2 animate-pulse" />
                            <Flame className="w-12 h-12 text-yellow-300 fill-yellow-300 absolute bottom-1 left-5" />
                          </div>

                          {/* Targeting Base Reticle */}
                          <button
                            onClick={handleLockTarget}
                            className={`absolute -bottom-3 px-3 py-1 rounded-full text-[10px] font-bold border transition flex items-center gap-1 ${
                              targetLocked
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                : 'bg-black/80 text-amber-400 border-amber-400 animate-pulse'
                            }`}
                          >
                            <Crosshair className="w-3 h-3" />
                            <span>{targetLocked ? 'AIM BASE LOCKED ✓' : 'TAP: AIM AT BASE'}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                          <span className="text-xs font-black text-emerald-400 mt-2 block tracking-wider uppercase">
                            Fire Suppressed
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Spray Wind Particles */}
                    {isSpraying && (
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center pointer-events-none animate-pulse">
                        <Wind className="w-16 h-16 text-white animate-spin" />
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 font-mono flex justify-between border-t border-slate-800 pt-1.5">
                      <span>Temp: {ambientTemp}°C</span>
                      <span>CO: {coPpm} ppm</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Top AR Status Bar */}
            <div className="relative z-20 p-3 flex items-center justify-between gap-2">
              <button
                onClick={() => setCurrentTab('modules')}
                className="h-9 px-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Exit</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAudioMuted(!audioMuted)}
                  className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition backdrop-blur-md ${
                    audioMuted
                      ? 'bg-slate-900/80 text-slate-400 border-slate-700'
                      : 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                  }`}
                >
                  {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{audioMuted ? 'Muted' : 'Audio Guide'}</span>
                </button>

                {/* Mode Switcher */}
                <button
                  onClick={() => {
                    if (viewMode === 'CAMERA_AR') {
                      stopCamera();
                      setViewMode('CANVAS_2D');
                    } else {
                      setViewMode('CAMERA_AR');
                      startCamera();
                    }
                  }}
                  className="h-9 px-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 hover:text-white transition"
                >
                  {viewMode === 'CAMERA_AR' ? <Camera className="w-3.5 h-3.5 text-sky-400" /> : <Layers className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{viewMode === 'CAMERA_AR' ? 'Camera Live' : '2D Canvas'}</span>
                </button>
              </div>
            </div>

            {/* Camera Error Prompt (if any) */}
            {cameraError && viewMode === 'CAMERA_AR' && (
              <div className="relative z-20 px-3">
                <div className="bg-amber-950/90 border border-amber-500 rounded-xl p-2.5 text-xs text-amber-200 flex items-center justify-between gap-2">
                  <span>{cameraError}</span>
                  <button
                    onClick={startCamera}
                    className="h-8 px-2.5 bg-amber-500 text-slate-950 font-bold rounded-lg shrink-0"
                  >
                    Retry Camera
                  </button>
                </div>
              </div>
            )}

            {/* Fire Intensity Gauge */}
            <div className="relative z-20 px-3">
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5 text-slate-200">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Fire Hazard Gauge</span>
                  </span>
                  <span className={`font-mono font-black ${fireIntensity > 50 ? 'text-red-400' : fireIntensity > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {fireIntensity}% {fireIntensity === 0 && '(SUPPRESSED)'}
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      fireIntensity > 50 ? 'bg-red-500' : fireIntensity > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${fireIntensity}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Safety Violation Warning */}
            {electricalRiskAlert && (
              <div className="relative z-20 px-3 pt-2">
                <div className="bg-red-950/95 border-2 border-red-500 text-red-100 rounded-2xl p-3 shadow-xl flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-black text-red-300 uppercase tracking-wide">DGMS Safety Violation</div>
                    <p className="mt-0.5 font-medium">{electricalRiskAlert}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Procedural 4-Step PASS Action Floating Stack */}
            <div className="relative z-20 p-3 space-y-2 mt-auto">
              <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Procedural PASS Actions (Step {passStep}/4)</span>
                  </span>
                  <button
                    onClick={resetFireDrill}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Step 1: Power Off */}
                  <button
                    onClick={handlePowerToggle}
                    disabled={powerIsolated}
                    className={`h-12 px-3 rounded-xl border flex items-center gap-2 font-bold transition text-left ${
                      powerIsolated
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                        : passStep === 1
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-pulse'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Power className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[9px] uppercase font-mono">Step 1</div>
                      <div className="truncate text-xs">{powerIsolated ? 'Power Off ✓' : '1. Power Off'}</div>
                    </div>
                  </button>

                  {/* Step 2: Remove Pin */}
                  <button
                    onClick={handleRemovePin}
                    disabled={pinRemoved}
                    className={`h-12 px-3 rounded-xl border flex items-center gap-2 font-bold transition text-left ${
                      pinRemoved
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                        : passStep === 2
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-pulse'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Lock className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[9px] uppercase font-mono">Step 2</div>
                      <div className="truncate text-xs">{pinRemoved ? 'Pin Pulled ✓' : '2. Pull Pin'}</div>
                    </div>
                  </button>

                  {/* Step 3: Aim at Base */}
                  <button
                    onClick={handleLockTarget}
                    disabled={targetLocked || !pinRemoved}
                    className={`h-12 px-3 rounded-xl border flex items-center gap-2 font-bold transition text-left ${
                      targetLocked
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                        : passStep === 3
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-pulse'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Crosshair className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[9px] uppercase font-mono">Step 3</div>
                      <div className="truncate text-xs">{targetLocked ? 'Aimed ✓' : '3. Aim Base'}</div>
                    </div>
                  </button>

                  {/* Step 4: Spray CO2 */}
                  <button
                    onMouseDown={handleStartSpray}
                    onMouseUp={handleStopSpray}
                    onTouchStart={handleStartSpray}
                    onTouchEnd={handleStopSpray}
                    onClick={handleStartSpray}
                    disabled={!targetLocked || fireSuppressed}
                    className={`h-12 px-3 rounded-xl border flex items-center gap-2 font-bold transition text-left select-none ${
                      fireSuppressed
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                        : passStep === 4
                        ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md active:scale-95 animate-pulse'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Wind className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[9px] uppercase font-mono">Step 4</div>
                      <div className="truncate text-xs">{fireSuppressed ? 'Extinguished ✓' : isSpraying ? 'Spraying...' : '4. Spray CO2'}</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Completion Banner */}
              {fireSuppressed && (
                <div className="bg-emerald-950/95 border border-emerald-500 rounded-2xl p-4 shadow-xl text-center space-y-3 animate-in zoom-in-95">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Fire Extinguished Successfully!</span>
                  </div>
                  <button
                    onClick={() => setCurrentTab('assessment')}
                    className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                  >
                    <span>Proceed to Assessment Drill</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --------------------------------------------------
            TAB 3: IN-APP PRACTICAL ASSESSMENT
            -------------------------------------------------- */}
        {currentTab === 'assessment' && (
          <div className="p-4 space-y-4">
            {!assessmentSubmitted ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Question {currentQuestionIndex + 1} of {ASSESSMENT_QUESTIONS.length}
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                    Practical Evaluation
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100}%`
                    }}
                  />
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <span className="inline-block text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                    Scenario #{currentQuestionIndex + 1}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 leading-snug">
                    {ASSESSMENT_QUESTIONS[currentQuestionIndex].question[language]}
                  </h3>

                  <div className="space-y-2.5 pt-1">
                    {ASSESSMENT_QUESTIONS[currentQuestionIndex].options.map((option, idx) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectAnswer(currentQuestionIndex, idx)}
                          className={`w-full min-h-[48px] p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50 text-slate-900 shadow-2xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <span className="flex-1 pr-2">{option[language]}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  {currentQuestionIndex > 0 && (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                      className="h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs"
                    >
                      Previous
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
                        setCurrentQuestionIndex(prev => prev + 1);
                      } else {
                        handleSubmitAssessment();
                      }
                    }}
                    disabled={selectedAnswers[currentQuestionIndex] === undefined}
                    className={`flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                      selectedAnswers[currentQuestionIndex] !== undefined
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>
                      {currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1
                        ? 'Submit Assessment'
                        : 'Next Question'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Assessment Results */
              <div className="space-y-4">
                {assessmentScore >= 2 ? (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 text-center space-y-2 shadow-xs">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-black text-emerald-950">COMPETENCY PASSED</h3>
                    <p className="text-xs text-emerald-800 font-medium">
                      Candidate meets DGMS CMR 2017 & OSHA statutory firefighting benchmarks.
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-300 rounded-2xl p-5 text-center space-y-2 shadow-xs">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-700">
                      <XCircle className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-black text-red-950">RE-DRILL MANDATORY</h3>
                    <p className="text-xs text-red-800 font-medium">
                      Score below 67% threshold. Review PASS protocol and retake drill.
                    </p>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score</span>
                    <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                      {assessmentScore} <span className="text-xs text-slate-400 font-sans">/ {ASSESSMENT_QUESTIONS.length}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Percentage</span>
                    <div className={`text-2xl font-black font-mono mt-0.5 ${assessmentScore >= 2 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {Math.round((assessmentScore / ASSESSMENT_QUESTIONS.length) * 100)}%
                    </div>
                  </div>
                </div>

                {assessmentScore >= 2 ? (
                  <button
                    onClick={generateCertificate}
                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Verifiable Certificate</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAssessmentSubmitted(false);
                      setCurrentQuestionIndex(0);
                      setSelectedAnswers({});
                    }}
                    className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retake Assessment</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------------
            TAB 4: CERTIFICATE AUTHORITY TAB
            -------------------------------------------------- */}
        {currentTab === 'certificate' && (
          <div className="p-4 space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-slate-900">National Mining Safety Registry</h2>
              <p className="text-xs text-slate-500">
                Cryptographically verifiable DGMS & OSHA statutory certificates.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-center">
              <Award className="w-12 h-12 text-amber-500 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Trainee: {userProfile.name}</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {userProfile.id} • Registered</p>
              </div>

              <button
                onClick={generateCertificate}
                className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition"
              >
                <FileCheck className="w-4 h-4" />
                <span>Issue & View Official Certificate</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ====================================================
          3. VERIFIABLE CERTIFICATE MODAL
          ==================================================== */}
      {certificateModalOpen && currentCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-1 border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-300 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DGMS STATUTORY RECORD</span>
              </div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                Certificate of Competency
              </h2>
              <p className="text-[11px] text-slate-500">
                SurakshaAR National Safety Training Standard
              </p>
            </div>

            {/* Candidate Metadata */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Trainee Name:</span>
                <span className="font-bold text-slate-900">{currentCertificate.traineeName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Worker ID:</span>
                <span className="font-mono font-bold text-slate-800">{currentCertificate.workerId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Course:</span>
                <span className="font-bold text-slate-900 truncate max-w-[160px] text-right">
                  {currentCertificate.courseName}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Score Achieved:</span>
                <span className="font-bold text-emerald-700">{currentCertificate.percentage}% (PASS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issue Date:</span>
                <span className="font-medium text-slate-700">{currentCertificate.issueDate}</span>
              </div>
            </div>

            {/* Dynamic QR Code Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2">
              <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-300 shadow-2xs flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                  <rect x="5" y="5" width="28" height="28" rx="4" fill="#0F172A" />
                  <rect x="9" y="9" width="20" height="20" rx="2" fill="#FFFFFF" />
                  <rect x="13" y="13" width="12" height="12" rx="1" fill="#0F172A" />

                  <rect x="67" y="5" width="28" height="28" rx="4" fill="#0F172A" />
                  <rect x="71" y="9" width="20" height="20" rx="2" fill="#FFFFFF" />
                  <rect x="75" y="13" width="12" height="12" rx="1" fill="#0F172A" />

                  <rect x="5" y="67" width="28" height="28" rx="4" fill="#0F172A" />
                  <rect x="9" y="71" width="20" height="20" rx="2" fill="#FFFFFF" />
                  <rect x="13" y="75" width="12" height="12" rx="1" fill="#0F172A" />

                  <circle cx="42" cy="19" r="4" fill="#0F172A" />
                  <circle cx="54" cy="19" r="4" fill="#0F172A" />
                  <circle cx="48" cy="48" r="6" fill="#D97706" />
                  <rect x="40" y="65" width="8" height="8" fill="#0F172A" />
                  <rect x="65" y="45" width="8" height="8" fill="#0F172A" />
                  <rect x="75" y="75" width="16" height="16" fill="#0F172A" />
                </svg>
              </div>

              <div className="text-center space-y-0.5">
                <p className="text-[10px] font-mono font-bold text-slate-700">
                  {currentCertificate.certId}
                </p>
                <p className="text-[9px] text-slate-400 font-mono truncate max-w-[220px]">
                  {currentCertificate.verificationUrl}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => alert(`Downloading Official PDF: ${currentCertificate.certId}`)}
                className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Certificate (PDF)</span>
              </button>

              <button
                onClick={() => setCertificateModalOpen(false)}
                className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          4. FIXED BOTTOM NAVIGATION BAR (4 CLEAN TABS)
          ==================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-2 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentTab('modules')}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition ${
            currentTab === 'modules' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Modules</span>
        </button>

        <button
          onClick={() => setCurrentTab('ar_camera')}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition ${
            currentTab === 'ar_camera' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Camera className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Live AR</span>
        </button>

        <button
          onClick={() => setCurrentTab('assessment')}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition ${
            currentTab === 'assessment' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Assessment</span>
        </button>

        <button
          onClick={() => setCurrentTab('certificate')}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition ${
            currentTab === 'certificate' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Certificate</span>
        </button>
      </nav>
    </div>
  );
};

export default SurakshaARApp;
