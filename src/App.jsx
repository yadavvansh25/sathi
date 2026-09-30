import React, { useState, useEffect, useRef, useMemo } from 'react';

// ============================================================================
// SurakshaAR: Minimal, Visual-First Industrial Safety & Real Camera AR
// Compliant with DGMS & OSHA Standards
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
  const [stepIndex, setStepIndex] = useState(0);
  const [isResolved, setIsResolved] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const currentHazard = useMemo(() => {
    return HAZARDS.find((h) => h.id === selectedId) || HAZARDS[0];
  }, [selectedId]);

  const riskPercent = useMemo(() => {
    if (isResolved) return 0;
    return Math.max(0, 100 - stepIndex * 25);
  }, [stepIndex, isResolved]);

  // Camera Management
  const startCamera = async () => {
    setCameraError(null);
    try {
      stopCamera();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser.');
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      setStepIndex(0);
      setIsResolved(false);
    } catch (err) {
      setCameraError('Camera permission denied. Please allow camera access in browser settings.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try { t.stop(); } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

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
          1. HOME SCREEN (MINIMAL & ZERO CLUTTER)
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
                Retry Camera
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

            {/* Minimal Hazard Warning Chip (Single 1-Line) */}
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
            2. LIVE CAMERA VIEW (UNCLUTTERED HUD OVERLAY)
            ==================================================================== */
        <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col justify-between">
          {/* Hardware Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover z-0"
          />

          {/* Transparent Floating Header Bar */}
          <header className="relative z-10 p-4 flex items-center justify-between">
            {/* Active Hazard Tag */}
            <div className="bg-black/60 backdrop-blur-md text-white font-bold text-xs px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 whitespace-nowrap shadow-md">
              <span>{currentHazard.icon}</span>
              <span>{currentHazard.title}</span>
            </div>

            {/* Circular Exit Button */}
            <button
              onClick={stopCamera}
              className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center font-bold text-sm hover:bg-black/80 transition active:scale-90 shadow-md"
              title="Close Camera"
              aria-label="Close Camera"
            >
              ✕
            </button>
          </header>

          {/* Center Viewport: Centered Reticle with Pulsating Hazard */}
          <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none">
            <div className="relative flex items-center justify-center w-40 h-40">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-amber-400" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-amber-400" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-amber-400" />

              {/* Pulsating Target Circle & Scaling Icon */}
              <div
                className={`w-28 h-28 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-300 ${
                  isResolved ? 'border-emerald-400 bg-emerald-950/40' : 'border-amber-400/80 animate-pulse'
                }`}
              >
                {!isResolved ? (
                  <div
                    className="transition-all duration-300 flex items-center justify-center text-4xl"
                    style={{ transform: `scale(${Math.max(0.3, riskPercent / 100)})` }}
                  >
                    {currentHazard.icon}
                  </div>
                ) : (
                  <span className="text-3xl text-emerald-400 font-black">✓</span>
                )}
              </div>
            </div>
          </div>

          {/* Floating Bottom Action Sheet */}
          <div className="relative z-10 bg-white rounded-t-3xl shadow-2xl p-5 border-t border-slate-200 space-y-4">
            {/* Top Sheet: Progress Dots (● ○ ○ ○) & Risk Meter */}
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
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
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
