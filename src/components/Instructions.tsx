import { ArrowLeft, Clock, Dumbbell, Camera, Ruler } from 'lucide-react';

interface InstructionsProps {
  onBack: () => void;
}

export function Instructions({ onBack }: InstructionsProps) {
  return (
    <div id="instructions-container" className="space-y-6 max-w-4xl mx-auto">
      
      {/* Back Button and Title Header */}
      <div id="instructions-header-section" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            id="instructions-back-btn"
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 min-h-[44px] py-2.5 px-4 text-xs font-mono font-black border-2 border-slate-900 bg-white hover:bg-yellow-101 text-slate-900 rounded-xl shadow-[2px_2px_0px_#1e293b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#1e293b] transition-all cursor-pointer mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO DASHBOARD
          </button>
          <span className="text-[10px] font-mono leading-none tracking-widest text-[#1e293b] uppercase font-black">GETTING STARTED GUIDE</span>
          <h2 id="instructions-heading" className="text-3xl font-sans font-black text-slate-950 tracking-tight mt-1">
            How to Use Banana Split
          </h2>
        </div>
      </div>

      {/* Main Grid: Step-by-Step Bento Box Items */}
      <div id="instructions-step-grid" className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Step 1: Select Routine */}
        <div className="bg-white border-4 border-slate-900 p-6 rounded-3xl shadow-[4px_4px_0px_#1e293b] space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-yellow-100 border-2 border-slate-900 rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#1e293b]">
              <Dumbbell className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-2xl font-mono font-black text-slate-300 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">01</span>
          </div>
          <div>
            <h3 className="text-lg font-sans font-black text-slate-950">1. Select a Stretching Routine</h3>
            <p className="text-xs text-slate-600 font-semibold mt-2 leading-relaxed">
              Explore the curated target routines on the dashboard. Choose a routine tailored for hip flexors, side splits, or middle splits to begin your sequence.
            </p>
          </div>
        </div>

        {/* Step 2: Use Built-in Interactive Timer */}
        <div className="bg-white border-4 border-slate-900 p-6 rounded-3xl shadow-[4px_4px_0px_#1e293b] space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-emerald-100 border-2 border-slate-900 rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#1e293b]">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-2xl font-mono font-black text-slate-300 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">02</span>
          </div>
          <div>
            <h3 className="text-lg font-sans font-black text-slate-950">2. Follow the Interactive Timer</h3>
            <p className="text-xs text-slate-600 font-semibold mt-2 leading-relaxed">
              Click Start Routine to launch the custom timer. Follow the guided sequence of poses with instructions for each stretch. Be consistent and avoid stretching to the point of pain.
            </p>
          </div>
        </div>

        {/* Step 3: Register Progress & Snaps */}
        <div className="bg-white border-4 border-slate-900 p-6 rounded-3xl shadow-[4px_4px_0px_#1e293b] space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-rose-100 border-2 border-slate-900 rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#1e293b]">
              <Camera className="w-6 h-6 text-rose-600" />
            </div>
            <span className="text-2xl font-mono font-black text-slate-300 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">03</span>
          </div>
          <div>
            <h3 className="text-lg font-sans font-black text-slate-950">3. Save Comparison Photos</h3>
            <p className="text-xs text-slate-650 font-semibold mt-2 leading-relaxed">
              Go to the Tracker tab to take a webcam photo or upload an image of your split pose. Log your sessions regularly to see your progress over time.
            </p>
          </div>
        </div>

        {/* Step 4: Calibrate Angles via Protractor */}
        <div className="bg-white border-4 border-slate-900 p-6 rounded-3xl shadow-[4px_4px_0px_#1e293b] space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-indigo-100 border-2 border-slate-900 rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#1e293b]">
              <Ruler className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-2xl font-mono font-black text-slate-300 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">04</span>
          </div>
          <div>
            <h3 className="text-lg font-sans font-black text-slate-950">4. Measure Stretching Angles</h3>
            <p className="text-xs text-slate-650 font-semibold mt-2 leading-relaxed">
              Use the measurement tool to drag the three points (pelvis and both legs) over your progress photo. This calculates your physical joint angle to save in your historical activity logs.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
