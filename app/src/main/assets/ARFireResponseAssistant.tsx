import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Zap,
  ShieldAlert,
  Volume2,
  VolumeX,
  Camera,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Award,
  ChevronRight,
  Crosshair,
  Power,
  Lock,
  Wind,
  ArrowLeft,
  Sparkles,
  Radio
} from 'lucide-react';

export type Language = 'en' | 'hi' | 'sat';

interface ARFireResponseAssistantProps {
  language: Language;
  onBack: () => void;
  onProceedToAssessment: () => void;
}

export const ARFireResponseAssistant: React.FC<ARFireResponseAssistantProps> = ({
  language,
  onBack,
  onProceedToAssessment
}) => {
  // 1. Camera & View Mode States
  const [viewMode, setViewMode] = useState<'AR_SPATIAL' | '2D_FALLBACK'>('AR_SPATIAL');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 2. Procedural Step State Machine
  // Steps: 1: POWER OFF -> 2: REMOVE PIN -> 3: AIM AT BASE -> 4: SPRAY AGENT -> 5: EVACUATE/SAFE
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [powerIsolated, setPowerIsolated] = useState<boolean>(false);
  const [pinRemoved, setPinRemoved] = useState<boolean>(false);
  const [targetLocked, setTargetLocked] = useState<boolean>(false);
  const [isSpraying, setIsSpraying] = useState<boolean>(false);
  const [fireExtinguished, setFireExtinguished] = useState<boolean>(false);

  // 3. Telemetry & Simulation Metrics
  const [fireIntensity, setFireIntensity] = useState<number>(100);
  const [extinguisherPressure, setExtinguisherPressure] = useState<number>(100);
  const [ambientTemp, setAmbientTemp] = useState<number>(58); // Celsius
  const [coPpm, setCoPpm] = useState<number>(380); // ppm
  const [selectedAgent, setSelectedAgent] = useState<'CO2' | 'WATER'>('CO2');
  const [electricalRiskAlert, setElectricalRiskAlert] = useState<string | null>(null);

  // 4. Audio Guidance State
  const [audioMuted, setAudioMuted] = useState<boolean>(false);

  // Initialize Camera stream when in AR_SPATIAL mode
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (viewMode === 'AR_SPATIAL') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
          })
          .then(mediaStream => {
            stream = mediaStream;
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
              videoRef.current.play().catch(() => {});
            }
            setCameraActive(true);
            setCameraError(null);
          })
          .catch(err => {
            console.warn('Camera access error, switching to 2D Fallback:', err);
            setCameraError('Camera unavailable. Activated 2D Photorealistic Fallback.');
            setViewMode('2D_FALLBACK');
            setCameraActive(false);
          });
      } else {
        setViewMode('2D_FALLBACK');
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [viewMode]);

  // Audio prompt speaker using Web Speech API or visual audio pill
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

  // Step 1: Isolate Electrical Power
  const handleTogglePower = () => {
    if (!powerIsolated) {
      setPowerIsolated(true);
      setElectricalRiskAlert(null);
      setCurrentStep(2);
      speakGuidance(
        'बिजली बंद हो गई है। अब अग्निशामक की पिन निकालें!',
        'ᱵᱤᱡᱞᱤ ᱵᱚᱸᱫᱽ ᱮᱱᱟ᱾ ᱱᱤᱛᱚᱜ ᱯᱤᱱ ᱚᱨ ᱢᱮ!',
        'Power isolated successfully. Pull the extinguisher safety pin now.'
      );
    }
  };

  // Step 2: Remove Extinguisher Safety Pin
  const handleRemovePin = () => {
    if (!powerIsolated) {
      triggerElectricalViolation();
      return;
    }
    setPinRemoved(true);
    setCurrentStep(3);
    speakGuidance(
      'पिन निकल गई। अब आग की जड़ पर निशाना लगाएं!',
      'ᱯᱤᱱ ᱚᱰᱚᱠ ᱮᱱᱟ᱾ ᱥᱮᱸᱜᱮᱞ ᱵᱩᱰᱟᱹ ᱨᱮ ᱱᱤᱥᱟᱱᱟ ᱢᱮ!',
      'Safety pin removed. Aim the nozzle at the base of the fire.'
    );
  };

  // Step 3: Lock Targeting Reticle onto Flame Base
  const handleLockTarget = () => {
    if (!pinRemoved) return;
    setTargetLocked(true);
    setCurrentStep(4);
    speakGuidance(
      'निशाना लॉक हुआ। अब लीवर दबाकर CO2 गैस स्प्रे करें!',
      'ᱱᱤᱥᱟᱱᱟ ᱞᱚᱠ ᱮᱱᱟ᱾ ᱱᱤᱛᱚᱜ ᱞᱤᱵᱷᱟᱨ ᱫᱟᱵᱟᱣ ᱠᱟᱛᱮ ᱜᱮᱥ ᱥᱯᱨᱮ ᱢᱮ!',
      'Target locked at flame base. Squeeze discharge lever to spray CO2.'
    );
  };

  // Step 4: Spray Extinguishing Agent (CO2 or Water check)
  const handleStartSpray = () => {
    if (selectedAgent === 'WATER' && !powerIsolated) {
      triggerElectricalViolation();
      return;
    }
    if (!pinRemoved) {
      alert('Safety pin is still locked! Pull pin first.');
      return;
    }

    setIsSpraying(true);

    const interval = setInterval(() => {
      setFireIntensity(prev => {
        const next = Math.max(0, prev - 15);
        if (next === 0) {
          clearInterval(interval);
          setIsSpraying(false);
          setFireExtinguished(true);
          setCurrentStep(5);
          speakGuidance(
            'शाबाश! आग बुझ गई है। अब 3 मीटर पीछे हटें और सुरक्षित निकास B की ओर निकलें।',
            'ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ! ᱥᱮᱸᱜᱮᱞ ᱤᱬᱤᱡ ᱮᱱᱟ᱾ ᱥᱩᱨᱚᱠᱷᱭᱟᱹ Exit B ᱥᱮᱫ ᱪᱟᱞᱟᱜ ᱢᱮ᱾',
            'Fire suppressed successfully. Stand clear and evacuate via safe Exit B.'
          );
        }
        return next;
      });

      setExtinguisherPressure(prev => Math.max(10, prev - 8));
      setAmbientTemp(prev => Math.max(24, prev - 4));
      setCoPpm(prev => Math.max(15, prev - 35));
    }, 400);
  };

  const handleStopSpray = () => {
    setIsSpraying(false);
  };

  const triggerElectricalViolation = () => {
    setElectricalRiskAlert(
      language === 'hi'
        ? 'गंभीर चेतावनी: 440V बिजली लाइन चालू है! पहले पावर कट करें, वरना करंट लग सकता है!'
        : language === 'sat'
        ? 'ᱵᱚᱛᱚᱨ: 440V ᱵᱤᱡᱞᱤ ᱪᱟᱹᱞᱩ ᱢᱮᱱᱟᱜᱼᱟ! ᱯᱩᱭᱞᱩ ᱵᱚᱸᱫᱽ ᱢᱮ!'
        : 'CRITICAL VIOLATION: 440V Energized Electrical Hazard! Isolate power first before deploying agent.'
    );
    speakGuidance(
      'रुको! बिजली चालू है, पहले पावर कट करें!',
      'ᱛᱤᱸᱜᱩᱱ ᱢᱮ! ᱵᱤᱡᱞᱤ ᱪᱟᱹᱞᱩ ᱢᱮᱱᱟᱜᱼᱟ, ᱯᱩᱭᱞᱩ ᱵᱚᱸᱫᱽ ᱢᱮ!',
      'Stop! Electrical shock risk! Cut power first!'
    );
  };

  const handleResetDrill = () => {
    setCurrentStep(1);
    setPowerIsolated(false);
    setPinRemoved(false);
    setTargetLocked(false);
    setIsSpraying(false);
    setFireExtinguished(false);
    setFireIntensity(100);
    setExtinguisherPressure(100);
    setAmbientTemp(58);
    setCoPpm(380);
    setElectricalRiskAlert(null);
  };

  return (
    <div className="flex flex-col h-full min-h-[640px] bg-[#0F172A] text-white relative overflow-hidden select-none">
      {/* ====================================================
          1. LIVE CAMERA FEED OR 2D PHOTOREALISTIC FALLBACK
          ==================================================== */}
      <div className="absolute inset-0 z-0">
        {viewMode === 'AR_SPATIAL' && cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          /* 2D Fallback: Photorealistic Industrial Underground Switchgear Room */
          <div className="w-full h-full relative bg-radial from-slate-800 via-slate-900 to-black flex items-center justify-center">
            {/* Background Mine Drift Gallery Art */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* Industrial Electrical Cabinet Simulation View */}
            <div className="relative z-10 w-72 h-80 bg-slate-950/80 rounded-2xl border-2 border-slate-700 p-4 shadow-2xl flex flex-col justify-between backdrop-blur-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  PANEL 440V #DR-02
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${powerIsolated ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-red-950 text-red-400 border border-red-700'}`}>
                  {powerIsolated ? 'BREAKER TRIPPED (ISOLATED)' : 'LIVE 440V (ENERGIZED)'}
                </span>
              </div>

              {/* Simulated Fire Flames */}
              <div className="relative h-44 flex items-end justify-center">
                {fireIntensity > 0 ? (
                  <div className="relative flex flex-col items-center">
                    {/* Animated Smoke Particles */}
                    <div className="absolute -top-12 flex gap-1 opacity-70 animate-pulse">
                      <span className="w-3 h-3 rounded-full bg-slate-400 blur-xs" />
                      <span className="w-4 h-4 rounded-full bg-slate-500 blur-xs" />
                      <span className="w-3 h-3 rounded-full bg-slate-400 blur-xs" />
                    </div>

                    {/* Flames */}
                    <div
                      className="relative transition-all duration-300 flex items-end"
                      style={{
                        transform: `scale(${fireIntensity / 100})`,
                        transformOrigin: 'bottom center'
                      }}
                    >
                      <Flame className="w-28 h-28 text-amber-500 fill-amber-500 animate-bounce" />
                      <Flame className="w-20 h-20 text-red-600 fill-red-600 absolute bottom-0 -left-2 animate-pulse" />
                      <Flame className="w-16 h-16 text-yellow-300 fill-yellow-300 absolute bottom-1 left-6" />
                    </div>

                    {/* Targeting Base Reticle */}
                    <button
                      onClick={handleLockTarget}
                      className={`absolute -bottom-3 px-3 py-1 rounded-full text-[10px] font-bold border transition flex items-center gap-1.5 ${
                        targetLocked
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                          : 'bg-black/80 text-amber-400 border-amber-400 hover:bg-amber-400 hover:text-black animate-pulse'
                      }`}
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>{targetLocked ? 'AIM BASE LOCKED ✓' : 'TAP HERE: AIM AT BASE'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-in zoom-in" />
                    <span className="text-xs font-black text-emerald-400 mt-2 block tracking-wider uppercase">
                      Fire Suppressed
                    </span>
                  </div>
                )}
              </div>

              {/* CO2 Extinguisher Spray Fog Overlay */}
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

      {/* ====================================================
          2. TOP AR HUD BAR (CAMERA TOGGLE & AUDIO PILL)
          ==================================================== */}
      <div className="relative z-20 px-3 pt-3 flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="h-9 px-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit AR</span>
        </button>

        {/* Audio Guidance Pill */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setAudioMuted(!audioMuted);
              if (audioMuted) {
                speakGuidance(
                  'सुरक्षा ए.आर. लाइव फायर ड्रिल सक्रिय है। निर्देशों का पालन करें।',
                  'ᱥᱩᱨᱚᱠᱷᱭᱟ AR ᱞᱟᱭᱤᱵᱷ ᱥᱮᱸᱜᱮᱞ ᱰᱨᱤᱞ ᱪᱟᱹᱞᱩ ᱮᱱᱟ᱾',
                  'SurakshaAR real-time fire drill active. Follow procedural steps.'
                );
              }
            }}
            className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition backdrop-blur-md ${
              audioMuted
                ? 'bg-slate-900/80 text-slate-400 border-slate-700'
                : 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
            }`}
          >
            {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{audioMuted ? 'Muted' : 'Audio Guide'}</span>
          </button>

          {/* Mode Switcher: AR Spatial vs 2D Fallback */}
          <button
            onClick={() => setViewMode(viewMode === 'AR_SPATIAL' ? '2D_FALLBACK' : 'AR_SPATIAL')}
            className="h-9 px-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1 hover:text-white transition"
          >
            {viewMode === 'AR_SPATIAL' ? <Camera className="w-3.5 h-3.5 text-sky-400" /> : <Layers className="w-3.5 h-3.5 text-amber-400" />}
            <span>{viewMode === 'AR_SPATIAL' ? 'Spatial AR' : '2D Fallback'}</span>
          </button>
        </div>
      </div>

      {/* ====================================================
          3. REAL-TIME TELEMETRY & FIRE INTENSITY GAUGE
          ==================================================== */}
      <div className="relative z-20 px-3 pt-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5 text-slate-200">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Fire Hazard Intensity</span>
            </span>
            <span className={`font-mono font-black ${fireIntensity > 50 ? 'text-red-400' : fireIntensity > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {fireIntensity}% {fireIntensity === 0 && '(EXTINGUISHED)'}
            </span>
          </div>

          {/* Dynamic Progress Gauge */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                fireIntensity > 50 ? 'bg-red-500' : fireIntensity > 0 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${fireIntensity}%` }}
            />
          </div>

          {/* Environmental Telemetry Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-[10px] font-mono text-slate-400">
            <div>Ambient: <strong className="text-slate-200">{ambientTemp}°C</strong></div>
            <div>CO Gas: <strong className={coPpm > 100 ? 'text-red-400 font-bold' : 'text-slate-200'}>{coPpm} ppm</strong></div>
            <div>Pressure: <strong className="text-emerald-400">{extinguisherPressure}%</strong></div>
          </div>
        </div>
      </div>

      {/* ====================================================
          4. SAFETY VIOLATION WARNING BANNER (IF TRIGGERED)
          ==================================================== */}
      {electricalRiskAlert && (
        <div className="relative z-20 px-3 pt-2 animate-in slide-in-from-top duration-200">
          <div className="bg-red-950/95 border-2 border-red-500 text-red-100 rounded-2xl p-3 shadow-xl flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-snug">
              <div className="font-black text-red-300 uppercase tracking-wide">DGMS Safety Violation</div>
              <p className="mt-0.5 font-medium">{electricalRiskAlert}</p>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          5. PROCEDURAL ACTION STEPS PANEL (PASS PROTOCOL)
          ==================================================== */}
      <div className="mt-auto relative z-20 px-3 pb-3 space-y-2">
        {/* Step-by-Step Action Chips */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Procedural Action Guide (DGMS & PASS)</span>
            </span>
            <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              Step {currentStep} of 5
            </span>
          </div>

          {/* Interactive Step Triggers */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Step 1: POWER OFF Button */}
            <button
              onClick={handleTogglePower}
              disabled={powerIsolated}
              className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition text-left ${
                powerIsolated
                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                  : currentStep === 1
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-pulse'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              <Power className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-mono">Step 1</div>
                <div className="truncate text-xs">{powerIsolated ? 'Power Isolated ✓' : '1. Power Off 440V'}</div>
              </div>
            </button>

            {/* Step 2: REMOVE PIN Button */}
            <button
              onClick={handleRemovePin}
              disabled={pinRemoved}
              className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition text-left ${
                pinRemoved
                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                  : currentStep === 2
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-pulse'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
            >
              <Lock className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-mono">Step 2</div>
                <div className="truncate text-xs">{pinRemoved ? 'Pin Removed ✓' : '2. Pull Safety Pin'}</div>
              </div>
            </button>

            {/* Step 3: AIM AT BASE Button */}
            <button
              onClick={handleLockTarget}
              disabled={targetLocked || !pinRemoved}
              className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition text-left ${
                targetLocked
                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                  : currentStep === 3
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-pulse'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
            >
              <Crosshair className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-mono">Step 3</div>
                <div className="truncate text-xs">{targetLocked ? 'Base Locked ✓' : '3. Aim at Base'}</div>
              </div>
            </button>

            {/* Step 4: SPRAY AGENT Button */}
            <button
              onMouseDown={handleStartSpray}
              onMouseUp={handleStopSpray}
              onTouchStart={handleStartSpray}
              onTouchEnd={handleStopSpray}
              onClick={handleStartSpray}
              disabled={!targetLocked || fireExtinguished}
              className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition text-left select-none ${
                fireExtinguished
                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                  : currentStep === 4
                  ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md active:scale-95 animate-pulse'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
            >
              <Wind className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-mono">Step 4</div>
                <div className="truncate text-xs">{fireExtinguished ? 'Suppressed ✓' : isSpraying ? 'Spraying CO2...' : '4. Spray CO2 (Press)'}</div>
              </div>
            </button>
          </div>

          {/* Agent Selector: Safe CO2 vs Prohibited Water */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Extinguisher Agent:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  setSelectedAgent('CO2');
                  setElectricalRiskAlert(null);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border transition ${
                  selectedAgent === 'CO2'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                CO₂ Clean Agent (Safe)
              </button>
              <button
                onClick={() => {
                  setSelectedAgent('WATER');
                  triggerElectricalViolation();
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border transition ${
                  selectedAgent === 'WATER'
                    ? 'bg-red-500/20 text-red-300 border-red-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Water (Prohibited)
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================
            6. COMPLETION STATE & CERTIFICATE TRANSITION
            ==================================================== */}
        {fireExtinguished ? (
          <div className="bg-emerald-950/90 border border-emerald-500 rounded-2xl p-4 shadow-xl text-center space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Fire Suppressed Successfully!</span>
            </div>
            <p className="text-xs text-emerald-200">
              Candidate demonstrated compliance with DGMS CMR 2017 Reg 139 & OSHA PASS standards.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleResetDrill}
                className="flex-1 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Repeat Drill</span>
              </button>
              <button
                onClick={onProceedToAssessment}
                className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <span>Proceed to Certificate</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span>Minimum 2.5m safe distance required</span>
            <button
              onClick={handleResetDrill}
              className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Scenario</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARFireResponseAssistant;
