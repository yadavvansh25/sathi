import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Volume2, 
  ArrowLeftRight, 
  User, 
  BadgeCheck, 
  HardHat, 
  QrCode, 
  RotateCw, 
  Smartphone, 
  BrainCircuit, 
  Activity, 
  ClipboardList, 
  Users 
} from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  workerName: string;
  workerId: string;
  trade: string;
  standard: string;
  mode: 'AR_MODE' | '2D_FALLBACK_MODE';
  eventCount: number;
}

const PREDEFINED_SCENARIOS: Scenario[] = [
  {
    id: 'DR-FIRE-2026-05',
    title: 'Mine Fire (Blocked Exit Fail)',
    workerName: 'Rajesh Gope',
    workerId: 'WKR-4491',
    trade: 'Haulage Attendant',
    standard: 'DGMS CMR 2017 & OSHA 1910',
    mode: '2D_FALLBACK_MODE',
    eventCount: 7
  },
  {
    id: 'DR-CS-2026-01',
    title: 'Confined Sump (Fail)',
    workerName: 'Sunil Soren',
    workerId: 'WKR-3108',
    trade: 'Pump Operator',
    standard: 'OSHA 1910.146 Confined Space',
    mode: 'AR_MODE',
    eventCount: 6
  },
  {
    id: 'DR-CS-SAFE-06',
    title: 'Confined Sump (Safe Escalation Pass)',
    workerName: 'Ramesh Kisku',
    workerId: 'WKR-5520',
    trade: 'Ventilation Attendant',
    standard: 'DGMS Standard Reg 139',
    mode: 'AR_MODE',
    eventCount: 8
  }
];

