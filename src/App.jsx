import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import HomeDashboard from './HomeDashboard';
import ARTrainingModule from './ARTrainingModule';
import PodcastAudioLessons from './PodcastAudioLessons';
import FlashcardsMistakes from './FlashcardsMistakes';

// ============================================================================
// SurakshaAR: Real-Time AI Computer Vision & Dual-Format Guidance Engine
// (TensorFlow.js + Chromatic Flame Analysis + Native Web Speech Synthesis)
// ============================================================================

const ELECTRICAL_CLASSES = new Set([
  'laptop', 'tv', 'cell phone', 'microwave', 'oven', 'refrigerator',
  'keyboard', 'mouse', 'toaster', 'sink'
]);

const EXTINGUISHER_CLASSES = new Set([
  'bottle', 'fire extinguisher', 'vase', 'cup'
]);

export default function App() {
  const [activeScreen, setActiveScreen] = useState('home'); // 'home' | 'ar-training' | 'ai-detector'
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);
  const [isStreamingLive, setIsStreamingLive] = useState(false);

  // Vision Detection State
  const [detections, setDetections] = useState([]);
  const [hasFlame, setHasFlame] = useState(false);
  const [hasElectrical, setHasElectrical] = useState(false);
  const [hasExtinguisher, setHasExtinguisher] = useState(false);
  const [hasWorker, setHasWorker] = useState(false);
  const [primaryTarget, setPrimaryTarget] = useState(null);

  // Procedural Resolution State
  const [hazardResolved, setHazardResolved] = useState(false);
  const [completedActions, setCompletedActions] = useState([]);

  // Voice Guidance State & Web Speech Synthesis
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');

  // Hardware and Canvas References
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const processingCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const modelRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastInferenceTimeRef = useRef(0);

  // Cached voice and debounced speech tracking
  const voiceRef = useRef(null);
  const lastSpokenRef = useRef({ text: '', timestamp: 0 });

  // 1. SPEECH UNLOCK ON USER INTERACTION (THE GOLDEN FIX)
  const unlockSpeechEngine = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const silentPrimer = new SpeechSynthesisUtterance('');
        silentPrimer.volume = 0;
        window.speechSynthesis.speak(silentPrimer);
        console.log("🔊 Speech Engine Primed & Unlocked via User Gesture");
      } catch (err) {
        console.warn("Speech unlock warning:", err);
      }
    }
  }, []);

  // 2. ASYNC VOICE PREPARATION HOOK
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      const availableVoices = window.speechSynthesis.getVoices();
      // Prioritize Hindi or Indian English voice, fallback to first available
      const preferredVoice = availableVoices.find(v => v.lang === 'hi-IN' || v.lang.includes('hi')) ||
                             availableVoices.find(v => v.lang === 'en-IN') ||
                             availableVoices[0];
      voiceRef.current = preferredVoice;
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 3. BULLETPROOF speakGuidance FUNCTION
  const speakGuidance = useCallback((textToSpeak, force = false) => {
    if (!textToSpeak || isMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn("Speech Synthesis not supported in this browser.");
      return;
    }

    const now = Date.now();
    // Don't repeat the exact same sentence within 5 seconds unless forced
    if (!force && lastSpokenRef.current.text === textToSpeak && (now - lastSpokenRef.current.timestamp) < 5000) {
      return;
    }

    // Cancel any lingering queued speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }
    utterance.rate = 0.95; // Clear and understandable speed
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      console.log("🔊 Speech Started:", textToSpeak);
      setIsSpeaking(true);
      setCurrentSubtitle(textToSpeak);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') {
        console.error("Speech Error:", e);
      }
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
    lastSpokenRef.current = { text: textToSpeak, timestamp: now };
  }, [isMuted]);

  // Toggle Mute Audio Controller
  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else if (!next) {
        unlockSpeechEngine();
      }
      return next;
    });
  };

  // 2. ASYNCHRONOUS TENSORFLOW COCO-SSD INITIALIZATION
  useEffect(() => {
    let isMounted = true;
    const initModel = async () => {
      try {
        setModelLoading(true);
        await tf.ready();
        const loaded = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        if (isMounted) {
          modelRef.current = loaded;
          setModelLoading(false);
        }
      } catch (err) {
        console.warn('COCO-SSD model load error, retrying standard mobilenet:', err);
        try {
          const fallback = await cocoSsd.load();
          if (isMounted) {
            modelRef.current = fallback;
            setModelLoading(false);
          }
        } catch (e2) {
          console.error('All model loading attempts failed:', e2);
          if (isMounted) {
            setModelError('AI Vision Engine initialization failed.');
            setModelLoading(false);
          }
        }
      }
    };

    initModel();

    return () => {
      isMounted = false;
    };
  }, []);

  // 3. STOP CAMERA & CLEANUP MEDIA STREAM AND AUDIO
  const stopCamera = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentSubtitle('');
    lastSpokenRef.current = { text: '', timestamp: 0 };

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try { t.stop(); } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreamingLive(false);
    setCameraActive(false);
    setActiveScreen('home');
    setDetections([]);
    setHasFlame(false);
    setHasElectrical(false);
    setHasExtinguisher(false);
    setHasWorker(false);
    setPrimaryTarget(null);
  }, []);

  // 4. START HARDWARE CAMERA
  const startCamera = async () => {
    unlockSpeechEngine();
    setCameraError(null);
    setIsStreamingLive(false);
    setHazardResolved(false);
    setCompletedActions([]);
    setCurrentSubtitle('');
    lastSpokenRef.current = { text: '', timestamp: 0 };

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser.');
      return;
    }

    const primaryConstraints = {
      video: {
        facingMode: 'environment', // Soft preference
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia(primaryConstraints);
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (fallbackErr) {
        setCameraError('Camera access blocked. Please allow camera permissions in browser.');
        setCameraActive(false);
        return;
      }
    }

    if (stream) {
      streamRef.current = stream;
      setCameraActive(true);
    }
  };

  // 5. ATTACH MEDIA STREAM TO VIDEO ELEMENT
  useEffect(() => {
    if (!cameraActive || !streamRef.current) return;

    let isMounted = true;
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = streamRef.current;

    const handleLoadedMetadata = () => {
      if (!isMounted) return;
      video.play().catch(() => {});
    };

    const handlePlaying = () => {
      if (!isMounted) return;
      setIsStreamingLive(true);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('playing', handlePlaying);

    const fallbackTimer = setTimeout(() => {
      if (video && (video.paused || video.videoWidth === 0)) {
        video.play().catch(() => {});
      }
    }, 600);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      if (video) {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('playing', handlePlaying);
      }
    };
  }, [cameraActive]);

  // 6. CHROMATIC PIXEL FLAME DETECTION (CANVAS RGB VARIANCE)
  const detectFlamePixels = (video, procCtx, width, height) => {
    if (!procCtx || width === 0 || height === 0) return null;

    const sampleW = 160;
    const sampleH = 120;
    procCtx.drawImage(video, 0, 0, sampleW, sampleH);

    const imgData = procCtx.getImageData(0, 0, sampleW, sampleH);
    const data = imgData.data;

    let flamePixels = 0;
    let minX = sampleW;
    let maxX = 0;
    let minY = sampleH;
    let maxY = 0;

    for (let y = 0; y < sampleH; y += 2) {
      for (let x = 0; x < sampleW; x += 2) {
        const i = (y * sampleW + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // High luminance red/orange with low blue and high warmth differential
        if (r > 190 && g < 140 && b < 85 && (r - g) > 60) {
          flamePixels++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (flamePixels >= 18) {
      const scaleX = width / sampleW;
      const scaleY = height / sampleH;
      const padding = 20;

      const bboxX = Math.max(0, minX * scaleX - padding);
      const bboxY = Math.max(0, minY * scaleY - padding);
      const bboxW = Math.min(width - bboxX, (maxX - minX) * scaleX + padding * 2);
      const bboxH = Math.min(height - bboxY, (maxY - minY) * scaleY + padding * 2);

      return {
        class: 'flame',
        category: 'FLAME',
        label: '🔥 Active Flame Hazard',
        score: Math.min(0.98, 0.70 + (flamePixels / 100)),
        bbox: [bboxX, bboxY, Math.max(80, bboxW), Math.max(80, bboxH)],
        color: '#EF4444' // Red
      };
    }

    return null;
  };

  // 7. REAL-TIME AI INFERENCE & OVERLAY RENDERING LOOP
  useEffect(() => {
    if (!cameraActive || !isStreamingLive) return;

    let isRunning = true;
    const video = videoRef.current;
    const overlay = overlayCanvasRef.current;
    const procCanvas = processingCanvasRef.current;

    if (!video || !overlay || !procCanvas) return;

    const procCtx = procCanvas.getContext('2d', { willReadFrequently: true });
    const ctx = overlay.getContext('2d');

    const renderLoop = async (timestamp) => {
      if (!isRunning) return;

      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        const vWidth = video.videoWidth;
        const vHeight = video.videoHeight;

        if (overlay.width !== vWidth || overlay.height !== vHeight) {
          overlay.width = vWidth;
          overlay.height = vHeight;
          procCanvas.width = 160;
          procCanvas.height = 120;
        }

        ctx.clearRect(0, 0, vWidth, vHeight);

        // Run object detection & chromatic analysis at ~10 FPS
        if (timestamp - lastInferenceTimeRef.current >= 100) {
          lastInferenceTimeRef.current = timestamp;

          let detectedItems = [];
          let foundFlame = false;
          let foundElectrical = false;
          let foundExtinguisher = false;
          let foundWorker = false;

          // A. Chromatic Pixel Flame Analysis
          const flameResult = detectFlamePixels(video, procCtx, vWidth, vHeight);
          if (flameResult) {
            detectedItems.push(flameResult);
            foundFlame = true;
          }

          // B. TensorFlow.js COCO-SSD Detection
          if (modelRef.current) {
            try {
              const predictions = await modelRef.current.detect(video, 6, 0.40);
              predictions.forEach((pred) => {
                const labelLower = pred.class.toLowerCase();

                if (ELECTRICAL_CLASSES.has(labelLower)) {
                  foundElectrical = true;
                  detectedItems.push({
                    class: pred.class,
                    category: 'ELECTRICAL',
                    label: `⚡ Electrical Unit (${pred.class})`,
                    score: pred.score,
                    bbox: pred.bbox,
                    color: '#F59E0B' // Amber
                  });
                } else if (EXTINGUISHER_CLASSES.has(labelLower)) {
                  foundExtinguisher = true;
                  detectedItems.push({
                    class: pred.class,
                    category: 'EXTINGUISHER',
                    label: `🧯 Suppression Tool (${pred.class})`,
                    score: pred.score,
                    bbox: pred.bbox,
                    color: '#10B981' // Emerald
                  });
                } else if (labelLower === 'person') {
                  foundWorker = true;
                  detectedItems.push({
                    class: pred.class,
                    category: 'WORKER',
                    label: '👤 Worker / Buddy Present',
                    score: pred.score,
                    bbox: pred.bbox,
                    color: '#38BDF8' // Sky
                  });
                }
              });
            } catch (inferErr) {
              console.warn('Inference error:', inferErr);
            }
          }

          setDetections(detectedItems);
          setHasFlame(foundFlame);
          setHasElectrical(foundElectrical);
          setHasExtinguisher(foundExtinguisher);
          setHasWorker(foundWorker);

          const primary = detectedItems.find((d) => d.category === 'FLAME') ||
                          detectedItems.find((d) => d.category === 'ELECTRICAL') ||
                          detectedItems.find((d) => d.category === 'EXTINGUISHER') || null;
          setPrimaryTarget(primary);
        }

        // C. RENDER DYNAMIC BOUNDING BOXES & TARGETING RETICLE
        if (detections.length > 0) {
          detections.forEach((item) => {
            const [x, y, w, h] = item.bbox;

            ctx.save();
            ctx.lineWidth = 3;
            ctx.strokeStyle = item.color;
            ctx.shadowColor = item.color;
            ctx.shadowBlur = 8;
            ctx.strokeRect(x, y, w, h);

            const cornerSize = Math.min(20, w / 4, h / 4);
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x, y + cornerSize); ctx.lineTo(x, y); ctx.lineTo(x + cornerSize, y);
            ctx.moveTo(x + w - cornerSize, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cornerSize);
            ctx.moveTo(x, y + h - cornerSize); ctx.lineTo(x, y + h); ctx.lineTo(x + cornerSize, y + h);
            ctx.moveTo(x + w - cornerSize, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cornerSize);
            ctx.stroke();

            const text = `${item.label} ${Math.round(item.score * 100)}%`;
            ctx.font = 'bold 13px system-ui, sans-serif';
            const textWidth = ctx.measureText(text).width;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.shadowBlur = 0;
            ctx.fillRect(x, Math.max(0, y - 26), textWidth + 16, 24);

            ctx.fillStyle = item.color;
            ctx.fillRect(x, Math.max(0, y - 26), 4, 24);

            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(text, x + 10, Math.max(0, y - 9));
            ctx.restore();
          });
        }

        // Draw HUD Lock-On Crosshairs on Primary Target
        if (primaryTarget) {
          const [tx, ty, tw, th] = primaryTarget.bbox;
          const centerX = tx + tw / 2;
          const centerY = ty + th / 2;

          ctx.save();
          ctx.strokeStyle = primaryTarget.color;
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);

          ctx.beginPath();
          ctx.arc(centerX, centerY, 32, 0, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.setLineDash([]);
          ctx.moveTo(centerX - 40, centerY); ctx.lineTo(centerX - 10, centerY);
          ctx.moveTo(centerX + 10, centerY); ctx.lineTo(centerX + 40, centerY);
          ctx.moveTo(centerX, centerY - 40); ctx.lineTo(centerX, centerY - 10);
          ctx.moveTo(centerX, centerY + 10); ctx.lineTo(centerX, centerY + 40);
          ctx.stroke();

          ctx.restore();
        }
      }

      if (isRunning) {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [cameraActive, isStreamingLive, detections, primaryTarget]);

  // Clean up on component unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // 8. DYNAMIC DETECTION-TO-GUIDANCE ROUTER (DUAL FORMAT: TEXT + VOICE)
  const guidanceState = useMemo(() => {
    // CASE E: RESOLVED / CONTROLLED
    if (hazardResolved) {
      return {
        type: 'RESOLVED',
        badge: '✓ COMPLIANCE VERIFIED',
        badgeColor: 'bg-emerald-500 text-slate-950 font-black',
        title: '✓ AREA SECURED & COMPLIANT',
        instruction: 'सभी सुरक्षा प्रक्रियाएं पूरी हुईं। क्षेत्र अब सुरक्षित है।',
        voiceAudio: 'खतरा नियंत्रित हो गया है! कार्यक्षेत्र पूरी तरह सुरक्षित है।',
        actionPill: '✓ Log Incident as Resolved',
        btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white'
      };
    }

    // CASE B: ACTIVE FLAME / FIRE DETECTED (High Heat / Fire Pixel Cluster)
    if (hasFlame) {
      return {
        type: 'FLAME',
        badge: '🔥 ACTIVE FLAME DETECTED',
        badgeColor: 'bg-red-600 text-white animate-pulse font-black',
        title: '🔥 ACTIVE FIRE IN VIEW',
        instruction: '1. 2 मीटर की सुरक्षित दूरी बनाएं। 2. धुएं पर नहीं, आग की जड़ (Base) पर निशाना लगाएं।',
        voiceAudio: 'आग की पहचान हुई है! सुरक्षित दूरी बनाएं और आग की जड़ पर निशाना लगाएं।',
        actionPill: '🎯 Lock Aim at Base',
        btnClass: 'bg-red-600 hover:bg-red-500 text-white shadow-red-200'
      };
    }

    // CASE A: ELECTRICAL APPLIANCE DETECTED (Laptop, TV, Electronics, Switchboard)
    if (hasElectrical) {
      return {
        type: 'ELECTRICAL',
        badge: '⚡ LIVE ELECTRICAL HAZARD IN VIEW',
        badgeColor: 'bg-amber-500 text-slate-950 animate-pulse font-black',
        title: '⚡ ELECTRICAL HAZARD DETECTED',
        instruction: '1. तुरंत मेन स्विच बंद करें। 2. केवल CO2 एक्सटिंग्विशर का उपयोग करें। पानी का इस्तेमाल सख्त मना है!',
        voiceAudio: 'इलेक्ट्रिकल खतरा मिला है! सबसे पहले मेन पावर ऑफ करें, पानी का इस्तेमाल ना करें।',
        actionPill: '🔌 Confirm Power Isolated',
        btnClass: 'bg-[#F59E0B] hover:bg-amber-500 text-slate-950 shadow-amber-200'
      };
    }

    // CASE C: EXTINGUISHER / BOTTLE / TOOL DETECTED
    if (hasExtinguisher) {
      return {
        type: 'EXTINGUISHER',
        badge: '🧯 SUPPRESSION TOOL RECOGNIZED',
        badgeColor: 'bg-emerald-500 text-slate-950 font-black',
        title: '🧯 SAFETY EQUIPMENT RECOGNIZED',
        instruction: '1. सेफ्टी पिन खींचें। 2. लीवर दबाकर लगातार बाईं-दाईं तरफ स्वीप करें।',
        voiceAudio: 'सिलेंडर मिल गया है! सेफ्टी पिन निकालें और लीवर दबाकर स्प्रे करें।',
        actionPill: '💨 Pull Pin & Discharge',
        btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200'
      };
    }

    // CASE D: NO HAZARD IN VIEW / SCANNING
    return {
      type: 'SCANNING',
      badge: '🔍 SCANNING AREA...',
      badgeColor: 'bg-slate-800 text-amber-300 font-bold',
      title: '🔍 SCANNING ENVIRONMENT...',
      instruction: 'कैमरे को संदिग्ध उपकरण या आग की तरफ दिखाएं।',
      voiceAudio: 'खतरे की दिशा में कैमरा दिखाएं।',
      actionPill: '🔍 Searching for Hazards...',
      btnClass: 'bg-slate-200 text-slate-400 cursor-not-allowed'
    };
  }, [hasFlame, hasElectrical, hasExtinguisher, hazardResolved]);

  // 9. AUTOMATIC REAL-TIME VOICE GUIDANCE DISPATCHER
  useEffect(() => {
    if (!cameraActive || isMuted) return;

    const stateType = guidanceState.type;
    const voiceText = guidanceState.voiceAudio;

    if (!voiceText) return;

    // For SCANNING state: only speak once when camera initially opens
    if (stateType === 'SCANNING') {
      if (lastSpokenRef.current.text === '') {
        const initialTimer = setTimeout(() => {
          speakGuidance(voiceText, true);
        }, 900);
        return () => clearTimeout(initialTimer);
      }
      return;
    }

    // When an active hazard state is recognized
    if (lastSpokenRef.current.text !== voiceText) {
      // Immediate voice guidance trigger on new detection
      speakGuidance(voiceText, true);
    } else {
      // Re-prompt periodically with safe debounced interval
      const repeatInterval = setInterval(() => {
        speakGuidance(voiceText);
      }, 5500);
      return () => clearInterval(repeatInterval);
    }
  }, [cameraActive, isMuted, guidanceState, speakGuidance]);

  // 10. MANUAL REPLAY VOICE GUIDANCE TRIGGER
  const handleReplayVoice = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    unlockSpeechEngine();
    if (guidanceState.voiceAudio) {
      console.log("🔊 Manual Voice Replay Triggered:", guidanceState.voiceAudio);
      speakGuidance(guidanceState.voiceAudio, true);
    }
  }, [unlockSpeechEngine, guidanceState.voiceAudio, speakGuidance]);

  // Execute Dynamic Step Action
  const handleDynamicAction = () => {
    if (guidanceState.type === 'SCANNING') return;

    if (guidanceState.type === 'RESOLVED') {
      setHazardResolved(false);
      setCompletedActions([]);
      setCurrentSubtitle('');
      lastSpokenRef.current = { text: '', timestamp: 0 };
      return;
    }

    setCompletedActions((prev) => [...prev, guidanceState.type]);

    if (guidanceState.type === 'FLAME' || guidanceState.type === 'ELECTRICAL') {
      setHazardResolved(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col justify-between max-w-md mx-auto shadow-2xl relative border-x border-[#E2E8F0]">
      {/* Hidden processing canvas for pixel chromatic scanning */}
      <canvas ref={processingCanvasRef} className="hidden" />

      {/* ====================================================================
          1. NAVIGATION ROUTER (PHASE 1: HOME DASHBOARD | PHASE 2: AR TRAINING)
          ==================================================================== */}
      {activeScreen === 'flashcards' ? (
        <FlashcardsMistakes
          onBack={() => setActiveScreen('podcast')}
          onNavigate={(dest) => {
            if (dest === 'certificates' || dest === 'home') {
              setActiveScreen('home');
            } else {
              setActiveScreen(dest);
            }
          }}
        />
      ) : activeScreen === 'podcast' ? (
        <PodcastAudioLessons
          onBack={() => setActiveScreen('home')}
          onNavigate={(dest) => {
            if (dest === 'home') setActiveScreen('home');
            else if (dest === 'flashcards') setActiveScreen('flashcards');
            else if (dest === 'ar-module') setActiveScreen('ar-training');
            else if (dest === 'ai-detector') {
              unlockSpeechEngine();
              startCamera();
              setActiveScreen('ai-detector');
            } else {
              setActiveScreen(dest);
            }
          }}
        />
      ) : activeScreen === 'ar-training' ? (
        <ARTrainingModule
          onBack={() => setActiveScreen('home')}
          onComplete={() => setActiveScreen('podcast')}
        />
      ) : activeScreen === 'home' && !cameraActive ? (
        <HomeDashboard
          onNavigate={(screenKey) => {
            if (screenKey === 'ar-module') {
              setActiveScreen('ar-training');
            } else if (screenKey === 'podcast') {
              setActiveScreen('podcast');
            } else if (screenKey === 'flashcards') {
              setActiveScreen('flashcards');
            } else if (screenKey === 'ai-detector') {
              unlockSpeechEngine();
              startCamera();
              setActiveScreen('ai-detector');
            }
          }}
        />
      ) : (
        /* ====================================================================
            2. LIVE CAMERA VIEW (REAL-TIME TF.JS + DUAL VOICE HUD)
            ==================================================================== */
        <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col justify-between">
          {/* Native HTML5 Video Element at z-0 */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover z-0"
          />

          {/* High-Contrast Bounding Box & HUD Canvas Overlay at z-10 */}
          <canvas
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
          />

          {/* Gradient scrim for header contrast */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none z-10" />

          {/* Floating Top Header Bar (z-20) */}
          <header className="relative z-20 p-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {/* Dynamic State Badge */}
              <div className={`px-3 py-1.5 rounded-full font-bold text-xs shadow-md whitespace-nowrap flex items-center gap-1.5 ${guidanceState.badgeColor}`}>
                <span>{guidanceState.badge}</span>
              </div>

              {/* Worker presence badge if detected */}
              {hasWorker && (
                <div className="bg-sky-500/90 text-white font-bold text-[10px] px-2 py-1 rounded-full whitespace-nowrap shadow-md">
                  👤 Buddy in View
                </div>
              )}
            </div>

            {/* Right Controls: Mute Toggle + Exit Button */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Voice Guidance Mute / Unmute Button */}
              <button
                onClick={toggleMute}
                className={`min-h-[38px] px-3 py-1.5 rounded-full font-bold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 border ${
                  !isMuted
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                    : 'bg-slate-800/90 text-slate-300 border-slate-700'
                }`}
                title={isMuted ? 'Turn on Voice Guidance' : 'Mute Voice Guidance'}
              >
                <span>{!isMuted ? '🔊 Voice Guidance: ON' : '🔇 Muted'}</span>
              </button>

              {/* Circular Exit Button */}
              <button
                onClick={stopCamera}
                className="w-9 h-9 min-h-[36px] rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center font-bold text-sm hover:bg-black/90 transition active:scale-90 shadow-md shrink-0"
                title="Close Camera"
              >
                ✕
              </button>
            </div>
          </header>

          {/* Floating Manual Audio Replay Button on HUD */}
          <div className="relative z-20 px-4 pt-1 pb-1 flex justify-end">
            <button
              onClick={handleReplayVoice}
              className="bg-white/95 backdrop-blur-md border border-slate-300 shadow-md px-3.5 py-1.5 rounded-full font-black text-xs text-slate-900 flex items-center gap-1.5 active:scale-95 hover:bg-white transition"
              title="Test Audio / Replay Voice Guidance"
            >
              <span className="text-amber-500 font-bold">🔊</span>
              <span>Replay Voice Guidance</span>
            </button>
          </div>

          {/* Center Viewport: Active Scanning Crosshair if no target */}
          <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none">
            {!primaryTarget && (
              <div className="relative flex items-center justify-center w-36 h-36 border border-dashed border-white/40 rounded-full animate-pulse">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="absolute bottom-2 text-[10px] font-mono text-white/70 bg-black/60 px-2 py-0.5 rounded">
                  SCANNING
                </span>
              </div>
            )}
          </div>

          {/* 3. FLOATING REAL-TIME SUBTITLE / VOICE TRANSCRIPT PILL (Z-20) */}
          {currentSubtitle && (
            <div className="relative z-20 px-4 pb-2 transition-all duration-300">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-3 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-900 shrink-0 font-bold">
                  {isSpeaking ? (
                    <span className="text-xs font-black text-amber-600 animate-pulse">
                      (( 🔊 ))
                    </span>
                  ) : (
                    <span className="text-sm">💬</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      {isSpeaking ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                          <span className="text-emerald-700 font-extrabold">Active Voice Audio</span>
                        </>
                      ) : (
                        <span>Voice Instruction</span>
                      )}
                    </span>
                    <button
                      onClick={handleReplayVoice}
                      className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-[9px] uppercase tracking-wider border border-amber-300 transition active:scale-95 flex items-center gap-1"
                      title="Replay Voice Guidance"
                    >
                      <span>🔊 Replay</span>
                    </button>
                  </div>
                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    {currentSubtitle}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. REAL-TIME CONTEXTUAL GUIDANCE ACTION SHEET (Z-20) */}
          <div className="relative z-20 bg-white rounded-t-3xl shadow-2xl p-5 border-t border-slate-200 space-y-4">
            {/* Top Sheet: Live Detection Feed Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${hasFlame ? 'bg-red-500 animate-ping' : hasElectrical ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                  {detections.length > 0 ? `${detections.length} Target(s) Tracked` : 'Searching Area...'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {!isMuted && isSpeaking && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full animate-pulse border border-amber-300">
                    (( 🔊 )) Speaking
                  </span>
                )}
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                  AI Vision • 10 FPS
                </span>
              </div>
            </div>

            {/* Dynamic Step Content Based on What Camera Sees */}
            <div className="space-y-3">
              <div>
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  {guidanceState.title}
                </h2>
                <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                  {guidanceState.instruction}
                </p>
              </div>

              <button
                onClick={handleDynamicAction}
                disabled={guidanceState.type === 'SCANNING'}
                className={`w-full h-[52px] min-h-[52px] font-black text-xs sm:text-sm tracking-wider uppercase rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-[0.98] ${guidanceState.btnClass}`}
              >
                <span>{guidanceState.actionPill}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { HomeDashboard, ARTrainingModule, PodcastAudioLessons, FlashcardsMistakes };

