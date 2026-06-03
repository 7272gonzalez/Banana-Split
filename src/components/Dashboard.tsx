import React from 'react';
import { Routine, RoutineLog, UserStats, ProgressPhoto } from '../types';
import { ROUTINES } from '../data/stretches';
import { Play, Flame, Award, Calendar, ChevronRight, Sparkles, TrendingUp, Trophy, HelpCircle, ArrowRight } from 'lucide-react';

interface DashboardProps {
  stats: UserStats;
  logs: RoutineLog[];
  photos: ProgressPhoto[];
  onSelectRoutine: (routine: Routine) => void;
  onNavigateToProgress: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  logs,
  photos,
  onSelectRoutine,
  onNavigateToProgress
}) => {
  // Let's figure out which badge is unlocked based on total logs or streak
  const getRipenessBadge = (streak: number, total: number) => {
    if (total >= 15 || streak >= 7) {
      return {
        title: 'Perfect Split Banana',
        desc: 'Fully ripe! You are supple, bouncy, and touching the floor.',
        bg: 'bg-yellow-300 text-slate-900',
        icon: '🍌👑',
        req: 'Maximum tier unlocked!'
      };
    } else if (total >= 5 || streak >= 3) {
      return {
        title: 'Golden Sweet Yellow',
        desc: 'No green spots. Hips are loose, muscles are starting to lengthen.',
        bg: 'bg-amber-100 text-slate-900',
        icon: '🍌✨',
        req: 'Next: 15 sessions or a 7-day streak'
      };
    } else {
      return {
        title: 'Fresh Green Banana',
        desc: 'Slightly firm, but packed with potential! Perfect starting point.',
        bg: 'bg-emerald-100 text-slate-900',
        icon: '🌱🍌',
        req: 'Next: 5 sessions or a 3-day streak'
      };
    }
  };

  const badge = getRipenessBadge(stats.streak, stats.totalSessions);

  const hasPhotos = photos.length > 0;
  // Calculate dynamic milestone percentage based on protractor splits
  const maxAngleRecorded = hasPhotos ? Math.max(...photos.map(p => p.angleValue)) : 0;
  const sortedPhotosByDate = [...photos].sort((a, b) => a.date.localeCompare(b.date));
  const earliestAngle = hasPhotos ? sortedPhotosByDate[0].angleValue : 0;
  
  const angleValue = hasPhotos ? maxAngleRecorded : 0;
  const progressPercent = hasPhotos ? Math.min(100, Math.round((angleValue / 180) * 100)) : 0;

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

  // Find some daily wisdom tip corresponding to user stats
  const getDailyTip = () => {
    if (stats.streak === 0) {
      return "The hardest part of doing the splits is sitting down on the mat for the first stretch. Pick any 5-minute routine and get started!";
    }
    if (stats.streak > 0 && stats.streak < 3) {
      return "Fantastic start! Remember: never bounce while in a stretch. Hold warm, steady tension and let your muscles naturally lengthen on deep exhales.";
    }
    return "You are on a roll! Ensure you stay super hydrated today. Water keeps your myofascial tissues slippery and flexible!";
  };

  const completedRoutinesGroup = logs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Dynamic Welcome Heading Styled as a large Bento Banner */}
      <div className="bento-card bg-amber-100/70 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-2 border-slate-900">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-900 uppercase bg-yellow-300 border border-slate-900 px-3 py-1 rounded-full shadow-[2px_2px_0px_#1e293b]">
            Flexibility Workspace
          </span>
          <h1 className="text-3xl md:text-4xl font-sans font-extrabold text-slate-900 tracking-tight mt-3">
            Keep peeling forward! 🍌
          </h1>
          <p className="text-sm text-slate-700/95 mt-2 max-w-xl font-medium leading-relaxed">
            Welcome to <span className="font-extrabold text-slate-900">Banana Split</span>, your personalized beginner split trainer. Pick a daily stretch below to heat up your hips.
          </p>
        </div>
        
        {/* Quick badge stats info */}
        <div className="flex gap-3 shrink-0">
          <div className="px-5 py-3 bento-card bg-white font-bold text-slate-950 text-xs font-mono uppercase shadow-[2px_2px_0px_#1e293b]">
            Level: Flexible Rookie
          </div>
          <button 
            onClick={() => {
              // Scroll to stretchingFlavor
              const el = document.getElementById('stretches-flavor');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-5 py-3 bento-btn bg-yellow-400 font-bold text-slate-900 text-xs uppercase cursor-pointer"
          >
            Start Routine
          </button>
        </div>
      </div>

      {/* Main Stats Bento Grid */}
      <main className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Streak Bento Card */}
        <div className="md:col-span-4 bento-card p-6 flex flex-col justify-between bg-emerald-400 border-2 border-slate-900 text-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-950 uppercase tracking-widest">Current Streak</span>
            <span className="text-3xl">🔥</span>
          </div>
          <div className="my-5">
            <span className="text-5xl font-extrabold font-sans leading-none">{stats.streak} Days</span>
            <p className="text-xs font-semibold text-emerald-900/90 mt-2">
              {stats.streak === 0 ? 'Stretch today to ignite your daily burn!' : 'Each day of consistency multiplies hamstring flexibility.'}
            </p>
          </div>
          <div className="text-[10px] font-mono uppercase bg-white/40 px-2 py-1 rounded-md border border-slate-900/20 font-bold self-start">
            Completed logs: {stats.totalSessions} sessions
          </div>
        </div>

        {/* Milestone: Full Split styling block directly mirroring design spec */}
        <div className="md:col-span-5 bento-card p-6 flex flex-col justify-between bg-indigo-600 border-2 border-slate-900 text-white">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono uppercase text-indigo-200 font-bold tracking-widest">Milestone Stage</span>
              <h3 className="font-extrabold text-lg text-white mt-0.5">Full 180° Touchdown</h3>
            </div>
            <span className="text-xs px-2.5 py-1 bg-indigo-500 rounded-lg border border-indigo-400 font-bold">
              {progressPercent}% there
            </span>
          </div>
          
          <div className="my-4">
            {/* The striped bento progress fill */}
            <div className="w-full h-8 bg-indigo-900 rounded-full border-2 border-slate-900 overflow-hidden relative shadow-[inner_2px_2px_4px_rgba(0,0,0,0.4)]">
              <div 
                className="h-full progress-fill border-r-2 border-slate-900 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-[11px] font-mono text-indigo-200">
              <span>Hips Angle: {hasPhotos ? `${angleValue}°` : '0°'}</span>
              <span>Target: 180°</span>
            </div>
          </div>

          <div className="text-xs text-indigo-100 font-medium">
            {!hasPhotos ? (
              <div className="space-y-1.5 pt-0.5">
                <p>No stretch photo logged yet to track splits.</p>
                <button 
                  onClick={onNavigateToProgress}
                  className="inline-flex items-center text-xs font-mono font-black text-yellow-300 hover:text-yellow-400 underline cursor-pointer transition-all"
                >
                  📸 Log first photo & measure angle
                  <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
                </button>
              </div>
            ) : angleValue === 180 ? (
              "Touchdown accomplished! Maintain splits depth with weekly stretch sets."
            ) : (
              `Estimate: ~${Math.ceil((180 - angleValue) * 1.5)} more sessions until sweet splits touchdown.`
            )}
          </div>
        </div>

        {/* Total Flexibility Gains Bento Card */}
        <div className="md:col-span-3 bento-card p-6 flex flex-col justify-between bg-white border-2 border-slate-900">
          <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest">Total Flexibility</h3>
          <div className="my-3">
            <span className="text-5xl font-extrabold text-slate-950 tracking-tight">
              {hasPhotos ? `+${Math.max(0, maxAngleRecorded - earliestAngle)}°` : '+0°'}
            </span>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {!hasPhotos 
                ? 'No tracked progress recorded yet' 
                : photos.length === 1 
                  ? `Baseline set at ${earliestAngle}°`
                  : `Gain from baseline of ${earliestAngle}°`}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
            {!hasPhotos ? (
              <button
                onClick={onNavigateToProgress}
                className="text-[10px] font-mono font-black text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1 cursor-pointer transition-all"
              >
                ➕ Measure first stretch
                <ArrowRight className="w-3 h-3 text-indigo-600" />
              </button>
            ) : (
              <>
                <span className="text-slate-400">Stretches Mode</span>
                <span className="text-slate-600 font-bold">Beginner</span>
              </>
            )}
          </div>
        </div>

        {/* Badges Ripeness Card */}
        <div className={`md:col-span-8 bento-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${badge.bg} border-2 border-slate-900`}>
          <div className="flex items-start gap-4">
            <span className="text-4xl bg-white p-2.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] shrink-0">
              {badge.icon}
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Ripeness Class Badge</span>
              <h4 className="text-lg font-extrabold leading-tight text-slate-900 mt-0.5">{badge.title}</h4>
              <p className="text-xs font-semibold text-slate-700 mt-1 max-w-xl leading-relaxed">{badge.desc}</p>
            </div>
          </div>
          <div className="text-[10px] font-mono bg-white/70 border border-slate-900 px-3 py-1.5 rounded-xl font-bold shrink-0 shadow-[1px_1px_0px_#1e293b]">
            {badge.req}
          </div>
        </div>

        {/* Daily Pro-Tip Bento Card */}
        <div className="md:col-span-4 bento-card p-6 flex items-center gap-4 bg-yellow-100 border-2 border-slate-900 mb-2">
          <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-white flex items-center justify-center text-2xl shrink-0 shadow-[2px_2px_0px_#1e293b]">
            💡
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Daily Pro-Tip</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold mt-0.5">
              {getDailyTip()}
            </p>
          </div>
        </div>

      </main>

      {/* Main Stretching Routines Selector */}
      <div id="stretches-flavor" className="pt-4">
        <div className="mb-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Today's Stretching Flavor</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Pick a custom targeted routine to unlock your pelvis & legs.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROUTINES.map((routine) => (
            <div 
              key={routine.id}
              className="bento-card bento-card-interactive bg-white flex flex-col justify-between overflow-hidden group shadow-[4px_4px_0px_#1e293b] border-2 border-slate-900"
            >
              <div className="p-5">
                {/* Header Tag info */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border border-slate-900 ${
                    routine.level === 'Beginner' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {routine.level}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    {routine.stretches.length} stretched moves
                  </span>
                </div>

                <h3 className="text-lg font-sans font-extrabold text-slate-950 group-hover:text-amber-600 transition-colors line-clamp-1">
                  {routine.name}
                </h3>
                
                <p className="text-xs text-slate-600 font-medium mt-2 line-clamp-3 leading-relaxed">
                  {routine.description}
                </p>

                {/* Stretches highlights lists */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-slate-900/30 px-2 py-0.5 rounded-full">
                    📂 {routine.focus}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-650 bg-slate-50 border border-slate-900/30 px-2 py-0.5 rounded-full">
                    ⏱️ {routine.durationMinutes} Mins
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-850 bg-emerald-50 border border-slate-900/30 px-2 py-0.5 rounded-full">
                    ⭐️ {routine.bananaMultiplier}x multiplier
                  </span>
                </div>
              </div>

              {/* Action play strip */}
              <button
                onClick={() => onSelectRoutine(routine)}
                className="w-full bg-[#FEFCE8] hover:bg-yellow-400 text-slate-900 font-bold text-xs font-mono py-3.5 px-4 flex items-center justify-center gap-2 transition-colors border-t-2 border-slate-900 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-900" />
                START TARGET ROUTINE
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Calendar */}
      <div className="bento-card bg-white border-2 border-slate-900 p-6 shadow-[4px_4px_0px_#1e293b]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 border-2 border-slate-900 rounded-xl text-slate-900 shadow-[2px_2px_0px_#1e293b]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-sans font-extrabold text-slate-900">Banana Peel Stretch Calendar</h3>
              <p className="text-xs text-slate-500 font-semibold">Your daily workout log for the past two weeks.</p>
            </div>
          </div>
          <button 
            onClick={onNavigateToProgress}
            className="text-xs font-mono font-bold text-slate-900 bg-yellow-300 hover:bg-yellow-400 border-2 border-slate-900 px-4 py-2 rounded-xl transition-all shadow-[2px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1e293b] flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-slate-900 fill-yellow-200 animate-pulse" />
            Photo comparison slider
          </button>
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
                day.isToday ? 'text-slate-900' : 'text-gray-400'
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
      {completedRoutinesGroup.length > 0 && (
        <div className="bento-card bg-white border-2 border-slate-900 p-6 shadow-[4px_4px_0px_#1e293b]">
          <h3 className="text-base font-sans font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100">Recent Activity Logs</h3>
          <div className="divide-y divide-slate-100">
            {completedRoutinesGroup.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-base bg-amber-100 border border-slate-900/40 p-1.5 rounded-xl shadow-[1px_1px_0px_#1E293B]">🍌</span>
                  <div>
                    <p className="font-extrabold text-slate-800">{log.routineName}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{log.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono bg-emerald-100 border border-slate-900/30 text-emerald-800 px-3 py-1 rounded-full font-bold">
                    +{Math.round(log.durationCompleted / 60)} Mins Complete
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