export const SurakshaARScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'engine' | 'ar_drill' | 'logs' | 'roster'>('engine');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('DR-FIRE-2026-05');
  const [activeMode, setActiveMode] = useState<'AR_MODE' | '2D_FALLBACK_MODE'>('2D_FALLBACK_MODE');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'hindi' | 'santali' | 'english'>('hindi');

  const currentScenario = PREDEFINED_SCENARIOS.find(s => s.id === selectedScenarioId) || PREDEFINED_SCENARIOS[0];

  const handleToggleMode = () => {
    setActiveMode(prev => prev === 'AR_MODE' ? '2D_FALLBACK_MODE' : 'AR_MODE');
  };

  const handleEvaluate = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setHasEvaluated(true);
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased max-w-md mx-auto relative shadow-2xl">
      {/* Root Container Padding: px-4 pt-3 pb-24 space-y-3 */}
      <main className="flex-1 px-4 pt-3 pb-24 space-y-3 overflow-y-auto">
        
        {/* TOP HEADER & COMPLIANCE BADGES */}
        <header className="w-full box-border p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
            <AlertTriangle className="w-6 h-6 text-amber-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
              <h1 className="text-base font-black text-slate-900 leading-tight">SurakshaAR</h1>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-amber-300 whitespace-nowrap">
                SIH 2026
              </span>
              <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-sky-200 whitespace-nowrap">
                DGMS & OSHA
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Safety Remediation & Assessment Engine
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-1.5 text-[10px] text-slate-500 font-semibold">
              <span className="truncate">Platform: Android 11 ({activeMode === 'AR_MODE' ? 'AR Core' : '2D Fallback'})</span>
              <span className="text-amber-700 flex items-center gap-1 shrink-0 ml-1">
                <RotateCw className="w-2.5 h-2.5" /> 0 pending
              </span>
            </div>
          </div>
        </header>

        {/* 3. SCENARIO SELECTOR PILLS (DEDICATED HORIZONTAL SCROLL CONTAINER) */}
        <section className="space-y-1.5">
          <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase px-0.5">
            Select Drill Telemetry Scenario:
          </div>
          {/* Dedicated scroll container: flex flex-row overflow-x-auto gap-2 no-scrollbar py-1 w-full */}
          <div className="flex flex-row overflow-x-auto gap-2 no-scrollbar py-1 w-full">
            {PREDEFINED_SCENARIOS.map(drill => {
              const isSelected = drill.id === selectedScenarioId;
              return (
                <button
                  key={drill.id}
                  onClick={() => setSelectedScenarioId(drill.id)}
                  className={`flex-shrink-0 whitespace-nowrap px-4 py-2 text-xs font-medium rounded-full transition-all flex items-center ${
                    isSelected
                      ? 'bg-amber-100 text-amber-900 border border-amber-400 shadow-xs font-bold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {drill.title}
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. SCENARIO HEADER & "SWITCH AR" BUTTON */}
        <section className="w-full box-border p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          {/* Top row: flex flex-row justify-between items-center w-full gap-2 */}
          <div className="flex flex-row justify-between items-center w-full gap-2">
            <h2 className="flex-1 min-w-0 text-sm font-bold text-slate-900 leading-tight truncate">
              {currentScenario.title}
            </h2>
            <button
              onClick={handleToggleMode}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold whitespace-nowrap bg-white text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 transition shadow-2xs"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600" />
              <span>{activeMode === 'AR_MODE' ? 'Switch 2D' : 'Switch AR'}</span>
            </button>
          </div>

          {/* Structured 2-Column Worker Metadata */}
          <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{currentScenario.workerName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                <HardHat className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>ID: {currentScenario.workerId}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <HardHat className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{currentScenario.trade}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-700 font-medium text-[10px]">
                <BadgeCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate">{currentScenario.standard}</span>
              </div>
            </div>
          </div>

          {/* Neatly Centered Full-Width Mode Tag */}
          <div className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border ${
            activeMode === 'AR_MODE' 
              ? 'bg-sky-50 text-sky-800 border-sky-300' 
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}>
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">
              {activeMode === 'AR_MODE' ? 'AR_MODE (Spatial Sensor HUD Enabled)' : '2D_FALLBACK_MODE (Interactive Decision Canvas)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Recorded Physical Events: {currentScenario.eventCount}</span>
            <span className="text-slate-400">DGMS Rule 1 Enforced</span>
          </div>
        </section>

        {/* 4. PRIMARY CTA ("EVALUATE TELEMETRY LOGS") - w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold */}
        <button
          onClick={handleEvaluate}
          disabled={isEvaluating}
          className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 text-sm tracking-wide shadow-md transition"
        >
          {isEvaluating ? (
            <RotateCw className="w-5 h-5 animate-spin text-slate-900" />
          ) : (
            <>
              <Play className="w-4 h-4 fill-slate-950 shrink-0" />
              <span className="whitespace-nowrap">EVALUATE TELEMETRY LOGS</span>
            </>
          )}
        </button>

        {/* 1. EVALUATION SUMMARY BADGES (FIX VERTICAL TEXT COLLAPSE IN RISK BADGE) */}
        {hasEvaluated && (
          <section className="w-full box-border p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5">
            {/* Non-shrinking, strictly horizontal row without vertical letter-by-letter collapse */}
            <div className="flex flex-row overflow-x-auto gap-2 no-scrollbar py-1 w-full items-center">
              {/* Col 1: [⚠ VERDICT: FAIL] (Red solid/subtle background) */}
              <div className="flex-shrink-0 whitespace-nowrap bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-xl font-bold text-xs flex flex-row items-center justify-center gap-1.5 shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="whitespace-nowrap">VERDICT: FAIL</span>
              </div>

              {/* Col 2: [✖ NOT_MASTERED] (Slate background) */}
              <div className="flex-shrink-0 whitespace-nowrap bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl font-bold text-xs flex flex-row items-center justify-center gap-1.5 shadow-2xs">
                <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="whitespace-nowrap">NOT_MASTERED</span>
              </div>

              {/* Col 3: [● RISK: CRITICAL] (High-contrast red border/pill) */}
              <div className="flex-shrink-0 whitespace-nowrap bg-red-50 text-red-700 border border-red-300 px-3 py-1.5 rounded-xl font-bold text-xs flex flex-row items-center justify-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0" />
                <span className="whitespace-nowrap">RISK: CRITICAL</span>
              </div>
            </div>

            {/* Score & Mastery Row */}
            <div className="flex items-center justify-between py-2 border-y border-slate-100">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Competency Score
                </div>
                <div className="text-2xl font-black font-mono text-red-600">
                  42 <span className="text-xs text-slate-400 font-sans">/ 100</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Compliance Rule
                </div>
                <div className="text-xs font-bold text-slate-800">
                  DGMS CMR 2017 Reg 139
                </div>
              </div>
            </div>

            {/* Critical Override Notice */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-left space-y-1">
              <div className="flex items-center gap-1.5 font-black text-xs text-red-700">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>CRITICAL SAFETY OVERRIDE ACTIVE</span>
              </div>
              <p className="text-xs text-slate-700 leading-normal">
                Panicked and rushed into North Conveyor Drift marked <strong>BLOCKED EXIT</strong> with CO &gt; 380 ppm. Mandatory instant FAIL enforced regardless of speed.
              </p>
            </div>

            {/* Verifiable Certificate Banner */}
            <div className="bg-white rounded-xl p-3 border border-amber-300 bg-amber-50/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[10px] font-black text-amber-800 tracking-wider">PROVISIONAL RECORD</div>
                  <div className="text-xs font-mono font-bold text-slate-800 truncate">CERT-2026-WKR4491-05</div>
                </div>
              </div>
              <button className="flex-shrink-0 px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-200 border border-amber-300 rounded-lg hover:bg-amber-300">
                View QR
              </button>
            </div>

            {/* Plain-Language Worker Feedback & Audio Guidance */}
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-800">Multilingual Worker Feedback</div>
                <button className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-100 rounded-md border border-amber-300">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen Audio</span>
                </button>
              </div>

              {/* Language Selector */}
              <div className="flex border-b border-slate-200 text-xs font-bold">
                <button 
                  onClick={() => setSelectedLanguage('hindi')}
                  className={`py-1.5 px-3 border-b-2 ${selectedLanguage === 'hindi' ? 'border-amber-600 text-amber-800' : 'border-transparent text-slate-500'}`}
                >
                  हिंदी (Devanagari)
                </button>
                <button 
                  onClick={() => setSelectedLanguage('santali')}
                  className={`py-1.5 px-3 border-b-2 ${selectedLanguage === 'santali' ? 'border-amber-600 text-amber-800' : 'border-transparent text-slate-500'}`}
                >
                  ᱥᱟᱱᱛᱟᱲᱤ (Santali)
                </button>
                <button 
                  onClick={() => setSelectedLanguage('english')}
                  className={`py-1.5 px-3 border-b-2 ${selectedLanguage === 'english' ? 'border-amber-600 text-amber-800' : 'border-transparent text-slate-500'}`}
                >
                  English
                </button>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-slate-200 text-sm leading-relaxed text-slate-800 font-medium">
                {selectedLanguage === 'hindi' && (
                  "राजेश, आग लगने पर कभी भी ब्लॉक किए गए रास्ते (Exit A) की ओर मत भागो! पहले अलार्म बजाओ और लाइफ़लाइन का पालन करते हुए सुरक्षित निकास B की ओर निकलो।"
                )}
                {selectedLanguage === 'santali' && (
                  "ᱨᱟᱡᱮᱥ, ᱥᱮᱸᱜᱮᱞ ᱞᱟᱜᱟᱣ ᱚᱠᱛᱚ ᱨᱮ ᱵᱚᱸᱫᱽ ᱟᱠᱟᱱ ᱰᱟᱦᱟᱨ ᱥᱮᱫ ᱟᱞᱚᱢ ᱫᱟᱹᱲᱟ! ᱞᱟᱭᱤᱯᱷᱞᱟᱭᱤᱱ ᱯᱟᱸᱡᱟ ᱠᱟᱛᱮ Exit B ᱥᱮᱫ ᱪᱟᱞᱟᱜ ᱢᱮ᱾"
                )}
                {selectedLanguage === 'english' && (
                  "Rajesh, never run towards an exit marked BLOCKED during an emergency. Raise the alarm first and follow the intake lifeline towards safe Exit B."
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 5. BOTTOM NAVIGATION BAR - fixed bottom-0 left-0 right-0 h-16 grid grid-cols-4 items-center bg-white border-t border-slate-200 */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 grid grid-cols-4 items-center bg-white border-t border-slate-200 shadow-lg z-50">
        {[
          { id: 'engine', label: 'Engine', icon: BrainCircuit },
          { id: 'ar_drill', label: 'AR Drill', icon: Activity },
          { id: 'logs', label: 'Logs', icon: ClipboardList },
          { id: 'roster', label: 'Roster', icon: Users },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full min-h-[48px] min-w-[48px] transition ${
                isActive ? 'text-amber-700 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] leading-none font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SurakshaARScreen;
