import React, { useState } from 'react';

// ============================================================================
// Sathi Industrial Safety: Phase 1 Home Dashboard
// Daylight High-Contrast Industrial Theme (#F8FAFC, #FFFFFF, #E2E8F0, #F59E0B)
// ============================================================================

export default function HomeDashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('home');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'learn') {
      setActiveModal('learning-catalog');
    } else if (tabKey === 'audio') {
      if (onNavigate) onNavigate('podcast');
    } else if (tabKey === 'progress') {
      setActiveModal('progress-report');
    } else if (tabKey === 'profile') {
      setActiveModal('worker-profile');
    }
  };

  const handleActionClick = (actionKey) => {
    if (actionKey === 'ar-module') {
      if (onNavigate) onNavigate('ar-module');
    } else if (actionKey === 'safety-podcasts') {
      if (onNavigate) onNavigate('podcast');
    } else {
      setActiveModal(actionKey);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col justify-between max-w-md mx-auto shadow-2xl relative border-x border-[#E2E8F0] pb-24">
      {/* ====================================================================
          1. TOP APP BAR (HEADER)
          ==================================================================== */}
      <header className="sticky top-0 z-30 bg-[#F8FAFC]/90 backdrop-blur-md px-4 pt-3 pb-2.5 flex items-center justify-between border-b border-slate-200/60">
        <div className="flex items-center gap-2.5">
          {/* App Logo: Stylized Safety Helmet / Shield in Amber/Orange */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 p-0.5 shadow-xs flex items-center justify-center">
            <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {/* Safety Helmet / Shield Graphic */}
                <path d="M12 2a5 5 0 0 0-5 5v1H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2V7a5 5 0 0 0-5-5z" />
                <path d="M4 14v4a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-4" />
                <line x1="12" y1="2" x2="12" y2="8" />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                Sathi
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                DGMS
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-none">
              सुरक्षित काम, उज्ज्वल कल
            </p>
          </div>
        </div>

        {/* Right Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition"
            title="Notifications"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {/* Active Notification Amber Dot */}
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
          </button>

          {/* Quick Notification Dropdown Pill */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-left animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Safety Broadcasts</span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">1 New</span>
              </div>
              <div className="pt-2 space-y-2">
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">Shift A Fire Drill Active</p>
                  <p className="text-[10px] text-slate-500">Complete the electrical isolation AR module before 18:00 hrs.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ====================================================================
          MAIN DASHBOARD SCROLL CONTENT
          ==================================================================== */}
      <main className="flex-1 px-4 pt-3 pb-6 space-y-4">
        {/* ====================================================================
            2. HERO BANNER ("LEARN, PRACTICE, STAY SAFE")
            ==================================================================== */}
        <section
          onClick={() => handleActionClick('ar-module')}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A101D] text-white p-5 shadow-lg border border-slate-800 cursor-pointer active:scale-[0.99] transition group"
        >
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />
          <div className="absolute right-0 bottom-0 w-32 h-32 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />

          {/* Industrial Excavation Site Graphic (SVG Illustration on the right) */}
          <div className="absolute right-2 bottom-1 w-36 h-36 opacity-30 group-hover:opacity-45 transition duration-300 pointer-events-none">
            <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
              {/* Excavation Bench / Mining Terrain */}
              <path d="M0 140 L40 125 L90 135 L160 120 L160 160 L0 160 Z" fill="#334155" />
              {/* Heavy Excavator Arm & Bucket */}
              <path d="M110 130 L125 105 L145 95 L155 110" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M142 93 L152 75 L158 80" stroke="#F59E0B" strokeWidth="4" />
              <rect x="95" y="118" width="30" height="18" rx="4" fill="#64748B" />
              {/* Safety Worker Silhouette with Hardhat */}
              <circle cx="50" cy="100" r="7" fill="#F59E0B" />
              <path d="M44 98 C44 92 56 92 56 98 Z" fill="#FBBF24" />
              <path d="M42 110 L58 110 L55 132 L45 132 Z" fill="#CBD5E1" />
              <path d="M46 112 L54 112" stroke="#EA580C" strokeWidth="2" />
            </svg>
          </div>

          <div className="relative z-10 max-w-[210px]">
            {/* Tag chip */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-bold text-amber-300 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Interactive Simulator</span>
            </div>

            {/* Headline */}
            <h2 className="text-[22px] font-black leading-tight tracking-tight text-white whitespace-pre-line">
              Learn{'\n'}Practice{'\n'}Stay Safe
            </h2>

            {/* Subtitle */}
            <p className="text-xs text-slate-300 mt-2 font-medium leading-relaxed">
              Interactive training for a safer workplace.
            </p>

            {/* Circular Arrow CTA */}
            <div className="mt-4 flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md group-hover:scale-110 transition active:scale-90">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
              <span className="text-xs font-bold text-amber-400 group-hover:underline">Launch AR</span>
            </div>
          </div>
        </section>

        {/* ====================================================================
            3. 2x2 QUICK ACTION GRID (4 PILL CARDS)
            ==================================================================== */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Start Training (AR Module) */}
            <button
              onClick={() => handleActionClick('ar-module')}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-400 hover:shadow-md active:scale-95 transition text-left relative overflow-hidden group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition shadow-xs">
                🦺
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-black text-slate-900 leading-tight truncate">
                  Start Training
                </div>
                <div className="text-[11px] font-bold text-amber-700 mt-0.5">
                  (AR Module)
                </div>
              </div>
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </button>

            {/* Card 2: Continue Learning */}
            <button
              onClick={() => handleActionClick('continue-learning')}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md active:scale-95 transition text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-800 text-xl font-black shrink-0 group-hover:scale-105 transition shadow-xs">
                ▶
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-black text-slate-900 leading-tight truncate">
                  Continue
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Learning
                </div>
              </div>
            </button>

            {/* Card 3: Podcast */}
            <button
              onClick={() => handleActionClick('safety-podcasts')}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-purple-300 hover:shadow-md active:scale-95 transition text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition shadow-xs">
                🎧
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-black text-slate-900 leading-tight truncate">
                  Podcast
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Listen & Learn
                </div>
              </div>
            </button>

            {/* Card 4: Flashcards */}
            <button
              onClick={() => handleActionClick('safety-flashcards')}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md active:scale-95 transition text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition shadow-xs">
                🗂️
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-black text-slate-900 leading-tight truncate">
                  Flashcards
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Revise Mistakes
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* ====================================================================
            4. "MY PROGRESS" CARD
            ==================================================================== */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-black text-slate-900 leading-tight">
                My Progress
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                3/6 Modules Completed
              </p>
            </div>
            <button
              onClick={() => handleActionClick('progress-report')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition"
            >
              <span>View All</span>
              <span>➔</span>
            </button>
          </div>

          {/* Progress Bar Track and Value */}
          <div className="flex items-center gap-3 mt-3.5">
            <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/70 p-0.5">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700 shadow-xs"
                style={{ width: '50%' }}
              />
            </div>
            <span className="text-xs font-black text-slate-800 tabular-nums">
              50%
            </span>
          </div>

          {/* Recent Achievement Footnote */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Last drill: Electrical Isolation</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              ✓ Passed
            </span>
          </div>
        </section>

        {/* ====================================================================
            5. "RECOMMENDED FOR YOU" SECTION
            ==================================================================== */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Recommended for You
            </h3>
            <button
              onClick={() => handleActionClick('learning-catalog')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 transition"
            >
              See All
            </button>
          </div>

          {/* Primary Recommended Card: Safe Working Near Heavy Machinery */}
          <div
            onClick={() => handleActionClick('ar-module')}
            className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-md cursor-pointer active:scale-[0.99] transition"
          >
            {/* Mining Dump Truck Graphic Thumbnail */}
            <div className="w-20 h-16 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700 overflow-hidden relative shrink-0 flex items-center justify-center shadow-xs">
              <svg viewBox="0 0 80 60" fill="none" className="w-14 h-12">
                {/* Dump Truck Bed */}
                <path d="M12 28 L46 28 L42 12 L18 12 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                {/* Cab */}
                <path d="M48 22 L62 22 L66 32 L48 32 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
                <rect x="52" y="24" width="8" height="6" fill="#38BDF8" />
                {/* Chassis */}
                <rect x="16" y="32" width="50" height="6" rx="2" fill="#334155" />
                {/* Giant Tires */}
                <circle cx="26" cy="40" r="9" fill="#0F172A" stroke="#475569" strokeWidth="2.5" />
                <circle cx="26" cy="40" r="4" fill="#94A3B8" />
                <circle cx="56" cy="40" r="9" fill="#0F172A" stroke="#475569" strokeWidth="2.5" />
                <circle cx="56" cy="40" r="4" fill="#94A3B8" />
              </svg>
              {/* Play / AR overlay chip */}
              <div className="absolute bottom-1 right-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1 rounded">
                AR
              </div>
            </div>

            {/* Info Column */}
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-black text-slate-900 leading-snug line-clamp-2">
                Safe Working Near Heavy Machinery
              </h4>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                  10 min
                </span>
                <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-100">
                  Hindi
                </span>
                <span className="bg-amber-50 text-amber-700 text-[11px] font-black px-2 py-0.5 rounded-md border border-amber-200">
                  AR
                </span>
              </div>
            </div>

            <div className="text-slate-400 text-sm font-bold pr-1">
              ➔
            </div>
          </div>

          {/* Secondary Recommended Card: Conveyor Belt Emergency Stop */}
          <div
            onClick={() => handleActionClick('ar-module')}
            className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-md cursor-pointer active:scale-[0.99] transition"
          >
            <div className="w-20 h-16 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700 overflow-hidden relative shrink-0 flex items-center justify-center shadow-xs">
              <svg viewBox="0 0 80 60" fill="none" className="w-14 h-12">
                {/* Conveyor rollers */}
                <line x1="10" y1="30" x2="70" y2="30" stroke="#94A3B8" strokeWidth="4" />
                <circle cx="20" cy="30" r="6" fill="#F59E0B" />
                <circle cx="40" cy="30" r="6" fill="#F59E0B" />
                <circle cx="60" cy="30" r="6" fill="#F59E0B" />
                {/* Emergency pull cord */}
                <line x1="10" y1="18" x2="70" y2="18" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 2" />
                <rect x="36" y="10" width="8" height="8" rx="2" fill="#DC2626" />
              </svg>
              <div className="absolute bottom-1 right-1 bg-red-600 text-white text-[9px] font-black px-1 rounded">
                DRILL
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-black text-slate-900 leading-snug line-clamp-2">
                Conveyor Belt Pull-Cord & Nip Points
              </h4>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                  8 min
                </span>
                <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-100">
                  Hindi
                </span>
                <span className="bg-amber-50 text-amber-700 text-[11px] font-black px-2 py-0.5 rounded-md border border-amber-200">
                  AR
                </span>
              </div>
            </div>

            <div className="text-slate-400 text-sm font-bold pr-1">
              ➔
            </div>
          </div>
        </section>
      </main>

      {/* ====================================================================
          6. 5-TAB BOTTOM NAVIGATION BAR
          ==================================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {/* Tab 1: Home (Active) */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            activeTab === 'home'
              ? 'text-amber-600 font-black'
              : 'text-slate-400 font-medium hover:text-slate-700'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-[11px]">Home</span>
        </button>

        {/* Tab 2: Learn */}
        <button
          onClick={() => handleTabClick('learn')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            activeTab === 'learn'
              ? 'text-amber-600 font-black'
              : 'text-slate-400 font-medium hover:text-slate-700'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill={activeTab === 'learn' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
          <span className="text-[11px]">Learn</span>
        </button>

        {/* Tab 3: Audio */}
        <button
          onClick={() => handleTabClick('audio')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            activeTab === 'audio'
              ? 'text-amber-600 font-black'
              : 'text-slate-400 font-medium hover:text-slate-700'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill={activeTab === 'audio' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>
          <span className="text-[11px]">Audio</span>
        </button>

        {/* Tab 4: Progress */}
        <button
          onClick={() => handleTabClick('progress')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            activeTab === 'progress'
              ? 'text-amber-600 font-black'
              : 'text-slate-400 font-medium hover:text-slate-700'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill={activeTab === 'progress' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span className="text-[11px]">Progress</span>
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            activeTab === 'profile'
              ? 'text-amber-600 font-black'
              : 'text-slate-400 font-medium hover:text-slate-700'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill={activeTab === 'profile' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-[11px]">Profile</span>
        </button>
      </nav>

      {/* ====================================================================
          7. SECONDARY CONTENT DRAWER / MODAL
          ==================================================================== */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-5 space-y-4 border-t sm:border border-slate-200 animate-in slide-in-from-bottom duration-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {activeModal === 'safety-podcasts' ? '🎧' : activeModal === 'safety-flashcards' ? '🗂️' : activeModal === 'progress-report' ? '📊' : activeModal === 'worker-profile' ? '👤' : '📚'}
                </span>
                <h3 className="text-base font-black text-slate-900 capitalize">
                  {activeModal.replace('-', ' ')}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 active:scale-95 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Based on Screen */}
            {activeModal === 'safety-podcasts' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Listen to vernacular audio safety modules recorded by DGMS certified mining instructors.
                </p>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Episode 04</span>
                  <h4 className="text-xs font-black text-slate-900">Methane Gas Safety & Multi-Gas Detectors</h4>
                  <p className="text-[11px] text-slate-500">Audio • 14 mins • Hindi (हिन्दी)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Episode 03</span>
                  <h4 className="text-xs font-black text-slate-900">Safe Blasting Clearance Procedures</h4>
                  <p className="text-[11px] text-slate-500">Audio • 11 mins • Hindi (हिन्दी)</p>
                </div>
              </div>
            )}

            {activeModal === 'safety-flashcards' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 font-medium">
                  Review recent mistakes from safety audits and mock drills.
                </p>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-amber-800">Rule 42: DGMS Safe Distance</span>
                  <h4 className="text-xs font-black text-slate-900">What is the safe operating perimeter from highwall face?</h4>
                  <p className="text-xs font-bold text-emerald-700">Answer: Minimum height of the face plus 3 meters.</p>
                </div>
              </div>
            )}

            {activeModal === 'progress-report' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs font-bold text-slate-700">Total Safety Score</span>
                  <span className="text-sm font-black text-emerald-600">84 / 100</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Fire Extinguisher Drill</span>
                    <span className="text-emerald-600 font-bold">100%</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Electrical Panel Isolation</span>
                    <span className="text-emerald-600 font-bold">100%</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Heavy Hauler Blind Spots</span>
                    <span className="text-amber-600 font-bold">Pending</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'worker-profile' && (
              <div className="space-y-3 text-center py-2">
                <div className="w-16 h-16 rounded-full bg-slate-900 text-amber-400 font-black text-xl flex items-center justify-center mx-auto shadow-md border-2 border-amber-400">
                  VY
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Vansh Yadav</h4>
                  <p className="text-xs text-slate-500">DGMS ID: SATHI-MN-8921</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  <span>✓ Level 2 Safety Certified</span>
                </div>
              </div>
            )}

            {activeModal === 'learning-catalog' || activeModal === 'continue-learning' ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 font-medium">
                  Select a module to initiate hands-on AR spatial evaluation.
                </p>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    if (onNavigate) onNavigate('ar-module');
                  }}
                  className="w-full p-3 rounded-xl bg-amber-50 border border-amber-300 text-left flex items-center justify-between hover:bg-amber-100 transition"
                >
                  <div>
                    <h4 className="text-xs font-black text-slate-900">⚡ Electrical Hazard & Fire Response</h4>
                    <p className="text-[11px] text-slate-500">Real-time object recognition and voice guidance</p>
                  </div>
                  <span className="text-xs font-black text-amber-700 bg-amber-200 px-2 py-1 rounded">START</span>
                </button>
              </div>
            ) : null}

            {/* Launch AR CTA in Modal */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setActiveModal(null);
                  if (onNavigate) onNavigate('ar-module');
                }}
                className="w-full h-12 bg-[#F59E0B] hover:bg-amber-500 active:scale-[0.98] text-[#0F172A] font-black text-xs tracking-wider uppercase rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>📸 Launch AR Camera Module</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
