import React, { useState, useMemo } from 'react';

// ============================================================================
// Sathi Industrial Safety: Phase 5 Certificates Module
// Verifiable Digital Credentials with QR Code Validation & DGMS Standards
// ============================================================================

const CERTIFICATES_DATA = [
  {
    id: 'CERT-BWS-2026-001',
    title: 'Basic Workplace Safety',
    titleHi: 'बुनियादी कार्यस्थल सुरक्षा प्रमाणन',
    category: 'Safety Basics',
    status: 'Completed',
    completedDate: '12 Sep 2026',
    score: '100% Mastery',
    validUntil: '12 Sep 2028',
    issuer: 'Directorate General of Mines Safety (DGMS)',
    traineeName: 'Rajesh Gope',
    traineeId: 'MINER-JH-8842',
    drillThumbnailBg: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: '🦺',
    skills: ['PPE Compliance', 'Hazard Awareness', 'Site Protocol']
  },
  {
    id: 'CERT-FIR-2026-002',
    title: 'Fire Safety & Emergency Response',
    titleHi: 'अग्नि सुरक्षा और आपातकालीन प्रतिक्रिया',
    category: 'Emergency Response',
    status: 'Completed',
    completedDate: '18 Sep 2026',
    score: '98% Mastery',
    validUntil: '18 Sep 2028',
    issuer: 'Directorate General of Mines Safety (DGMS)',
    traineeName: 'Rajesh Gope',
    traineeId: 'MINER-JH-8842',
    drillThumbnailBg: 'bg-red-100 text-red-700 border-red-200',
    icon: '🧯',
    skills: ['PASS Extinguisher Protocol', 'Evacuation Route', 'Fire Alarms']
  },
  {
    id: 'CERT-WAH-2026-003',
    title: 'Working at Heights',
    titleHi: 'ऊंचाई पर कार्य और मचान सुरक्षा',
    category: 'High Risk Ops',
    status: 'Completed',
    completedDate: '25 Sep 2026',
    score: '100% Mastery',
    validUntil: '25 Sep 2028',
    issuer: 'Directorate General of Mines Safety (DGMS)',
    traineeName: 'Rajesh Gope',
    traineeId: 'MINER-JH-8842',
    drillThumbnailBg: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: '🪜',
    skills: ['Full-Body Harness', '100% Tie-Off', 'Scaffolding Inspection']
  },
  {
    id: 'CERT-HMH-2026-004',
    title: 'Hazardous Material Handling',
    titleHi: 'खतरनाक रसायन और सामग्री प्रबंधन',
    category: 'Hazmat',
    status: 'Completed',
    completedDate: '28 Sep 2026',
    score: '95% Mastery',
    validUntil: '28 Sep 2028',
    issuer: 'Directorate General of Mines Safety (DGMS)',
    traineeName: 'Rajesh Gope',
    traineeId: 'MINER-JH-8842',
    drillThumbnailBg: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: '🧪',
    skills: ['MSDS Guidelines', 'Spill Berms', 'Chemical Respirator']
  },
  {
    id: 'CERT-HMC-2026-005',
    title: 'Heavy Machinery & Conveyor Safety',
    titleHi: 'भारी मशीनरी और कन्वेयर बेल्ट सुरक्षा',
    category: 'Machinery',
    status: 'In Progress',
    completedDate: 'In Progress (60%)',
    score: 'In Progress',
    validUntil: 'Pending Completion',
    issuer: 'Directorate General of Mines Safety (DGMS)',
    traineeName: 'Rajesh Gope',
    traineeId: 'MINER-JH-8842',
    drillThumbnailBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: '🚜',
    skills: ['Pull-Cord Trip Wire', 'Nip Point Protection', 'Dump Truck Blind Spots']
  }
];

