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
  ShieldCheck
} from 'lucide-react';
import {
  STUDIO_PRESETS,
  LUSTER_MODES,
  processStudioImage
} from '../utils/aiImageEnhancer';

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
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) | 'user' (front)
  const [rawPhoto, setRawPhoto] = useState(initialPhoto || '');
  const [processedPhoto, setProcessedPhoto] = useState(initialPhoto || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('white');
  const [selectedLuster, setSelectedLuster] = useState('gold');
  const [showOriginal, setShowOriginal] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);

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

  // Flip front/back camera
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

  // Run AI Enhancement on current raw photo
  const runAIEnhancement = async (src, preset, luster) => {
    if (!src) return;
    setIsProcessing(true);
    setActiveTab('enhance');
    try {
      const enhanced = await processStudioImage(src, {
        preset,
        luster,
        quality: 0.92
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
        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
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
          className="w-full max-w-xl bg-[#0D1B2A] text-white border border-[#B59A6C]/40 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden font-mono flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-[#07162C] border-b border-[#1E3A5F] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B59A6C] animate-pulse" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                  <span>{title}</span>
                </h3>
                <p className="text-[10px] text-[#B59A6C]">
                  Live Camera Snap & AI Studio Background Calibration for Bill Proof
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-[#102A4C] hover:bg-rose-900 border border-[#1E3A5F] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Navigation Tabs */}
          <div className="grid grid-cols-3 border-b border-[#1E3A5F] bg-[#0A192F] text-xs shrink-0">
            <button
              type="button"
              onClick={() => handleTabChange('camera')}
              className={`py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors border-b-2 font-bold ${
                activeTab === 'camera'
                  ? 'border-[#B59A6C] text-[#B59A6C] bg-[#0E233E]'
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
                  ? 'border-[#B59A6C] text-[#B59A6C] bg-[#0E233E]'
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
                  ? 'border-[#B59A6C] text-[#B59A6C] bg-[#0E233E]'
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
                  <div className="relative aspect-square max-h-[380px] w-full mx-auto bg-black rounded-xl overflow-hidden border border-[#1E3A5F] flex items-center justify-center group">
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

                      <div className="w-3 h-3 rounded-full border border-[#B59A6C]/80" />
                      <div className="text-[9px] uppercase tracking-widest text-[#B59A6C] font-bold absolute bottom-2 bg-black/60 px-2 py-0.5 rounded">
                        Position Ornament Centered
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
                      className="px-6 py-2.5 bg-[#B59A6C] hover:bg-white text-[#07162C] font-black uppercase tracking-wider rounded-full shadow-lg transition-all flex items-center gap-2 cursor-pointer text-xs"
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
                className="border-2 border-dashed border-[#B59A6C]/60 hover:border-[#B59A6C] rounded-2xl p-8 sm:p-12 text-center bg-[#07172A] cursor-pointer transition-colors space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-14 h-14 mx-auto rounded-full bg-[#102A4C] border border-[#B59A6C]/40 flex items-center justify-center text-[#B59A6C]">
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
                <div className="inline-block px-3 py-1 bg-[#102A4C] text-[#B59A6C] border border-[#1E3A5F] rounded text-[10px] font-bold uppercase tracking-wider">
                  Select Photo from Gallery / Disk
                </div>
              </div>
            )}

            {/* TAB 3: AI STUDIO BACKGROUND & ENHANCER */}
            {activeTab === 'enhance' && (
              <div className="space-y-4">
                {/* Image Preview Canvas */}
                <div className="relative aspect-square max-h-[300px] w-full mx-auto bg-[#050C15] rounded-xl overflow-hidden border border-[#B59A6C]/40 flex items-center justify-center">
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
                      <img
                        src={showOriginal ? rawPhoto : (processedPhoto || rawPhoto)}
                        alt="Jewelry Piece Preview"
                        className="w-full h-full object-contain"
                      />

                      {/* Before / After Peek Button */}
                      <button
                        type="button"
                        onMouseDown={() => setShowOriginal(true)}
                        onMouseUp={() => setShowOriginal(false)}
                        onTouchStart={() => setShowOriginal(true)}
                        onTouchEnd={() => setShowOriginal(false)}
                        className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-black/75 hover:bg-black text-[10px] rounded border border-white/20 text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3 h-3 text-[#B59A6C]" />
                        <span>Hold to View Original</span>
                      </button>

                      {/* Active Preset Watermark Badge */}
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/75 rounded border border-[#B59A6C]/40 text-[9px] text-amber-300 font-bold uppercase tracking-wider">
                        {STUDIO_PRESETS.find(p => p.id === selectedPreset)?.name}
                      </div>
                    </>
                  )}
                </div>

                {/* Studio Background Presets Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[#B59A6C] tracking-wider block">
                    1. Select Studio Background Backdrop:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STUDIO_PRESETS.map((preset) => {
                      const isSelected = selectedPreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handlePresetSelect(preset.id)}
                          className={`p-2 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#B59A6C] bg-[#102A4C] shadow-sm'
                              : 'border-[#1E3A5F] bg-[#07172A] hover:border-slate-500'
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
                              {preset.id === 'white' ? 'Official Invoices' : preset.id === 'champagne' ? 'Luxury Silk' : preset.id === 'obsidian' ? 'Deep Velvet' : 'Cutout'}
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
                  <div className="grid grid-cols-3 gap-2">
                    {LUSTER_MODES.map((luster) => {
                      const isSelected = selectedLuster === luster.id;
                      return (
                        <button
                          key={luster.id}
                          type="button"
                          onClick={() => handleLusterSelect(luster.id)}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-amber-400 bg-[#163359] text-white font-bold'
                              : 'border-[#1E3A5F] bg-[#07172A] text-slate-300 hover:text-white'
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
          <div className="p-3 sm:p-4 bg-[#07162C] border-t border-[#1E3A5F] flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              {activeTab === 'enhance' && (
                <button
                  type="button"
                  onClick={() => handleTabChange('camera')}
                  className="px-3 py-1.5 bg-[#102A4C] hover:bg-[#1C4170] text-slate-300 rounded text-xs flex items-center gap-1 border border-[#1E3A5F] cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retake / Change</span>
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
                className="px-3 py-1.5 bg-[#102A4C] hover:bg-slate-700 text-slate-300 rounded text-xs border border-[#1E3A5F] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!rawPhoto || isProcessing}
                onClick={handleConfirmPhoto}
                className="px-4 py-1.5 bg-[#B59A6C] hover:bg-white text-[#07162C] font-black uppercase tracking-wider rounded text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
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
