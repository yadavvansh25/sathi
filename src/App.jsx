import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// ============================================================================
// SurakshaAR: Industrial Safety & Bulletproof Real Camera AR View
// ============================================================================

const HAZARDS = [
  {
    id: 'electrical',
    title: 'Electrical',
    icon: '⚡',
    code: 'Class C',
    warning: '⚠️ Water Prohibited • Use CO2 Cylinder',
    steps: [
      { num: 1, title: 'Power Off Main Switch', sub: 'मुख्य पावर MCB स्विच बंद करें' },
      { num: 2, title: 'Pull CO2 Pin', sub: 'सिलेंडर की सेफ्टी पिन निकालें' },
      { num: 3, title: 'Maintain 2M & Aim Base', sub: '2 मीटर दूरी, आग की जड़ पर निशाना' },
      { num: 4, title: 'Discharge & Sweep', sub: 'हॉर्न छुए बिना CO2 चलाएं' }
    ]
  },
  {
    id: 'fuel',
    title: 'Fuel Fire',
    icon: '🛢️',
    code: 'Class B',
    warning: '⚠️ Direct Water Jet Prohibited • Use Foam/DCP',
    steps: [
      { num: 1, title: 'Sound Alarm Siren', sub: 'इमरजेंसी सायरन बजाएं' },
      { num: 2, title: 'Pull Foam Pin', sub: 'फोम एक्सटिंगुइशर पिन निकालें' },
      { num: 3, title: 'Blanket Liquid Surface', sub: 'ईंधन पर फोम की परत बिछाएं' },
      { num: 4, title: 'Isolate Fuel Valve', sub: 'मुख्य ईंधन वाल्व बंद करें' }
    ]
  },
  {
    id: 'gas',
    title: 'Gas Leak',
    icon: '☣️',
    code: 'Mining Air',
    warning: '⚠️ Extinguisher Prohibited • Evacuate Only',
    steps: [
      { num: 1, title: 'Check Gas Meter', sub: 'CH4 व CO स्तर जांचें' },
      { num: 2, title: 'Don SCBA Oxygen Mask', sub: 'ऑक्सीजन मास्क पहनें' },
      { num: 3, title: 'Verify Buddy Safety', sub: 'साथी वर्कर सुरक्षित करें' },
      { num: 4, title: 'Evacuate Upwind', sub: 'ताज़ी हवा की ओर निकलें' }
    ]
  },
  {
    id: 'chemical',
    title: 'Chemical',
    icon: '🧪',
    code: 'Corrosive',
    warning: '⚠️ Do Not Touch • Use Neutralizer Kit',
    steps: [
      { num: 1, title: 'Wear Chemical PPE', sub: 'दस्ताने व फेस शील्ड पहनें' },
      { num: 2, title: 'Cordon Danger Area', sub: 'डेंजर बैरिकेड टेप लगाएं' },
      { num: 3, title: 'Apply Absorbent Powder', sub: 'न्यूट्रलाइजिंग पाउडर डालें' },
      { num: 4, title: 'Start Exhaust Sweep', sub: 'एग्जॉस्ट वेंटिलेशन चालू करें' }
    ]
  }
];

