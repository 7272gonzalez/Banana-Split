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

  // Split-specific calculations
  const rightPhotos = photos.filter(p => p.splitType === 'right');
  const leftPhotos = photos.filter(p => p.splitType === 'left');
  const centerPhotos = photos.filter(p => p.splitType === 'center' || !p.splitType);

  const maxRightAngle = rightPhotos.length > 0 ? Math.max(...rightPhotos.map(p => p.angleValue)) : 0;
  const maxLeftAngle = leftPhotos.length > 0 ? Math.max(...leftPhotos.map(p => p.angleValue)) : 0;
  const maxCenterAngle = centerPhotos.length > 0 ? Math.max(...centerPhotos.map(p => p.angleValue)) : 0;

  const rightPercent = maxRightAngle > 0 ? Math.min(100, Math.round((maxRightAngle / 180) * 100)) : 0;
  const leftPercent = maxLeftAngle > 0 ? Math.min(100, Math.round((maxLeftAngle / 180) * 100)) : 0;
  const centerPercent = maxCenterAngle > 0 ? Math.min(100, Math.round((maxCenterAngle / 180) * 100)) : 0;

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

  // Curated Daily Pro-Tips provided by the user
  const PRO_TIPS = [
    "Never stretch cold. Always do 5–10 minutes of light cardio (jumping jacks, dancing, or jogging) to get the blood flowing first.",
    "Warm muscles are like taffy. Cold muscles are like cold rubber bands—they snap instead of stretching.",
    "Consistency beats intensity. Stretching for 15 minutes every day is infinitely better than stretching for two hours once a week.",
    "Breathe through the tension. Deep, slow exhalations signal your nervous system that it’s safe to let the muscles relax.",
    "Pain is a stop sign. You want to feel a deep, satisfying 'clean' stretch, not sharp, pinching, or shooting pain.",
    "Square your hips. For front splits, keep your hips facing forward like headlights, rather than letting the back hip open up.",
    "Engage your core. A stable torso protects your lower back and gives your hips a solid foundation to stretch from.",
    "Point and flex. Alternate between pointing your toes and flexing your feet to target different parts of your legs and calves.",
    "Don't forget your hip flexors. The back leg in a front split requires massive hip flexor flexibility, not just hamstring length!",
    "Prop yourself up. Use yoga blocks, books, or the back of a chair under your hands to take the weight off your legs.",
    "Gravity is your friend. In gravity-assisted stretches (like lying on your back and letting your legs open), let go and let gravity do the work.",
    "Celebrate the millimeters. Progress in flexibility is measured in tiny increments. Every millimeter closer to the floor is a victory!",
    "Take progress photos. Sometimes it feels like you aren't moving, but looking back at a photo from a month ago will prove otherwise.",
    "Every body is built differently. Bone structure and hip socket depth vary. Your split will look uniquely yours, and that’s perfect.",
    "Expect good days and tight days. Hydration, stress, and sleep all affect your flexibility. Be kind to your body on tight days.",
    "Try PNF stretching. Contract the muscle you are stretching for 5 seconds, relax, and then sink deeper into the stretch.",
    "Active flexibility matters. Don't just sit in splits; strengthen your glutes and quads so your body can actually support the position.",
    "Hold for at least 30 seconds. It takes time for the 'stretch reflex' to relax and allow the muscle to truly elongate.",
    "Massage your muscles. Using a foam roller or massage ball on your hamstrings and glutes can help release stubborn tension.",
    "Dress for warmth. Wear sweatpants or leg warmers. Keeping your muscles physically warm helps them stay pliable.",
    "Slightly bend your knees if needed. Micro-bending the knees protects your joints and ensures the stretch stays in the muscle belly.",
    "Rest days are mandatory. Your muscles need time to recover and rebuild. Dedicate 1–2 days a week to gentle movement or rest.",
    "Hydrate like it's your job. Dehydrated muscles are stiff and much more prone to cramping and injury.",
    "Slide out safely. When you are done, don’t try to jump up. Roll onto your side or use your hands to carefully push yourself out.",
    "Put on a great playlist. Distract your brain with your favorite music or a good podcast while you hold your stretches.",
    "Do a gentle evening stretch. Stretching before bed can relax your nervous system and help you sleep better.",
    "Be patient with your 'bad side.' Almost everyone has one leg that is less flexible than the other. Give it a little extra love.",
    "Visualize the split. Mental rehearsal is a powerful tool used by elite gymnasts and dancers. Picture yourself hitting the floor effortlessly.",
    "Trust the process. You will get there. Enjoy the feeling of opening up your body and becoming more agile every day!"
  ];

  // Find some daily wisdom tip corresponding to user stats or date
  const getDailyTip = () => {
    const today = new Date();
    // Deterministic selection based on day of month + month index
    const dayIndex = today.getDate() + (today.getMonth() * 31);
    const tipIndex = dayIndex % PRO_TIPS.length;
    return PRO_TIPS[tipIndex];
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

        {/* Milestone Stage: Three-split progressive tracker directly satisfying user request */}
        <div className="md:col-span-5 bento-card p-6 flex flex-col justify-between bg-indigo-100 border-2 border-slate-900 text-slate-950">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[10px] font-mono uppercase text-indigo-950 font-black tracking-widest">Milestones Tracker</span>
              <h3 className="font-extrabold text-lg text-slate-950 mt-0.5 font-sans">180° Touchdown Progress</h3>
            </div>
          </div>
          
          <div className="space-y-3.5 my-3">
            {/* Right Splits */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-black text-indigo-950 flex items-center gap-1">▶️ Right Splits</span>
                <span className="font-black text-indigo-950 bg-white/60 px-1.5 py-0.5 rounded border border-slate-900/10 shadow-[1px_1px_0px_rgba(0,0,0,0.15)]">
                  {maxRightAngle > 0 ? `${maxRightAngle}°` : '0°'} ({rightPercent}%)
                </span>
              </div>
              <div className="w-full h-5 bg-white rounded-full border-2 border-slate-900 overflow-hidden relative shadow-[inner_1px_1px_2px_rgba(0,0,0,0.3)]">
                {rightPercent > 0 && (
                  <div 
                    className="h-full progress-fill border-r-2 border-slate-900 transition-all duration-500"
                    style={{ width: `${rightPercent}%` }}
                  ></div>
                )}
              </div>
            </div>

            {/* Left Splits */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-black text-indigo-950 flex items-center gap-1">◀️ Left Splits</span>
                <span className="font-black text-indigo-950 bg-white/60 px-1.5 py-0.5 rounded border border-slate-900/10 shadow-[1px_1px_0px_rgba(0,0,0,0.15)]">
                  {maxLeftAngle > 0 ? `${maxLeftAngle}°` : '0°'} ({leftPercent}%)
                </span>
              </div>
              <div className="w-full h-5 bg-white rounded-full border-2 border-slate-900 overflow-hidden relative shadow-[inner_1px_1px_2px_rgba(0,0,0,0.3)]">
                {leftPercent > 0 && (
                  <div 
                    className="h-full progress-fill border-r-2 border-slate-900 transition-all duration-500"
                    style={{ width: `${leftPercent}%` }}
                  ></div>
                )}
              </div>
            </div>

            {/* Center Splits */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-black text-indigo-950 flex items-center gap-1">🔽 Center Splits</span>
                <span className="font-black text-indigo-950 bg-white/60 px-1.5 py-0.5 rounded border border-slate-900/10 shadow-[1px_1px_0px_rgba(0,0,0,0.15)]">
                  {maxCenterAngle > 0 ? `${maxCenterAngle}°` : '0°'} ({centerPercent}%)
                </span>
              </div>
              <div className="w-full h-5 bg-white rounded-full border-2 border-slate-900 overflow-hidden relative shadow-[inner_1px_1px_2px_rgba(0,0,0,0.3)]">
                {centerPercent > 0 && (
                  <div 
                    className="h-full progress-fill border-r-2 border-slate-900 transition-all duration-500"
                    style={{ width: `${centerPercent}%` }}
                  ></div>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-indigo-950 font-bold">
            {!hasPhotos ? (
              <div className="space-y-1.5 pt-0.5 animate-pulse">
                <p className="text-indigo-950">No stretch photo logged yet to track splits.</p>
                <button 
                  onClick={onNavigateToProgress}
                  className="inline-flex items-center text-xs font-mono font-black text-indigo-950 hover:text-indigo-800 underline cursor-pointer transition-all"
                >
                  📸 Log study photo & measure angles
                  <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
                </button>
              </div>
            ) : (
              <p className="leading-tight text-[11px] font-sans font-bold text-indigo-950">
                Keep stretching daily! Log webcam snaps to calibrate angles of left, right, or center folds.
              </p>
            )}
          </div>
        </div>

        {/* Total Flexibility Gains Bento Card */}
        <div className="md:col-span-3 bento-card p-6 flex flex-col justify-between bg-white border-2 border-slate-900">
          <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest text-left">Total Flexibility</h3>
          
          <div className="my-3 space-y-3">
            {/* Left Split */}
            <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
              <span className="text-xs font-mono font-extrabold text-slate-700 flex items-center gap-1">◀️ Left</span>
              <span className="text-2xl font-black text-slate-950 tracking-tight">
                {maxLeftAngle > 0 ? `${maxLeftAngle}°` : '0°'}
              </span>
            </div>

            {/* Right Split */}
            <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
              <span className="text-xs font-mono font-extrabold text-slate-700 flex items-center gap-1">▶️ Right</span>
              <span className="text-2xl font-black text-slate-950 tracking-tight">
                {maxRightAngle > 0 ? `${maxRightAngle}°` : '0°'}
              </span>
            </div>

            {/* Center Split */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-mono font-extrabold text-slate-700 flex items-center gap-1">🔽 Center</span>
              <span className="text-2xl font-black text-slate-950 tracking-tight">
                {maxCenterAngle > 0 ? `${maxCenterAngle}°` : '0°'}
              </span>
            </div>
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
                <span className="text-slate-400">Peak Angle</span>
                <span className="text-indigo-600 font-extrabold">{maxAngleRecorded}° Max</span>
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

                <h3 className="text-lg font-sans font-extrabold text-slate-950 group-hover:text-amber-600 transition-colors whitespace-normal break-words">
                  {routine.name}
                </h3>
                
                <p className="text-xs text-slate-600 font-semibold mt-2 whitespace-normal break-words leading-relaxed">
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
                    +{Math.round(log.durationCompleted / 60)} Mins
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

