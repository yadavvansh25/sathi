import React, { useState, useMemo } from 'react';

// ============================================================================
// Sathi Industrial Safety: Phase 4 Flashcards (Your Mistakes)
// AI-Powered Revision System with Interactive MCQ Evaluation & SVG Hazard Signs
// ============================================================================

const FLASHCARDS_DATA = [
  {
    id: 1,
    questionNumber: 1,
    topic: 'Personal Protective Equipment',
    category: 'Safety Signs',
    isMistake: true,
    isWeakTopic: false,
    signType: 'mandatory-ppe',
    question: 'What does this mandatory blue circular safety sign indicate?',
    options: [
      { id: 'A', text: 'Hard hat & safety boots required on site' },
      { id: 'B', text: 'Authorized personnel only' },
      { id: 'C', text: 'First-aid post ahead' },
      { id: 'D', text: 'Hearing protection optional zone' }
    ],
    correctAnswer: 'A',
    previousMistakeAnswer: 'B', // Previously chosen wrong answer
    explanation: 'Blue circular signs indicate mandatory actions. This sign specifies that both industrial safety helmets and steel-toe protective boots must be worn at all times.',
    regulatoryRef: 'DGMS Safety Circular 02/2019 • Rule 182 (PPE Compliance)'
  },
  {
    id: 2,
    questionNumber: 2,
    topic: 'Gas & Atmospheric Hazards',
    category: 'Gas Hazards',
    isMistake: false,
    isWeakTopic: true,
    signType: 'toxic-gas',
    question: 'What is the immediate action when a multi-gas detector sounds the Carbon Monoxide (CO) high alarm (>50 ppm)?',
    options: [
      { id: 'A', text: 'Continue working with open damp cloth on face' },
      { id: 'B', text: 'Immediately evacuate upwind and notify the control room' },
      { id: 'C', text: 'Reset the detector and wait 15 minutes' },
      { id: 'D', text: 'Increase diesel vehicle throttle to clear the air' }
    ],
    correctAnswer: 'B',
    previousMistakeAnswer: null,
    explanation: 'Carbon Monoxide (CO) is a deadly, odorless, and colorless toxic gas. When CO exceeds 50 ppm, personnel must immediately withdraw to fresh air upwind and notify safety supervisors.',
    regulatoryRef: 'CMR 2017 • Regulation 153 (Ventilation & Mine Atmosphere Monitoring)'
  },
  {
    id: 3,
    questionNumber: 3,
    topic: 'Chemical & Fire Safety',
    category: 'Safety Signs',
    isMistake: true,
    isWeakTopic: true,
    signType: 'flammable-material', // The exact mockup sign
    question: 'What does this safety sign indicate?',
    options: [
      { id: 'A', text: 'A. Explosive material' },
      { id: 'B', text: 'B. Flammable material' },
      { id: 'C', text: 'C. High voltage' },
      { id: 'D', text: 'D. Slippery surface' }
    ],
    correctAnswer: 'B',
    previousMistakeAnswer: 'A', // Matches reference mockup where user previously failed on this question
    explanation: 'This sign indicates flammable material, which can easily catch fire. Keep away from naked flames, grinding sparks, and ungrounded electrical switches.',
    regulatoryRef: 'ISO 7010 - W021 • Warning: Flammable Material'
  },
  {
    id: 4,
    questionNumber: 4,
    topic: 'Electrical Isolation & LOTO',
    category: 'Electrical Safety',
    isMistake: true,
    isWeakTopic: false,
    signType: 'high-voltage',
    question: 'What does this yellow equilateral warning triangle with a jagged flash indicate?',
    options: [
      { id: 'A', text: 'Danger: High Voltage / Risk of Electric Shock' },
      { id: 'B', text: 'Overhead crane working zone' },
      { id: 'C', text: 'Lightning strike detection tower' },
      { id: 'D', text: 'Battery charging bay' }
    ],
    correctAnswer: 'A',
    previousMistakeAnswer: 'C',
    explanation: 'This sign warns of high electrical voltage capable of causing fatal electrocution or arc flashes. LOTO (Lockout/Tagout) and zero-energy verification are mandatory before contact.',
    regulatoryRef: 'Central Electricity Authority (Measures Relating to Safety) Reg. 18'
  },
  {
    id: 5,
    questionNumber: 5,
    topic: 'Emergency Response',
    category: 'Procedures',
    isMistake: false,
    isWeakTopic: false,
    signType: 'emergency-exit',
    question: 'What is the meaning of the green rectangular sign showing a white figure running toward a door?',
    options: [
      { id: 'A', text: 'Exercise and running area for miners' },
      { id: 'B', text: 'Emergency escape route / Emergency exit' },
      { id: 'C', text: 'Entry forbidden during blast operations' },
      { id: 'D', text: 'Rest shelter for heavy equipment operators' }
    ],
    correctAnswer: 'B',
    previousMistakeAnswer: null,
    explanation: 'Green rectangular signs denote safety equipment and emergency egress. This sign marks designated escapeways that must be kept clear of any obstruction.',
    regulatoryRef: 'ISO 7010 - E001 • Emergency Exit / Escape Route'
  },
  {
    id: 6,
    questionNumber: 6,
    topic: 'Compressed Gas Safety',
    category: 'Safety Signs',
    isMistake: true,
    isWeakTopic: true,
    signType: 'gas-cylinder',
    question: 'What is the primary hazard represented by this gas cylinder warning symbol?',
    options: [
      { id: 'A', text: 'Beverage distribution depot' },
      { id: 'B', text: 'Danger: Gas Under High Pressure (Blast / Rupture Risk)' },
      { id: 'C', text: 'Water reservoir filtration tank' },
      { id: 'D', text: 'Oxygen cylinder recycling bin' }
    ],
    correctAnswer: 'B',
    previousMistakeAnswer: 'D',
    explanation: 'Gas cylinders under pressure can become dangerous unguided projectiles or cause catastrophic ruptures if dropped, heated, or stored without protective valve caps.',
    regulatoryRef: 'Gas Cylinder Rules 2016 • Rule 21 (Safe Stacking & Valve Caps)'
  },
  {
    id: 7,
    questionNumber: 7,
    topic: 'Working at Heights',
    category: 'Procedures',
    isMistake: true,
    isWeakTopic: false,
    signType: 'fall-protection',
    question: 'Under DGMS regulations, what is the mandatory minimum height threshold above which a full-body safety harness must be anchored?',
    options: [
      { id: 'A', text: '1.8 meters (approx. 6 feet)' },
      { id: 'B', text: '5.0 meters (approx. 16 feet)' },
      { id: 'C', text: '10 meters (approx. 33 feet)' },
      { id: 'D', text: 'Only when working over water bodies' }
    ],
    correctAnswer: 'A',
    previousMistakeAnswer: 'B',
    explanation: 'Working at any height exceeding 1.8 meters requires a certified full-body harness connected to a rigid 22.2 kN rated anchor point with an energy-absorbing lanyard.',
    regulatoryRef: 'DGMS Tech. Circular No. 06 • Prevention of Falls from Heights'
  },
  {
    id: 8,
    questionNumber: 8,
    topic: 'Heavy Conveyor Systems',
    category: 'Machinery',
    isMistake: false,
    isWeakTopic: true,
    signType: 'conveyor-nip',
    question: 'What is the function of the continuous trip-wire cable running alongside overland belt conveyors?',
    options: [
      { id: 'A', text: 'To transmit audio communication to the driver' },
      { id: 'B', text: 'Emergency Pull-Cord Switch to immediately stop the belt' },
      { id: 'C', text: 'Earth grounding conductor for static electricity' },
      { id: 'D', text: 'Overhead lighting support wire' }
    ],
    correctAnswer: 'B',
    previousMistakeAnswer: null,
    explanation: 'The pull-cord switch allows any worker along the conveyor length to instantaneously trip and de-energize the drive motor in case of entrapment or mechanical jam.',
    regulatoryRef: 'IS 11592 • Safety Code for Belt Conveyors & Nip Point Guards'
  },
  {
    id: 9,
    questionNumber: 9,
    topic: 'Confined Space Operations',
    category: 'Procedures',
    isMistake: true,
    isWeakTopic: true,
    signType: 'confined-space',
    question: 'What mandatory pre-condition must be met before any worker enters an underground sump or fuel storage tank?',
    options: [
      { id: 'A', text: 'Spray chemical deodorizer inside' },
      { id: 'B', text: 'Atmospheric gas testing, mechanical ventilation & signed permit' },
      { id: 'C', text: 'Ensure work is completed within 5 minutes without testing' },
      { id: 'D', text: 'Carry a burning candle to test oxygen' }
    ],
    correctAnswer: 'B',
    previousMistakeAnswer: 'D',
    explanation: 'Never use an open flame to test oxygen in confined spaces! Calibrated 4-gas testing (O2, LEL, CO, H2S), forced ventilation, and a Confined Space Entry Permit are required.',
    regulatoryRef: 'The Factories Act 1948 • Section 36 (Precautions Against Dangerous Fumes)'
  },
  {
    id: 10,
    questionNumber: 10,
    topic: 'Emergency First Aid',
    category: 'Safety Signs',
    isMistake: false,
    isWeakTopic: false,
    signType: 'eyewash-station',
    question: 'If hazardous acid or caustic solution splashes into a worker\'s eyes, what does this green cross & eye sign mark?',
    options: [
      { id: 'A', text: 'Drinking water dispenser' },
      { id: 'B', text: 'Emergency Eye-Wash Station (Flush eyes with water for 15 min)' },
      { id: 'C', text: 'Doctor consultation cabin' },
      { id: 'D', text: 'Goggle disposal recycling bin' }
    ],
    correctAnswer: 'B',
    previousMistakeAnswer: null,
    explanation: 'Emergency eyewash units provide immediate continuous water irrigation to flush harmful corrosive chemicals from the eyes, preventing permanent retinal blindness.',
    regulatoryRef: 'ANSI/ISEA Z358.1 • Standard for Emergency Eyewash and Shower Equipment'
  }
];

