import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================================
// Sathi Industrial Safety: Phase 3 Podcast / Audio Lessons
// Vernacular Audio Training with Web Audio Engine & Realistic Scrubber
// ============================================================================

const EPISODES_DATA = [
  {
    id: 1,
    number: 1,
    title: 'Personal Protective Equipment (PPE)',
    titleHi: 'व्यक्तिगत सुरक्षा उपकरण (PPE) का सही उपयोग',
    category: 'Safety Basics',
    durationSec: 420, // 7 min
    durationText: '⏱ 7 min • Hindi',
    thumbnailColor: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: '🦺',
    narration: 'नमस्ते साथियों। आज के इस एपिसोड में हम जानेंगे कि माइनिंग और कंस्ट्रक्शन साइट पर पीपीई यानी पर्सनल प्रोटेक्टिव इक्विपमेंट पहनना क्यों अनिवार्य है। सबसे पहले हार्ड हैट, हाई-विजिबिलिटी वेस्ट, और स्टील-टो सेफ्टी बूट्स। यदि आपका वेस्ट फटा है या हेलमेट में दरार है, तो तुरंत सुपरवाइजर से बदलें। याद रखें, सुरक्षा में लापरवाही जानलेवा हो सकती है।',
    summary: 'Essential helmet, high-vis vest, and steel-toe boot protocols.'
  },
  {
    id: 2,
    number: 2,
    title: 'Working at Heights & Scaffold Safety',
    titleHi: 'ऊंचाई पर कार्य और मचान सुरक्षा नियम',
    category: 'Safety Basics',
    durationSec: 360, // 6 min
    durationText: '⏱ 6 min • Hindi',
    thumbnailColor: 'bg-blue-100 text-blue-900 border-blue-300',
    icon: '🪜',
    narration: 'ऊंचाई पर कार्य करते समय दो मीटर से अधिक ऊंचाई पर सेफ्टी हार्नेस लगाना डीजीएमएस नियमों के अनुसार अनिवार्य है। हार्नेस की लाइफलाइन को हमेशा मजबूत एंकर पॉइंट से बांधें। सीढ़ी का कोण चार अनुपात एक पर रखें और मचान के ऊपर बिखरे औजारों को बांधकर रखें ताकि नीचे काम कर रहे साथियों पर ना गिरें।',
    summary: 'Full-body harness anchoring, 100% tie-off, and dropped object hazards.'
  },
  {
    id: 3,
    number: 3,
    title: 'Handling Hazardous Materials & Chemical Spills',
    titleHi: 'खतरनाक सामग्री और रसायन रिसाव नियंत्रण',
    category: 'Expert Tips',
    durationSec: 480, // 8 min
    durationText: '⏱ 8 min • Hindi',
    thumbnailColor: 'bg-purple-100 text-purple-900 border-purple-300',
    icon: '🧪',
    narration: 'रासायनिक पदार्थों और एसिड के ड्रम को हिलाते समय हमेशा नाइट्राइल दस्ताने और फेस शील्ड पहनें। यदि कोई रिसाव दिखाई दे, तो तुरंत हवा की उल्टी दिशा में हटें और अलार्म बजाएं। बिना उचित मास्क के कभी भी बंद कमरे या टैंक में प्रवेश ना करें।',
    summary: 'MSDS compliance, spill berm isolation, and respirators.'
  },
  {
    id: 4,
    number: 4,
    title: 'Real Incident Story: Mine Inundation Prevention',
    titleHi: 'सच्ची घटना: खदान में जलभराव और बचाव',
    category: 'Real Stories',
    durationSec: 300, // 5 min
    durationText: '⏱ 5 min • Hindi',
    thumbnailColor: 'bg-red-100 text-red-900 border-red-300',
    icon: '🌊',
    narration: 'साल 2021 की यह घटना है जब भारी बारिश के दौरान भूमिगत खदान की पुरानी गैलरी में पानी का रिसाव होने लगा था। समय रहते सुरक्षा गार्ड ने दीवार में नमी और पानी की दरार को भांप लिया और तुरंत सभी कर्मचारियों को सुरक्षित बाहर निकलने का अलार्म दे दिया। सतर्कता ही हमारी सबसे बड़ी ढाल है।',
    summary: 'Real case study on underground water seepages and emergency evacuation.'
  },
  {
    id: 5,
    number: 5,
    title: 'Safe Working Near Heavy Machinery',
    titleHi: 'भारी मशीनों और डंपरों के पास सुरक्षित दूरी',
    category: 'Expert Tips',
    durationSec: 540, // 9 min
    durationText: '⏱ 9 min • Hindi',
    thumbnailColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    icon: '🚜',
    narration: 'बड़े डंपर और हाइड्रोलिक एक्सकेवेटर के चारों तरफ बड़े ब्लाइंड स्पॉट्स होते हैं। जब तक ऑपरेटर आपको देखकर रुकने का स्पष्ट इशारा ना दे, मशीन के पीछे या ब्लाइंड जोन में कभी ना जाएं। दस मीटर की सुरक्षित दूरी हर समय बनाकर रखें।',
    summary: 'Haul road right-of-way, operator horn signals, and blind spots.'
  }
];