export default function CertificatesModule({ onBack }) {
  // Segmented filter tabs: 'all' | 'completed' | 'in-progress'
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCert, setSelectedCert] = useState(null);
  const [downloadToast, setDownloadToast] = useState(null);

  const completedCount = useMemo(() => {
    return CERTIFICATES_DATA.filter((c) => c.status === 'Completed').length;
  }, []);

  const filteredCerts = useMemo(() => {
    if (activeFilter === 'completed') {
      return CERTIFICATES_DATA.filter((c) => c.status === 'Completed');
    }
    if (activeFilter === 'in-progress') {
      return CERTIFICATES_DATA.filter((c) => c.status === 'In Progress');
    }
    return CERTIFICATES_DATA;
  }, [activeFilter]);

  const showToast = (message) => {
    setDownloadToast(message);
    setTimeout(() => {
      setDownloadToast(null);
    }, 3200);
  };

  const handleDownloadAll = () => {
    showToast(`Downloading ${completedCount} Verified Certificates (PDF Package)...`);
  };

  const handleDownloadSingle = (certId) => {
    showToast(`Downloading Certificate ${certId} (PDF with QR validation)...`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col justify-between max-w-md mx-auto shadow-2xl relative border-x border-[#E2E8F0]">
      {/* ====================================================================
          1. TOP APP BAR
          ==================================================================== */}
      <header className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-md px-4 pt-3 pb-2.5 flex items-center justify-between border-b border-slate-200/60">
        {/* Left: Circular back button */}
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition active:scale-90 shadow-xs"
          title="Return"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Center: Title */}
        <h1 className="text-lg font-black text-slate-900 tracking-tight">
          My Certificates
        </h1>

        {/* Right: Share / Export Icon */}
        <button
          onClick={handleDownloadAll}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-blue-600 flex items-center justify-center shadow-xs transition active:scale-90"
          title="Export / Share Credentials"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 px-4 pt-4 pb-28 overflow-y-auto">
        {/* ====================================================================
            2. "TOTAL CERTIFICATES" SUMMARY HERO CARD
            ==================================================================== */}
        <div className="rounded-3xl bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE]/40 to-[#EFF6FF] border border-blue-200/90 p-4 mb-4 shadow-sm flex items-center justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />

          {/* Left Column: Label + Big Trophy Counter */}
          <div className="relative z-10">
            <span className="text-xs font-bold text-slate-600 tracking-tight">
              Total Certificates
            </span>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-2xl filter drop-shadow-xs">🏆</span>
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {completedCount}
              </span>
            </div>
            <p className="text-[11px] text-blue-700 font-semibold mt-1">
              DGMS & Jharkhand Approved
            </p>
          </div>

          {/* Right Column: Minimalist Vector Illustration of Certificate */}
          <div className="relative z-10 w-24 h-20 flex items-center justify-center">
            <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-sm" fill="none">
              {/* Certificate Parchment */}
              <rect x="8" y="6" width="84" height="66" rx="6" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="2.5" />
              {/* Inner Decorative Border */}
              <rect x="13" y="11" width="74" height="56" rx="3" fill="#F8FAFC" stroke="#BFDBFE" strokeWidth="1" strokeDasharray="3 2" />
              {/* Lines representing credential text */}
              <line x1="22" y1="22" x2="60" y2="22" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
              <line x1="22" y1="30" x2="70" y2="30" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              <line x1="22" y1="36" x2="52" y2="36" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              {/* Golden Badge with Ribbon */}
              <g transform="translate(64, 42)">
                {/* Ribbons */}
                <path d="M4 14 L0 26 L8 22 L16 26 L12 14 Z" fill="#F59E0B" />
                <path d="M8 14 L12 24 L16 22 L20 26 L16 14 Z" fill="#D97706" />
                {/* Seal Circle */}
                <circle cx="8" cy="8" r="9" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
                {/* Star in seal */}
                <polygon points="8,3 9.8,6.8 14,7.4 11,10.3 11.7,14.5 8,12.5 4.3,14.5 5,10.3 2,7.4 6.2,6.8" fill="#FFFFFF" />
              </g>
            </svg>
          </div>
        </div>

        {/* ====================================================================
            3. FILTER PILL SEGMENTED CONTROL
            ==================================================================== */}
        <div className="bg-[#F1F5F9] p-1 rounded-full flex items-center justify-between text-xs font-semibold border border-slate-200/60 mb-4 shadow-inner">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 py-1.5 px-3 rounded-full text-center transition ${
              activeFilter === 'all'
                ? 'bg-[#2563EB] text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            All
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={`flex-1 py-1.5 px-3 rounded-full text-center transition ${
              activeFilter === 'completed'
                ? 'bg-[#2563EB] text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            Completed
          </button>

          <button
            onClick={() => setActiveFilter('in-progress')}
            className={`flex-1 py-1.5 px-3 rounded-full text-center transition ${
              activeFilter === 'in-progress'
                ? 'bg-[#2563EB] text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            In Progress
          </button>
        </div>

        {/* ====================================================================
            4. CERTIFICATES LIST SECTION
            ==================================================================== */}
        <div className="space-y-3">
          {filteredCerts.map((cert) => {
            const isCompleted = cert.status === 'Completed';

            return (
              <div
                key={cert.id}
                onClick={() => setSelectedCert(cert)}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99] group"
              >
                {/* Left Side: Thumbnail & Metadata */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail Badge */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border shadow-xs group-hover:scale-105 transition ${cert.drillThumbnailBg}`}
                  >
                    {cert.icon}
                  </div>

                  {/* Metadata */}
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-black text-slate-900 leading-snug truncate">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                      {isCompleted ? `Completed on: ${cert.completedDate}` : cert.completedDate}
                    </p>

                    {/* Verification Status Badge */}
                    <div className="mt-1">
                      {isCompleted ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>In Progress</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Chevron Icon */}
                <div className="text-slate-400 group-hover:text-blue-600 text-lg transition pr-1 shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ====================================================================
          5. BOTTOM STICKY ACTION BUTTON ("DOWNLOAD ALL CERTIFICATES")
          ==================================================================== */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md p-4 border-t border-slate-200 z-40">
        <button
          onClick={handleDownloadAll}
          className="w-full h-13 bg-[#1E293B] hover:bg-slate-900 active:scale-[0.98] text-white font-bold text-sm tracking-wide rounded-2xl flex items-center justify-center gap-2 shadow-lg transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="2" x2="12" y2="3" />
          </svg>
          <span>Download All Certificates</span>
        </button>
      </footer>

      {/* ====================================================================
          6. INTERACTIVE CERTIFICATE PREVIEW MODAL (ON CARD CLICK)
          ==================================================================== */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Official Credential
              </span>
              <button
                onClick={() => setSelectedCert(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Official Certificate Canvas Frame */}
            <div className="mt-3 p-4 rounded-2xl bg-gradient-to-b from-[#FFFBEB]/40 via-white to-[#F8FAFC] border-2 border-amber-200/90 relative overflow-hidden text-center shadow-inner">
              {/* Government / DGMS Header Badge */}
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="text-sm">🇮🇳</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                  Government of Jharkhand • DGMS
                </span>
              </div>

              {/* Certificate Watermark Stamp */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] pointer-events-none opacity-10">
                <div className="border-4 border-emerald-600 text-emerald-800 font-black text-2xl px-4 py-2 uppercase tracking-widest rounded-xl">
                  VALIDATED
                </div>
              </div>

              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Certificate of Proficiency
              </h2>

              <p className="text-[11px] text-slate-600 mt-2 font-medium">
                This is officially certified that
              </p>

              {/* Trainee Name */}
              <h3 className="text-lg font-black text-slate-900 mt-0.5 tracking-tight border-b-2 border-amber-400/80 inline-block px-4 pb-0.5">
                {selectedCert.traineeName}
              </h3>

              <p className="text-[10px] text-slate-500 font-mono mt-1">
                ID: {selectedCert.traineeId}
              </p>

              <p className="text-xs text-slate-600 mt-3 font-medium">
                has successfully completed all requirements for
              </p>

              {/* Module Name */}
              <h4 className="text-sm font-black text-blue-900 mt-0.5">
                {selectedCert.title}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                {selectedCert.titleHi}
              </p>

              {/* Mastery & Validation Data Grid */}
              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-2.5 my-3 border border-slate-200/80 flex items-center justify-around text-left">
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Score</span>
                  <span className="text-xs font-black text-emerald-600">{selectedCert.score}</span>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Completed</span>
                  <span className="text-xs font-bold text-slate-800">{selectedCert.completedDate}</span>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Valid Until</span>
                  <span className="text-xs font-bold text-slate-800">{selectedCert.validUntil}</span>
                </div>
              </div>

              {/* Dynamic QR Code for Verification */}
              <div className="flex flex-col items-center justify-center my-2">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
                    {/* Corner Position Detection Patterns */}
                    <rect x="5" y="5" width="26" height="26" fill="#0F172A" rx="3" />
                    <rect x="9" y="9" width="18" height="18" fill="#FFFFFF" rx="2" />
                    <rect x="13" y="13" width="10" height="10" fill="#0F172A" rx="1" />

                    <rect x="69" y="5" width="26" height="26" fill="#0F172A" rx="3" />
                    <rect x="73" y="9" width="18" height="18" fill="#FFFFFF" rx="2" />
                    <rect x="77" y="13" width="10" height="10" fill="#0F172A" rx="1" />

                    <rect x="5" y="69" width="26" height="26" fill="#0F172A" rx="3" />
                    <rect x="9" y="73" width="18" height="18" fill="#FFFFFF" rx="2" />
                    <rect x="13" y="77" width="10" height="10" fill="#0F172A" rx="1" />

                    {/* QR Matrix Bits */}
                    <rect x="36" y="8" width="6" height="6" fill="#0F172A" />
                    <rect x="46" y="8" width="6" height="6" fill="#0F172A" />
                    <rect x="56" y="8" width="6" height="6" fill="#0F172A" />
                    <rect x="36" y="18" width="6" height="6" fill="#0F172A" />
                    <rect x="56" y="18" width="6" height="6" fill="#0F172A" />

                    <rect x="8" y="36" width="6" height="6" fill="#0F172A" />
                    <rect x="18" y="36" width="6" height="6" fill="#0F172A" />
                    <rect x="28" y="36" width="6" height="6" fill="#0F172A" />
                    <rect x="38" y="36" width="6" height="6" fill="#0F172A" />
                    <rect x="48" y="36" width="6" height="6" fill="#0F172A" />
                    <rect x="58" y="36" width="6" height="6" fill="#0F172A" />
                    <rect x="68" y="36" width="6" height="6" fill="#0F172A" />
                    <rect x="78" y="36" width="6" height="6" fill="#0F172A" />
                    <rect x="88" y="36" width="6" height="6" fill="#0F172A" />

                    <rect x="36" y="46" width="6" height="6" fill="#0F172A" />
                    <rect x="46" y="46" width="6" height="6" fill="#0F172A" />
                    <rect x="66" y="46" width="6" height="6" fill="#0F172A" />
                    <rect x="86" y="46" width="6" height="6" fill="#0F172A" />

                    <rect x="36" y="56" width="6" height="6" fill="#0F172A" />
                    <rect x="56" y="56" width="6" height="6" fill="#0F172A" />
                    <rect x="76" y="56" width="6" height="6" fill="#0F172A" />

                    <rect x="36" y="66" width="6" height="6" fill="#0F172A" />
                    <rect x="46" y="66" width="6" height="6" fill="#0F172A" />
                    <rect x="66" y="66" width="6" height="6" fill="#0F172A" />

                    <rect x="36" y="76" width="6" height="6" fill="#0F172A" />
                    <rect x="56" y="76" width="6" height="6" fill="#0F172A" />
                    <rect x="76" y="76" width="6" height="6" fill="#0F172A" />
                    <rect x="86" y="76" width="6" height="6" fill="#0F172A" />

                    <rect x="46" y="86" width="6" height="6" fill="#0F172A" />
                    <rect x="66" y="86" width="6" height="6" fill="#0F172A" />
                    <rect x="86" y="86" width="6" height="6" fill="#0F172A" />
                  </svg>
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-1">
                  Scan to verify on blockchain • {selectedCert.id}
                </span>
              </div>

              {/* Status Stamp */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-black uppercase tracking-wider mt-1">
                <span>✔</span>
                <span>Officially Validated</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-4 space-y-2">
              <button
                onClick={() => handleDownloadSingle(selectedCert.id)}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="2" x2="12" y2="3" />
                </svg>
                <span>Download PDF Certificate</span>
              </button>

              <button
                onClick={() => setSelectedCert(null)}
                className="w-full h-10 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-2 border border-slate-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{downloadToast}</span>
        </div>
      )}
    </div>
  );
}