export default function FlashcardsMistakes({ onBack, onNavigate }) {
  // Sub-filter tabs: 'my-mistakes' (default as per mockup) | 'all' | 'weak-topics'
  const [activeTab, setActiveTab] = useState('my-mistakes');
  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);

  // User interactions for current session
  // Record of { [questionId]: { selectedAnswer: string, isSubmitted: boolean } }
  const [answersState, setAnswersState] = useState(() => {
    // Pre-initialize question #3 (Flammable material) in mistake review mode if on my-mistakes
    const initial = {};
    FLASHCARDS_DATA.forEach((q) => {
      if (q.isMistake && q.previousMistakeAnswer) {
        initial[q.id] = {
          selectedAnswer: q.previousMistakeAnswer,
          isSubmitted: true
        };
      }
    });
    return initial;
  });

  const [shakeOptionId, setShakeOptionId] = useState(null);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

  // Filter cards based on active tab
  const activeDeck = useMemo(() => {
    if (activeTab === 'my-mistakes') {
      return FLASHCARDS_DATA.filter((q) => q.isMistake);
    }
    if (activeTab === 'weak-topics') {
      return FLASHCARDS_DATA.filter((q) => q.isWeakTopic);
    }
    return FLASHCARDS_DATA;
  }, [activeTab]);

  // Safe current question
  const currentQuestion = activeDeck[currentDeckIndex] || activeDeck[0] || FLASHCARDS_DATA[0];
  const totalDeckCount = activeDeck.length;

  const currentAnswerInfo = answersState[currentQuestion.id] || {
    selectedAnswer: null,
    isSubmitted: false
  };

  // Switch tab handler
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setCurrentDeckIndex(0);
    setIsCompletedModalOpen(false);
  };

  // Handle option click
  const handleSelectOption = (optionId) => {
    const isCorrect = optionId === currentQuestion.correctAnswer;

    // Trigger subtle shake if wrong
    if (!isCorrect) {
      setShakeOptionId(optionId);
      setTimeout(() => setShakeOptionId(null), 600);
    }

    setAnswersState((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedAnswer: optionId,
        isSubmitted: true
      }
    }));
  };

  // Handle Next button click
  const handleNext = () => {
    if (currentDeckIndex < totalDeckCount - 1) {
      setCurrentDeckIndex((prev) => prev + 1);
    } else {
      setIsCompletedModalOpen(true);
    }
  };

  // Reset deck
  const handleRestartDeck = () => {
    setCurrentDeckIndex(0);
    setIsCompletedModalOpen(false);
  };

  // Helper to render accurate, high-contrast SVG signs
  const renderHazardSign = (type) => {
    switch (type) {
      case 'flammable-material':
        // Yellow warning equilateral triangle with flame symbol inside (The exact mockup)
        return (
          <div className="relative w-28 h-28 flex items-center justify-center filter drop-shadow-sm">
            <svg viewBox="0 0 100 90" className="w-full h-full" fill="none">
              {/* Outer Triangle with thick border */}
              <polygon
                points="50,6 94,84 6,84"
                fill="#FACC15"
                stroke="#0F172A"
                strokeWidth="7"
                strokeLinejoin="round"
              />
              {/* Inner subtle yellow highlight line */}
              <polygon
                points="50,14 86,79 14,79"
                fill="#FACC15"
              />
              {/* Bold Black Fire / Flame Graphic */}
              <path
                d="M50 32
                   C52 40, 58 45, 57 52
                   C56 59, 51 63, 50 63
                   C48 63, 47 62, 47 60
                   C47 56, 50 54, 49 50
                   C48 45, 41 48, 41 57
                   C41 64, 47 69, 53 69
                   C61 69, 66 62, 66 53
                   C66 45, 60 38, 50 32 Z"
                fill="#0F172A"
              />
              <path
                d="M48 55
                   C49 52, 53 52, 53 58
                   C53 62, 50 65, 48 65
                   C45 65, 44 62, 45 59
                   C46 57, 47 56, 48 55 Z"
                fill="#FACC15"
              />
            </svg>
          </div>
        );

      case 'high-voltage':
        // High voltage lightning bolt
        return (
          <div className="relative w-28 h-28 flex items-center justify-center filter drop-shadow-sm">
            <svg viewBox="0 0 100 90" className="w-full h-full" fill="none">
              <polygon
                points="50,6 94,84 6,84"
                fill="#FACC15"
                stroke="#0F172A"
                strokeWidth="7"
                strokeLinejoin="round"
              />
              {/* Lightning Bolt */}
              <path
                d="M54 28 L40 50 L48 50 L44 68 L60 46 L51 46 Z"
                fill="#0F172A"
                stroke="#0F172A"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );

      case 'mandatory-ppe':
        // Blue circular mandatory PPE sign with helmet & boots
        return (
          <div className="relative w-28 h-28 flex items-center justify-center filter drop-shadow-sm">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <circle cx="50" cy="50" r="44" fill="#2563EB" stroke="#FFFFFF" strokeWidth="4" />
              {/* White Helmet */}
              <path d="M50 24 C40 24 34 30 34 38 L66 38 C66 30 60 24 50 24 Z" fill="#FFFFFF" />
              <rect x="30" y="38" width="40" height="4" rx="2" fill="#FFFFFF" />
              {/* Steel-toe boot */}
              <path d="M40 50 L48 50 L48 64 L62 64 C64 64 66 66 66 69 L66 74 L38 74 L38 52 C38 50 39 50 40 50 Z" fill="#FFFFFF" />
              <rect x="36" y="72" width="32" height="4" rx="1" fill="#FFFFFF" />
            </svg>
          </div>
        );

      case 'emergency-exit':
        // Green ISO Emergency Escape sign
        return (
          <div className="relative w-32 h-24 flex items-center justify-center filter drop-shadow-sm">
            <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
              <rect x="4" y="4" width="112" height="72" rx="8" fill="#16A34A" stroke="#FFFFFF" strokeWidth="3" />
              {/* Running man silhouette */}
              <circle cx="68" cy="26" r="6" fill="#FFFFFF" />
              <path d="M68 34 L62 48 L54 44 L48 56" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M62 48 L72 62 L80 60" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M64 36 L76 42 L84 38" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {/* Door frame */}
              <rect x="22" y="18" width="20" height="46" fill="none" stroke="#FFFFFF" strokeWidth="4" />
              <polygon points="26,40 34,34 34,46" fill="#FFFFFF" />
            </svg>
          </div>
        );

      case 'toxic-gas':
        // Yellow triangle with skull and crossbones
        return (
          <div className="relative w-28 h-28 flex items-center justify-center filter drop-shadow-sm">
            <svg viewBox="0 0 100 90" className="w-full h-full" fill="none">
              <polygon
                points="50,6 94,84 6,84"
                fill="#FACC15"
                stroke="#0F172A"
                strokeWidth="7"
                strokeLinejoin="round"
              />
              {/* Skull */}
              <path d="M50 32 C43 32 38 37 38 44 C38 48 40 51 43 53 L43 58 L57 58 L57 53 C60 51 62 48 62 44 C62 37 57 32 50 32 Z" fill="#0F172A" />
              {/* Eye holes */}
              <circle cx="45" cy="44" r="3" fill="#FACC15" />
              <circle cx="55" cy="44" r="3" fill="#FACC15" />
              {/* Teeth lines */}
              <line x1="47" y1="58" x2="47" y2="54" stroke="#FACC15" strokeWidth="1.5" />
              <line x1="53" y1="58" x2="53" y2="54" stroke="#FACC15" strokeWidth="1.5" />
              {/* Crossbones */}
              <path d="M35 62 L65 72 M65 62 L35 72" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        );

      default:
        // Generic industrial warning triangle
        return (
          <div className="relative w-28 h-28 flex items-center justify-center filter drop-shadow-sm">
            <svg viewBox="0 0 100 90" className="w-full h-full" fill="none">
              <polygon
                points="50,6 94,84 6,84"
                fill="#FACC15"
                stroke="#0F172A"
                strokeWidth="7"
                strokeLinejoin="round"
              />
              <line x1="50" y1="36" x2="50" y2="58" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
              <circle cx="50" cy="70" r="3.5" fill="#0F172A" />
            </svg>
          </div>
        );
    }
  };

  const isCurrentMistake = currentQuestion.isMistake;
  const isAnswered = currentAnswerInfo.isSubmitted;
  const selectedOptionId = currentAnswerInfo.selectedAnswer;
  const isSelectedCorrect = selectedOptionId === currentQuestion.correctAnswer;

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
          title="Return to Previous Screen"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Center: Title */}
        <h1 className="text-lg font-black text-slate-900 tracking-tight">
          Flashcards
        </h1>

        {/* Right: Info / Filter spacer */}
        <button
          onClick={() => {
            alert('AI Revision Mode: Flashcards prioritize critical safety questions previously failed in assessments to ensure zero-accident compliance.');
          }}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center shadow-xs transition"
          title="Deck Info"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 pt-3 pb-28 overflow-y-auto">
        {/* ====================================================================
            2. SUB-FILTER SEGMENTED TABS (ALL CARDS | MY MISTAKES | WEAK TOPICS)
            ==================================================================== */}
        <div className="bg-[#F1F5F9] p-1 rounded-full flex items-center justify-between text-xs font-semibold border border-slate-200/60 mb-3 shadow-inner">
          <button
            onClick={() => handleTabChange('all')}
            className={`flex-1 py-1.5 px-3 rounded-full text-center transition ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            All Cards
          </button>

          <button
            onClick={() => handleTabChange('my-mistakes')}
            className={`flex-1 py-1.5 px-3 rounded-full text-center transition ${
              activeTab === 'my-mistakes'
                ? 'bg-[#2563EB] text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            My Mistakes
          </button>

          <button
            onClick={() => handleTabChange('weak-topics')}
            className={`flex-1 py-1.5 px-3 rounded-full text-center transition ${
              activeTab === 'weak-topics'
                ? 'bg-[#2563EB] text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            Weak Topics
          </button>
        </div>

        {/* ====================================================================
            3. QUESTION METADATA ROW (PROGRESS COUNTER & MISTAKE BADGE)
            ==================================================================== */}
        <div className="flex items-center justify-between mt-2 mb-2 px-0.5">
          {/* Question Counter (e.g., Question 3 / 10) */}
          <span className="text-sm font-bold text-slate-600 tracking-tight">
            Question {currentDeckIndex + 1} / {totalDeckCount}
          </span>

          {/* Right Status Badge */}
          {isCurrentMistake ? (
            <div className="bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] font-black text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
              <span className="text-xs">🚩</span>
              <span>Mistake</span>
            </div>
          ) : currentQuestion.isWeakTopic ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 font-black text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
              <span className="text-xs">⚡</span>
              <span>Weak Topic</span>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 font-black text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
              <span className="text-xs">📚</span>
              <span>Drill Card</span>
            </div>
          )}
        </div>

        {/* Progress Bar Line */}
        <div className="w-full bg-slate-200/80 h-1 rounded-full overflow-hidden mb-3">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentDeckIndex + 1) / totalDeckCount) * 100}%` }}
          />
        </div>

        {/* ====================================================================
            4. HAZARD SIGN DISPLAY CARD (HIGH-CONTRAST SVG ARTWORK)
            ==================================================================== */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-center my-2.5 min-h-[160px] relative overflow-hidden">
          {/* Background subtle radial texture */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white pointer-events-none" />

          {/* Dynamic Hazard Sign */}
          <div className="relative z-10">
            {renderHazardSign(currentQuestion.signType)}
          </div>
        </div>

        {/* ====================================================================
            5. QUESTION TITLE
            ==================================================================== */}
        <h2 className="text-base font-black text-slate-900 leading-snug my-3">
          {currentQuestion.question}
        </h2>

        {/* ====================================================================
            6. MULTIPLE CHOICE OPTION PILLS (A, B, C, D)
            ==================================================================== */}
        <div className="space-y-2.5 mb-3">
          {currentQuestion.options.map((option) => {
            const isThisSelected = selectedOptionId === option.id;
            const isThisCorrect = option.id === currentQuestion.correctAnswer;
            const isShaking = shakeOptionId === option.id;

            // Determine pill styling based on evaluation state
            let pillStyle = 'bg-white border-slate-200 text-slate-800 hover:border-slate-300';
            let iconBadge = null;

            if (isAnswered) {
              if (isThisSelected && !isThisCorrect) {
                // Incorrectly selected option: Soft red bg, bold red border, red text, X icon
                pillStyle = 'bg-[#FEF2F2] border-[#EF4444] text-[#B91C1C] font-bold shadow-xs';
                iconBadge = (
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                    ✕
                  </span>
                );
              } else if (isThisCorrect) {
                // Correct answer: Soft green bg, green border, checkmark icon
                pillStyle = 'bg-[#F0FDF4] border-[#22C55E] text-[#15803D] font-bold shadow-xs';
                iconBadge = (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                    ✓
                  </span>
                );
              } else {
                pillStyle = 'bg-white border-slate-200 text-slate-400 opacity-75';
              }
            } else if (isThisSelected) {
              pillStyle = 'bg-blue-50 border-blue-500 text-blue-900 font-bold';
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`w-full p-3.5 rounded-xl border text-sm text-left transition-all duration-200 flex items-center justify-between gap-3 active:scale-[0.99] ${pillStyle} ${
                  isShaking ? 'animate-bounce border-red-500' : ''
                }`}
              >
                <span className="leading-snug">
                  {option.text}
                </span>
                {iconBadge}
              </button>
            );
          })}
        </div>

        {/* ====================================================================
            7. EXPLANATION & RATIONALE CARD
            ==================================================================== */}
        {isAnswered && (
          <div
            className={`rounded-xl p-3.5 border transition-all duration-300 ${
              isSelectedCorrect
                ? 'bg-[#F0FDF4] border-emerald-200 text-emerald-950'
                : 'bg-[#FEF2F2] border-red-200 text-slate-800'
            }`}
          >
            {/* Status indicator row */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSelectedCorrect ? 'bg-emerald-600' : 'bg-red-600 animate-pulse'
                }`}
              />
              <span
                className={`text-xs font-black uppercase tracking-wider ${
                  isSelectedCorrect ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {isSelectedCorrect ? 'Correct Answer' : 'Incorrect'}
              </span>
            </div>

            {/* Detailed Explanation */}
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {currentQuestion.explanation}
            </p>

            {/* Regulatory Reference Footnote */}
            {currentQuestion.regulatoryRef && (
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                <span>⚖️</span>
                <span className="truncate">{currentQuestion.regulatoryRef}</span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ====================================================================
          8. BOTTOM ACTION BUTTON ("NEXT")
          ==================================================================== */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md p-4 border-t border-slate-200 z-40">
        <button
          onClick={handleNext}
          className="w-full h-13 bg-[#1E293B] hover:bg-slate-900 active:scale-[0.98] text-white font-bold text-sm tracking-wide rounded-2xl flex items-center justify-center shadow-lg transition"
        >
          {currentDeckIndex < totalDeckCount - 1 ? (
            <span>Next</span>
          ) : (
            <span>Finish Revision & View Results</span>
          )}
        </button>
      </footer>

      {/* ====================================================================
          9. COMPLETION & MASTERY MODAL SHEET
          ==================================================================== */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-6 text-center">
            {/* Celebration Icon */}
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
              🏆
            </div>

            <h3 className="text-lg font-black text-slate-900 leading-tight">
              Mistakes Revision Completed!
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              You reviewed {totalDeckCount} critical industrial safety flashcards. All identified knowledge gaps have been corrected.
            </p>

            {/* Scorecard Summary */}
            <div className="bg-slate-50 rounded-2xl p-3.5 my-4 border border-slate-200/80 flex items-center justify-around text-center">
              <div>
                <span className="block text-xs font-medium text-slate-500">Cards</span>
                <span className="text-base font-black text-slate-800">{totalDeckCount}</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="block text-xs font-medium text-slate-500">Mastered</span>
                <span className="text-base font-black text-emerald-600">100%</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="block text-xs font-medium text-slate-500">XP Gained</span>
                <span className="text-base font-black text-amber-600">+60 XP</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsCompletedModalOpen(false);
                  if (onNavigate) onNavigate('certificates');
                }}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>View My Certificates ➔</span>
              </button>

              <button
                onClick={handleRestartDeck}
                className="w-full h-10 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Revise Deck Again ↺
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
