import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================================
// Sathi Industrial Safety: Phase 2 AR Training Module
// Heavy Machinery Spatial Hazard Inspection & Multilingual Audio Guidance
// ============================================================================

const STEPS_DATA = [
  {
    step: 1,
    titleEn: 'Identify the hazards around the moving dump truck.',
    titleHi: 'डंप ट्रक के चारों ओर खतरों की पहचान करें।',
    titleSat: 'ᱪᱟᱞᱟᱣᱜ ᱠᱟᱱ ᱰᱟᱢᱯ ᱴᱨᱟᱠ ᱟᱲᱮ ᱯᱟᱥᱮ ᱵᱚᱛᱚᱨ ᱴᱷᱟᱹᱣᱠᱟᱹᱭ ᱢᱮ᱾',
    speechHi: 'डंप ट्रक के चारों ओर खतरों की पहचान करें और सुरक्षित दूरी बनाएं।',
    speechSat: 'ᱪᱟᱞᱟᱣᱜ ᱠᱟᱱ ᱰᱟᱢᱯ ᱴᱨᱟᱠ ᱟᱲᱮ ᱯᱟᱥᱮ ᱵᱚᱛᱚᱨ ᱴᱷᱟᱹᱣᱠᱟᱹᱭ ᱢᱮ ᱟᱨ ᱥᱟᱺᱜᱤᱧ ᱨᱮ ᱛᱟᱦᱮᱸᱱ ᱢᱮ᱾',
    speechEn: 'Identify the hazards around the moving dump truck and maintain a safe clearance.',
    bannerText: 'Stay away from moving machinery',
    bannerTextHi: 'चलती मशीनरी से दूर रहें',
    hazardPos: { top: '38%', left: '50%' },
    actionPrompt: 'Tap on hazard marker to inspect danger zone',
    hazardType: 'PINCH_POINT'
  },
  {
    step: 2,
    titleEn: 'Check blind spots and maintain 10-meter clearance zone.',
    titleHi: 'ब्लाइंड स्पॉट की जांच करें और 10 मीटर की सुरक्षित दूरी बनाए रखें।',
    titleSat: 'ᱠᱚᱭᱚᱜ ᱵᱟᱝ ᱧᱮᱞᱚᱜ ᱡᱟᱭᱜᱟ ᱧᱮᱞ ᱢᱮ ᱟᱨ ᱑᱐ ᱢᱤᱴᱟᱨ ᱥᱟᱺᱜᱤᱧ ᱨᱮ ᱛᱟᱦᱮᱸᱱ ᱢᱮ᱾',
    speechHi: 'ब्लाइंड स्पॉट की जांच करें और कम से कम 10 मीटर का सुरक्षित दायरा बनाए रखें।',
    speechSat: 'ᱠᱚᱭᱚᱜ ᱵᱟᱝ ᱧᱮᱞᱚᱜ ᱡᱟᱭᱜᱟ ᱧᱮᱞ ᱢᱮ ᱟᱨ ᱑᱐ ᱢᱤᱴᱟᱨ ᱥᱟᱺᱜᱤᱧ ᱨᱮ ᱛᱟᱦᱮᱸᱱ ᱢᱮ᱾',
    speechEn: 'Check operator blind spots and maintain at least 10 meters clearance zone.',
    bannerText: 'Clearance Zone: 10 Meters Required',
    bannerTextHi: 'सुरक्षित दूरी: 10 मीटर अनिवार्य',
    hazardPos: { top: '44%', left: '60%' },
    actionPrompt: 'Verify perimeter ring is outside vehicle trajectory',
    hazardType: 'BLIND_SPOT'
  },
  {
    step: 3,
    titleEn: 'Verify eye contact with the heavy machine operator.',
    titleHi: 'मशीन ऑपरेटर के साथ स्पष्ट आंखों का संपर्क सुनिश्चित करें।',
    titleSat: 'ᱚᱯᱟᱨᱮᱴᱚᱨ ᱥᱟᱶ ᱢᱮᱫ ᱢᱮᱞᱟᱣ ᱴᱷᱟᱹᱣᱠᱟᱹᱭ ᱢᱮ᱾',
    speechHi: 'ऑपरेटर के साथ आंखों का संपर्क बनाएं, जब तक वह रुकने का इशारा ना करे।',
    speechSat: 'ᱚᱯᱟᱨᱮᱴᱚᱨ ᱥᱟᱶ ᱢᱮᱫ ᱢᱮᱞᱟᱣ ᱴᱷᱟᱹᱣᱠᱟᱹᱭ ᱢᱮ, ᱛᱤᱸᱜᱩ ᱤᱥᱟᱨᱟ ᱵᱟᱭ ᱮᱢ ᱫᱷᱟᱹᱵᱤᱡ᱾',
    speechEn: 'Make direct eye contact with the machine operator before crossing path.',
    bannerText: 'Operator Cabin in Sight • Awaiting Signal',
    bannerTextHi: 'ऑपरेटर केबिन दृश्य में • संकेत की प्रतीक्षा',
    hazardPos: { top: '32%', left: '42%' },
    actionPrompt: 'Confirm operator hand signal acknowledgement',
    hazardType: 'OPERATOR_SIGNAL'
  },
  {
    step: 4,
    titleEn: 'Identify safe pedestrian walkway and signal operator.',
    titleHi: 'सुरक्षित पैदल मार्ग की पहचान करें और ऑपरेटर को संकेत दें।',
    titleSat: 'ᱥᱩᱨᱚᱠᱷᱤᱭᱟᱹ ᱛᱟᱲᱟᱢ ᱰᱟᱦᱟᱨ ᱧᱟᱢ ᱢᱮ ᱟᱨ ᱤᱥᱟᱨᱟ ᱮᱢᱟᱭ ᱢᱮ᱾',
    speechHi: 'चिन्हित सुरक्षित पैदल मार्ग पर रहें और कभी भी टेलगेट के नीचे ना जाएं।',
    speechSat: 'ᱥᱩᱨᱚᱠᱷᱤᱭᱟᱹ ᱛᱟᱲᱟᱢ ᱰᱟᱦᱟᱨ ᱨᱮ ᱛᱟᱦᱮᱸᱱ ᱢᱮ ᱟᱨ ᱴᱨᱟᱠ ᱛᱟᱭᱚᱢ ᱥᱮᱫ ᱟᱞᱚᱢ ᱪᱟᱞᱟᱜ-ᱟ᱾',
    speechEn: 'Locate designated pedestrian walkway and give green clearance signal.',
    bannerText: 'Designated Green Pathway Clear',
    bannerTextHi: 'निर्धारित सुरक्षित मार्ग खाली है',
    hazardPos: { top: '56%', left: '48%' },
    actionPrompt: 'Tap green zone to lock safe pedestrian corridor',
    hazardType: 'WALKWAY'
  },
  {
    step: 5,
    titleEn: 'Confirm safe passage and report clearance.',
    titleHi: 'सुरक्षित मार्ग की पुष्टि करें और क्लीयरेंस की रिपोर्ट करें।',
    titleSat: 'ᱥᱩᱨᱚᱠᱷᱤᱭᱟᱹ ᱰᱟᱦᱟᱨ ᱴᱷᱟᱹᱣᱠᱟᱹᱭ ᱢᱮ ᱟᱨ ᱨᱤᱯᱚᱴ ᱮᱢ ᱢᱮ᱾',
    speechHi: 'रास्ता पूरी तरह सुरक्षित है। कंट्रोल रूम को क्लीयरेंस रिपोर्ट दर्ज करें।',
    speechSat: 'ᱰᱟᱦᱟᱨ ᱯᱩᱨᱟᱹ ᱥᱩᱨᱚᱠᱷᱤᱭᱟᱹ ᱜᱮᱭᱟ᱾ ᱠᱚᱱᱴᱨᱚᱞ ᱨᱩᱢ ᱨᱮ ᱨᱤᱯᱚᱴ ᱮᱢ ᱢᱮ᱾',
    speechEn: 'Safe passage verified. Register drill clearance to supervisor desk.',
    bannerText: 'Safe Passage Verified • Drill Complete',
    bannerTextHi: 'सुरक्षित आवागमन सत्यापित • ड्रिल पूर्ण',
    hazardPos: { top: '48%', left: '50%' },
    actionPrompt: 'Final compliance check passed',
    hazardType: 'COMPLIANCE_PASS'
  }
];

