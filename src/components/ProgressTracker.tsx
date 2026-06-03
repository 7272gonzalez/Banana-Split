import React, { useState, useEffect, useRef } from 'react';
import { ProgressPhoto } from '../types';
import { Camera, Upload, Trash2, Sliders, ChevronLeft, Check, Compass, Info, Calendar } from 'lucide-react';

interface ProgressTrackerProps {
  photos: ProgressPhoto[];
  onSavePhoto: (photo: ProgressPhoto) => void;
  onDeletePhoto: (id: string) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  photos,
  onSavePhoto,
  onDeletePhoto,
}) => {
  // Navigation inside tracker
  const [activeTab, setActiveTab] = useState<'gallery' | 'add' | 'compare'>('gallery');

  // New photo entry state
  const [newImage, setNewImage] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [markers, setMarkers] = useState<{ x: number; y: number }[]>([]);
  const [calculatedAngle, setCalculatedAngle] = useState<number>(180);

  // Webcam capture states
  const [showWebcam, setShowWebcam] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Compare mode states
  const [compareLeftId, setCompareLeftId] = useState<string>('');
  const [compareRightId, setCompareRightId] = useState<string>('');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const compareContainerRef = useRef<HTMLDivElement | null>(null);

  // Angle Calculator logic
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (markers.length >= 3) return; // Only 3 points needed for angle calculation

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const updatedMarkers = [...markers, { x, y }];
    setMarkers(updatedMarkers);
  };

  const handleClearMarkers = () => {
    setMarkers([]);
    setCalculatedAngle(180);
  };

  // Run angle calculation whenever markers update
  useEffect(() => {
    if (markers.length === 3) {
      // P1: Left leg foot / knee
      // P2: Vertex (Hip Joint / Pelvis)
      // P3: Right leg foot
      const [p1, p2, p3] = markers;

      // Invert Y axes visually to calculate math angle
      const vA = { x: p1.x - p2.x, y: p2.y - p1.y };
      const vB = { x: p3.x - p2.x, y: p2.y - p3.y };

      const dotProduct = vA.x * vB.x + vA.y * vB.y;
      const magA = Math.sqrt(vA.x * vA.x + vA.y * vA.y);
      const magB = Math.sqrt(vB.x * vB.x + vB.y * vB.y);

      if (magA > 0 && magB > 0) {
        const cosTheta = dotProduct / (magA * magB);
        // Correct float bounds
        const clampedCos = Math.max(-1, Math.min(1, cosTheta));
        const rad = Math.acos(clampedCos);
        const deg = Math.round(rad * (180 / Math.PI));
        setCalculatedAngle(deg);
      }
    }
  }, [markers]);

  // Save Progress photo item
  const handleSavePhotoItem = () => {
    if (!newImage) return;

    const newPhoto: ProgressPhoto = {
      id: `photo-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      imageDataUrl: newImage,
      notes: notes || 'Feeling flexible!',
      angleValue: markers.length === 3 ? calculatedAngle : 180,
      markers: markers
    };

    onSavePhoto(newPhoto);
    
    // Reset inputs
    setNewImage(null);
    setNotes('');
    setMarkers([]);
    setCalculatedAngle(180);
    setActiveTab('gallery');
  };

  // Drag comparison slide controller
  const handleCompareMove = (clientX: number) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const offset = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (offset / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleCompareMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) { // Left click dragged
      handleCompareMove(e.clientX);
    }
  };

  // Camera start module
  const startWebcam = async () => {
    setShowWebcam(true);
    setNewImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn("Could not activate camera. Please use file upload instead.", e);
      setShowWebcam(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowWebcam(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Horizontal flip capture because mirror view is comfortable
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setNewImage(dataUrl);
        stopWebcam();
      }
    }
  };

  // Convert files to base64
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sync default comparison items if they exist
  useEffect(() => {
    if (photos.length >= 2) {
      if (!compareLeftId || !compareRightId) {
        // Sort chronologically to default left as earliest, right as latest
        const sorted = [...photos].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setCompareLeftId(sorted[0].id);
        setCompareRightId(sorted[sorted.length - 1].id);
      }
    }
  }, [photos]);

  // Clean up streaming on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const leftPhotoCompare = photos.find(p => p.id === compareLeftId);
  const rightPhotoCompare = photos.find(p => p.id === compareRightId);

  return (
    <div className="space-y-6">
      
      {/* Tab Selectors with Bento borders and shadow */}
      <div className="flex flex-col sm:flex-row bg-[#FEFCE8] p-1.5 rounded-2xl w-full sm:w-fit gap-2 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
        <button
          onClick={() => { setActiveTab('gallery'); stopWebcam(); }}
          className={`text-center py-2.5 px-4 rounded-xl text-xs font-mono font-extrabold transition-all cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-yellow-300 text-slate-900 border-2 border-slate-900 shadow-[1px_1px_0px_#1e293b]'
              : 'text-slate-550 border-2 border-transparent hover:text-slate-950'
          }`}
        >
          📷 PROGRESS GALLERY
        </button>
        <button
          onClick={() => { setActiveTab('add'); handleClearMarkers(); }}
          className={`text-center py-2.5 px-4 rounded-xl text-xs font-mono font-extrabold transition-all cursor-pointer ${
            activeTab === 'add'
              ? 'bg-yellow-300 text-slate-900 border-2 border-slate-900 shadow-[1px_1px_0px_#1e293b]'
              : 'text-slate-550 border-2 border-transparent hover:text-slate-950'
          }`}
        >
          ➕ NEW PROGRESS & PROTRACTOR
        </button>
        {photos.length >= 2 && (
          <button
            onClick={() => { setActiveTab('compare'); stopWebcam(); }}
            className={`text-center py-2.5 px-4 rounded-xl text-xs font-mono font-extrabold transition-all cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-yellow-300 text-slate-900 border-2 border-slate-900 shadow-[1px_1px_0px_#1e293b]'
                : 'text-slate-550 border-2 border-transparent hover:text-slate-950'
            }`}
          >
            ↔️ BEFORE/AFTER SLIDER
          </button>
        )}
      </div>

      {/* GALLERY TAB */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {photos.length === 0 ? (
            <div className="bg-white border-2 border-slate-900 bento-card rounded-3xl p-10 text-center space-y-4 max-w-md mx-auto shadow-[4px_4px_0px_#1e293b]">
              <span className="text-4xl bg-yellow-100 p-4 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1E293B] inline-block animate-bounce">🍌</span>
              <h3 className="text-xl font-sans font-extrabold text-slate-900">Your Splits Track is Empty</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
                No progress photos recorded yet. Stretch today, take a webcam lunge snap, and estimate your split angle with our built-in protractor widget!
              </p>
              <button
                onClick={() => setActiveTab('add')}
                className="bento-btn bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black font-mono py-2.5 px-5 rounded-xl text-xs w-full sm:w-auto cursor-pointer"
              >
                SNAP YOUR FIRST PHOTO
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {photos.map((item) => (
                <div 
                  key={item.id}
                  className="bento-card bg-white border-2 border-slate-900 rounded-3xl overflow-hidden shadow-[4px_4px_0px_#1e293b] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#1e293b] duration-200 transition-all relative group"
                >
                  {/* Photo area with mini badge showing Angle */}
                  <div className="relative aspect-video bg-slate-900 border-b-2 border-slate-900 overflow-hidden">
                    <img 
                      src={item.imageDataUrl} 
                      alt="Splits Progress" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Angle stamp overlay with Bento design */}
                    {item.angleValue < 185 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-yellow-300 text-slate-950 border-2 border-slate-900 px-2.5 py-1 rounded-xl font-mono text-[10px] font-black shadow-[2px_2px_0px_#1E293B]">
                        <Compass className="w-3.5 h-3.5 text-slate-900" />
                        {item.angleValue}° Split
                      </div>
                    )}
                  </div>

                  {/* Body text info */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-mono font-black text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-900" />
                        {item.date}
                      </p>
                      
                      <button
                        onClick={() => onDeletePhoto(item.id)}
                        className="text-slate-400 hover:text-red-650 p-1.5 rounded-xl hover:bg-red-50 hover:border-red-200 border border-transparent transition-colors cursor-pointer"
                        title="Delete photo record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 font-extrabold italic leading-relaxed line-clamp-2">
                      “{item.notes}”
                    </p>

                    {/* Progress feedback line */}
                    {item.angleValue < 185 && (
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-slate-400 font-mono">Pelvis Depth</span>
                        <span className={`font-mono font-black ${
                          item.angleValue >= 165 
                            ? 'text-emerald-700' 
                            : item.angleValue >= 140
                              ? 'text-amber-800'
                              : 'text-slate-500'
                        }`}>
                          {item.angleValue >= 170 ? '🎉 Touchdown Accomplished!' : `${180 - item.angleValue}° left to floor`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD TAB */}
      {activeTab === 'add' && (
        <div className="max-w-2xl mx-auto bento-card bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_#1e293b] space-y-6">
          <div>
            <h3 className="text-xl font-sans font-extrabold text-slate-900">Add Progress Snap</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">Take a photo using your webcam or select a file to calculate your split angle.</p>
          </div>

          {!newImage && !showWebcam ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Webcam option with dynamic indicator */}
              <button 
                onClick={startWebcam}
                className="flex flex-col items-center justify-center p-8 bg-amber-50/70 border-2 border-dashed border-slate-900 rounded-2xl transition-all text-center space-y-4 shadow-[2px_2px_0px_#1E293B] cursor-pointer hover:bg-amber-100"
              >
                <div className="p-4 bg-yellow-300 text-slate-900 rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_#1E293B] transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-black text-slate-900 uppercase">Use Webcam Camera</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">Capture your stretch directly via window camera access.</p>
                </div>
              </button>

              {/* Upload file option */}
              <label className="flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-900 rounded-2xl transition-all text-center space-y-4 shadow-[2px_2px_0px_#1E293B] cursor-pointer hover:bg-slate-100">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />
                <div className="p-4 bg-white text-slate-900 rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_#1E293B] transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-black text-slate-900 uppercase">Select Local File</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">Import JPEG/PNG from your mobile or desktop folders.</p>
                </div>
              </label>
            </div>
          ) : showWebcam ? (
            /* ACTIVE CAMERA STREAM AREA */
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border-4 border-slate-900 shadow-[4px_4px_0px_#1e293b]">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover scale-x-[-1]" 
              />
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={stopWebcam}
                  className="bg-white text-slate-900 border-2 border-slate-900 font-mono text-[10px] font-bold px-4 py-2.5 rounded-xl shadow-[2px_2px_0px_#1E293B] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 border-2 border-slate-900 font-mono text-[11px] font-black px-5 py-2.5 rounded-xl shadow-[2px_2px_0px_#1E293B] flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4" /> SNAP IMAGE
                </button>
              </div>
            </div>
          ) : (
            /* INTERACTIVE ANGLE REGISTERING PROTRACTOR WIDGET */
            <div className="space-y-4">
              <div className="p-4 bg-yellow-100 border-2 border-slate-900 rounded-2xl space-y-1.5 shadow-[2px_2px_0px_#1E293B]">
                <p className="text-xs font-mono font-black text-slate-900 uppercase flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-slate-900" />
                  Banana Split Angle Protractor (Click to Place Hips & Feet)
                </p>
                <p className="text-[10px] text-slate-800 font-semibold leading-relaxed">
                  Help us calculate your split angle! Click 3 exact points on your photo: <br/>
                  <strong className="text-slate-950 font-bold font-mono">1st click: Left Foot</strong> ➔ 
                  <strong className="text-slate-950 font-bold font-mono"> 2nd click: Pelvis center</strong> ➔ 
                  <strong className="text-slate-950 font-bold font-mono"> 3rd click: Right Foot</strong>.
                </p>
              </div>

              {/* Photo viewport container for registering markers */}
              <div 
                onClick={handleImageClick}
                className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 group cursor-crosshair select-none border-4 border-slate-900 shadow-[4px_4px_0px_#1e293b]"
              >
                <img 
                  src={newImage} 
                  alt="Review source" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />

                {/* SVG Skeleton and lines drawing layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {markers.length >= 2 && (
                    <line 
                      x1={`${markers[0].x}%`} 
                      y1={`${markers[0].y}%`} 
                      x2={`${markers[1].x}%`} 
                      y2={`${markers[1].y}%`} 
                      stroke="#facc15" 
                      strokeWidth="4" 
                      strokeLinecap="round"
                    />
                  )}
                  {markers.length === 3 && (
                    <>
                      <line 
                        x1={`${markers[1].x}%`} 
                        y1={`${markers[1].y}%`} 
                        x2={`${markers[2].x}%`} 
                        y2={`${markers[2].y}%`} 
                        stroke="#facc15" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                      />
                      {/* Semi-transparent angular visual sector fan */}
                      <circle 
                        cx={`${markers[1].x}%`} 
                        cy={`${markers[1].y}%`} 
                        r="35" 
                        fill="rgba(250, 204, 21, 0.3)" 
                        stroke="#ffffff" 
                        strokeWidth="1.5"
                      />
                    </>
                  )}
                </svg>

                {/* Markers visual indicators - Yellow button styled with pulse */}
                {markers.map((pt, i) => (
                  <div
                    key={i}
                    className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-yellow-400 border-2 border-slate-900 flex items-center justify-center text-[10px] font-mono font-black text-slate-900 marker-pulse shadow-[1px_1px_0px_#1E293B]"
                    style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                  >
                    {i + 1}
                  </div>
                ))}

                {/* Direct angle print over image center */}
                {markers.length === 3 && (
                  <div 
                    className="absolute bg-slate-950 text-yellow-300 font-mono px-3 py-1.5 rounded-xl border-2 border-slate-900 text-xs font-black shadow-lg flex items-center gap-1.5"
                    style={{ 
                      left: `${markers[1].x}%`, 
                      top: `${Math.max(10, markers[1].y - 20)}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    {calculatedAngle}° Split
                  </div>
                )}
              </div>

              {/* Controls below drawing area */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleClearMarkers}
                  disabled={markers.length === 0}
                  className="text-[10px] font-mono font-bold text-slate-400 hover:text-red-500 disabled:opacity-40 cursor-pointer"
                >
                  RESET ANGLES PROTRACTOR
                </button>
                <span className="text-[10px] font-mono text-slate-900 bg-slate-100 border border-slate-900/20 px-3 py-1 rounded-lg font-bold">
                  Placements: {markers.length}/3 joints
                </span>
              </div>

              {/* Progress photo details inputs fields */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-black text-slate-600 block">How did this stretch feel?</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. Feeling lower than last week! Hip feels unlocked."
                    className="w-full bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-0 outline-none rounded-xl py-2.5 px-3.5 text-xs text-slate-800 font-semibold"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setNewImage(null); handleClearMarkers(); }}
                    className="flex-1 py-3 border-2 border-slate-900 text-slate-900 bg-white hover:bg-slate-50 rounded-xl font-mono text-xs font-black shadow-[2px_2px_0px_#1E293B] cursor-pointer"
                  >
                    RESELECT IMAGE
                  </button>
                  <button
                    onClick={handleSavePhotoItem}
                    className="flex-1 bg-yellow-400 border-2 border-slate-900 hover:bg-yellow-500 text-slate-950 font-mono text-xs font-black py-3 rounded-xl shadow-[2px_2px_0px_#1E293B] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> SAVE RECORD
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPARE MODE TAB */}
      {activeTab === 'compare' && photos.length >= 2 && (
        <div className="max-w-2xl mx-auto bento-card bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_#1e293b] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-sans font-extrabold text-slate-900">Before / After Split Sandbox Slider</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Choose two historical entries. Drag the bar sideways to overlay your depth gains.</p>
            </div>
          </div>

          {/* Slices Selectors to populate Left/Right comparison */}
          <div className="grid grid-cols-2 gap-4 bg-[#FEFCE8] p-4 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1E293B]">
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono uppercase text-slate-500 block font-black">Left Image (Before)</label>
              <select
                value={compareLeftId}
                onChange={(e) => setCompareLeftId(e.target.value)}
                className="w-full bg-white border-2 border-slate-900 rounded-xl text-xs py-2 px-2.5 outline-none font-sans font-bold cursor-pointer"
              >
                {photos.map(p => (
                  <option key={p.id} value={p.id}>{p.date} - Angle: {p.angleValue}°</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono uppercase text-slate-500 block font-black">Right Image (After)</label>
              <select
                value={compareRightId}
                onChange={(e) => setCompareRightId(e.target.value)}
                className="w-full bg-white border-2 border-slate-900 rounded-xl text-xs py-2 px-2.5 outline-none font-sans font-bold cursor-pointer"
              >
                {/* Reversed for easy selection */}
                {[...photos].reverse().map(p => (
                  <option key={p.id} value={p.id}>{p.date} - Angle: {p.angleValue}°</option>
                ))}
              </select>
            </div>
          </div>

          {/* LARGE SLIDER INTERACTIVE CONTAINER */}
          {leftPhotoCompare && rightPhotoCompare ? (
            <div className="space-y-4">
              <div 
                ref={compareContainerRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border-4 border-slate-900 select-none cursor-ew-resize shadow-[4px_4px_0px_#1e293b]"
              >
                {/* Background (After / Right Image) */}
                <div className="absolute inset-0 w-full h-full">
                  <img 
                    src={rightPhotoCompare.imageDataUrl} 
                    alt="After stretch" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Informative text stamp for Right */}
                  <div className="absolute bottom-3 right-3 bg-slate-950 text-yellow-300 border-2 border-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-mono font-black shadow-[2px_2px_0px_#1E293B]">
                    ✅ {rightPhotoCompare.date} ({rightPhotoCompare.angleValue}° Split)
                  </div>
                </div>

                {/* Foreground Overlay (Before / Left Image) clipped */}
                <div 
                  className="absolute inset-0 w-full h-full overflow-hidden border-r-4 border-yellow-400"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img 
                    src={leftPhotoCompare.imageDataUrl} 
                    alt="Before stretch" 
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    style={{ 
                      width: compareContainerRef.current?.getBoundingClientRect().width || '100vw',
                      maxWidth: 'none'
                    }}
                    referrerPolicy="no-referrer"
                  />
                  {/* Informative text stamp for Left */}
                  <div className="absolute bottom-3 left-3 bg-slate-950 text-slate-100 border-2 border-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-mono whitespace-nowrap shadow-[2px_2px_0px_#1E293B]">
                    🌱 {leftPhotoCompare.date} ({leftPhotoCompare.angleValue}° Split)
                  </div>
                </div>

                {/* Floating vertical handler line */}
                <div 
                  className="absolute top-0 bottom-0 w-[4px] bg-yellow-400 cursor-ew-resize flex items-center justify-center pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  {/* Inner handle drag circle */}
                  <div className="w-10 h-10 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center shadow-[2px_2px_0px_#1E293B] border-2 border-slate-900 font-mono text-xs select-none shrink-0">
                    ↔️
                  </div>
                </div>
              </div>

              {/* Slider hints help row */}
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold justify-center">
                <Info className="w-4 h-4 text-yellow-500" />
                <span>Drag your cursor or swipe back/forth on the photo to peel apart progress!</span>
              </div>
              
              {/* Angle metric improvement box */}
              {leftPhotoCompare.angleValue < 185 && rightPhotoCompare.angleValue < 185 && (
                <div className="bg-emerald-100 border-2 border-slate-900 p-5 rounded-2xl text-center space-y-1 shadow-[2px_2px_0px_#1e293b]">
                  <span className="text-2xl">🏆</span>
                  <p className="text-sm font-sans font-black text-slate-900 leading-none">
                    Pelvis Improvement Angle: +{Math.max(0, rightPhotoCompare.angleValue - leftPhotoCompare.angleValue)}° Closer to Split touchdown!
                  </p>
                  <p className="text-[10px] text-slate-700 font-bold leading-relaxed mt-2">
                    Your hips have widened from {leftPhotoCompare.angleValue}° on {leftPhotoCompare.date} to {rightPhotoCompare.angleValue}° on {rightPhotoCompare.date}. Keep up the delicious daily stretches!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-6 text-xs text-slate-400 font-semibold">
              Please choose two valid records from your dates dropdowns.
            </div>
          )}
        </div>
      )}

    </div>
  );
};