export default function App() {
  const [selectedId, setSelectedId] = useState('electrical');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isStreamingLive, setIsStreamingLive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isResolved, setIsResolved] = useState(false);
  const [activeStream, setActiveStream] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const currentHazard = useMemo(() => {
    return HAZARDS.find((h) => h.id === selectedId) || HAZARDS[0];
  }, [selectedId]);

  const riskPercent = useMemo(() => {
    if (isResolved) return 0;
    return Math.max(0, 100 - stepIndex * 25);
  }, [stepIndex, isResolved]);

  // Clean and release camera tracks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.error('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    setActiveStream(null);
    setIsStreamingLive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // 1. HARDWARE CAMERA INITIALIZATION (LAPTOP / DESKTOP / MOBILE COMPLIANT)
  const startCamera = async () => {
    setCameraError(null);
    setIsStreamingLive(false);

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser.');
      return;
    }

    // Soft preference for environment camera (auto-fallbacks on laptops/MacBooks)
    const primaryConstraints = {
      video: {
        facingMode: 'environment', // Soft preference (never use exact: "environment")
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    let stream = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia(primaryConstraints);
    } catch (primaryErr) {
      console.warn('Environment camera constraint failed, retrying with flexible constraints:', primaryErr);
      try {
        // Universal fallback for webcams / MacBook FaceTime cameras
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      } catch (fallbackErr) {
        console.error('All camera attempts failed:', fallbackErr);
        setCameraError(
          'Camera access blocked or device unavailable. Please allow camera permissions in your browser.'
        );
        setCameraActive(false);
        return;
      }
    }

    if (stream) {
      streamRef.current = stream;
      setActiveStream(stream);
      // Switch view mode so <video> element mounts in DOM
      setCameraActive(true);
      setStepIndex(0);
      setIsResolved(false);
    }
  };

  // 2. BULLETPROOF STREAM ATTACH & AUTOPLAY EFFECT
  // Solves React mounting race condition where videoRef was null during getUserMedia
  useEffect(() => {
    if (!cameraActive || !activeStream) return;

    let isMounted = true;
    const video = videoRef.current;

    if (!video) return;

    // Attach stream directly
    if (video.srcObject !== activeStream) {
      video.srcObject = activeStream;
    }

    const handleLoadedMetadata = () => {
      if (!isMounted) return;
      video.play().catch((err) => {
        console.warn('Autoplay failed, awaiting user interaction:', err);
      });
    };

    const handlePlaying = () => {
      if (!isMounted) return;
      setIsStreamingLive(true);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('playing', handlePlaying);

    // Fallback: Check if video is playing after 800ms
    const fallbackTimer = setTimeout(() => {
      if (video && (video.paused || video.videoWidth === 0)) {
        console.log('Triggering fallback video play...');
        video.play().catch(() => {});
      }
    }, 800);

    // Secondary watchdog check after 2 seconds
    const watchdogTimer = setTimeout(() => {
      if (video && video.videoWidth > 0) {
        setIsStreamingLive(true);
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      clearTimeout(watchdogTimer);
      if (video) {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('playing', handlePlaying);
      }
    };
  }, [cameraActive, activeStream]);

  // Clean up on component unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleAdvance = () => {
    if (stepIndex < 3) {
      setStepIndex((prev) => prev + 1);
    } else {
      setIsResolved(true);
    }
  };

  const handleReset = () => {
    setStepIndex(0);
    setIsResolved(false);
  };

  const handleNextHazard = () => {
    const curIdx = HAZARDS.findIndex((h) => h.id === selectedId);
    const nextIdx = (curIdx + 1) % HAZARDS.length;
    setSelectedId(HAZARDS[nextIdx].id);
    setStepIndex(0);
    setIsResolved(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col justify-between max-w-md mx-auto shadow-2xl relative border-x border-[#E2E8F0]">
      {/* ====================================================================
          1. HOME SCREEN (CLEAN, MINIMAL & ERGONOMIC)
          ==================================================================== */}
      {!cameraActive ? (
        <div className="flex-1 flex flex-col justify-between p-4 min-h-screen">
          {/* Header */}
          <header className="flex items-center justify-between pt-1 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-xs">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">SurakshaAR</h1>
            </div>

            <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              DGMS
            </span>
          </header>

          {/* Camera Error Alert */}
          {cameraError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center space-y-2">
              <p className="text-xs text-red-700 font-semibold">{cameraError}</p>
              <button
                onClick={startCamera}
                className="w-full h-10 rounded-lg bg-red-600 text-white font-bold text-xs uppercase"
              >
                Retry Camera Access
              </button>
            </div>
          )}

          {/* Symmetrical 2x2 Hazard Selector */}
          <div className="my-auto py-2 space-y-3">
            <div className="grid grid-cols-2 gap-3.5">
              {HAZARDS.map((h) => {
                const isSelected = h.id === selectedId;
                return (
                  <button
                    key={h.id}
                    onClick={() => {
                      setSelectedId(h.id);
                      setStepIndex(0);
                      setIsResolved(false);
                    }}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.97] min-h-[120px] ${
                      isSelected
                        ? 'bg-[#FEF3C7] border-2 border-[#F59E0B] shadow-md ring-2 ring-amber-400/20'
                        : 'bg-white border-[#E2E8F0] shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <span className="text-3xl mb-2">{h.icon}</span>
                    <span className="text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap">
                      {h.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Minimal Hazard Warning Chip */}
            <div className="bg-amber-50 border border-amber-200 text-amber-950 px-3.5 py-2.5 rounded-xl flex items-center justify-center text-xs font-semibold text-center shadow-xs">
              <span className="truncate">{currentHazard.warning}</span>
            </div>
          </div>

          {/* Sticky Primary CTA (56px Height, Thumb-Friendly) */}
          <div className="pt-3 pb-1">
            <button
              onClick={startCamera}
              className="w-full h-14 min-h-[56px] bg-[#F59E0B] hover:bg-amber-500 active:scale-[0.98] text-[#0F172A] font-black text-sm tracking-wider uppercase rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>📸 OPEN CAMERA & START</span>
            </button>
          </div>
        </div>
      ) : (
        /* ====================================================================
            2. LIVE CAMERA VIEW (FIXED Z-INDEX, AUTOPLAY & FEED INDICATOR)
            ==================================================================== */
        <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col justify-between">
          {/* Native HTML5 Video Element mounted to live MediaStream at z-0 */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover z-0"
          />

          {/* Dark scrim overlay behind header for text contrast */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

          {/* 3. FLOATING TOP HEADER BAR (Z-20) */}
          <header className="relative z-20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Active Hazard Tag */}
              <div className="bg-black/70 backdrop-blur-md text-white font-bold text-xs px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 whitespace-nowrap shadow-md">
                <span>{currentHazard.icon}</span>
                <span>{currentHazard.title}</span>
              </div>

              {/* 4. LIVE FEED INDICATOR */}
              <div className="bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-md">
                <span
                  className={`w-2 h-2 rounded-full transition-all ${
                    isStreamingLive
                      ? 'bg-emerald-400 animate-pulse ring-2 ring-emerald-400/40'
                      : 'bg-amber-400 animate-ping'
                  }`}
                />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  {isStreamingLive ? 'Camera Active' : 'Connecting...'}
                </span>
              </div>
            </div>

            {/* Circular Exit Button */}
            <button
              onClick={stopCamera}
              className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center font-bold text-sm hover:bg-black/90 transition active:scale-90 shadow-md"
              title="Close Camera"
              aria-label="Close Camera"
            >
              ✕
            </button>
          </header>

          {/* 3. CENTER VIEWPORT: TARGETING RETICLE & SCALING HAZARD ICON (Z-10) */}
          <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none">
            <div className="relative flex items-center justify-center w-44 h-44">
              {/* 4 Corner Crosshairs */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-400 shadow-sm" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-400 shadow-sm" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-400 shadow-sm" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-400 shadow-sm" />

              {/* Pulsating Target Circle & Vivid Hazard Icon */}
              <div
                className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-300 ${
                  isResolved
                    ? 'border-emerald-400 bg-emerald-950/50 backdrop-blur-xs'
                    : 'border-amber-400/90 bg-black/25 backdrop-blur-xs animate-pulse'
                }`}
              >
                {!isResolved ? (
                  <div
                    className="transition-all duration-300 flex items-center justify-center text-5xl filter drop-shadow-[0_0_16px_rgba(245,158,11,0.9)]"
                    style={{ transform: `scale(${Math.max(0.35, riskPercent / 100)})` }}
                  >
                    {currentHazard.icon}
                  </div>
                ) : (
                  <span className="text-4xl text-emerald-400 font-black drop-shadow-md">✓</span>
                )}
              </div>
            </div>
          </div>

          {/* 3. FLOATING BOTTOM ACTION SHEET (Z-20 RELATIVE) */}
          <div className="relative z-20 bg-white rounded-t-3xl shadow-2xl p-5 border-t border-slate-200 space-y-4">
            {/* Top of Sheet: Progress Dots (● ○ ○ ○) & Risk Meter */}
            <div className="flex items-center justify-between">
              {/* Step Dots */}
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3].map((idx) => {
                  const isDone = isResolved || idx < stepIndex;
                  const isCurrent = !isResolved && idx === stepIndex;
                  return (
                    <span
                      key={idx}
                      className={`transition-all rounded-full ${
                        isDone
                          ? 'w-2.5 h-2.5 bg-emerald-500'
                          : isCurrent
                          ? 'w-3 h-3 bg-amber-500 ring-4 ring-amber-100'
                          : 'w-2.5 h-2.5 bg-slate-200'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Risk Meter Badge */}
              <span
                className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  riskPercent === 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : riskPercent <= 50
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-red-50 text-red-700 border-red-300'
                }`}
              >
                {riskPercent === 0 ? 'RISK: 0% SAFE' : `RISK: ${riskPercent}%`}
              </span>
            </div>

            {/* Action Content */}
            {!isResolved ? (
              <div className="space-y-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 leading-tight">
                    Step {stepIndex + 1}: {currentHazard.steps[stepIndex].title}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {currentHazard.steps[stepIndex].sub}
                  </p>
                </div>

                {/* Primary Action Button (52px height) */}
                <button
                  onClick={handleAdvance}
                  className="w-full h-[52px] min-h-[52px] bg-[#F59E0B] hover:bg-amber-500 active:scale-[0.98] text-[#0F172A] font-black text-sm tracking-wider uppercase rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>MARK COMPLETED ➔</span>
                </button>
              </div>
            ) : (
              /* Success / Resolution State */
              <div className="text-center space-y-3 py-1">
                <div>
                  <h2 className="text-base font-black text-emerald-700 uppercase tracking-wide">
                    ✓ Hazard Neutralized
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Compliance 100% • DGMS & OSHA Standards
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 h-[52px] min-h-[52px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase rounded-xl transition flex items-center justify-center"
                  >
                    Retest
                  </button>
                  <button
                    onClick={handleNextHazard}
                    className="flex-1 h-[52px] min-h-[52px] bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl shadow-md transition flex items-center justify-center"
                  >
                    Next Hazard ➔
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
