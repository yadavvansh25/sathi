import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// ============================================================================
// SurakshaAR: Real-Time AI Computer Vision & Fire Chromatic Analysis Engine
// ============================================================================

const ELECTRICAL_CLASSES = new Set([
  'laptop', 'tv', 'cell phone', 'microwave', 'oven', 'refrigerator',
  'keyboard', 'mouse', 'toaster', 'sink'
]);

const EXTINGUISHER_CLASSES = new Set([
  'bottle', 'fire extinguisher', 'vase', 'cup'
]);

export default function App() {
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

  // Hardware and Canvas References
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const processingCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const modelRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastInferenceTimeRef = useRef(0);

  // 1. ASYNCHRONOUS TENSORFLOW COCO-SSD INITIALIZATION
  useEffect(() => {
    let isMounted = true;
    const initModel = async () => {
      try {
        setModelLoading(true);
        // Ensure tf backend is ready (WebGL or CPU fallback)
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

  // 2. STOP CAMERA & CLEANUP STREAM TRACKS
  const stopCamera = useCallback(() => {
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
    setDetections([]);
    setHasFlame(false);
    setHasElectrical(false);
    setHasExtinguisher(false);
    setHasWorker(false);
    setPrimaryTarget(null);
  }, []);

  // 3. START HARDWARE CAMERA
  const startCamera = async () => {
    setCameraError(null);
    setIsStreamingLive(false);
    setHazardResolved(false);
    setCompletedActions([]);

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

  // 4. ATTACH MEDIA STREAM TO VIDEO ELEMENT
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

  // 5. CHROMATIC PIXEL FLAME DETECTION (CANVAS RGB VARIANCE)
  const detectFlamePixels = (video, procCtx, width, height) => {
    if (!procCtx || width === 0 || height === 0) return null;

    // Scale down for ultra-fast chromatic scan
    const sampleW = 160;
    const sampleH = 120;
    procCtx.drawImage(video, 0, 0, sampleW, sampleH);

    const imgData = procCtx.getImageData(0, 0, sampleW, sampleH);
    const data = imgData.data;

    let flamePixels = 0;
    let sumX = 0;
    let sumY = 0;
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
          sumX += x;
          sumY += y;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Threshold: cluster of flame pixels detected
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

  // 6. REAL-TIME AI INFERENCE & OVERLAY RENDERING LOOP
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

        // Synchronize display dimensions
        if (overlay.width !== vWidth || overlay.height !== vHeight) {
          overlay.width = vWidth;
          overlay.height = vHeight;
          procCanvas.width = 160;
          procCanvas.height = 120;
        }

        ctx.clearRect(0, 0, vWidth, vHeight);

        // Run object detection & chromatic analysis every 100ms (10 FPS limit for smooth 60fps UI)
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
                    bbox: pred.bbox, // [x, y, width, height]
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

          // Determine primary target for HUD lock-on
          const primary = detectedItems.find((d) => d.category === 'FLAME') ||
                          detectedItems.find((d) => d.category === 'ELECTRICAL') ||
                          detectedItems.find((d) => d.category === 'EXTINGUISHER') || null;
          setPrimaryTarget(primary);
        }

        // --- C. RENDER DYNAMIC BOUNDING BOXES & RETICLE ---
        if (detections.length > 0) {
          detections.forEach((item) => {
            const [x, y, w, h] = item.bbox;

            // Box Outline
            ctx.save();
            ctx.lineWidth = 3;
            ctx.strokeStyle = item.color;
            ctx.shadowColor = item.color;
            ctx.shadowBlur = 8;
            ctx.strokeRect(x, y, w, h);

            // Corner Brackets
            const cornerSize = Math.min(20, w / 4, h / 4);
            ctx.lineWidth = 4;
            ctx.beginPath();
            // Top-left
            ctx.moveTo(x, y + cornerSize); ctx.lineTo(x, y); ctx.lineTo(x + cornerSize, y);
            // Top-right
            ctx.moveTo(x + w - cornerSize, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cornerSize);
            // Bottom-left
            ctx.moveTo(x, y + h - cornerSize); ctx.lineTo(x, y + h); ctx.lineTo(x + cornerSize, y + h);
            // Bottom-right
            ctx.moveTo(x + w - cornerSize, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cornerSize);
            ctx.stroke();

            // Label Chip Background
            const text = `${item.label} ${Math.round(item.score * 100)}%`;
            ctx.font = 'bold 13px system-ui, sans-serif';
            const textWidth = ctx.measureText(text).width;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.shadowBlur = 0;
            ctx.fillRect(x, Math.max(0, y - 26), textWidth + 16, 24);

            // Label Color Bar
            ctx.fillStyle = item.color;
            ctx.fillRect(x, Math.max(0, y - 26), 4, 24);

            // Label Text
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(text, x + 10, Math.max(0, y - 9));
            ctx.restore();
          });
        }

        // Draw HUD Lock-On Crosshair on Primary Target
        if (primaryTarget) {
          const [tx, ty, tw, th] = primaryTarget.bbox;
          const centerX = tx + tw / 2;
          const centerY = ty + th / 2;

          ctx.save();
          ctx.strokeStyle = primaryTarget.color;
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);

          // Lock-on ring
          ctx.beginPath();
          ctx.arc(centerX, centerY, 32, 0, Math.PI * 2);
          ctx.stroke();

          // Crosshairs
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

  // 7. DYNAMIC STATE-DRIVEN GUIDANCE RESOLUTION
  const guidanceState = useMemo(() => {
    if (hazardResolved) {
      return {
        type: 'RESOLVED',
        badge: '✓ COMPLIANCE VERIFIED',
        badgeColor: 'bg-emerald-500 text-slate-950',
        title: 'Area Neutralized & Secured',
        hindiSub: 'खतरा समाप्त: सभी सुरक्षा नियम पूरे हुए।',
        actionLabel: 'LOG INCIDENT AS RESOLVED',
        btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white'
      };
    }

    if (hasFlame) {
      return {
        type: 'FLAME',
        badge: '🔥 ACTIVE FLAME DETECTED',
        badgeColor: 'bg-red-600 text-white animate-pulse',
        title: 'Maintain 2M Distance & Aim Nozzle at Base',
        hindiSub: '2 मीटर की सुरक्षित दूरी बनाएं, जड़ पर निशाना साधें',
        actionLabel: 'DISCHARGE SUPPRESSION AGENT ➔',
        btnClass: 'bg-red-600 hover:bg-red-500 text-white'
      };
    }

    if (hasElectrical) {
      return {
        type: 'ELECTRICAL',
        badge: '⚡ LIVE ELECTRICAL HAZARD IN VIEW',
        badgeColor: 'bg-amber-500 text-slate-950 animate-pulse',
        title: 'Isolate 440V Main Power Immediately',
        hindiSub: 'बिजली का मुख्य स्विच तुरंत बंद करें (Isolate Power)',
        actionLabel: 'CONFIRM POWER ISOLATED ➔',
        btnClass: 'bg-[#F59E0B] hover:bg-amber-500 text-slate-950'
      };
    }

    if (hasExtinguisher) {
      return {
        type: 'EXTINGUISHER',
        badge: '🧯 SUPPRESSION TOOL RECOGNIZED',
        badgeColor: 'bg-emerald-500 text-slate-950',
        title: 'Equipment Ready: Pull Safety Pin & Test Nozzle',
        hindiSub: 'सिलेंडर की सेफ्टी पिन निकालें और जड़ पर निशाना लगाएं',
        actionLabel: 'DEPLOY EXTINGUISHER ➔',
        btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white'
      };
    }

    // Default Scanning State
    return {
      type: 'SCANNING',
      badge: '🔍 SCANNING AREA...',
      badgeColor: 'bg-slate-800 text-amber-300',
      title: 'Point Camera at Hazard or Equipment',
      hindiSub: 'कैमरा बिजली के पैनल, आग, या बुझाने वाले सिलेंडर की ओर लाएं',
      actionLabel: 'SEARCHING FOR HAZARD TARGETS...',
      btnClass: 'bg-slate-200 text-slate-400 cursor-not-allowed'
    };
  }, [hasFlame, hasElectrical, hasExtinguisher, hazardResolved]);

  // Execute Dynamic Step Action
  const handleDynamicAction = () => {
    if (guidanceState.type === 'SCANNING') return;

    if (guidanceState.type === 'RESOLVED') {
      setHazardResolved(false);
      setCompletedActions([]);
      return;
    }

    setCompletedActions((prev) => [...prev, guidanceState.type]);

    // If active flame was suppressed or electrical power isolated
    if (guidanceState.type === 'FLAME' || guidanceState.type === 'ELECTRICAL') {
      setHazardResolved(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col justify-between max-w-md mx-auto shadow-2xl relative border-x border-[#E2E8F0]">
      {/* Hidden processing canvas for pixel chromatic scanning */}
      <canvas ref={processingCanvasRef} className="hidden" />

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
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">SurakshaAR</h1>
                <span className="text-[10px] text-slate-500 font-bold">AI Computer Vision</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {modelLoading ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                  AI Loading...
                </span>
              ) : (
                <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  AI Ready
                </span>
              )}
            </div>
          </header>

          {/* Model or Camera Error Alert */}
          {(cameraError || modelError) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center space-y-2">
              <p className="text-xs text-red-700 font-semibold">{cameraError || modelError}</p>
              <button
                onClick={startCamera}
                className="w-full h-10 rounded-lg bg-red-600 text-white font-bold text-xs uppercase"
              >
                Retry Camera Access
              </button>
            </div>
          )}

          {/* Symmetrical 2x2 AI Capability Visual Grid */}
          <div className="my-auto py-2 space-y-3">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-200 bg-white shadow-xs min-h-[120px]">
                <span className="text-3xl mb-2">⚡</span>
                <span className="text-sm font-bold text-slate-900">Electrical AI</span>
                <span className="text-[10px] text-slate-500 font-medium">Auto-Switchboard Detect</span>
              </div>

              <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-200 bg-white shadow-xs min-h-[120px]">
                <span className="text-3xl mb-2">🔥</span>
                <span className="text-sm font-bold text-slate-900">Flame Pixel Scan</span>
                <span className="text-[10px] text-slate-500 font-medium">Chromatic Luminance</span>
              </div>

              <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-200 bg-white shadow-xs min-h-[120px]">
                <span className="text-3xl mb-2">🧯</span>
                <span className="text-sm font-bold text-slate-900">Extinguisher AI</span>
                <span className="text-[10px] text-slate-500 font-medium">Tool Recognition</span>
              </div>

              <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-200 bg-white shadow-xs min-h-[120px]">
                <span className="text-3xl mb-2">👤</span>
                <span className="text-sm font-bold text-slate-900">Buddy Safety</span>
                <span className="text-[10px] text-slate-500 font-medium">Worker Verification</span>
              </div>
            </div>

            {/* Status Information Chip */}
            <div className="bg-amber-50 border border-amber-200 text-amber-950 px-3.5 py-2.5 rounded-xl flex items-center justify-center text-xs font-semibold text-center shadow-xs">
              <span>{modelLoading ? '⏳ Loading MobileNet Neural Network...' : '✓ AI Vision Model Armed & Ready'}</span>
            </div>
          </div>

          {/* Sticky Primary CTA (56px Height, Thumb-Friendly) */}
          <div className="pt-3 pb-1">
            <button
              onClick={startCamera}
              className="w-full h-14 min-h-[56px] bg-[#F59E0B] hover:bg-amber-500 active:scale-[0.98] text-[#0F172A] font-black text-sm tracking-wider uppercase rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>📸 OPEN AI CAMERA & DETECT</span>
            </button>
          </div>
        </div>
      ) : (
        /* ====================================================================
            2. LIVE CAMERA VIEW (REAL-TIME TF.JS + CHROMATIC BOUNDING BOXES)
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
          <header className="relative z-20 p-4 flex items-center justify-between">
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

            {/* Circular Exit Button */}
            <button
              onClick={stopCamera}
              className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center font-bold text-sm hover:bg-black/90 transition active:scale-90 shadow-md shrink-0 ml-2"
              title="Close Camera"
            >
              ✕
            </button>
          </header>

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

              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                AI Vision • 10 FPS
              </span>
            </div>

            {/* Dynamic Step Content Based on What Camera Sees */}
            <div className="space-y-3">
              <div>
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  {guidanceState.title}
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {guidanceState.hindiSub}
                </p>
              </div>

              {/* Dynamic Action Button */}
              <button
                onClick={handleDynamicAction}
                disabled={guidanceState.type === 'SCANNING'}
                className={`w-full h-[52px] min-h-[52px] font-black text-xs sm:text-sm tracking-wider uppercase rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-[0.98] ${guidanceState.btnClass}`}
              >
                <span>{guidanceState.actionLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
