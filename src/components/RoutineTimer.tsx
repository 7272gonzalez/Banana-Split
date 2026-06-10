import React, { useState, useEffect, useRef } from 'react';
import { Routine, Stretch } from '../types';
import { StretchIllustration } from './StretchIllustration';
import { Play, Pause, SkipForward, SkipBack, ChevronLeft, Volume2, Award, CheckCircle2, RefreshCw, Star } from 'lucide-react';

interface RoutineTimerProps {
  routine: Routine;
  onClose: () => void;
  onComplete: (durationSeconds: number) => void;
}

export const RoutineTimer: React.FC<RoutineTimerProps> = ({
  routine,
  onClose,
  onComplete,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const currentStretch: Stretch = routine.stretches[currentStepIdx];

  const [timeLeft, setTimeLeft] = useState<number>(currentStretch.duration);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalDurationRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Lazy initialize or resume the unified AudioContext
  const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch (e) {
      console.warn('Failed to initialize AudioContext:', e);
      return null;
    }
  };

  // Beep sound synthesizer using Web Audio API
  const playSynthesisBeep = (freq: number, type: OscillatorType = 'sine', dur = 0.1) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.06, audioCtx.currentTime); // Low safe volume
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);

      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (e) {
      console.warn('Audio synthesis ignored due to browser constraints', e);
    }
  };

  // Crisp tick sound for 5-second markers
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'triangle'; // softer click sound than sine/square
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime); // Gentle comfortable volume
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {
      console.warn('Click synthesis ignored', e);
    }
  };

  // Trigger happy ringing bell sound when each step successfully completes
  const playStepCompleteChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      
      // Voice 1 - Fundamental frequency (C6)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.50, now);
      gain1.gain.setValueAtTime(0.07, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.25);

      // Voice 2 - Harmonic major third overtone (E6) starting with a slight delay
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.05);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.05, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 1.05);

      // Voice 3 - Perfect fifth overtone (G6)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1567.98, now + 0.1);
      gain3.gain.setValueAtTime(0, now);
      gain3.gain.setValueAtTime(0.03, now + 0.1);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.1);
      osc3.stop(now + 0.85);
    } catch (e) {
      console.warn('Step completion chime ignored', e);
    }
  };

  // Triumphant major arpeggio fanfare chord progression when the entire routine finishes
  const playFinishedChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Ascending C major progression C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz) -> C6 (1046Hz) -> E6 (1318Hz)
      const notes = [
        { freq: 523.25, offset: 0, dur: 0.6, vol: 0.06 },   // C5
        { freq: 659.25, offset: 0.12, dur: 0.6, vol: 0.06 },  // E5
        { freq: 783.99, offset: 0.24, dur: 0.6, vol: 0.06 },  // G5
        { freq: 1046.50, offset: 0.36, dur: 1.5, vol: 0.08 }, // C6 (long hold)
        { freq: 1318.51, offset: 0.48, dur: 1.5, vol: 0.05 }, // E6 (harmonic shimmer)
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle'; // Warm friendly retro brass feel
        osc.frequency.setValueAtTime(note.freq, now + note.offset);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0, now + note.offset);
        gain.gain.linearRampToValueAtTime(note.vol, now + note.offset + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.offset + note.dur);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + note.offset);
        osc.stop(now + note.offset + note.dur + 0.05);
      });

      // Warm background drone for fullness (C4 + G4)
      const lowNotes = [261.63, 392.00];
      lowNotes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.3);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.3);
        osc.stop(now + 1.85);
      });
    } catch (e) {
      console.warn('Finished chime ignored', e);
    }
  };

  // Safe timer control effect
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          totalDurationRef.current += 1;

          // Sound tick every 5 seconds (only when active, and next is a multiple of 5)
          if (next > 0 && next % 5 === 0) {
            playTickSound();
          }

          // Sound warm alert tick warning on last 3/2/1 seconds
          if (next > 0 && next <= 3) {
            playSynthesisBeep(440, 'triangle', 0.08); // soft timer ticks (A4)
          }

          if (next === 0) {
            handleStepCompletion();
          }

          return next;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeLeft]);

  // Handle when a single step completes
  const handleStepCompletion = () => {
    setIsPlaying(false);
    playStepCompleteChime();

    if (currentStepIdx < routine.stretches.length - 1) {
      // Move to the next step but pause and do not auto-play.
      // We do it after a brief delay so they see the final timer state.
      setTimeout(() => {
        setCurrentStepIdx((prev) => {
          const nextIdx = prev + 1;
          setTimeLeft(routine.stretches[nextIdx].duration);
          setIsPlaying(false); // Do not auto-play! Pause and require user action
          return nextIdx;
        });
      }, 1000);
    } else {
      // All exercises finished!
      setIsFinished(true);
      playFinishedChime();
    }
  };

  const handleTogglePlay = () => {
    // Register action and resume browser audio constraints
    getAudioContext();
    setIsPlaying(!isPlaying);
  };

  const handleSkip = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);

    if (currentStepIdx < routine.stretches.length - 1) {
      setCurrentStepIdx((prev) => {
        const nextIdx = prev + 1;
        setTimeLeft(routine.stretches[nextIdx].duration);
        return nextIdx;
      });
    } else {
      setIsFinished(true);
      playFinishedChime();
    }
  };

  const handlePrev = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);

    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => {
        const prevIdx = prev - 1;
        setTimeLeft(routine.stretches[prevIdx].duration);
        return prevIdx;
      });
    }
  };

  const handleResetStretch = () => {
    setIsPlaying(false);
    setTimeLeft(currentStretch.duration);
  };

  const handleFinishEarly = () => {
    setIsFinished(true);
    playFinishedChime();
  };

  const handleFinalSubmit = () => {
    onComplete(totalDurationRef.current);
  };

  // Convert seconds to clean display format (M:SS)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remain = secs % 60;
    return `${mins}:${remain < 10 ? '0' : ''}${remain}`;
  };

  // Calculate overall routine progress percentage
  const progressPercent = ((currentStepIdx) / routine.stretches.length) * 100;
  // Circular progress stroke calculation
  const circleRadius = 70;
  const strokeCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = strokeCircumference - (timeLeft / currentStretch.duration) * strokeCircumference;

  if (isFinished) {
    return (
      <div className="max-w-md w-full mx-auto bento-card border-2 border-slate-900 bg-white rounded-3xl p-4 sm:p-6 text-center space-y-4 sm:space-y-6 shadow-[4px_4px_0px_#1e293b] animate-fade-in my-1 sm:my-4 overflow-hidden">
        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-yellow-300 text-slate-900 border-2 border-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-[2px_2px_0px_#1E293B] animate-bounce mt-2 sm:mt-4">
          <Award className="w-8 h-8 sm:w-10 sm:h-10 fill-yellow-200 stroke-slate-900" />
        </div>

        <div>
          <span className="text-[9px] sm:text-[10px] font-mono uppercase bg-yellow-300 text-slate-900 border border-slate-900 font-black px-2.5 py-0.5 rounded-full shadow-[1px_1px_0px_#1E293B]">
            Split Progress +1
          </span>
          <h2 className="text-xl sm:text-2xl font-sans font-black text-slate-900 mt-2 sm:mt-3">Splits Done! Ripe Job!</h2>
          <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-1 max-w-xs mx-auto">
            You successfully completed the <span className="font-extrabold text-slate-900">{routine.name}</span> stretch set. Your hamstrings and hips are thanking you!
          </p>
        </div>

        {/* Celebration stats box */}
        <div className="bg-[#FEFCE8] rounded-2xl p-3 sm:p-4 border-2 border-slate-900 flex items-center justify-around divide-x-2 divide-slate-200 shadow-[2px_2px_0px_#1E293B]">
          <div>
            <span className="text-xl sm:text-2xl">⚡️</span>
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono mt-0.5">Time Stretched</p>
            <p className="font-mono font-black text-xs sm:text-sm text-slate-900">
              {formatTime(totalDurationRef.current)}
            </p>
          </div>
          <div className="pl-3 sm:pl-4">
            <span className="text-xl sm:text-2xl">🍌</span>
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono mt-0.5">Banana Points</p>
            <p className="font-mono font-black text-xs sm:text-sm text-slate-900">
              +{Math.round((totalDurationRef.current / 60) * 10 * routine.bananaMultiplier)} BP
            </p>
          </div>
        </div>

        {/* Informative summary note */}
        <div className="text-left text-[11px] sm:text-xs bg-slate-50 p-3 sm:p-4 rounded-xl border-2 border-slate-900">
          <p className="font-black text-slate-900 flex items-center gap-1 mt-[2px] mb-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 stroke-slate-900" /> Recovery Tips:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-600 font-semibold leading-normal">
            <li>Drink water to rehydrate connective tissues.</li>
            <li>Avoid heavy stretching for at least 12 hours.</li>
            <li>Snap a photo in the tracker to check your angle!</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2 w-full mt-2">
          <button
            onClick={handleFinalSubmit}
            className="w-full min-h-[44px] bento-btn bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black font-mono py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-[1.5px_1.5px_0px_#1e293b] active:translate-y-0.5 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            SAVE LOG & UPDATE STREAK
          </button>

          <button
            onClick={onClose}
            className="w-full min-h-[44px] bento-btn bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-900 font-extrabold font-mono py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-[1.5px_1.5px_0px_#1e293b] active:translate-y-0.5 transition-all"
          >
            DISCARD & RETURN TO MAIN PAGE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bento-card bg-white border-2 border-slate-900 rounded-3xl overflow-hidden shadow-[4px_4px_0px_#1e293b] flex flex-col my-1 sm:my-4">
      
      {/* Dynamic unified header controls bar to maximize screen space on mobile */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 bg-slate-50/50 p-2 sm:p-3 gap-2 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 text-xs font-mono font-black border-2 border-slate-900 bg-white hover:bg-slate-100 text-slate-900 rounded-xl shadow-[1.5px_1.5px_0px_#1e293b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#1e293b] transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          EXIT <span className="hidden sm:inline">WORKOUT</span>
        </button>

        <span className="text-[10px] sm:text-xs font-mono uppercase bg-yellow-300 text-slate-900 border-2 border-slate-900 font-black px-2.5 sm:px-3.5 py-1 rounded-full shadow-[1.5px_1.5px_0px_#1E293B]">
          Step {currentStepIdx + 1}/{routine.stretches.length}
        </span>

        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all border-2 border-slate-900 cursor-pointer shadow-[1.5px_1.5px_0px_#1E293B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1e293b] ${
            soundEnabled 
              ? 'bg-yellow-300 text-slate-900' 
              : 'text-slate-300 bg-white'
          }`}
          title={soundEnabled ? "Mute beep sound" : "Enable beep sound"}
        >
          <Volume2 className="w-4 h-4 text-slate-900" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Visual illustration Column */}
        <div className="md:w-1/2 bg-slate-50/20 p-3 sm:p-6 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-slate-900">
          <div className="space-y-1 shrink-0">
            <h2 className="text-base sm:text-lg md:text-xl font-sans font-black text-slate-900 leading-tight">
              {currentStretch.name}
            </h2>
          </div>

          {/* Dynamic customized Vector Stick illustration inside a clean frame */}
          <div className="my-2 sm:my-3 border-2 border-slate-900 rounded-xl bg-white p-2 shadow-[1.5px_1.5px_0px_#1E293B] shrink-0">
            <StretchIllustration type={currentStretch.illustrationType} isActive={isPlaying} />
          </div>

          {/* Dynamic Stretching Progress Bar */}
          <div className="space-y-1 bg-white p-2 border border-slate-900 rounded-xl shadow-[1px_1px_0px_#1E293B] shrink-0">
            <div className="flex justify-between text-[9px] text-slate-500 font-mono font-extrabold uppercase">
              <span>Progress</span>
              <span>{Math.round(progressPercent)}% Done</span>
            </div>
            <div className="w-full h-2.5 bg-slate-50 border border-slate-900 rounded-full overflow-hidden relative">
              <div 
                className="h-full progress-fill border-r border-slate-900 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Control Timer Column */}
        <div className="md:w-1/2 p-3 sm:p-6 flex flex-col justify-between space-y-3 sm:space-y-4 flex-1 bg-white">
          
          {/* Big Circular Clock Interface with static viewBox for robust scaling */}
          <div className="flex items-center justify-center relative my-1 shrink-0">
            <svg viewBox="0 0 160 160" className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90">
              {/* Outer Background ring */}
              <circle
                cx="80"
                cy="80"
                r={circleRadius}
                className="stroke-slate-100"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Animated countdown border */}
              <circle
                cx="80"
                cy="80"
                r={circleRadius}
                stroke="#eab308"
                className="transition-all duration-1000 ease-linear"
                strokeWidth="8"
                strokeDasharray={strokeCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            
            {/* Inner numeric counter */}
            <div className="absolute text-center">
              <span className="text-xl sm:text-2xl font-sans font-black text-slate-950 font-mono tracking-tight">
                {formatTime(timeLeft)}
              </span>
              <p className="text-[8px] font-mono text-slate-450 uppercase font-black tracking-widest mt-0.5">
                {isPlaying ? 'STRETCHING' : 'PAUSED'}
              </p>
            </div>
          </div>

          {/* Action Controls panel */}
          <div className="space-y-1.5 shrink-0">
            <div className="flex items-center justify-center gap-2.5">
              {/* Reset step */}
              <button
                onClick={handleResetStretch}
                className="w-11 h-11 flex items-center justify-center border-2 border-slate-900 text-slate-900 hover:bg-slate-100 bg-white rounded-xl transition-all shadow-[1.5px_1.5px_0px_#1E293B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1E293B] cursor-pointer"
                title="Reset timer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Back to previous pose */}
              <button
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                className={`w-11 h-11 flex items-center justify-center border-2 border-slate-900 rounded-xl transition-all shadow-[1.5px_1.5px_0px_#1E293B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1E293B] ${
                  currentStepIdx === 0 
                    ? 'bg-slate-100 text-slate-350 border-slate-300 shadow-none cursor-not-allowed opacity-50' 
                    : 'text-slate-900 hover:bg-slate-100 bg-white cursor-pointer'
                }`}
                title="Go back to previous pose"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Main Play/Pause */}
              <button
                onClick={handleTogglePlay}
                className={`w-14 h-14 flex items-center justify-center rounded-2xl text-slate-900 transform hover:scale-105 active:scale-95 transition-all border-2 border-slate-900 cursor-pointer shadow-[2px_2px_0px_#1E293B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1E293B] ${
                  isPlaying 
                    ? 'bg-amber-100 font-black' 
                    : 'bg-yellow-405 bg-yellow-400 font-black'
                }`}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-slate-900" /> : <Play className="w-5 h-5 fill-slate-900" />}
              </button>

              {/* Skip step */}
              <button
                onClick={handleSkip}
                className="w-11 h-11 flex items-center justify-center border-2 border-slate-900 text-slate-900 hover:bg-slate-100 bg-white rounded-xl transition-all shadow-[1.5px_1.5px_0px_#1E293B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1E293B] cursor-pointer"
                title="Skip step"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleFinishEarly}
              className="w-full text-center text-[10px] font-black font-mono text-slate-400 hover:text-amber-800 transition-colors py-0.5 cursor-pointer animate-pulse"
            >
              FINISH ROUTINE EARLY
            </button>
          </div>

          {/* Written step descriptions - scrollable inside tight max height constraints on mobile */}
          <div className="bg-yellow-101/60 bg-yellow-105/50 border-2 border-slate-900 rounded-xl p-2.5 sm:p-4 text-xs shadow-[1.5px_1.5px_0px_#1E293B] overflow-hidden flex flex-col min-h-[90px] max-h-[130px] md:max-h-none flex-1">
            <span className="font-mono text-[9px] font-black text-slate-900 uppercase tracking-widest block shrink-0 mb-1">
              ⭐ Stretching Instructions:
            </span>
            <div className="overflow-y-auto flex-1 pr-1 text-slate-700 font-semibold space-y-1">
              <ol className="list-decimal pl-4 space-y-1.5">
                {currentStretch.instructions.map((inst, idx) => (
                  <li key={idx} className="leading-snug">{inst}</li>
                ))}
              </ol>
              {currentStretch.tips && (
                <div className="pt-1 border-t border-slate-900/10 text-[10px] text-slate-800 italic mt-1 leading-snug font-semibold">
                  <span className="font-black text-slate-900 not-italic">Banana Tip:</span> {currentStretch.tips}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