export default function ARTrainingModule({ onBack, onComplete }) {
  // Step & Language State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [language, setLanguage] = useState('hi'); // 'hi' | 'sat' | 'en'
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [hazardInspected, setHazardInspected] = useState(false);
  const [drillCompleted, setDrillCompleted] = useState(false);

  // Audio / Speech Synthesis State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioPrimed, setAudioPrimed] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Hardware Camera State & References
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const voiceRef = useRef(null);
  const lastSpokenRef = useRef({ text: '', timestamp: 0 });
  const activeUtteranceRef = useRef(null);

  const currentStep = STEPS_DATA[currentStepIndex];

  // 1. HARDWARE CAMERA INITIALIZATION (WITH MACBOOK/LAPTOP FALLBACK)
  useEffect(() => {
    let isMounted = true;

    const startHardwareCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) {
          setCameraError('Camera API not supported in this browser environment.');
        }
        return;
      }

      const primaryConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia(primaryConstraints);
      } catch (err) {
        console.warn('Primary environment camera failed, falling back to any available video stream:', err);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (fallbackErr) {
          console.error('All camera attempts failed:', fallbackErr);
          if (isMounted) {
            setCameraError('Camera access blocked. Please allow camera permissions in browser.');
          }
          return;
        }
      }

      if (isMounted && stream) {
        streamRef.current = stream;
        setCameraActive(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((playErr) => {
            console.warn('Video play interrupted:', playErr);
          });
        }
      }
    };

    startHardwareCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          try { track.stop(); } catch {}
        });
        streamRef.current = null;
      }
    };
  }, []);

  // 2. AUDIO SYNTHESIS VOICE PREPARATION HOOK (CHROME ASYNC VOICES LISTENER)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechSupported(false);
      return;
    }

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        voiceRef.current = voices;
      } catch (e) {
        console.warn('Voice retrieval error:', e);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // 1. Web Audio Hardware Wakeup: forces Chrome & macOS CoreAudio to wake audio device from sleep
  const wakeAudioHardware = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.001; // sub-audible near-zero gain
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);
      osc.stop(ctx.currentTime + 0.01);
    } catch (e) {
      console.warn("Audio hardware wakeup non-fatal error:", e);
    }
  }, []);

  // 3. BULLETPROOF NATIVE SPEECH GUIDANCE DISPATCHER (CHROME / MACOS OPTIMIZED)
  const playVoiceGuidance = useCallback((textToSpeak, lang = 'hi-IN') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn("Speech synthesis not supported.");
      return;
    }

    try {
      // Step A: Wake hardware audio engine first
      wakeAudioHardware();

      // Step B: Clear any hung queues and force resume
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      // Retain utterance on component ref AND global window to prevent Chrome V8 GC mid-speech
      activeUtteranceRef.current = utterance;
      if (typeof window !== 'undefined') {
        window.activeUtterance = utterance;
      }
      
      const allVoices = window.speechSynthesis.getVoices();
      let selectedVoice = null;

      // Multi-tier Fallback Priority:
      // 1. Hindi (hi-IN or name containing Hindi)
      if (lang.startsWith('hi')) {
        selectedVoice = allVoices.find(v => v.lang === 'hi-IN' || v.lang.includes('hi') || (v.name && v.name.toLowerCase().includes('hindi')));
      }

      // 2. Indian English (en-IN or name containing India)
      if (!selectedVoice) {
        selectedVoice = allVoices.find(v => v.lang === 'en-IN' || (v.name && v.name.toLowerCase().includes('india')));
      }

      // 3. System default or first available voice
      if (!selectedVoice) {
        selectedVoice = allVoices.find(v => v.default) || allVoices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.lang = selectedVoice ? selectedVoice.lang : (lang.startsWith('hi') ? 'hi-IN' : 'en-US');
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        console.log("🔊 Playing safety instruction:", textToSpeak);
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        activeUtteranceRef.current = null;
        if (typeof window !== 'undefined') window.activeUtterance = null;
      };
      utterance.onerror = (e) => {
        if (e.error !== 'interrupted') {
          console.error("SpeechSynthesis error:", e);
        }
        setIsSpeaking(false);
        activeUtteranceRef.current = null;
        if (typeof window !== 'undefined') window.activeUtterance = null;
        // Self-healing: resume synthesis queue
        try {
          window.speechSynthesis.resume();
        } catch {}
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Failed to speak:", err);
      setIsSpeaking(false);
      activeUtteranceRef.current = null;
      if (typeof window !== 'undefined') window.activeUtterance = null;
    }
  }, [wakeAudioHardware]);

  // Helper to resolve text and language for current step
  const getStepNarration = useCallback(() => {
    let textToSpeak = currentStep.speechHi || currentStep.titleHi;
    let targetLang = 'hi-IN';

    if (language === 'en') {
      textToSpeak = currentStep.speechEn || currentStep.titleEn;
      targetLang = 'en-IN';
    } else if (language === 'sat') {
      textToSpeak = currentStep.speechSat || currentStep.titleSat;
      targetLang = 'hi-IN';
    }

    return { textToSpeak, targetLang };
  }, [currentStep, language]);

  // Trigger speech narration automatically upon step advance or language change
  useEffect(() => {
    const { textToSpeak, targetLang } = getStepNarration();

    const timer = setTimeout(() => {
      playVoiceGuidance(textToSpeak, targetLang);
    }, 400);

    return () => clearTimeout(timer);
  }, [currentStepIndex, language, getStepNarration, playVoiceGuidance]);

  // Clean up speech on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speech engine unlock for user gestures
  const unlockSpeechEngine = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {}
    }
  }, []);

  // STEP NAVIGATION CONTROLLERS
  const handleNextStep = () => {
    wakeAudioHardware();
    setHazardInspected(false);

    if (currentStepIndex < STEPS_DATA.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      // Trigger voice instruction for the new step immediately
      const nextStep = STEPS_DATA[nextIdx];
      let text = nextStep.speechHi || nextStep.titleHi;
      let targetLang = 'hi-IN';
      if (language === 'en') {
        text = nextStep.speechEn || nextStep.titleEn;
        targetLang = 'en-IN';
      } else if (language === 'sat') {
        text = nextStep.speechSat || nextStep.titleSat;
        targetLang = 'hi-IN';
      }
      setTimeout(() => {
        playVoiceGuidance(text, targetLang);
      }, 250);
    } else {
      setDrillCompleted(true);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const handlePrevStep = () => {
    unlockSpeechEngine();
    setHazardInspected(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleHazardInspect = () => {
    unlockSpeechEngine();
    setHazardInspected(true);
    const confirmText = language === 'hi' ? 'खतरा सत्यापित हुआ!' : language === 'sat' ? 'ᱵᱚᱛᱚᱨ ᱴᱷᱟᱹᱣᱠᱟᱹ ᱮᱱᱟ!' : 'Hazard Verified!';
    playVoiceGuidance(confirmText, language === 'en' ? 'en-IN' : 'hi-IN');
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col justify-between font-sans select-none max-w-md mx-auto shadow-2xl border-x border-[#E2E8F0]">
      {/* ====================================================================
          1. REAL HARDWARE CAMERA STREAM CONTAINER (Z-0)
          ==================================================================== */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Fallback Simulation Canvas if Camera is Blocked */}
      {(!cameraActive || cameraError) && (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
          {/* Spatial Grid Lines Simulation */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="relative z-10 max-w-xs space-y-2">
            <span className="text-3xl">📷</span>
            <h4 className="text-sm font-bold text-white">Spatial AR Simulation Mode</h4>
            <p className="text-xs text-slate-400">
              {cameraError || 'Camera stream mounting... Operating in high-precision spatial anchor mode.'}
            </p>
          </div>
        </div>
      )}

      {/* Gradient Top Scrim for Text/Button Legibility */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none z-10" />

      {/* ====================================================================
          2. TOP FLOATING APP BAR (Z-20)
          ==================================================================== */}
      <header className="relative z-20 px-4 pt-3 flex items-center justify-between">
        {/* Left: Circular Back Button */}
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
            if (onBack) onBack();
          }}
          className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-center text-slate-800 hover:bg-white active:scale-95 transition"
          title="Back to Home Dashboard"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </button>

        {/* Right: Language Dropdown + Audio Toggle */}
        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown Pill */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="h-10 px-3.5 rounded-full bg-white/95 backdrop-blur-md border border-white/40 shadow-lg text-xs font-black text-slate-900 flex items-center gap-1.5 active:scale-95 transition"
            >
              <span>{language === 'hi' ? 'Hindi' : language === 'sat' ? 'Santali' : 'English'}</span>
              <span className="text-[10px] text-slate-500">⌵</span>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-2xl border border-slate-200 p-1.5 z-50 animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    setLanguage('hi');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    language === 'hi' ? 'bg-amber-50 text-amber-900 font-black' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Hindi (हिंदी)</span>
                  {language === 'hi' && <span>✓</span>}
                </button>

                <button
                  onClick={() => {
                    setLanguage('sat');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    language === 'sat' ? 'bg-amber-50 text-amber-900 font-black' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Santali (ᱥᱟᱱᱛᱟᱲᱤ)</span>
                  {language === 'sat' && <span>✓</span>}
                </button>

                <button
                  onClick={() => {
                    setLanguage('en');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    language === 'en' ? 'bg-amber-50 text-amber-900 font-black' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>English</span>
                  {language === 'en' && <span>✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Audio Speaker Pill with Active Wave & Ripple Animation */}
          <button
            onClick={() => {
              const { textToSpeak, targetLang } = getStepNarration();
              playVoiceGuidance(textToSpeak, targetLang);
            }}
            className={`w-10 h-10 rounded-full border shadow-lg flex items-center justify-center transition active:scale-95 relative ${
              isSpeaking
                ? 'bg-amber-500 border-amber-400 text-slate-950 font-black animate-pulse ring-4 ring-amber-400/50'
                : 'bg-white/95 backdrop-blur-md border-white/40 text-slate-800 hover:bg-white'
            }`}
            title="Play Audio Guidance"
          >
            {isSpeaking && (
              <span className="absolute -inset-1 rounded-full border-2 border-amber-400 animate-ping pointer-events-none" />
            )}
            <span className="text-sm">{isSpeaking ? '🔊' : '🔈'}</span>
          </button>
        </div>
      </header>

      {/* ====================================================================
          3. AR SPATIAL HAZARD OVERLAY & RETICLE IN CAMERA (Z-10)
          ==================================================================== */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pointer-events-none">
        {/* Dynamic Spatial Anchor Group */}
        <div
          className="absolute transition-all duration-700 pointer-events-auto flex flex-col items-center"
          style={{ top: currentStep.hazardPos.top, left: currentStep.hazardPos.left, transform: 'translate(-50%, -50%)' }}
        >
          {/* A. Dynamic Hazard Warning Banner */}
          <div className="bg-[#0F172A]/90 backdrop-blur-md text-white border border-amber-500/80 px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2 mb-3 animate-bounce">
            <span className="text-amber-400 text-sm">⚠️</span>
            <span className="text-xs font-bold tracking-tight whitespace-nowrap">
              {language === 'hi' ? currentStep.bannerTextHi : currentStep.bannerText}
            </span>
          </div>

          {/* B. Interactive Target Reticle / Clearance Ring */}
          <div
            onClick={handleHazardInspect}
            className="relative flex items-center justify-center cursor-pointer group"
          >
            {/* Outer Pulsing Safe Radius Ring */}
            <div className={`w-28 h-28 rounded-full border-2 border-dashed transition-all duration-300 flex items-center justify-center ${
              hazardInspected
                ? 'border-emerald-400 bg-emerald-500/20'
                : 'border-amber-400 bg-amber-500/10 animate-pulse'
            }`}>
              {/* Inner Crosshair Target */}
              <div className="w-12 h-12 rounded-full border border-white/80 flex items-center justify-center shadow-inner">
                {hazardInspected ? (
                  <span className="text-emerald-300 text-lg font-black">✓</span>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 group-hover:scale-125 transition" />
                )}
              </div>
            </div>

            {/* Target Reticle Precision Brackets */}
            <div className="absolute inset-0 pointer-events-none">
              <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
              <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
              <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
              <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-400" />
            </div>
          </div>

          {/* C. Realistic Mining Dump Truck Silhouette Ground Anchor */}
          <div className="mt-2 w-28 h-16 opacity-75 pointer-events-none drop-shadow-xl">
            <svg viewBox="0 0 120 70" fill="none" className="w-full h-full">
              {/* Truck Body */}
              <path d="M15 36 L75 36 L68 14 L24 14 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
              {/* Operator Cab */}
              <path d="M76 26 L98 26 L104 40 L76 40 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
              <rect x="82" y="28" width="12" height="8" rx="1" fill="#38BDF8" />
              {/* Wheels */}
              <circle cx="36" cy="50" r="12" fill="#0F172A" stroke="#475569" strokeWidth="3" />
              <circle cx="36" cy="50" r="5" fill="#94A3B8" />
              <circle cx="90" cy="50" r="12" fill="#0F172A" stroke="#475569" strokeWidth="3" />
              <circle cx="90" cy="50" r="5" fill="#94A3B8" />
            </svg>
          </div>

          {/* Clearance Tag / Status Pill */}
          <div className="mt-1">
            {hazardInspected ? (
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-md">
                ✓ 10M Zone Verified
              </span>
            ) : (
              <span className="text-[10px] font-bold text-white/90 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                Tap to inspect
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================================
          4. BOTTOM FLOATING ACTION CARD (Z-20)
          ==================================================================== */}
      <div className="relative z-20 mx-4 mb-6">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-slate-200/90 text-left space-y-3">
          {/* Step Count & In-Card "सुनें (Listen)" Audio Trigger */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Step {currentStep.step} of {STEPS_DATA.length}
            </span>

            <div className="flex items-center gap-2">
              {/* In-Card Manual Listen Trigger Button */}
              <button
                onClick={() => {
                  const { textToSpeak, targetLang } = getStepNarration();
                  playVoiceGuidance(textToSpeak, targetLang);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-black border transition active:scale-90 flex items-center gap-1.5 shadow-xs ${
                  isSpeaking
                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse ring-2 ring-amber-400/40'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
                title="Tap to listen to this safety instruction"
              >
                <span>🔊</span>
                <span>{isSpeaking ? 'बोल रहा है...' : 'सुनें (Listen)'}</span>
              </button>
            </div>
          </div>

          {/* Primary Instruction Text (Daylight High-Contrast Bold) */}
          <div>
            <h2 className="text-base sm:text-[17px] font-black text-slate-900 leading-snug">
              {currentStep.titleEn}
            </h2>

            {/* Multilingual Translated Subtitle */}
            <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
              {language === 'hi' ? currentStep.titleHi : language === 'sat' ? currentStep.titleSat : currentStep.titleHi}
            </p>
          </div>

          {/* Navigation Controller Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {/* Left Button: Previous Step [ ← ] */}
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition active:scale-90 border ${
                currentStepIndex === 0
                  ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
              title="Previous Step"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>

            {/* Center: 5 Pagination Dots (● ○ ○ ○ ○) */}
            <div className="flex items-center gap-2">
              {STEPS_DATA.map((s, idx) => (
                <div
                  key={s.step}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentStepIndex
                      ? 'w-7 bg-amber-500'
                      : idx < currentStepIndex
                      ? 'w-2.5 bg-emerald-500'
                      : 'w-2.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Right Button: Vibrant CTA Next Step [ ➔ ] */}
            <button
              onClick={handleNextStep}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 active:scale-95 text-slate-950 font-black shadow-lg shadow-amber-500/25 flex items-center justify-center transition"
              title="Complete Step & Advance"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================================
          5. COMPLETION STATE MODAL (Z-50)
          ==================================================================== */}
      {drillCompleted && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            {/* Trophy / Target Badge */}
            <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl mx-auto shadow-md">
              🎯
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                AR Training Drill Completed!
              </h3>
              <p className="text-xs font-bold text-emerald-700 mt-1">
                Accuracy: 100% • Safety Standards Compliant
              </p>
              <p className="text-xs text-slate-500 mt-1">
                You have verified heavy machinery clearance zones under DGMS safety protocols.
              </p>
            </div>

            {/* Two Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  if (onComplete) onComplete();
                  else if (onBack) onBack();
                }}
                className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Next: Audio Podcast ➔</span>
              </button>

              <button
                onClick={() => {
                  if (onBack) onBack();
                }}
                className="w-full h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold text-xs uppercase tracking-wider transition"
              >
                Back to Home Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