const CATEGORIES = ['All', 'Safety Basics', 'Real Stories', 'Expert Tips'];
const PLAYBACK_SPEEDS = [1.0, 1.25, 1.5, 2.0];

export default function PodcastAudioLessons({ onBack, onNavigate }) {
  // Navigation & Filter State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeEpisode, setActiveEpisode] = useState(EPISODES_DATA[0]);
  const [downloadedEpisodes, setDownloadedEpisodes] = useState(new Set([1, 4]));
  const [offlineToast, setOfflineToast] = useState(null);

  // Playback & Scrubber State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0); // 1.0x

  const playbackSpeed = PLAYBACK_SPEEDS[speedIndex];
  const scrubberIntervalRef = useRef(null);
  const voiceRef = useRef(null);

  // Filter episodes based on category
  const filteredEpisodes = selectedCategory === 'All'
    ? EPISODES_DATA
    : EPISODES_DATA.filter((ep) => ep.category === selectedCategory);

  // 1. POPULATE WEB SPEECH VOICES (HINDI / INDIAN ENGLISH PREFERRED)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find((v) => v.lang === 'hi-IN' || v.lang.toLowerCase().includes('hi')) ||
                          voices.find((v) => v.lang === 'en-IN' || v.name.toLowerCase().includes('india')) ||
                          voices.find((v) => v.lang.startsWith('en')) ||
                          voices[0];
        voiceRef.current = preferred;
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

  // 2. PLAY / PAUSE VOICE AUDIO ENGINE
  const playEpisode = useCallback((episodeToPlay, startTime = 0) => {
    if (typeof window === 'undefined') return;

    // Reset lingering synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsPlaying(true);
    setCurrentTimeSec(startTime);

    if ('speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(episodeToPlay.narration);
        if (voiceRef.current) {
          utterance.voice = voiceRef.current;
        }
        utterance.lang = 'hi-IN';
        utterance.rate = playbackSpeed;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          setIsPlaying(false);
          setCurrentTimeSec(episodeToPlay.durationSec);
        };

        utterance.onerror = (e) => {
          if (e.error !== 'interrupted') {
            console.warn('Playback audio error:', e);
          }
          setIsPlaying(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech playback failed:', err);
      }
    }
  }, [playbackSpeed]);

  const pauseEpisode = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseEpisode();
    } else {
      playEpisode(activeEpisode, currentTimeSec);
    }
  };

  // 3. PROGRESS SCRUBBER TIMER
  useEffect(() => {
    if (isPlaying) {
      scrubberIntervalRef.current = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= activeEpisode.durationSec) {
            clearInterval(scrubberIntervalRef.current);
            setIsPlaying(false);
            return activeEpisode.durationSec;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (scrubberIntervalRef.current) {
        clearInterval(scrubberIntervalRef.current);
      }
    }

    return () => {
      if (scrubberIntervalRef.current) {
        clearInterval(scrubberIntervalRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, activeEpisode.durationSec]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format remaining time as -mm:ss
  const formatRemaining = (current, total) => {
    const rem = Math.max(0, total - current);
    return `-${formatTime(rem)}`;
  };

  // Scrubber drag / click handler
  const handleSeek = (e) => {
    const newSec = Number(e.target.value);
    setCurrentTimeSec(newSec);
    if (isPlaying) {
      playEpisode(activeEpisode, newSec);
    }
  };

  // Speed multiplier cycle
  const handleCycleSpeed = () => {
    const nextIdx = (speedIndex + 1) % PLAYBACK_SPEEDS.length;
    setSpeedIndex(nextIdx);
    if (isPlaying) {
      pauseEpisode();
      setTimeout(() => {
        playEpisode(activeEpisode, currentTimeSec);
      }, 150);
    }
  };

  // Download toggle handler
  const toggleDownload = (epId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setDownloadedEpisodes((prev) => {
      const next = new Set(prev);
      if (next.has(epId)) {
        next.delete(epId);
        showToast('Removed from offline downloads');
      } else {
        next.add(epId);
        showToast('Saved for offline listening ✓');
      }
      return next;
    });
  };

  const showToast = (msg) => {
    setOfflineToast(msg);
    setTimeout(() => {
      setOfflineToast(null);
    }, 2200);
  };

  // Select new episode from list
  const handleSelectEpisode = (ep) => {
    setActiveEpisode(ep);
    playEpisode(ep, 0);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col justify-between max-w-md mx-auto shadow-2xl relative border-x border-[#E2E8F0] pb-10">
      {/* ====================================================================
          1. TOP APP BAR
          ==================================================================== */}
      <header className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-md px-4 pt-3 pb-2.5 flex items-center justify-between border-b border-slate-200/70">
        {/* Left: Back Button */}
        <button
          onClick={() => {
            pauseEpisode();
            if (onBack) onBack();
          }}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition"
          title="Back to Home Dashboard"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </button>

        {/* Center: Title */}
        <h1 className="text-lg font-black tracking-tight text-slate-900">
          Podcast
        </h1>

        {/* Right: Offline Downloads Indicator */}
        <button
          onClick={() => showToast(`${downloadedEpisodes.size} episodes available offline`)}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition relative"
          title="Offline Downloads"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {downloadedEpisodes.size > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
          )}
        </button>
      </header>

      {/* Main Scroll Content */}
      <main className="flex-1 px-4 pt-2.5 pb-6">
        {/* ====================================================================
            2. CATEGORY FILTER CHIPS (HORIZONTAL SCROLL)
            ==================================================================== */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 mb-3">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ====================================================================
            3. FEATURED ACTIVE PODCAST PLAYER CARD
            ==================================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-5 mb-5 space-y-4 relative overflow-hidden">
          {/* Subtle Ambient Wave Background Graphic */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Upper Row: Worker Avatar + Show Info */}
          <div className="flex items-center gap-3.5">
            {/* Worker Avatar Illustration with Orange Hardhat */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0F172A] to-slate-800 border border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-xs relative">
              <svg viewBox="0 0 60 60" fill="none" className="w-12 h-12">
                {/* Safety Helmet in Bright Orange */}
                <path d="M16 26 C16 16 44 16 44 26 Z" fill="#EA580C" />
                <rect x="13" y="25" width="34" height="4" rx="2" fill="#F97316" />
                {/* Face & Ear Protection */}
                <circle cx="30" cy="36" r="10" fill="#F87171" />
                <rect x="18" y="32" width="4" height="8" rx="2" fill="#0F172A" />
                <rect x="38" y="32" width="4" height="8" rx="2" fill="#0F172A" />
                {/* High-Vis Vest */}
                <path d="M20 46 L40 46 L38 58 L22 58 Z" fill="#FBBF24" />
                <line x1="28" y1="46" x2="28" y2="58" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="32" y1="46" x2="32" y2="58" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
              {/* Active Audio Wave Indicator Dot */}
              {isPlaying && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping ring-2 ring-white" />
              )}
            </div>

            {/* Title & Subtitle */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider mb-1">
                <span>🎙️</span>
                <span>Episode {activeEpisode.number}</span>
              </div>
              <h2 className="text-[17px] font-black text-slate-900 leading-snug truncate">
                सुरक्षा की बातें
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate">
                {activeEpisode.title}
              </p>
            </div>
          </div>

          {/* Audio Scrubber & Timeline */}
          <div className="space-y-1.5 pt-1">
            {/* Interactive Seekbar Slider */}
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max={activeEpisode.durationSec}
                value={currentTimeSec}
                onChange={handleSeek}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
              />
            </div>

            {/* Time Indicators Row */}
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 px-0.5">
              <span>{formatTime(currentTimeSec)}</span>
              <span>{formatRemaining(currentTimeSec, activeEpisode.durationSec)}</span>
            </div>
          </div>

          {/* Audio Controls Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {/* Rewind 15s */}
            <button
              onClick={() => {
                const target = Math.max(0, currentTimeSec - 15);
                setCurrentTimeSec(target);
                if (isPlaying) playEpisode(activeEpisode, target);
              }}
              className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs active:scale-90 transition"
              title="Rewind 15 seconds"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>

            {/* Primary Play / Pause Button */}
            <button
              onClick={togglePlayPause}
              className="w-14 h-14 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 active:scale-95 transition"
              title={isPlaying ? 'Pause Lesson' : 'Play Lesson'}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-6 h-6 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            {/* Fast Forward 15s */}
            <button
              onClick={() => {
                const target = Math.min(activeEpisode.durationSec, currentTimeSec + 15);
                setCurrentTimeSec(target);
                if (isPlaying) playEpisode(activeEpisode, target);
              }}
              className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs active:scale-90 transition"
              title="Fast Forward 15 seconds"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>

            {/* Speed Multiplier Pill */}
            <button
              onClick={handleCycleSpeed}
              className="h-8 px-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold text-xs active:scale-95 transition"
              title="Change Playback Speed"
            >
              {playbackSpeed.toFixed(2).replace('.00', '.0')}x
            </button>
          </div>
        </div>

        {/* ====================================================================
            4. EPISODES LIST SECTION
            ==================================================================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Episodes ({filteredEpisodes.length})
            </h3>
            <span className="text-xs font-bold text-blue-600">
              DGMS Audio Library
            </span>
          </div>

          <div className="space-y-2.5">
            {filteredEpisodes.map((ep) => {
              const isSelected = activeEpisode.id === ep.id;
              const isDownloaded = downloadedEpisodes.has(ep.id);

              return (
                <div
                  key={ep.id}
                  onClick={() => handleSelectEpisode(ep)}
                  className={`rounded-2xl p-3 flex items-center justify-between transition cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-300 shadow-sm'
                      : 'bg-white border-slate-100 hover:border-slate-200 shadow-xs'
                  }`}
                >
                  {/* Left Column: Number + Thumbnail */}
                  <div className="flex items-center">
                    <span className="w-4 font-bold text-xs text-slate-400 text-center">
                      {ep.number}
                    </span>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ml-2 shrink-0 border ${ep.thumbnailColor}`}>
                      {ep.icon}
                    </div>
                  </div>

                  {/* Middle Column: Title & Duration */}
                  <div className="flex-1 ml-3 min-w-0 pr-2">
                    <h4 className={`text-[13px] font-black leading-snug truncate ${
                      isSelected ? 'text-blue-900' : 'text-slate-900'
                    }`}>
                      {ep.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5 truncate">
                      {ep.durationText}
                    </p>
                  </div>

                  {/* Right Column: Actions (Offline Download / Playing pill) */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && isPlaying ? (
                      <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-xs animate-pulse">
                        ▶
                      </span>
                    ) : (
                      <button
                        onClick={(e) => toggleDownload(ep.id, e)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition active:scale-90 ${
                          isDownloaded
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-400 hover:text-slate-700'
                        }`}
                        title={isDownloaded ? 'Downloaded Offline' : 'Save Offline'}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ====================================================================
            5. NEXT DRILL CTA BUTTON ("FLASHCARDS / REVISE MISTAKES")
            ==================================================================== */}
        <div className="mt-6 pt-2">
          <button
            onClick={() => {
              pauseEpisode();
              if (onNavigate) onNavigate('flashcards');
            }}
            className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 active:scale-[0.98] text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            <span>Next: Revise Mistakes (Flashcards) ➔</span>
          </button>
        </div>
      </main>

      {/* Floating Offline Toast Notification */}
      {offlineToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          {offlineToast}
        </div>
      )}
    </div>
  );
}
