import React, { useState, useEffect, useRef } from 'react';
import { ProgressPhoto, RoutineLog } from '../types';
import { Camera, Upload, Trash2, Sliders, ChevronLeft, Check, Compass, Info, Calendar, RotateCw } from 'lucide-react';

interface ProgressTrackerProps {
  photos: ProgressPhoto[];
  logs: RoutineLog[];
  onSavePhoto: (photo: ProgressPhoto) => void;
  onDeletePhoto: (id: string) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  photos,
  logs,
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
  const [splitType, setSplitType] = useState<'right' | 'left' | 'center'>('center');

  // Webcam facing mode & drag state controls
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Webcam capture states
  const [showWebcam, setShowWebcam] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Compare mode states
  const [compareLeftId, setCompareLeftId] = useState<string>('');
  const [compareRightId, setCompareRightId] = useState<string>('');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [compareSplitFilter, setCompareSplitFilter] = useState<'left' | 'right' | 'center'>('center');
  const compareContainerRef = useRef<HTMLDivElement | null>(null);

  // Angle Calculator logic
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If we were just dragging or clicked on a marker directly, ignore
    if (draggedIndex !== null) return;
    if (markers.length >= 3) return; // Only 3 points needed for angle calculation

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const updatedMarkers = [...markers, { x, y }];
    setMarkers(updatedMarkers);
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedIndex === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const updated = [...markers];
    updated[draggedIndex] = { x, y };
    setMarkers(updated);
  };

  const handleImageTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (draggedIndex === null || !e.touches[0]) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.touches[0].clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.touches[0].clientY - rect.top) / rect.height) * 100));

    const updated = [...markers];
    updated[draggedIndex] = { x, y };
    setMarkers(updated);
  };

  const deleteMarker = (index: number) => {
    const updated = markers.filter((_, i) => i !== index);
    setMarkers(updated);
  };

  const handleClearMarkers = () => {
    setMarkers([]);
    setCalculatedAngle(180);
    setDraggedIndex(null);
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
      markers: markers,
      splitType: splitType
    };

    onSavePhoto(newPhoto);
    
    // Reset inputs
    setNewImage(null);
    setNotes('');
    setMarkers([]);
    setCalculatedAngle(180);
    setSplitType('center');
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
  const startWebcam = async (mode: 'user' | 'environment' = facingMode) => {
    setShowWebcam(true);
    setNewImage(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn(`Could not activate camera with facingMode: ${mode}. Retrying default fallback...`, e);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Could not activate camera.", err);
        setShowWebcam(false);
      }
    }
  };

  const handleToggleCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (showWebcam) {
      startWebcam(nextMode);
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
        if (facingMode === 'user') {
          // Horizontal flip capture because mirror view of front camera is comfortable
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
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

  const filteredComparePhotos = photos.filter(p => {
    if (compareSplitFilter === 'center') return p.splitType === 'center' || !p.splitType;
    return p.splitType === compareSplitFilter;
  });

  // Sync default comparison items if they exist under the current filter
  useEffect(() => {
    if (filteredComparePhotos.length >= 2) {
      const isLeftValid = filteredComparePhotos.some(p => p.id === compareLeftId);
      const isRightValid = filteredComparePhotos.some(p => p.id === compareRightId);
      if (!isLeftValid || !isRightValid) {
        // Sort chronologically to default left as earliest, right as latest
        const sorted = [...filteredComparePhotos].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setCompareLeftId(sorted[0].id);
        setCompareRightId(sorted[sorted.length - 1].id);
      }
    } else if (filteredComparePhotos.length === 1) {
      setCompareLeftId(filteredComparePhotos[0].id);
      setCompareRightId(filteredComparePhotos[0].id);
    } else {
      setCompareLeftId('');
      setCompareRightId('');
    }
  }, [compareSplitFilter, photos]);

  // Clean up streaming on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Generate calendar dates for the past 14 days to show on a mini tracker
  const getPastFortnight = () => {
    const dates = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const hasCompleted = logs.some(l => l.date === dateStr && l.completed);
      dates.push({
        dateStr,
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dayNum: d.getDate(),
        isToday: d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0],
        hasCompleted
      });
    }
    return dates;
  };

  const fortnight = getPastFortnight();
  const completedRoutinesGroup = logs.slice(0, 5);

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
              <h3 className="text-xl font-sans font-extrabold text-slate-900">Your Gallery is Empty</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
                No progress photos saved yet. Complete a routine, save a photo, and measure your split angle to see your progress over time.
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

                    {/* Split type flavor overlay with human/emoji elements */}
                    <div className="absolute top-3 left-3 bg-slate-900/95 text-yellow-300 border-2 border-slate-900 px-2.5 py-1 rounded-xl font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_#1E293B] flex items-center gap-1 z-10">
                      {item.splitType === 'left' ? '◀️ Left Split' : item.splitType === 'right' ? '▶️ Right Split' : '🔽 Center Split'}
                    </div>
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
                  <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">Take a picture using your webcam.</p>
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
                  <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">Upload an image from your device.</p>
                </div>
              </label>
            </div>
          ) : showWebcam ? (
            /* ACTIVE CAMERA STREAM AREA */
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border-4 border-slate-900 shadow-[4px_4px_0px_#1e293b]">
              {/* Floating Camera Facing Toggle Overlay */}
              <button
                type="button"
                onClick={handleToggleCameraFacing}
                className="absolute top-3 right-3 bg-white hover:bg-yellow-100 text-slate-950 border-2 border-slate-900 font-mono text-[9px] font-black px-2.5 py-1.5 rounded-xl shadow-[1.5px_1.5px_0px_#1E293B] cursor-pointer flex items-center gap-1 z-10 transition-colors"
                title="Toggle Front / Back Camera"
              >
                <RotateCw className="w-3 h-3 text-slate-950" />
                {facingMode === 'user' ? 'BACK CAMERA' : 'FRONT CAMERA'}
              </button>

              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
              />
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 z-10">
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
                  Angle Measurement Tool
                </p>
                <p className="text-[10px] text-slate-800 font-semibold leading-relaxed">
                  To measure your split angle, place 3 points on your photo: <br/>
                  <strong className="text-slate-950 font-bold font-mono">1st click: Left Foot</strong> ➔ 
                  <strong className="text-slate-950 font-bold font-mono"> 2nd click: Pelvis centre</strong> ➔ 
                  <strong className="text-slate-950 font-bold font-mono"> 3rd click: Right Foot</strong>.
                </p>
              </div>

              {/* Photo viewport container for registering markers */}
              <div 
                onClick={handleImageClick}
                onMouseMove={handleImageMouseMove}
                onTouchMove={handleImageTouchMove}
                onMouseUp={() => setDraggedIndex(null)}
                onTouchEnd={() => setDraggedIndex(null)}
                onMouseLeave={() => setDraggedIndex(null)}
                className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 group/img cursor-crosshair select-none border-4 border-slate-900 shadow-[4px_4px_0px_#1e293b]"
              >
                <img 
                  src={newImage} 
                  alt="Review source" 
                  className="w-full h-full object-contain pointer-events-none"
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
                      stroke="#fbbf24" 
                      strokeWidth="2" 
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
                        stroke="#fbbf24" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                      />
                      {/* Semi-transparent angular visual sector fan */}
                      <circle 
                        cx={`${markers[1].x}%`} 
                        cy={`${markers[1].y}%`} 
                        r="20" 
                        fill="rgba(250, 204, 21, 0.25)" 
                        stroke="#ffffff" 
                        strokeWidth="1"
                      />
                    </>
                  )}
                </svg>

                {/* Markers visual indicators - Draggable and Deletable */}
                {markers.map((pt, i) => (
                  <div
                    key={i}
                    className={`absolute w-11 h-11 -ml-[22px] -mt-[22px] rounded-full bg-yellow-400 border-2 border-slate-900 flex items-center justify-center text-xs font-mono font-black text-slate-900 shadow-[1.5px_1.5px_0px_#1E293B] z-20 transition-transform touch-none ${draggedIndex === i ? 'cursor-grabbing scale-125 bg-yellow-300' : 'cursor-grab'} group/dot`}
                    style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggedIndex(i);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      setDraggedIndex(i);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    title="Drag to Adjust Position!"
                  >
                    {i + 1}
                    
                    {/* Inline custom delete indicator button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMarker(i);
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-650 text-white border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer opacity-90 hover:opacity-100 transition-opacity z-30"
                      title="Remove Point"
                    >
                      ×
                    </button>
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

              {/* Joint Dots Info & Edit Row */}
              {markers.length > 0 && (
                <div className="p-3.5 bg-slate-50 border-2 border-slate-900 rounded-xl space-y-2">
                  <p className="text-[10px] font-mono font-black text-slate-505 uppercase tracking-wide flex items-center justify-between">
                    <span>📍 Calibrated Joints</span>
                    <span className="text-[9px] text-slate-400 font-normal">Click & Drag any point directly on the image to adjust</span>
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {markers.map((pt, i) => {
                      const labels = ["Left Foot / Knee", "Pelvis / Hip center", "Right Foot / Knee"];
                      return (
                        <div key={i} className="flex items-center gap-1.5 bg-white border-2 border-slate-900 px-3 py-1.5 rounded-xl font-bold shadow-[1px_1px_0px_#1E293B]">
                          <span className="w-4 h-4 rounded-full bg-yellow-300 text-slate-950 font-mono text-[9px] font-black flex items-center justify-center border border-slate-900">
                            {i + 1}
                          </span>
                          <span className="text-slate-800">{labels[i]}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMarker(i);
                            }}
                            className="text-red-500 hover:text-red-700 font-black ml-1.5 px-1 hover:bg-red-50 text-xs cursor-pointer transition-all"
                            title="Delete joint"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase font-black text-slate-600 block">Which split is this photo showing?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['left', 'right', 'center'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSplitType(type)}
                        className={`py-2 px-3 rounded-xl border-2 text-center text-xs font-mono font-black uppercase transition-all cursor-pointer ${
                          splitType === type
                            ? 'bg-yellow-300 text-slate-900 border-slate-900 shadow-[2px_2px_0px_#1e293b]'
                            : 'bg-white text-slate-550 border-slate-200 hover:border-slate-450 hover:bg-slate-50'
                        }`}
                      >
                        {type === 'left' && 'Left Split ◀️'}
                        {type === 'right' && 'Right Split ▶️'}
                        {type === 'center' && 'Center Split 🔽'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-black text-slate-600 block">How did this stretch feel?</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. Feeling lower than last week! Hip feels unlocked."
                    className="w-full bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-0 outline-none rounded-xl py-3 px-3.5 text-base md:text-xs text-slate-800 font-semibold"
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
              <h3 className="text-xl font-sans font-extrabold text-slate-900">Compare Progress</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Choose two photos. Move the slider left and right to see your progress.</p>
            </div>
          </div>

          {/* Option to choose which split to compare */}
          <div className="space-y-1.5 p-3.5 bg-indigo-50 border-2 border-slate-900 rounded-2xl shadow-[2px_2px_0px_#1E293B]">
            <label className="text-[10px] font-mono text-indigo-950 block font-black uppercase">SPLIT TYPE TO COMPARE</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'left', label: 'Left ◀️' },
                { id: 'right', label: 'Right ▶️' },
                { id: 'center', label: 'Center 🔽' }
              ] as const).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCompareSplitFilter(item.id)}
                  className={`py-1.5 px-2 bg-white rounded-xl border-2 text-center text-xs font-mono font-black uppercase transition-all cursor-pointer ${
                    compareSplitFilter === item.id
                      ? 'bg-yellow-300 text-slate-1000 border-slate-900 shadow-[2px_2px_0px_#1e293b]'
                      : 'text-slate-600 border-slate-200 hover:border-slate-450 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Slices Selectors to populate Left/Right comparison */}
          {filteredComparePhotos.length >= 1 ? (
            <div className="grid grid-cols-2 gap-4 bg-[#FEFCE8] p-4 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1E293B]">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono uppercase text-slate-500 block font-black">Left Image (Before)</label>
                <select
                  value={compareLeftId}
                  onChange={(e) => setCompareLeftId(e.target.value)}
                  className="w-full bg-white border-2 border-slate-900 rounded-xl text-base md:text-xs py-2.5 px-3 outline-none font-sans font-bold cursor-pointer"
                >
                  {filteredComparePhotos.map(p => (
                    <option key={p.id} value={p.id}>{p.date} - Angle: {p.angleValue}° ({p.splitType === 'left' ? '◀️ Left' : p.splitType === 'right' ? '▶️ Right' : '🔽 Center'})</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono uppercase text-slate-500 block font-black">Right Image (After)</label>
                <select
                  value={compareRightId}
                  onChange={(e) => setCompareRightId(e.target.value)}
                  className="w-full bg-white border-2 border-slate-900 rounded-xl text-base md:text-xs py-2.5 px-3 outline-none font-sans font-bold cursor-pointer"
                >
                  {/* Reversed for easy selection */}
                  {[...filteredComparePhotos].reverse().map(p => (
                    <option key={p.id} value={p.id}>{p.date} - Angle: {p.angleValue}° ({p.splitType === 'left' ? '◀️ Left' : p.splitType === 'right' ? '▶️ Right' : '🔽 Center'})</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-xs text-slate-500 font-extrabold font-sans">No photos logged yet for {compareSplitFilter === 'left' ? 'Left Splits ◀️' : compareSplitFilter === 'right' ? 'Right Splits ▶️' : 'Center Splits 🔽'}.</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Select another filter or add more progress snaps in the "New Progress" tab.</p>
            </div>
          )}

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
                  <div className="absolute bottom-3 right-3 bg-slate-950/95 text-yellow-350 border-2 border-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-mono font-black shadow-[2px_2px_0px_#1E293B] flex items-center gap-1">
                    {rightPhotoCompare.splitType === 'left' ? '◀️ Left' : rightPhotoCompare.splitType === 'right' ? '▶️ Right' : '🔽 Center'} Splits • {rightPhotoCompare.date} ({rightPhotoCompare.angleValue}° Split)
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
                  <div className="absolute bottom-3 left-3 bg-slate-950/95 text-slate-100 border-2 border-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-mono whitespace-nowrap shadow-[2px_2px_0px_#1E293B] flex items-center gap-1">
                    {leftPhotoCompare.splitType === 'left' ? '◀️ Left' : leftPhotoCompare.splitType === 'right' ? '▶️ Right' : '🔽 Center'} Splits • {leftPhotoCompare.date} ({leftPhotoCompare.angleValue}° Split)
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
                <span>Move the slider left and right to compare your photos.</span>
              </div>
              
              {/* Angle metric improvement box */}
              {leftPhotoCompare.angleValue < 185 && rightPhotoCompare.angleValue < 185 && (
                <div className="bg-emerald-100 border-2 border-slate-900 p-5 rounded-2xl text-center space-y-1 shadow-[2px_2px_0px_#1e293b]">
                  <span className="text-2xl">🏆</span>
                  <p className="text-sm font-sans font-black text-slate-900 leading-none">
                    Angle Improvement: +{Math.max(0, rightPhotoCompare.angleValue - leftPhotoCompare.angleValue)}° Closer to a full split!
                  </p>
                  <p className="text-[10px] text-slate-700 font-bold leading-relaxed mt-2 flex flex-col gap-1 items-center justify-center">
                    <span>
                      Type: <b className="font-mono uppercase text-emerald-900 bg-white border border-emerald-900/20 px-1.5 py-0.5 rounded text-[9px]">{leftPhotoCompare.splitType === 'left' ? '◀️ Left' : leftPhotoCompare.splitType === 'right' ? '▶️ Right' : '🔽 Center'}</b>
                    </span>
                    <span>
                      Your angle increased from {leftPhotoCompare.angleValue}° on {leftPhotoCompare.date} to {rightPhotoCompare.angleValue}° on {rightPhotoCompare.date}. Keep up the consistent practice!
                    </span>
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

      {/* Dynamic Stretch Calendar and Activity Logs boxes added per user request */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 border-t font-sans border-slate-200">
        
        {/* Progress Calendar */}
        <div className="md:col-span-7 bento-card bg-white border-2 border-slate-900 p-6 shadow-[4px_4px_0px_#1e293b]">
          <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-100 mb-5">
            <div className="p-2 bg-yellow-100 border-2 border-slate-900 rounded-xl text-slate-900 shadow-[2px_2px_0px_#1e293b]">
              <Calendar className="w-5 h-5 text-yellow-605" />
            </div>
            <div>
              <h3 className="text-base font-sans font-extrabold text-slate-900 text-left">Banana Peel Stretch Calendar</h3>
              <p className="text-xs text-slate-500 font-semibold text-left">Your daily workout log for the past two weeks.</p>
            </div>
          </div>

          {/* 14 Day grid cells */}
          <div className="grid grid-cols-7 sm:grid-cols-14 gap-2.5">
            {fortnight.map((day, idx) => (
              <div 
                key={idx}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-transform ${
                  day.isToday 
                    ? 'border-slate-900 bg-yellow-100/80 shadow-[2px_2px_0px_#1E293B]' 
                    : day.hasCompleted
                      ? 'border-slate-900 bg-yellow-300 shadow-[1px_1px_0px_#1E293B]'
                      : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <span className={`text-[9px] font-mono uppercase font-black ${
                  day.isToday ? 'text-slate-950' : 'text-gray-400'
                }`}>
                  {day.dayLabel}
                </span>
                <span className={`text-xs font-sans font-extrabold my-1 ${
                  day.isToday ? 'text-slate-950 font-black' : 'text-slate-700'
                }`}>
                  {day.dayNum}
                </span>
                {day.hasCompleted ? (
                  <span className="text-sm select-none" title="Completed stretching!">🍌</span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200" title="Not stretched yet"></span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent History logs list */}
        <div className="md:col-span-5 bento-card bg-white border-2 border-slate-900 p-6 shadow-[4px_4px_0px_#1e293b] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-sans font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100 text-left">Recent Activity Logs</h3>
            {completedRoutinesGroup.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {completedRoutinesGroup.map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-base bg-amber-100 border border-slate-900/40 p-1.5 rounded-xl shadow-[1px_1px_0px_#1E293B] shrink-0">🍌</span>
                      <div className="text-left">
                        <p className="font-extrabold text-slate-800 line-clamp-1">{log.routineName}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{log.date}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono bg-emerald-100 border border-slate-900/30 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
                        +{Math.round(log.durationCompleted / 60)}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 font-semibold space-y-2">
                <p>No stretching logs found yet.</p>
                <p className="text-[10px] font-medium max-w-xs mx-auto text-slate-400 leading-relaxed">Complete a banana split session on the workouts page to start logging your progress here.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

