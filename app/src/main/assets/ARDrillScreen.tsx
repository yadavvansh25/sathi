import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Zap,
  Volume2,
  VolumeX,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Crosshair,
  Lock,
  Wind,
  Bell,
  ArrowRight,
  ShieldCheck,
  Radio,
  ExternalLink,
  Info,
  Activity,
  RefreshCw
} from 'lucide-react';

interface ARDrillScreenProps {
  onFinishAndEvaluate?: (drillData?: any) => void;
  onBackToEngine?: () => void;
  workerName?: string;
  workerId?: string;
}

// DGMS & OSHA Gas Threshold Limits (Permissible Exposure Limits)
const GAS_THRESHOLDS = {
  O2_MIN: 19.5,   // Below 19.5% Vol: Oxygen deficiency / Asphyxiation hazard
  O2_MAX: 23.5,   // Above 23.5% Vol: Fire enrichment danger
  CO_MAX: 50,     // Ceiling 50 ppm (TWA 25 ppm, >200 ppm immediately lethal)
  H2S_MAX: 10.0,  // Ceiling 10.0 ppm (TWA 1.0 ppm, toxic sour gas)
  CH4_MAX: 1.25   // Mine air regulation limit 1.25% (25% Lower Explosive Limit)
};

export const ARDrillScreen: React.FC<ARDrillScreenProps> = ({
  onFinishAndEvaluate,
  onBackToEngine,
  workerName = 'Rajesh Gope',
  workerId = 'WKR-4491'
}) => {
  // -----------------------------------------------------------------
  // 1. HARDWARE CAMERA HOOK & STREAM STATE
  // -----------------------------------------------------------------
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<boolean>(false);

  const startCamera = async () => {
    setCameraError(false);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available in this environment');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      setCameraError(false);
    } catch (err) {
      console.error('Camera access failed', err);
      setCameraError(true);
      setCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // -----------------------------------------------------------------
  // 2. PROCEDURAL AR GUIDANCE & FIRE INTENSITY STATE
  // -----------------------------------------------------------------
  const [powerIsolated, setPowerIsolated] = useState<boolean>(false);
  const [pinPulled, setPinPulled] = useState<boolean>(false);
  const [aimLocked, setAimLocked] = useState<boolean>(false);
  const [isSpraying, setIsSpraying] = useState<boolean>(false);
  const [firePercentage, setFirePercentage] = useState<number>(100);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [arBannerText, setArBannerText] = useState<string>(
    'पहले मेन पावर बंद करें (Isolate Power Source)'
  );
  const [violationAlert, setViolationAlert] = useState<string | null>(null);

  // -----------------------------------------------------------------
  // 3. REAL-TIME 4-GAS SNIFFER TELEMETRY & THRESHOLD STATE
  // -----------------------------------------------------------------
  // Initial fire state: Oxygen depleted by fire combustion, toxic CO & H2S spike
  const [o2Percent, setO2Percent] = useState<number>(17.4);   // <19.5% Asphyxiation Alert
  const [coPpm, setCoPpm] = useState<number>(380);          // >50 ppm Lethal CO Alert
  const [h2sPpm, setH2sPpm] = useState<number>(14.8);       // >10.0 ppm Lethal H2S Alert
  const [ch4Percent, setCh4Percent] = useState<number>(1.35); // >1.25% LEL Combustible Alert
  const [snifferPumpActive, setSnifferPumpActive] = useState<boolean>(true);
  const [snifferBuzzerMuted, setSnifferBuzzerMuted] = useState<boolean>(false);
  const [isBumpTesting, setIsBumpTesting] = useState<boolean>(false);

  // Evaluate Gas Threshold Violations in Real Time
  const isO2Deficient = o2Percent < GAS_THRESHOLDS.O2_MIN;
  const isCoToxic = coPpm > GAS_THRESHOLDS.CO_MAX;
  const isH2sLethal = h2sPpm > GAS_THRESHOLDS.H2S_MAX;
  const isCh4Hazard = ch4Percent > GAS_THRESHOLDS.CH4_MAX;
  const hasGasThresholdViolation = isO2Deficient || isCoToxic || isH2sLethal || isCh4Hazard;

  // Real-Time Sensor Oscillation (Jitter) Loop: Simulates active suction pump and catalytic/electrochemical cells
  useEffect(() => {
    const snifferInterval = setInterval(() => {
      if (!isSpraying && !isBumpTesting) {
        // Subtle micro-fluctuations around current base target
        setO2Percent(prev => {
          const target = firePercentage === 0 ? 20.9 : 17.4;
          const jitter = (Math.random() - 0.5) * 0.16;
          return parseFloat(Math.max(16.2, Math.min(21.2, target + jitter)).toFixed(1));
        });
        setCoPpm(prev => {
          const target = firePercentage === 0 ? 14 : 380;
          const jitter = (Math.random() - 0.5) * 8;
          return Math.max(4, Math.min(420, Math.round(target + jitter)));
        });
        setH2sPpm(prev => {
          const target = firePercentage === 0 ? 0.4 : 14.8;
          const jitter = (Math.random() - 0.5) * 0.4;
          return parseFloat(Math.max(0.1, Math.min(22.0, target + jitter)).toFixed(1));
        });
        setCh4Percent(prev => {
          const target = firePercentage === 0 ? 0.08 : 1.35;
          const jitter = (Math.random() - 0.5) * 0.04;
          return parseFloat(Math.max(0.02, Math.min(2.5, target + jitter)).toFixed(2));
        });
      }
    }, 1200);

    return () => clearInterval(snifferInterval);
  }, [isSpraying, isBumpTesting, firePercentage]);

  // -----------------------------------------------------------------
  // 4. TELEMETRY ACTION TRIGGERS (OUTSIDE CAMERA)
  // -----------------------------------------------------------------
  const [alarmSounded, setAlarmSounded] = useState<boolean>(false);
  const [co2ExtinguisherSelected, setCo2ExtinguisherSelected] = useState<boolean>(false);
  const [chosenExit, setChosenExit] = useState<'NONE' | 'EXIT_B' | 'EXIT_A'>('NONE');
  const [ambientTemp, setAmbientTemp] = useState<number>(58);

  // Web Speech API Voice synthesis helper
  const speakText = (textHi: string, textEn: string) => {
    if (audioMuted) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textHi);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Step 1: Power Off
  const handlePowerOff = () => {
    if (!powerIsolated) {
      setPowerIsolated(true);
      setViolationAlert(null);
      setArBannerText('अब CO2 सिलेंडर की सेफ्टी पिन निकालें (Pull Safety Pin)');
      speakText('बिजली बंद हो गई है। अब पिन निकालें!', 'Main 440V power isolated. Pull extinguisher safety pin.');
    }
  };

  // Step 2: Pull Pin
  const handlePullPin = () => {
    if (!powerIsolated) {
      setViolationAlert('⚠️ गंभीर चेतावनी: 440V लाइन चालू है! पहले मेन पावर बंद करें (Isolate Power first)!');
      speakText('रुको! पहले मेन पावर बंद करें!', 'Wait! Isolate main 440V power first!');
      return;
    }
    setPinPulled(true);
    setCo2ExtinguisherSelected(true);
    setViolationAlert(null);
    setArBannerText('आग की जड़ पर क्रॉसहेयर सेट करें (Aim at Flame Base)');
    speakText('पिन निकल गई है। अब आग की जड़ पर निशाना लगाएं!', 'Pin pulled. Aim nozzle at base of fire.');
  };

  // Step 3: Aim Base
  const handleAimBase = () => {
    if (!pinPulled) {
      setViolationAlert('पहले सेफ्टी पिन निकालें (Pull Pin first)!');
      return;
    }
    setAimLocked(true);
    setViolationAlert(null);
    setArBannerText('निशाना लॉक! अब CO2 स्प्रे करें (Press Spray CO2)');
    speakText('निशाना लॉक हुआ। अब CO2 स्प्रे करें!', 'Target locked at base. Squeeze lever to spray CO2.');
  };

  // Step 4: Spray CO2 (Dynamically extinguishes fire & clears toxic gas levels)
  const handleSprayCo2 = () => {
    if (!powerIsolated) {
      setViolationAlert('⚠️ जानलेवा खतरा: 440V चालू होने पर स्प्रे न करें!');
      return;
    }
    if (!pinPulled) {
      setViolationAlert('सेफ्टी पिन अभी लॉक है!');
      return;
    }
    if (!aimLocked) {
      setViolationAlert('पहले आग की जड़ पर निशाना लगाएं!');
      return;
    }

    setIsSpraying(true);
    let current = firePercentage;
    const interval = setInterval(() => {
      current = Math.max(0, current - 25);
      setFirePercentage(current);
      setAmbientTemp(prev => Math.max(24, prev - 8));

      // Dynamic Gas Telemetry clearing as combustion terminates & ventilation restores
      setCoPpm(prev => Math.max(14, prev - 90));
      setH2sPpm(prev => parseFloat(Math.max(0.4, prev - 3.6).toFixed(1)));
      setO2Percent(prev => parseFloat(Math.min(20.9, prev + 0.88).toFixed(1)));
      setCh4Percent(prev => parseFloat(Math.max(0.08, prev - 0.32).toFixed(2)));

      if (current === 0) {
        clearInterval(interval);
        setIsSpraying(false);
        setArBannerText('आग बुझ गई! गैस स्तर सुरक्षित सीमा में (Atmosphere Safe)');
        speakText('शाबाश! आग पूरी तरह बुझ गई है और गैस स्तर सामान्य हो गया है। अब निकास B की ओर निकलें।', 'Fire extinguished. Atmosphere safe. Evacuate via Exit B.');
      }
    }, 450);
  };

  // Bump Test Simulation: Tests sniffer sensor response and threshold alarms
  const handleBumpTest = () => {
    setIsBumpTesting(true);
    speakText('गैस स्निफर बंप टेस्ट शुरू हो रहा है।', 'Initiating 4-gas sniffer bump test.');
    // Temporarily trigger full-scale check
    const originalO2 = o2Percent;
    const originalCo = coPpm;
    const originalH2s = h2sPpm;
    const originalCh4 = ch4Percent;

    setO2Percent(16.5);
    setCoPpm(250);
    setH2sPpm(25.0);
    setCh4Percent(2.0);

    setTimeout(() => {
      setO2Percent(originalO2);
      setCoPpm(originalCo);
      setH2sPpm(originalH2s);
      setCh4Percent(originalCh4);
      setIsBumpTesting(false);
      speakText('बंप टेस्ट सफल। सभी सेंसर्स कैलिब्रेटेड हैं।', 'Bump test complete. All 4 sensors calibrated.');
    }, 2000);
  };

  // Telemetry Triggers
  const handleToggleAlarm = () => {
    const next = !alarmSounded;
    setAlarmSounded(next);
    if (next) {
      speakText('इमरजेंसी अलार्म सक्रिय हो गया है।', 'Emergency siren activated.');
    }
  };

  const handleSelectExitB = () => {
    setChosenExit('EXIT_B');
    setViolationAlert(null);
    speakText('सुरक्षित निकास B (लाइफ़लाइन) चुना गया।', 'Safe Exit B lifeline selected.');
  };

  const handleSelectExitA = () => {
    setChosenExit('EXIT_A');
    setViolationAlert(`❌ चेतावनी: Exit A ब्लॉक है (CO ${coPpm} ppm, H2S ${h2sPpm} ppm धुआं)! तुरंत Exit B चुनें!`);
    speakText('खतरा! Exit A ब्लॉक है, वहां न जाएं!', 'Danger! Exit A is blocked with toxic carbon monoxide and hydrogen sulfide!');
  };

  const handleResetDrill = () => {
    setPowerIsolated(false);
    setPinPulled(false);
    setAimLocked(false);
    setIsSpraying(false);
    setFirePercentage(100);
    setAlarmSounded(false);
    setCo2ExtinguisherSelected(false);
    setChosenExit('NONE');
    setAmbientTemp(58);
    setO2Percent(17.4);
    setCoPpm(380);
    setH2sPpm(14.8);
    setCh4Percent(1.35);
    setViolationAlert(null);
    setArBannerText('पहले मेन पावर बंद करें (Isolate Power Source)');
  };

  const handleFinish = () => {
    if (onFinishAndEvaluate) {
      onFinishAndEvaluate({
        powerIsolated,
        pinPulled,
        aimLocked,
        firePercentage,
        alarmSounded,
        chosenExit,
        passRuleFollowed: powerIsolated && pinPulled && aimLocked && firePercentage === 0
      });
    } else if (onBackToEngine) {
      onBackToEngine();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased max-w-md mx-auto relative shadow-2xl pb-24">
      {/* -------------------------------------------------------------
          TOP BAR & SCENARIO METADATA
          ------------------------------------------------------------- */}
      <div className="px-4 pt-3 space-y-3">
        <header className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-xs">
              <Flame className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-slate-900 leading-tight">Live Spatial AR Drill</h1>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.2 rounded border border-amber-300">
                  PASS PROTOCOL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {workerName} • ID: {workerId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setAudioMuted(!audioMuted)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
                audioMuted
                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
              title={audioMuted ? 'Unmute Audio Guidance' : 'Mute Audio Guidance'}
            >
              {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-700" />}
            </button>
            <button
              onClick={handleResetDrill}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
              title="Reset Drill"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* -------------------------------------------------------------
            1. ACTUAL HARDWARE CAMERA INTEGRATION CONTAINER
            ------------------------------------------------------------- */}
        <div className="relative w-full h-[400px] sm:h-[450px] rounded-2xl overflow-hidden bg-black border border-slate-300 shadow-md">
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Camera Permission Denied / Error Fallback Overlay */}
          {cameraError && (
            <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
                <Camera className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-100">Camera Access Required for AR</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Allow camera permissions in browser to project the interactive spatial fire hazard reticle.
                </p>
              </div>
              <button
                onClick={startCamera}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Allow Camera Permission</span>
              </button>
            </div>
          )}

          {/* -------------------------------------------------------------
              2. REAL-TIME AR FIRE GUIDANCE & 4-GAS SNIFFER OVERLAY (INSIDE CAMERA VIEW)
              ------------------------------------------------------------- */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2.5 z-10">
            {/* Top HUD: Flame Gauge & Audio/Text Hindi Guidance Banner */}
            <div className="space-y-1.5 pointer-events-auto">
              {/* Audio/Text Banner */}
              <div className="bg-slate-950/85 backdrop-blur-md border border-amber-400/50 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-amber-300 shadow-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <span className="text-[11px] font-bold truncate tracking-wide">
                    {arBannerText}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0 uppercase ml-1">
                  DGMS PASS
                </span>
              </div>

              {/* Flame Intensity Gauge */}
              <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1.5 space-y-1 shadow-md">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Flame Gauge</span>
                  </span>
                  <span
                    className={`font-mono font-black ${
                      firePercentage > 50
                        ? 'text-red-400'
                        : firePercentage > 0
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {firePercentage}% {firePercentage === 0 ? '(EXTINGUISHED)' : ''}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      firePercentage > 50
                        ? 'bg-gradient-to-r from-red-600 to-amber-500'
                        : firePercentage > 0
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${firePercentage}%` }}
                  />
                </div>
              </div>

              {/* REAL-TIME 'GAS THRESHOLD' 4-GAS SNIFFER VISUALIZATION IN AR CAMERA VIEW */}
              <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/90 rounded-xl p-2 space-y-1.5 shadow-xl">
                {/* Sniffer Top Status Bar */}
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <Activity className={`w-3.5 h-3.5 ${hasGasThresholdViolation ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
                    <span className="font-bold text-slate-200 tracking-wider uppercase text-[10px]">
                      DGMS 4-Gas Sniffer
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[9px] bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      0.5L/m
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {hasGasThresholdViolation ? (
                      <span className="bg-red-500/20 text-red-300 border border-red-500/70 font-black text-[9px] px-1.5 py-0.5 rounded animate-pulse">
                        ⚠️ THRESHOLD ALARM
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 font-black text-[9px] px-1.5 py-0.5 rounded">
                        ✓ ATMOSPHERE SAFE
                      </span>
                    )}
                  </div>
                </div>

                {/* 4-Gas Dynamic Sensor Grid: O2, CO, H2S, CH4 */}
                <div className="grid grid-cols-4 gap-1 text-center font-mono">
                  {/* 1. Oxygen (O2) */}
                  <div
                    className={`p-1 rounded-lg border flex flex-col justify-between transition-colors ${
                      isO2Deficient
                        ? 'bg-red-950/80 border-red-500 text-red-200'
                        : 'bg-slate-900/80 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-sans text-slate-400 font-bold px-0.5">
                      <span>O₂</span>
                      <span className="text-[8px] font-mono">&gt;19.5%</span>
                    </div>
                    <div className="text-xs font-black my-0.5 tracking-tight">
                      {o2Percent.toFixed(1)}%
                    </div>
                    {/* Visual Threshold Bar */}
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isO2Deficient ? 'bg-red-500' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, (o2Percent / 22) * 100)}%` }}
                      />
                    </div>
                    <div
                      className={`text-[8px] font-bold mt-0.5 truncate uppercase ${
                        isO2Deficient ? 'text-red-400 animate-pulse font-black' : 'text-emerald-400'
                      }`}
                    >
                      {isO2Deficient ? 'DEFICIENT' : 'NORMAL'}
                    </div>
                  </div>

                  {/* 2. Carbon Monoxide (CO) */}
                  <div
                    className={`p-1 rounded-lg border flex flex-col justify-between transition-colors ${
                      isCoToxic
                        ? 'bg-red-950/80 border-red-500 text-red-200'
                        : 'bg-slate-900/80 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-sans text-slate-400 font-bold px-0.5">
                      <span>CO</span>
                      <span className="text-[8px] font-mono">&lt;50ppm</span>
                    </div>
                    <div className="text-xs font-black my-0.5 tracking-tight">
                      {Math.round(coPpm)} <span className="text-[8px] font-normal">ppm</span>
                    </div>
                    {/* Visual Threshold Bar */}
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCoToxic ? 'bg-red-500' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, (coPpm / 400) * 100)}%` }}
                      />
                    </div>
                    <div
                      className={`text-[8px] font-bold mt-0.5 truncate uppercase ${
                        isCoToxic ? 'text-red-400 animate-pulse font-black' : 'text-emerald-400'
                      }`}
                    >
                      {isCoToxic ? 'TOXIC' : 'SAFE'}
                    </div>
                  </div>

                  {/* 3. Hydrogen Sulfide (H2S) */}
                  <div
                    className={`p-1 rounded-lg border flex flex-col justify-between transition-colors ${
                      isH2sLethal
                        ? 'bg-red-950/80 border-red-500 text-red-200'
                        : 'bg-slate-900/80 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-sans text-slate-400 font-bold px-0.5">
                      <span>H₂S</span>
                      <span className="text-[8px] font-mono">&lt;10ppm</span>
                    </div>
                    <div className="text-xs font-black my-0.5 tracking-tight">
                      {h2sPpm.toFixed(1)} <span className="text-[8px] font-normal">ppm</span>
                    </div>
                    {/* Visual Threshold Bar */}
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isH2sLethal ? 'bg-red-500' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, (h2sPpm / 20) * 100)}%` }}
                      />
                    </div>
                    <div
                      className={`text-[8px] font-bold mt-0.5 truncate uppercase ${
                        isH2sLethal ? 'text-red-400 animate-pulse font-black' : 'text-emerald-400'
                      }`}
                    >
                      {isH2sLethal ? 'LETHAL' : 'CLEAR'}
                    </div>
                  </div>

                  {/* 4. Methane (CH4) */}
                  <div
                    className={`p-1 rounded-lg border flex flex-col justify-between transition-colors ${
                      isCh4Hazard
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                        : 'bg-slate-900/80 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-sans text-slate-400 font-bold px-0.5">
                      <span>CH₄</span>
                      <span className="text-[8px] font-mono">&lt;1.25%</span>
                    </div>
                    <div className="text-xs font-black my-0.5 tracking-tight">
                      {ch4Percent.toFixed(2)}%
                    </div>
                    {/* Visual Threshold Bar */}
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCh4Hazard ? 'bg-amber-500' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, (ch4Percent / 2.5) * 100)}%` }}
                      />
                    </div>
                    <div
                      className={`text-[8px] font-bold mt-0.5 truncate uppercase ${
                        isCh4Hazard ? 'text-amber-400 font-black' : 'text-emerald-400'
                      }`}
                    >
                      {isCh4Hazard ? 'LEL HIGH' : 'SAFE'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Centered Simulated Animated Fire / Target Reticle */}
            <div className="relative flex-1 flex items-center justify-center pointer-events-auto py-2">
              {firePercentage > 0 ? (
                <div className="relative flex flex-col items-center">
                  {/* Smoke Particles */}
                  <div className="absolute -top-6 flex gap-1.5 opacity-60">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 blur-[2px] animate-pulse" />
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-400 blur-[2px] animate-pulse delay-75" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 blur-[2px] animate-pulse delay-150" />
                  </div>

                  {/* Scaled Flame Graphic */}
                  <div
                    className="relative transition-all duration-300 flex items-end justify-center"
                    style={{
                      transform: `scale(${Math.max(0.35, firePercentage / 100)})`,
                      transformOrigin: 'bottom center'
                    }}
                  >
                    <Flame className="w-20 h-20 text-amber-500 fill-amber-500 animate-bounce drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                    <Flame className="w-14 h-14 text-red-600 fill-red-600 absolute bottom-0 -left-2 animate-pulse" />
                    <Flame className="w-10 h-10 text-yellow-300 fill-yellow-300 absolute bottom-1 left-4" />
                  </div>

                  {/* Aiming Reticle Button on Fire Base */}
                  <button
                    onClick={handleAimBase}
                    className={`mt-1 px-3 py-1 rounded-full text-[10px] font-bold border transition flex items-center gap-1.5 backdrop-blur-md ${
                      aimLocked
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black'
                        : pinPulled
                        ? 'bg-amber-500/90 text-slate-950 border-amber-300 animate-pulse shadow-md font-bold'
                        : 'bg-black/80 text-slate-300 border-slate-600 opacity-80'
                    }`}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>{aimLocked ? 'AIM BASE LOCKED ✓' : '🎯 AIM AT BASE'}</span>
                  </button>
                </div>
              ) : (
                /* Fire Suppressed Success Overlay */
                <div className="bg-emerald-950/85 border border-emerald-400 rounded-2xl px-5 py-3 text-center text-white backdrop-blur-md shadow-2xl animate-in zoom-in-95">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-1 animate-bounce" />
                  <span className="text-xs font-black text-emerald-300 tracking-wider uppercase block">
                    Fire Extinguished (0%)
                  </span>
                  <span className="text-[10px] text-emerald-100 font-medium">
                    CO2 Blanket Smother Complete • Gas Levels Normal
                  </span>
                </div>
              )}

              {/* Fog/Spray effect when actively spraying */}
              {isSpraying && (
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] rounded-2xl flex items-center justify-center pointer-events-none animate-pulse">
                  <Wind className="w-16 h-16 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* 4 Procedural Guidance Action Pills (Floating inside Camera View) */}
            <div className="pointer-events-auto pt-1 space-y-1.5">
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                {/* 1. Power Off */}
                <button
                  onClick={handlePowerOff}
                  disabled={powerIsolated}
                  className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 font-bold transition shadow-sm ${
                    powerIsolated
                      ? 'bg-emerald-600/90 text-white border-emerald-400'
                      : 'bg-slate-950/85 hover:bg-slate-900 text-amber-300 border-amber-400 animate-pulse'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span className="truncate w-full">1. Power Off</span>
                </button>

                {/* 2. Pull Pin */}
                <button
                  onClick={handlePullPin}
                  disabled={pinPulled}
                  className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 font-bold transition shadow-sm ${
                    pinPulled
                      ? 'bg-emerald-600/90 text-white border-emerald-400'
                      : powerIsolated
                      ? 'bg-slate-950/85 hover:bg-slate-900 text-amber-300 border-amber-400 animate-pulse'
                      : 'bg-slate-900/60 text-slate-500 border-slate-700'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="truncate w-full">2. Pull Pin</span>
                </button>

                {/* 3. Aim at Base */}
                <button
                  onClick={handleAimBase}
                  disabled={aimLocked || !pinPulled}
                  className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 font-bold transition shadow-sm ${
                    aimLocked
                      ? 'bg-emerald-600/90 text-white border-emerald-400'
                      : pinPulled
                      ? 'bg-slate-950/85 hover:bg-slate-900 text-amber-300 border-amber-400 animate-pulse'
                      : 'bg-slate-900/60 text-slate-500 border-slate-700'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span className="truncate w-full">3. Aim Base</span>
                </button>

                {/* 4. Spray CO2 */}
                <button
                  onClick={handleSprayCo2}
                  disabled={!aimLocked || firePercentage === 0}
                  className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 font-bold transition shadow-sm ${
                    firePercentage === 0
                      ? 'bg-emerald-600/90 text-white border-emerald-400'
                      : aimLocked
                      ? 'bg-sky-500 hover:bg-sky-600 text-slate-950 border-sky-300 animate-pulse'
                      : 'bg-slate-900/60 text-slate-500 border-slate-700'
                  }`}
                >
                  <Wind className="w-3.5 h-3.5" />
                  <span className="truncate w-full">4. Spray CO2</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Violation Alert Notification (if any) */}
        {violationAlert && (
          <div className="bg-red-50 border border-red-300 text-red-800 rounded-xl p-3 text-xs font-semibold flex items-start gap-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-snug">{violationAlert}</div>
          </div>
        )}

        {/* -------------------------------------------------------------
            3. TELEMETRY ACTION TRIGGERS (LIGHT THEME)
            ------------------------------------------------------------- */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black tracking-wider uppercase text-slate-600">
              Drill Telemetry Actions
            </h2>
            <span className="text-[11px] font-mono text-slate-500">CMR 2017 Reg 139</span>
          </div>

          {/* 4 Telemetry Triggers */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* [Sound Alarm] */}
            <button
              onClick={handleToggleAlarm}
              className={`p-3 rounded-xl border font-bold flex items-center gap-2.5 transition text-left ${
                alarmSounded
                  ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs'
                  : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  alarmSounded ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-500 uppercase">Alert siren</div>
                <div className="truncate">{alarmSounded ? 'Siren Active (105dB)' : 'Sound Alarm'}</div>
              </div>
            </button>

            {/* [CO2 Extinguisher] */}
            <button
              onClick={() => {
                setCo2ExtinguisherSelected(!co2ExtinguisherSelected);
                speakText('CO2 अग्निशामक चुना गया।', 'CO2 extinguisher selected.');
              }}
              className={`p-3 rounded-xl border font-bold flex items-center gap-2.5 transition text-left ${
                co2ExtinguisherSelected
                  ? 'bg-sky-50 text-sky-900 border-sky-300 shadow-xs'
                  : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  co2ExtinguisherSelected ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Flame className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-500 uppercase">Class B/C Clean</div>
                <div className="truncate">CO2 Extinguisher</div>
              </div>
            </button>

            {/* [Exit B (Safe Lifeline)] */}
            <button
              onClick={handleSelectExitB}
              className={`p-3 rounded-xl border font-bold flex items-center gap-2.5 transition text-left ${
                chosenExit === 'EXIT_B'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-400 shadow-xs'
                  : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  chosenExit === 'EXIT_B' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-emerald-700 uppercase font-black">Recommended</div>
                <div className="truncate">Exit B (Safe Lifeline)</div>
              </div>
            </button>

            {/* [Exit A (Blocked Danger)] */}
            <button
              onClick={handleSelectExitA}
              className={`p-3 rounded-xl border font-bold flex items-center gap-2.5 transition text-left ${
                chosenExit === 'EXIT_A'
                  ? 'bg-red-50 text-red-900 border-red-400 shadow-xs'
                  : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  chosenExit === 'EXIT_A' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-red-600 uppercase font-black">Blocked Hazard</div>
                <div className="truncate">Exit A (Danger)</div>
              </div>
            </button>
          </div>

          {/* 4-Gas Sniffer Environmental & Permissible Limit Telemetry Card */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">4-Gas Atmospheric Sniffer Telemetry</span>
              </div>
              <button
                onClick={handleBumpTest}
                disabled={isBumpTesting}
                className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg px-2 py-0.5 flex items-center gap-1 transition"
                title="Run sensor calibration & bump check"
              >
                <RefreshCw className={`w-3 h-3 ${isBumpTesting ? 'animate-spin' : ''}`} />
                <span>{isBumpTesting ? 'Testing...' : 'Bump Test'}</span>
              </button>
            </div>

            {/* 4-Gas Metric Strip with Regulatory Thresholds */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {/* O2 Cell */}
              <div className={`p-2.5 rounded-xl border ${isO2Deficient ? 'bg-red-50 border-red-300' : 'bg-[#F8FAFC] border-slate-200'}`}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-700">Oxygen (O₂)</span>
                  <span className="text-[9px] font-mono text-slate-500">Min 19.5%</span>
                </div>
                <div className={`text-base font-black font-mono my-0.5 ${isO2Deficient ? 'text-red-600' : 'text-slate-900'}`}>
                  {o2Percent.toFixed(1)}%
                </div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-slate-500">OSHA Safe</span>
                  <span className={`font-bold ${isO2Deficient ? 'text-red-700' : 'text-emerald-700'}`}>
                    {isO2Deficient ? 'HYPOXIA' : 'NORMAL'}
                  </span>
                </div>
              </div>

              {/* CO Cell */}
              <div className={`p-2.5 rounded-xl border ${isCoToxic ? 'bg-red-50 border-red-300' : 'bg-[#F8FAFC] border-slate-200'}`}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-700">Carbon Monoxide (CO)</span>
                  <span className="text-[9px] font-mono text-slate-500">Max 50ppm</span>
                </div>
                <div className={`text-base font-black font-mono my-0.5 ${isCoToxic ? 'text-red-600' : 'text-slate-900'}`}>
                  {Math.round(coPpm)} <span className="text-[10px] font-normal">ppm</span>
                </div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-slate-500">TWA 25ppm</span>
                  <span className={`font-bold ${isCoToxic ? 'text-red-700' : 'text-emerald-700'}`}>
                    {isCoToxic ? 'CRITICAL' : 'SAFE'}
                  </span>
                </div>
              </div>

              {/* H2S Cell */}
              <div className={`p-2.5 rounded-xl border ${isH2sLethal ? 'bg-red-50 border-red-300' : 'bg-[#F8FAFC] border-slate-200'}`}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-700">Hydrogen Sulfide (H₂S)</span>
                  <span className="text-[9px] font-mono text-slate-500">Max 10ppm</span>
                </div>
                <div className={`text-base font-black font-mono my-0.5 ${isH2sLethal ? 'text-red-600' : 'text-slate-900'}`}>
                  {h2sPpm.toFixed(1)} <span className="text-[10px] font-normal">ppm</span>
                </div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-slate-500">STEL 10ppm</span>
                  <span className={`font-bold ${isH2sLethal ? 'text-red-700' : 'text-emerald-700'}`}>
                    {isH2sLethal ? 'TOXIC' : 'CLEAR'}
                  </span>
                </div>
              </div>

              {/* CH4 Cell */}
              <div className={`p-2.5 rounded-xl border ${isCh4Hazard ? 'bg-amber-50 border-amber-300' : 'bg-[#F8FAFC] border-slate-200'}`}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-700">Methane (CH₄)</span>
                  <span className="text-[9px] font-mono text-slate-500">Max 1.25%</span>
                </div>
                <div className={`text-base font-black font-mono my-0.5 ${isCh4Hazard ? 'text-amber-700' : 'text-slate-900'}`}>
                  {ch4Percent.toFixed(2)}%
                </div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-slate-500">DGMS Reg 139</span>
                  <span className={`font-bold ${isCh4Hazard ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {isCh4Hazard ? 'WARN LEL' : 'SAFE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Environmental Baseline Strip */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <div className="bg-[#F8FAFC] p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-sans">Ambient Temp</span>
                <span className="font-bold text-slate-800">{ambientTemp}°C</span>
              </div>
              <div className="bg-[#F8FAFC] p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-sans">440V Breaker</span>
                <span className={`font-bold ${powerIsolated ? 'text-emerald-700' : 'text-red-600'}`}>
                  {powerIsolated ? 'ISOLATED' : 'LIVE'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------
            4. FINISH & EVALUATE IN ENGINE CTA
            ------------------------------------------------------------- */}
        <button
          onClick={handleFinish}
          className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 text-sm tracking-wide shadow-md transition"
        >
          <span>FINISH & EVALUATE IN ENGINE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ARDrillScreen;
