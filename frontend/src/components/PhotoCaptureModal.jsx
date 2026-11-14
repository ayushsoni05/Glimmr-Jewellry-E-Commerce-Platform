import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  Check,
  X,
  RotateCw,
  Sliders,
  Image as ImageIcon,
  AlertCircle,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Split,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  ADVANCED_STUDIO_PRESETS,
  ADVANCED_LUSTER_MODES,
  processAdvancedStudioImage
} from '../utils/advancedAiStudioEngine';

/**
 * PhotoCaptureModal
 * High-definition live camera capture and AI Jewelry Studio background engine
 * Designed for Monika Jewellers counter POS billing and official GST tax invoices.
 *
 * Features:
 * - Live device webcam snap with center crosshairs and shutter animation
 * - Drag-and-drop file upload with support for mobile camera exports
 * - Multi-pass AI Studio background removal, bilateral edge matting & contact grounding shadow
 * - Interactive Before/After Split Comparison Slider with draggable divider
 * - 6 Luxury Studio presets (Pristine White, Champagne Silk, Noir Obsidian, Carrara Marble, Transparent, Original)
 * - 4 Precious Metal and Gemstone Luster calibration profiles
 * - Strictly zero emojis in code and comments
 */
export default function PhotoCaptureModal({
  isOpen,
  onClose,
  onPhotoCaptured,
  initialPhoto = '',
  title = 'Photograph Ornament for Official Bill'
}) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload' | 'enhance'
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear) | 'user' (front)
  const [rawPhoto, setRawPhoto] = useState(initialPhoto || '');
  const [processedPhoto, setProcessedPhoto] = useState(initialPhoto || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('white');
  const [selectedLuster, setSelectedLuster] = useState('gold');
  const [shutterFlash, setShutterFlash] = useState(false);

  // Before / After Split Slider State
  const [isSplitView, setIsSplitView] = useState(true);
  const [splitPos, setSplitPos] = useState(50); // 0% to 100%
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderContainerRef = useRef(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize or stop camera stream
  const startCamera = useCallback(async (mode = facingMode) => {
    setCameraError('');
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access not supported on this browser. Please use File Upload.');
        setActiveTab('upload');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      setCameraError('Could not access device camera (' + (err.message || 'Permission denied') + '). Please use File Upload.');
      setActiveTab('upload');
    }
  }, [facingMode, cameraStream]);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  // Lifecycle when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (initialPhoto) {
        setRawPhoto(initialPhoto);
        setProcessedPhoto(initialPhoto);
        setActiveTab('enhance');
      } else {
        setActiveTab('camera');
        startCamera('environment');
      }
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, initialPhoto]);

  // Handle switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'camera') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
  };

  // Flip front/rear camera
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture Live Snapshot
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;

    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setRawPhoto(dataUrl);
    stopCamera();
    runAIEnhancement(dataUrl, selectedPreset, selectedLuster);
  };

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setRawPhoto(dataUrl);
        stopCamera();
        runAIEnhancement(dataUrl, selectedPreset, selectedLuster);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl === 'string') {
          setRawPhoto(dataUrl);
          stopCamera();
          runAIEnhancement(dataUrl, selectedPreset, selectedLuster);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI Studio Multi-Pass Enhancement
  const runAIEnhancement = async (src, preset, luster) => {
    if (!src) return;
    setIsProcessing(true);
    setActiveTab('enhance');
    try {
      const enhanced = await processAdvancedStudioImage(src, {
        preset,
        luster,
        quality: 0.94,
        shadowIntensity: 0.35
      });
      setProcessedPhoto(enhanced || src);
    } catch {
      setProcessedPhoto(src);
    } finally {
      setIsProcessing(false);
    }
  };

  // Preset or Luster change
  const handlePresetSelect = (presetId) => {
    setSelectedPreset(presetId);
    runAIEnhancement(rawPhoto, presetId, selectedLuster);
  };

  const handleLusterSelect = (lusterId) => {
    setSelectedLuster(lusterId);
    runAIEnhancement(rawPhoto, selectedPreset, lusterId);
  };

  // Before / After Slider Drag Calculations
  const updateSliderPosFromEvent = (clientX) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPos(Math.round(pct));
  };

  const handlePointerDown = (e) => {
    setIsDraggingSlider(true);
    updateSliderPosFromEvent(e.clientX || (e.touches && e.touches[0].clientX));
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDraggingSlider) return;
      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
      if (clientX !== undefined) {
        updateSliderPosFromEvent(clientX);
      }
    };

    const handlePointerUp = () => {
      if (isDraggingSlider) {
        setIsDraggingSlider(false);
      }
    };

    if (isDraggingSlider) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDraggingSlider]);

  // Confirm and attach photo to voucher row
  const handleConfirmPhoto = () => {
    const finalImage = processedPhoto || rawPhoto;
    if (finalImage) {
      onPhotoCaptured(finalImage);
    }
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            stopCamera();
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-2xl bg-[#0B1524] text-white border border-[#B59A6C]/40 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden font-mono flex flex-col max-h-[94vh]"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-[#07111D] border-b border-[#1A2E47] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B59A6C] animate-pulse" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                  <span>{title}</span>
                </h3>
                <p className="text-[10px] text-[#B59A6C]">
                  Live Camera Snap, Multi-Pass AI Studio Backdrop & Specular Luster Engine
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-[#0F2238] hover:bg-rose-900 border border-[#1A2E47] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Navigation Tabs */}
          <div className="grid grid-cols-3 border-b border-[#1A2E47] bg-[#091523] text-xs shrink-0">
            <button
              type="button"
              onClick={() => handleTabChange('camera')}
              className={`py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors border-b-2 font-bold ${
                activeTab === 'camera'
                  ? 'border-[#B59A6C] text-[#B59A6C] bg-[#0E1E33]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Camera</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('upload')}
              className={`py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors border-b-2 font-bold ${
                activeTab === 'upload'
                  ? 'border-[#B59A6C] text-[#B59A6C] bg-[#0E1E33]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>

            <button
              type="button"
              disabled={!rawPhoto}
              onClick={() => handleTabChange('enhance')}
              className={`py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors border-b-2 font-bold disabled:opacity-40 ${
                activeTab === 'enhance'
                  ? 'border-[#B59A6C] text-[#B59A6C] bg-[#0E1E33]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Studio Edit</span>
            </button>
          </div>

          {/* Tab Body Content */}
          <div className="p-4 overflow-y-auto flex-1 space-y-4">

            {/* TAB 1: LIVE CAMERA */}
            {activeTab === 'camera' && (
              <div className="space-y-3">
                {cameraError ? (
                  <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <div>
                      <p className="font-bold">{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => handleTabChange('upload')}
                        className="mt-2 px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded text-[11px] font-bold"
                      >
                        Switch to File Upload
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-square max-h-[380px] w-full mx-auto bg-black rounded-xl overflow-hidden border border-[#1A2E47] flex items-center justify-center group">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className="w-full h-full object-cover"
                    />

                    {/* Shutter Flash Animation */}
                    {shutterFlash && (
                      <div className="absolute inset-0 bg-white z-30 transition-opacity duration-200" />
                    )}

                    {/* Viewfinder Jewelry Crosshairs and Frame */}
                    <div className="absolute inset-6 border border-dashed border-[#B59A6C]/60 pointer-events-none rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 border-t-2 border-l-2 border-[#B59A6C] absolute top-0 left-0" />
                      <div className="w-8 h-8 border-t-2 border-r-2 border-[#B59A6C] absolute top-0 right-0" />
                      <div className="w-8 h-8 border-b-2 border-l-2 border-[#B59A6C] absolute bottom-0 left-0" />
                      <div className="w-8 h-8 border-b-2 border-r-2 border-[#B59A6C] absolute bottom-0 right-0" />

                      <div className="w-4 h-4 rounded-full border border-[#B59A6C]/80" />
                      <div className="text-[9px] uppercase tracking-widest text-[#B59A6C] font-bold absolute bottom-2 bg-black/70 px-2.5 py-0.5 rounded border border-[#B59A6C]/30">
                        Center Ornament in Frame
                      </div>
                    </div>

                    {/* Camera Flip Button */}
                    <button
                      type="button"
                      onClick={handleToggleFacingMode}
                      className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black text-slate-200 hover:text-white rounded-full border border-white/20 transition-all z-20"
                      title="Flip Front / Rear Camera"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {!cameraError && (
                  <div className="flex items-center justify-center pt-2">
                    <button
                      type="button"
                      onClick={handleCaptureSnapshot}
                      className="px-6 py-2.5 bg-[#B59A6C] hover:bg-white text-[#07111D] font-black uppercase tracking-wider rounded-full shadow-lg transition-all flex items-center gap-2 cursor-pointer text-xs"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Ornament Snapshot</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FILE UPLOAD */}
            {activeTab === 'upload' && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#B59A6C]/60 hover:border-[#B59A6C] rounded-2xl p-8 sm:p-12 text-center bg-[#071322] cursor-pointer transition-colors space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-14 h-14 mx-auto rounded-full bg-[#0F2238] border border-[#B59A6C]/40 flex items-center justify-center text-[#B59A6C]">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-200">
                    Click to browse or drag & drop ornament photo
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Accepts JPG, PNG, WEBP, or HEIC camera exports directly from device.
                  </p>
                </div>
                <div className="inline-block px-3 py-1 bg-[#0F2238] text-[#B59A6C] border border-[#1A2E47] rounded text-[10px] font-bold uppercase tracking-wider">
                  Select Photo from Gallery / Disk
                </div>
              </div>
            )}

            {/* TAB 3: AI STUDIO BACKGROUND & ENHANCER */}
            {activeTab === 'enhance' && (
              <div className="space-y-4">
                {/* View Mode Controls: Split Slider vs Full Enhanced */}
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">View Mode:</span>
                    <button
                      type="button"
                      onClick={() => setIsSplitView(true)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                        isSplitView
                          ? 'border-[#B59A6C] bg-[#0F2238] text-[#B59A6C]'
                          : 'border-[#1A2E47] bg-[#07111D] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Split className="w-3 h-3" />
                      <span>Before / After Split Slider</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSplitView(false)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                        !isSplitView
                          ? 'border-[#B59A6C] bg-[#0F2238] text-[#B59A6C]'
                          : 'border-[#1A2E47] bg-[#07111D] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Full Studio Bill Preview</span>
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-400 hidden sm:block">
                    {isSplitView ? 'Drag slider handle left / right' : 'Official bill rendering'}
                  </div>
                </div>

                {/* Interactive Split Comparison Viewport */}
                <div
                  ref={sliderContainerRef}
                  onMouseDown={isSplitView ? handlePointerDown : undefined}
                  onTouchStart={isSplitView ? handlePointerDown : undefined}
                  className="relative aspect-square max-h-[320px] w-full mx-auto bg-[#040911] rounded-xl overflow-hidden border border-[#B59A6C]/40 select-none cursor-ew-resize flex items-center justify-center"
                >
                  {isProcessing ? (
                    <div className="text-center space-y-2 p-4">
                      <RefreshCw className="w-8 h-8 text-[#B59A6C] animate-spin mx-auto" />
                      <p className="text-xs font-bold text-amber-300">
                        AI Processing Jewelry Background & Highlights...
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Isolating precious metal contours, calibrating tone & grounded studio drop-shadow.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Layer 1: Enhanced Studio Image (Bottom Layer) */}
                      <img
                        src={processedPhoto || rawPhoto}
                        alt="AI Studio Enhanced"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                      />

                      {/* Layer 2: Raw Original Image (Clipped Left Layer) */}
                      {isSplitView && rawPhoto && (
                        <div
                          className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
                          style={{ width: `${splitPos}%` }}
                        >
                          <div className="relative w-full h-full" style={{ width: sliderContainerRef.current?.clientWidth || 320, height: '100%' }}>
                            <img
                              src={rawPhoto}
                              alt="Raw Counter Capture"
                              className="absolute inset-0 w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      )}

                      {/* Split Divider Line and Draggable Handle */}
                      {isSplitView && rawPhoto && (
                        <div
                          className="absolute inset-y-0 z-20 pointer-events-none"
                          style={{ left: `${splitPos}%`, transform: 'translateX(-50%)' }}
                        >
                          {/* Vertical Line */}
                          <div className="w-[2px] h-full bg-[#B59A6C] shadow-[0_0_8px_rgba(181,154,108,0.8)] mx-auto" />

                          {/* Center Grab Handle */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#07111D] border-2 border-[#B59A6C] shadow-lg flex items-center justify-center text-[#B59A6C] pointer-events-auto cursor-ew-resize">
                            <div className="flex items-center -space-x-1">
                              <ChevronLeft className="w-3.5 h-3.5" />
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Floating Badges */}
                      {isSplitView && (
                        <>
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/80 rounded border border-white/20 text-[9px] text-slate-300 font-bold uppercase tracking-wider pointer-events-none z-10">
                            Raw Camera Capture
                          </div>
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/80 rounded border border-[#B59A6C]/60 text-[9px] text-[#B59A6C] font-bold uppercase tracking-wider pointer-events-none z-10">
                            AI Studio Enhanced
                          </div>
                        </>
                      )}

                      {!isSplitView && (
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/80 rounded border border-[#B59A6C]/40 text-[9px] text-amber-300 font-bold uppercase tracking-wider pointer-events-none z-10">
                          {ADVANCED_STUDIO_PRESETS.find(p => p.id === selectedPreset)?.name}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Studio Background Presets Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[#B59A6C] tracking-wider block">
                    1. Select Studio Backdrop Style:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ADVANCED_STUDIO_PRESETS.map((preset) => {
                      const isSelected = selectedPreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handlePresetSelect(preset.id)}
                          className={`p-2 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#B59A6C] bg-[#0F2238] shadow-sm'
                              : 'border-[#1A2E47] bg-[#071322] hover:border-slate-500'
                          }`}
                        >
                          <div
                            className="w-5 h-5 rounded-full border border-slate-400 shrink-0 mt-0.5"
                            style={{ background: preset.previewBg }}
                          />
                          <div className="min-w-0">
                            <span className="block text-[11px] font-bold text-white truncate">
                              {preset.name}
                            </span>
                            <span className="block text-[9px] text-slate-400 leading-tight">
                              {preset.subtitle}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Metal Luster & Polish Enhancements */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[#B59A6C] tracking-wider block">
                    2. Precious Metal & Diamond Luster Calibration:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ADVANCED_LUSTER_MODES.map((luster) => {
                      const isSelected = selectedLuster === luster.id;
                      return (
                        <button
                          key={luster.id}
                          type="button"
                          onClick={() => handleLusterSelect(luster.id)}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-amber-400 bg-[#142A45] text-white font-bold'
                              : 'border-[#1A2E47] bg-[#071322] text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="block text-[11px]">{luster.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-3 sm:p-4 bg-[#07111D] border-t border-[#1A2E47] flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              {activeTab === 'enhance' && (
                <button
                  type="button"
                  onClick={() => handleTabChange('camera')}
                  className="px-3 py-1.5 bg-[#0F2238] hover:bg-[#1A385C] text-slate-300 rounded text-xs flex items-center gap-1 border border-[#1A2E47] cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retake / Snap Again</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="px-3 py-1.5 bg-[#0F2238] hover:bg-slate-700 text-slate-300 rounded text-xs border border-[#1A2E47] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!rawPhoto || isProcessing}
                onClick={handleConfirmPhoto}
                className="px-4 py-1.5 bg-[#B59A6C] hover:bg-white text-[#07111D] font-black uppercase tracking-wider rounded text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Attach to Voucher Row</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
