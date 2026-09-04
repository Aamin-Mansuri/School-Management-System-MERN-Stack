import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  FlipHorizontal,
  Sparkles,
  Image as ImageIcon,
  Sliders,
} from 'lucide-react';

export const CameraCaptureModal = ({
  isOpen,
  onClose,
  onImageCaptured,
  currentImage,
  title = 'Take or Upload Profile Photo',
  aspectRatio = 'square', // 'square' or 'id-card'
}) => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' | 'environment'
  const [capturedImage, setCapturedImage] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera stream safely
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start camera stream
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setCapturedImage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser or environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      let errorMsg = 'Could not connect to camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission was denied. Please allow camera access in browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera device found on this system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'Camera is already in use by another application.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      setCameraError(errorMsg);
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode]);

  // Flip camera (front/back)
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Take Snapshot
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crop center square
    const startX = ((video.videoWidth || 640) - size) / 2;
    const startY = ((video.videoHeight || 640) - size) / 2;

    if (facingMode === 'user') {
      // Mirror front camera for natural selfie orientation
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
    } else {
      ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Countdown Snapshot
  const triggerCountdownSnapshot = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          captureSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // File Upload Handlers
  const handleFileProcess = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCapturedImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    if (capturedImage) {
      onImageCaptured(capturedImage);
      stopCamera();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Campus Identity & Profile Picture</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle: Live Camera vs Upload */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl max-w-xs w-full">
            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                setCapturedImage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Camera</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[320px]">
          {/* TAB 1: LIVE CAMERA VIEW */}
          {activeTab === 'camera' && (
            <div className="w-full flex flex-col items-center">
              {capturedImage ? (
                // Display Captured Photo Preview
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-indigo-500/30 dark:border-indigo-500/50 shadow-xl ring-4 ring-indigo-500/10">
                    <img
                      src={capturedImage}
                      alt="Captured Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 inset-x-0 text-center">
                      <span className="text-[10px] bg-slate-900/80 text-white px-2 py-0.5 rounded-full backdrop-blur-xs font-medium">
                        Preview
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    Review your photo. Click retake if you want another shot.
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCapturedImage(null);
                        startCamera();
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retake</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply as Profile</span>
                    </button>
                  </div>
                </div>
              ) : cameraError ? (
                // Camera Error Fallback
                <div className="w-full max-w-sm p-6 text-center space-y-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                    Camera Access Required
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {cameraError}
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full py-2 px-3 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors cursor-pointer"
                    >
                      Retry Camera Connection
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className="w-full py-2 px-3 text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Upload File Instead
                    </button>
                  </div>
                </div>
              ) : (
                // Live Viewfinder
                <div className="flex flex-col items-center space-y-4 w-full">
                  <div className="relative w-64 h-64 rounded-full overflow-hidden bg-slate-950 border-4 border-indigo-600 shadow-2xl ring-4 ring-indigo-500/20 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${
                        facingMode === 'user' ? 'scale-x-[-1]' : ''
                      }`}
                    />

                    {/* Viewfinder Circle Target Overlay */}
                    <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full pointer-events-none" />

                    {/* 3-Second Countdown Display */}
                    {countdown !== null && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="text-6xl font-extrabold text-white animate-ping">
                          {countdown}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Camera Controls */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={toggleFacingMode}
                      title="Flip camera"
                      className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <FlipHorizontal className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={captureSnapshot}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={triggerCountdownSnapshot}
                      title="Take photo with 3s timer"
                      className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      ⏱️ 3s Timer
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Position your face within the frame and click Take Photo
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD IMAGE / DRAG & DROP */}
          {activeTab === 'upload' && (
            <div className="w-full flex flex-col items-center">
              {capturedImage ? (
                // Display Uploaded Photo Preview
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-indigo-500/30 dark:border-indigo-500/50 shadow-xl ring-4 ring-indigo-500/10">
                    <img
                      src={capturedImage}
                      alt="Uploaded Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    Image loaded successfully. Ready to apply to your profile.
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCapturedImage(null)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Choose Different</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply as Profile</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Drag & Drop Area
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full max-w-sm p-8 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.02]'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30 hover:border-indigo-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileProcess(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 border border-indigo-100 dark:border-indigo-900/50 shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Click to browse or drop photo here
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    Supports high-resolution PNG, JPG, or WebP (square aspect ratio recommended)
                  </p>

                  <div className="mt-4 px-3 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                    Browse Computer or Mobile Storage
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Current avatar will be updated across all school records
          </span>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-3.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
