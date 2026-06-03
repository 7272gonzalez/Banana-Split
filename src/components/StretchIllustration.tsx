import React from 'react';

interface StretchIllustrationProps {
  type: 'hamstring-fold' | 'low-lunge' | 'half-split' | 'pigeon' | 'butterfly' | 'frog' | 'lizard' | 'straddle';
  isActive?: boolean;
}

export const StretchIllustration: React.FC<StretchIllustrationProps> = ({ type, isActive = true }) => {
  // Common theme colors:
  // Base: Charcoal slate lines for skin/bones (#4B5563)
  // Accent: Banana yellow for targets/mats (#FBBF24 / #F59E0B)
  const isAnimated = isActive;

  return (
    <div className="relative w-full h-48 bg-amber-50/40 rounded-2xl border-2 border-slate-900 flex items-center justify-center overflow-hidden">
      {/* Background ambient banana peel designs */}
      <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="none" />
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F59E0B" strokeWidth="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>


      {/* Main vector figure */}
      <svg
        viewBox="0 0 300 200"
        className={`w-52 h-36 select-none ${isAnimated ? 'animate-pulse-slow' : ''}`}
        style={{
          // Custom breathing animation
          animation: isAnimated ? 'breathe 4s ease-in-out infinite' : 'none'
        }}
      >
        <style>{`
          @keyframes breathe {
            0%, 100% { transform: scale(0.97) translateY(2px); }
            50% { transform: scale(1.02) translateY(-2px); }
          }
          @keyframes slide-leg {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(5px); }
          }
          .stretch-highlight {
            stroke: #F59E0B;
            stroke-width: 5;
            stroke-linecap: round;
            stroke-dasharray: 6 4;
          }
          .body-joint {
            fill: #78350F;
            stroke: #FEF3C7;
            stroke-width: 2;
          }
        `}</style>

        {/* Floor/Yoga Mat */}
        <line x1="20" y1="160" x2="280" y2="160" stroke="#FDE68A" strokeWidth="4" strokeLinecap="round" />
        <line x1="15" y1="164" x2="285" y2="164" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" />

        {/* Target flexibility highlighted zone (The Banana Peel Curve) */}
        {type === 'low-lunge' && (
          <path d="M 120 160 Q 160 130 190 160" fill="none" className="stretch-highlight" />
        )}
        {type === 'half-split' && (
          <path d="M 70 160 Q 110 110 150 160" fill="none" className="stretch-highlight" />
        )}
        {type === 'pigeon' && (
          <path d="M 60 160 Q 100 120 140 160" fill="none" className="stretch-highlight" />
        )}
        {type === 'butterfly' && (
          <path d="M 110 160 Q 150 130 190 160" fill="none" className="stretch-highlight" />
        )}
        {type === 'straddle' && (
          <path d="M 50 160 Q 150 100 250 160" fill="none" className="stretch-highlight" />
        )}
        {type === 'frog' && (
          <path d="M 100 160 Q 150 120 200 160" fill="none" className="stretch-highlight" />
        )}
        {type === 'lizard' && (
          <path d="M 100 160 Q 140 120 180 160" fill="none" className="stretch-highlight" />
        )}
        {type === 'hamstring-fold' && (
          <path d="M 130 160 Q 150 70 170 160" fill="none" className="stretch-highlight" />
        )}

        {/* Vector Stick Figures representing the Stretches */}
        {type === 'low-lunge' && (
          <g transform="translate(10, 0)">
            {/* Back Leg (Right) extending backwards */}
            <path d="M 150 140 L 220 160 L 250 160" fill="none" stroke="#78350F" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {/* Front Leg (Left) bent 90 degrees */}
            <path d="M 150 140 L 100 110 L 100 160" fill="none" stroke="#4B5563" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {/* Torso sitting proud */}
            <path d="M 150 140 L 150 80" fill="none" stroke="#4B5563" strokeWidth="8" strokeLinecap="round" />
            {/* Arms on hips */}
            <path d="M 150 95 L 125 110 L 150 115" fill="none" stroke="#4B5563" strokeWidth="5" strokeLinecap="round" />
            {/* Head */}
            <circle cx="150" cy="62" r="14" fill="#FBBF24" stroke="#4B5563" strokeWidth="4" />
            
            {/* Joints for visual style */}
            <circle cx="220" cy="160" r="4" className="body-joint" />
            <circle cx="100" cy="110" r="4" className="body-joint" />
            <circle cx="150" cy="140" r="4" className="body-joint" />
          </g>
        )}

        {type === 'half-split' && (
          <g transform="translate(10, 0)">
            {/* Back Leg kneeling at 90 deg */}
            <path d="M 180 160 L 180 120 L 140 120" fill="none" stroke="#78350F" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {/* Front Leg (straight out) */}
            <path d="M 140 120 L 60 160" fill="none" stroke="#4B5563" strokeWidth="7" strokeLinecap="round" />
            {/* Flexed front Foot */}
            <line x1="58" y1="160" x2="52" y2="150" stroke="#4B5563" strokeWidth="5" strokeLinecap="round" />
            {/* Torso hinged over leg */}
            <path d="M 140 120 L 100 85" fill="none" stroke="#4B5563" strokeWidth="8" strokeLinecap="round" />
            {/* Arms reaching to foot/ground */}
            <path d="M 115 95 L 75 145" fill="none" stroke="#4B5563" strokeWidth="5" strokeLinecap="round" />
            {/* Head */}
            <circle cx="90" cy="72" r="14" fill="#FBBF24" stroke="#4B5563" strokeWidth="4" />
            
            <circle cx="180" cy="120" r="4" className="body-joint" />
            <circle cx="140" cy="120" r="4" className="body-joint" />
          </g>
        )}

        {type === 'pigeon' && (
          <g transform="translate(10, 5)">
            {/* Back Leg lying flat behind */}
            <path d="M 145 150 L 245 155" fill="none" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
            {/* Front Leg bent in front (horizontal view outline) */}
            <path d="M 145 150 L 105 155 L 75 135" fill="none" stroke="#4B5563" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {/* Torso folding down slightly */}
            <path d="M 145 150 L 155 95" fill="none" stroke="#4B5563" strokeWidth="8" strokeLinecap="round" />
            {/* Arms reaching forward on the ground */}
            <path d="M 152 105 L 110 135 L 85 155" fill="none" stroke="#4B5563" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Head */}
            <circle cx="160" cy="77" r="14" fill="#FBBF24" stroke="#4B5563" strokeWidth="4" />

            <circle cx="145" cy="150" r="4" className="body-joint" />
            <circle cx="105" cy="155" r="4" className="body-joint" />
          </g>
        )}

        {type === 'butterfly' && (
          <g transform="translate(0, 0)">
            {/* Sitting Torso slightly tilting forward */}
            <path d="M 150 145 L 150 75" fill="none" stroke="#4B5563" strokeWidth="8" strokeLinecap="round" />
            {/* Butterfly wings (knees outwards) */}
            <path d="M 150 145 Q 110 120 115 155" fill="none" stroke="#78350F" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 150 145 Q 190 120 185 155" fill="none" stroke="#78350F" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {/* Soles together in reference */}
            <ellipse cx="150" cy="155" rx="8" ry="5" fill="#F59E0B" />
            {/* Hands wrapping feet */}
            <path d="M 150 90 L 135 125 L 150 150" fill="none" stroke="#4B5563" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 150 90 L 165 125 L 150 150" fill="none" stroke="#4B5563" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Head */}
            <circle cx="150" cy="57" r="14" fill="#FBBF24" stroke="#4B5563" strokeWidth="4" />
          </g>
        )}

        {type === 'straddle' && (
          <g transform="translate(0, 5)">
            {/* Left wide leg */}
            <path d="M 150 140 L 60 150" fill="none" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
            {/* Right wide leg */}
            <path d="M 150 140 L 240 150" fill="none" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
            {/* Torso bowing way down */}
            <path d="M 150 140 L 150 85" fill="none" stroke="#4B5563" strokeWidth="8" strokeLinecap="round" />
            {/* Arms reaching along the floor towards ground center */}
            <path d="M 150 100 L 110 135 L 75 145" fill="none" stroke="#4B5563" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 150 100 L 190 135 L 225 145" fill="none" stroke="#4B5563" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Head bowed down */}
            <circle cx="150" cy="67" r="14" fill="#FBBF24" stroke="#4B5563" strokeWidth="4" />
            <circle cx="150" cy="140" r="4" className="body-joint" />
          </g>
        )}

        {type === 'frog' && (
          <g transform="translate(0, 10)">
            {/* Knees spread very wide outwardly */}
            <path d="M 70 140 L 150 120 L 230 140" fill="none" stroke="#78350F" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {/* Foot ankles angled at 90 deg */}
            <path d="M 70 140 L 55 125" fill="none" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
            <path d="M 230 140 L 245 125" fill="none" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
            {/* Pelvis/Torso horizontal */}
            <path d="M 150 120 L 150 90" fill="none" stroke="#4B5563" strokeWidth="8" strokeLinecap="round" />
            {/* Elbows down */}
            <path d="M 150 90 L 120 120 L 110 140" fill="none" stroke="#4B5563" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 150 90 L 180 120 L 190 140" fill="none" stroke="#4B5563" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Head in front of forearms */}
            <circle cx="150" cy="72" r="14" fill="#FBBF24" stroke="#4B5563" strokeWidth="4" />

            <circle cx="70" cy="140" r="4" className="body-joint" />
            <circle cx="230" cy="140" r="4" className="body-joint" />
            <circle cx="150" cy="120" r="4" className="body-joint" />
          </g>
        )}

        {type === 'lizard' && (
          <g transform="translate(5, 0)">
            {/* Long Back Leg */}
            <path d="M 130 135 L 230 155 L 260 155" fill="none" stroke="#78350F" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {/* Front Foot past the arms */}
            <path d="M 130 135 L 70 105 L 70 155" fill="none" stroke="#4B5563" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {/* Torso horizontal, lower down */}
            <path d="M 130 135 L 140 85" fill="none" stroke="#4B5563" strokeWidth="8" strokeLinecap="round" />
            {/* Elbows/Forearms fully on floor inside */}
            <path d="M 135 95 L 105 155" fill="none" stroke="#4B5563" strokeWidth="5" strokeLinecap="round" />
            {/* Head */}
            <circle cx="145" cy="67" r="14" fill="#FBBF24" stroke="#4B5563" strokeWidth="4" />

            <circle cx="230" cy="155" r="4" className="body-joint" />
            <circle cx="70" cy="105" r="4" className="body-joint" />
            <circle cx="130" cy="135" r="4" className="body-joint" />
          </g>
        )}

        {type === 'hamstring-fold' && (
          <g transform="translate(0, -10)">
            {/* Standing legs */}
            <line x1="150" y1="170" x2="150" y2="100" stroke="#78350F" strokeWidth="7" strokeLinecap="round" />
            {/* Torso folding completely down */}
            <path d="M 150 100 L 150 150" fill="none" stroke="#4B5563" strokeWidth="8" strokeLinecap="round" />
            {/* Dangling Arms */}
            <path d="M 150 115 L 138 165" fill="none" stroke="#4B5563" strokeWidth="5" strokeLinecap="round" />
            {/* Head hanging at bottom */}
            <circle cx="150" cy="165" r="14" fill="#FBBF24" stroke="#4B5563" strokeWidth="4" />
            <circle cx="150" cy="100" r="4" className="body-joint" />
          </g>
        )}
      </svg>

      {/* Stretch indicator/label */}
      <div className="absolute top-3 left-4 flex items-center gap-1.5 bg-yellow-300 py-1.5 px-3 rounded-xl border-2 border-slate-900 shadow-[1px_1px_0px_#1E293B]">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-900 animate-pulse"></span>
        <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-900">
          {type.replace('-', ' ')} target
        </span>
      </div>
    </div>
  );
};
