import React, { useState, useEffect, useRef } from 'react';
import { Routine, Stretch } from '../types';
import { StretchIllustration } from './StretchIllustration';
import { Play, Pause, SkipForward, ChevronLeft, Volume2, Award, CheckCircle2, RefreshCw, Star } from 'lucide-react';

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

  // Beep sound synthesizer using Web Audio API
  const playSynthesisBeep = (freq: number, type: OscillatorType = 'sine', dur = 0.1) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
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

  // Trigger sound alerts
  const playStepCompleteChime = () => {
    playSynthesisBeep(523.25, 'sine', 0.15); // C5
    setTimeout(() => {
      playSynthesisBeep(659.25, 'sine', 0.15); // E5
    }, 120);
    setTimeout(() => {
      playSynthesisBeep(783.99, 'sine', 0.3); // G5
    }, 240);
  };

  const playFinishedChime = () => {
    playSynthesisBeep(523.25, 'sine', 0.2); // C5
    setTimeout(() => playSynthesisBeep(659.25, 'sine', 0.2), 150);
    setTimeout(() => playSynthesisBeep(783.99, 'sine', 0.2), 300);
    setTimeout(() => playSynthesisBeep(1046.50, 'sine', 0.5), 450); // C6
  };

  // Safe timer control effect
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          totalDurationRef.current += 1;

          // Sound warnings on last 3 seconds
          if (next > 0 && next <= 3) {
            playSynthesisBeep(440, 'triangle', 0.08); // simple soft warning ticks (A4)
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
      // Move to next step with brief delay
      setTimeout(() => {
        setCurrentStepIdx((prev) => {
          const nextIdx = prev + 1;
          setTimeLeft(routine.stretches[nextIdx].duration);
          // Auto-start next step so user doesn't have to touch Screen
          setIsPlaying(true);
          return nextIdx;
        });
      }, 800);
    } else {
      // All exercises finished!
      setIsFinished(true);
      playFinishedChime();
    }
  };

  const handleTogglePlay = () => {
    // Resume context if suspended (browser behavior)
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    } catch (_) {}
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
      <div className="max-w-md mx-auto bento-card border-2 border-slate-900 bg-white rounded-3xl p-6 text-center space-y-6 shadow-[4px_4px_0px_#1e293b] animate-fade-in my-4">
        <div className="w-20 h-20 bg-yellow-300 text-slate-900 border-2 border-slate-900 rounded-3xl flex items-center justify-center mx-auto shadow-[3px_3px_0px_#1E293B] animate-bounce mt-4">
          <Award className="w-10 h-10 fill-yellow-200 stroke-slate-900" />
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase bg-yellow-300 text-slate-900 border border-slate-900 font-black px-3 py-1 rounded-full shadow-[1px_1px_0px_#1E293B]">
            Split Progress +1
          </span>
          <h2 className="text-2xl font-sans font-black text-slate-900 mt-3">Splits Done! Ripe Job!</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1 max-w-xs mx-auto">
            You successfully completed the <span className="font-extrabold text-slate-900">{routine.name}</span> stretch set. Your hamstrings and hips are thanking you!
          </p>
        </div>

        {/* Celebration stats box */}
        <div className="bg-[#FEFCE8] rounded-2xl p-4 border-2 border-slate-900 flex items-center justify-around divide-x-2 divide-slate-200 shadow-[2px_2px_0px_#1E293B]">
          <div>
            <span className="text-2xl">⚡️</span>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Time Stretched</p>
            <p className="font-mono font-black text-sm text-slate-900">
              {formatTime(totalDurationRef.current)}
            </p>
          </div>
          <div className="pl-4">
            <span className="text-2xl">🍌</span>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Banana Points</p>
            <p className="font-mono font-black text-sm text-slate-900">
              +{Math.round((totalDurationRef.current / 60) * 10 * routine.bananaMultiplier)} BP
            </p>
          </div>
        </div>

        {/* Informative summary note */}
        <div className="text-left text-xs bg-slate-50 p-4 rounded-xl border-2 border-slate-900">
          <p className="font-black text-slate-900 flex items-center gap-1.5 mb-1.5">
            <Star className="w-4 h-4 fill-yellow-400 stroke-slate-900" /> Quick Recovery Tips:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-600 font-semibold">
            <li>Drink a dynamic cup of water immediately to rehydrate connective tissues.</li>
            <li>Avoid heavy stretching for at least 12 hours.</li>
            <li>Open the Progress Tracker tab below and snap a progress photo to calculate your split angle!</li>
          </ul>
        </div>

        <button
          onClick={handleFinalSubmit}
          className="w-full bento-btn bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black font-mono py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-xs cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          SAVE LOG & UPDATE STREAK
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bento-card bg-white border-2 border-slate-900 rounded-3xl overflow-hidden shadow-[4px_4px_0px_#1e293b] flex flex-col md:flex-row my-4">
      
      {/* Visual illustration Column */}
      <div className="md:w-1/2 bg-slate-50/50 p-6 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-slate-900">
        <div>
          <button
            onClick={onClose}
            className="text-xs font-mono font-black text-slate-500 hover:text-slate-950 flex items-center gap-1.5 mb-5 cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            EXIT WORKOUT
          </button>
          
          <span className="text-[10px] font-mono uppercase bg-yellow-300 text-slate-900 border border-slate-900 font-black px-3 py-1 rounded-full shadow-[1px_1px_0px_#1E293B]">
            Step {currentStepIdx + 1} of {routine.stretches.length}
          </span>
          <h2 className="text-xl font-sans font-black text-slate-900 mt-4 leading-tight">
            {currentStretch.name}
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            🎯 Target: {currentStretch.target}
          </p>
        </div>

        {/* Dynamic customized Vector Stick illustration inside a clean frame */}
        <div className="my-6 border-2 border-slate-900 rounded-2xl bg-white p-3 shadow-[2px_2px_0px_#1E293B]">
          <StretchIllustration type={currentStretch.illustrationType} isActive={isPlaying} />
        </div>

        {/* Dynamic Stretching Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold">
            <span>Overall Progress</span>
            <span>{Math.round(progressPercent)}% Complete</span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 border-2 border-slate-900 rounded-full overflow-hidden relative">
            <div 
              className="h-full progress-fill border-r border-slate-900 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Control Timer Column */}
      <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-6">
        
        {/* Toggle Sound status button */}
        <div className="flex justify-end">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl transition-all border-2 border-slate-900 cursor-pointer shadow-[2px_2px_0px_#1E293B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1e293b] ${
              soundEnabled 
                ? 'bg-yellow-300 text-slate-900' 
                : 'text-slate-300 bg-white'
            }`}
            title={soundEnabled ? "Mute beep sound" : "Enable beep sound"}
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Big Circular Clock Interface */}
        <div className="flex items-center justify-center relative">
          <svg className="w-40 h-40 transform -rotate-90">
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
            <span className="text-3xl font-sans font-black text-slate-950 font-mono">
              {formatTime(timeLeft)}
            </span>
            <p className="text-[9px] font-mono text-slate-500 uppercase font-black tracking-wider mt-0.5">
              {isPlaying ? 'PEEL STRETCH' : 'PAUSED'}
            </p>
          </div>
        </div>

        {/* Action Controls panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            {/* Reset step */}
            <button
              onClick={handleResetStretch}
              className="p-3.5 border-2 border-slate-900 text-slate-900 hover:bg-slate-100 bg-white rounded-2xl transition-all shadow-[2px_2px_0px_#1E293B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1E293B] cursor-pointer"
              title="Reset timer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Main Play/Pause */}
            <button
              onClick={handleTogglePlay}
              className={`p-5 rounded-3xl text-slate-900 transform hover:scale-105 active:scale-95 transition-all border-2 border-slate-900 cursor-pointer shadow-[3px_3px_0px_#1E293B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1E293B] ${
                isPlaying 
                  ? 'bg-amber-100 font-black' 
                  : 'bg-yellow-405 bg-yellow-400 font-black'
              }`}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-slate-900" /> : <Play className="w-6 h-6 fill-slate-900" />}
            </button>

            {/* Skip step */}
            <button
              onClick={handleSkip}
              className="p-3.5 border-2 border-slate-900 text-slate-900 hover:bg-slate-100 bg-white rounded-2xl transition-all shadow-[2px_2px_0px_#1E293B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1E293B] cursor-pointer"
              title="Skip step"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleFinishEarly}
            className="w-full text-center text-xs font-black font-mono text-slate-400 hover:text-amber-800 transition-colors py-1 cursor-pointer"
          >
            FINISH ROUTINE EARLY
          </button>
        </div>

        {/* Written step descriptions */}
        <div className="bg-yellow-100/60 border-2 border-slate-900 rounded-2xl p-4 space-y-2.5 text-xs shadow-[2px_2px_0px_#1E293B]">
          <span className="font-mono text-[9px] font-black text-slate-900 uppercase tracking-widest block">
            ⭐ Stretching Instructions:
          </span>
          <ol className="list-decimal pl-4 text-slate-700 font-semibold space-y-1.5 leading-relaxed">
            {currentStretch.instructions.map((inst, idx) => (
              <li key={idx}>{inst}</li>
            ))}
          </ol>
          {currentStretch.tips && (
            <div className="pt-2 border-t border-slate-900/10 text-[11px] text-slate-805 italic mt-1.5 leading-relaxed font-semibold">
              <span className="font-black text-slate-900 not-italic">Banana Tip:</span> {currentStretch.tips}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

