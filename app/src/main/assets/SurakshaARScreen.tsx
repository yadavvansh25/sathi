import React, { useState } from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  Play, 
  Volume2, 
  ArrowRight, 
  User, 
  BadgeCheck, 
  HardHat, 
  QrCode, 
  Smartphone, 
  Sync, 
  RefreshCw, 
  ClipboardCheck, 
  CheckCircle2, 
  FileText, 
  ArrowLeftRight 
} from 'lucide-react';

export const SurakshaARScreen: React.FC = () => {
  // Navigation: 3 Essential Tabs Only: [Drill, My Results, Offline Sync]
  const [activeTab, setActiveTab] = useState<'drill' | 'results' | 'sync'>('results');
  
  // Language Switch: Hindi | Santali
  const [selectedLang, setSelectedLang] = useState<'hindi' | 'santali'>('hindi');
  
  // Mode: 2D Fallback Mode vs AR Mode
  const [executionMode, setExecutionMode] = useState<'2D_MODE' | 'AR_MODE'>('2D_MODE');
  
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleLanguage = (lang: 'hindi' | 'santali') => {
    setSelectedLang(lang);
  };

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased max-w-md mx-auto relative shadow-2xl pb-20">
      
      {/* ======================================================== */}
      {/* MAIN STREAMLINED CONTENT                                 */}
      {/* ======================================================== */}
      <main className="flex-1 px-4 pt-3 pb-6 space-y-3 overflow-y-auto">
        
        {/* 1. HEADER (App Title + DGMS/OSHA Badge + Language Switch Pill + Audio) */}
        <header className="flex items-center justify-between gap-2 pt-1 pb-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              SurakshaAR
            </h1>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
              DGMS & OSHA
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Switch Pill: [हिंदी | ᱥᱟᱱᱛᱟᱲᱤ] */}
            <div className="bg-white border border-slate-200 rounded-full p-0.5 flex items-center shadow-xs">
              <button
                onClick={() => toggleLanguage('hindi')}
                className={`px-2.5 py-1 text-xs rounded-full font-bold transition-colors ${
                  selectedLang === 'hindi'
                    ? 'bg-amber-100 text-amber-900 font-extrabold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => toggleLanguage('santali')}
                className={`px-2.5 py-1 text-xs rounded-full font-bold transition-colors ${
                  selectedLang === 'santali'
                    ? 'bg-amber-100 text-amber-900 font-extrabold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ᱥᱟᱱᱛᱟᱲᱤ
              </button>
            </div>

            {/* Quick Audio Play Button */}
            <button
              onClick={handlePlayAudio}
              title="Play Voice Guidance"
              className={`w-8 h-8 rounded-full border border-amber-300 bg-amber-100 flex items-center justify-center text-amber-900 hover:bg-amber-200 transition ${
                isPlayingAudio ? 'ring-2 ring-amber-500 scale-95' : ''
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 2. ACTIVE MODULE CARD (Pure White #FFFFFF, 1px Border #E2E8F0, rounded-2xl) */}
        <section className="w-full bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
          {/* Module Title & Mode Switch Button */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                ACTIVE SAFETY DRILL
              </span>
              <h2 className="text-sm font-bold text-slate-900 leading-snug">
                Gas Leak & Confined Space Entry Lab
              </h2>
            </div>

            <button
              onClick={() => setExecutionMode(prev => prev === '2D_MODE' ? 'AR_MODE' : '2D_MODE')}
              className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600" />
              <span>{executionMode === '2D_MODE' ? 'Switch to AR' : 'Switch to 2D'}</span>
            </button>
          </div>

          {/* Mode Pill */}
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Smartphone className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {executionMode === '2D_MODE'
                  ? '2D Fallback Mode (Android 11)'
                  : 'Spatial AR Mode (IMU / HUD)'}
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400">DGMS Standard Reg 139</span>
          </div>

          {/* Worker Details */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Rajesh Gope (ID: WKR-4491)</span>
            </div>
            <span className="text-slate-600 font-medium">Trade: Pump Operator</span>
          </div>
        </section>

        {/* 3. PRIMARY BIG BUTTON ("▶ START SAFETY DRILL" - Full width, 52px, amber-500) */}
        <button
          onClick={() => setActiveTab('drill')}
          className="w-full h-[52px] min-h-[52px] rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-black text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>START SAFETY DRILL</span>
        </button>

        {/* 4. CLEAR EVALUATION SUMMARY CARD (HORIZONTAL ALIGNMENT, NO WRAPPING BUGS) */}
        <section className="w-full bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              LAST EVALUATION SUMMARY
            </span>
            <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-black px-2 py-0.5 rounded-md">
              Score: 42/100
            </span>
          </div>

          {/* Clean Horizontal Status Badges Row (Zero letter-by-letter wrapping) */}
          <div className="grid grid-cols-3 gap-2 w-full items-center">
            {/* Pill 1: [ ⚠ VERDICT: FAIL ] */}
            <div className="bg-[#FEE2E2] text-red-700 border border-red-200 px-2 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 whitespace-nowrap shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>VERDICT: FAIL</span>
            </div>

            {/* Pill 2: [ ✖ NOT MASTERED ] */}
            <div className="bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 whitespace-nowrap">
              <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>NOT MASTERED</span>
            </div>

            {/* Pill 3: [ CRITICAL ERROR: Gas Test Skipped ] */}
            <div className="bg-red-50 text-red-700 border border-red-200 px-1.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center text-center whitespace-nowrap truncate">
              <span>CRITICAL: Gas Test Skipped</span>
            </div>
          </div>

          {/* Plain-Language Worker Feedback & Audio */}
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 space-y-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Worker Guidance ({selectedLang === 'hindi' ? 'हिंदी' : 'ᱥᱟᱱᱛᱟᱲᱤ'}):
              </span>
              <button
                onClick={handlePlayAudio}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-amber-900 bg-amber-100 rounded border border-amber-300"
              >
                <Volume2 className="w-3 h-3" />
                <span>Listen</span>
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {selectedLang === 'hindi'
                ? "राजेश, बिना 4-गैस स्निफ़र टेस्ट के सम्प में मत उतरो! पहले O2, H2S और CH4 चेक करो और परमिट साइन कराओ।"
                : "ᱨᱟᱡᱮᱥ, ᱜᱮᱥ ᱴᱮᱥᱴ ᱵᱤᱱᱟ ᱛᱮ ᱥᱟᱢᱯ ᱨᱮ ᱟᱞᱚᱢ ᱯᱷᱮᱰᱚᱜ-ᱟ! ᱞᱟᱦᱟ ᱛᱮ O2 ᱟᱨ H2S ᱪᱮᱠ ᱢᱮ᱾"}
            </p>
          </div>
        </section>

        {/* 5. REMEDIATION CARD */}
        <section className="w-full bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">
                Required Action:
              </span>
              <h3 className="text-xs font-bold text-slate-900 truncate">
                Complete 3-Minute Gas Detector Drill
              </h3>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('drill')}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg shadow-xs transition"
          >
            <span>Retry Drill</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>

        {/* 6. OFFLINE STATUS & VERIFIABLE QR CARD */}
        <section className="w-full bg-white rounded-2xl border border-[#E2E8F0] p-3.5 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                Provisional Offline Receipt
              </div>
              <div className="text-[10px] font-medium text-slate-500">
                Status: <span className="text-amber-700 font-bold">Sync Pending (1 record)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert("Cryptographic Certificate: CERT-2026-WKR4491-05 verified by DGMS offline key.")}
            className="shrink-0 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            View QR
          </button>
        </section>

      </main>

      {/* ======================================================== */}
      {/* 4. CLEAN BOTTOM NAVIGATION (3 ESSENTIAL TABS ONLY)        */}
      {/* ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 bg-white border-t border-[#E2E8F0] shadow-lg z-50">
        <div className="grid grid-cols-3 h-full items-center">
          
          {/* Tab 1: Drill */}
          <button
            onClick={() => setActiveTab('drill')}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full min-h-[48px] transition ${
              activeTab === 'drill' ? 'text-amber-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span className="text-xs leading-none">Drill</span>
          </button>

          {/* Tab 2: My Results */}
          <button
            onClick={() => setActiveTab('results')}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full min-h-[48px] transition ${
              activeTab === 'results' ? 'text-amber-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-xs leading-none">My Results</span>
          </button>

          {/* Tab 3: Offline Sync */}
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full min-h-[48px] transition ${
              activeTab === 'sync' ? 'text-amber-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sync className="w-5 h-5" />
            <span className="text-xs leading-none">Offline Sync</span>
          </button>

        </div>
      </nav>

    </div>
  );
};

export default SurakshaARScreen;
