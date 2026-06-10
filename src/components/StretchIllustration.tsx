import React from 'react';

import lowLungeImg from '../assets/images/low_lunge_1780506161112.png';
import halfSplitImg from '../assets/images/half_split_1780506182790.png';
import pigeonImg from '../assets/images/pigeon_1780506194410.png';
import butterflyImg from '../assets/images/butterfly_1780506207485.png';
import straddleImg from '../assets/images/straddle_1780506218976.png';
import frogImg from '../assets/images/frog_1780506230934.png';
import lizardImg from '../assets/images/lizard_lunge_updated_1780508154879.png';
import hamstringFoldImg from '../assets/images/hamstring_fold_1780506254975.png';
import rightSplitImg from '../assets/images/front_split_pose_1780507246622.png';
import leftSplitImg from '../assets/images/left_split_pose_1780507361794.png';
import middleSplitImg from '../assets/images/middle_split_pose_1780508034995.png';
import kneelingQuadRightImg from '../assets/images/kneeling_quad_right_1780508351260.png';
import kneelingQuadLeftImg from '../assets/images/kneeling_quad_left_1780508369247.png';
import yogiSquatImg from '../assets/images/yogi_squat_pose_1780508564679.png';

interface StretchIllustrationProps {
  type: 'hamstring-fold' | 'low-lunge' | 'half-split' | 'pigeon' | 'butterfly' | 'frog' | 'lizard' | 'straddle' | 'front-split' | 'left-split' | 'right-split' | 'middle-split' | 'kneeling-quad-left' | 'kneeling-quad-right' | 'yogi-squat';
  isActive?: boolean;
}

const imageMap: Record<string, string> = {
  'low-lunge': lowLungeImg,
  'half-split': halfSplitImg,
  'pigeon': pigeonImg,
  'butterfly': butterflyImg,
  'straddle': straddleImg,
  'frog': frogImg,
  'lizard': lizardImg,
  'hamstring-fold': hamstringFoldImg,
  'front-split': rightSplitImg,
  'left-split': leftSplitImg,
  'right-split': rightSplitImg,
  'middle-split': middleSplitImg,
  'kneeling-quad-left': kneelingQuadLeftImg,
  'kneeling-quad-right': kneelingQuadRightImg,
  'yogi-squat': yogiSquatImg,
};

export const StretchIllustration: React.FC<StretchIllustrationProps> = ({ type, isActive = true }) => {
  const currentPhoto = imageMap[type];

  return (
    <div className={`relative w-full h-28 sm:h-44 md:h-52 bg-[#FAF6F0] rounded-2xl border-4 border-slate-950 flex flex-col items-center justify-center overflow-hidden shadow-[4px_4px_0px_#1e293b] transition-all duration-300 ${
      isActive ? 'ring-4 ring-emerald-400 border-emerald-500' : ''
    }`}>
      
      {/* 1. Underlying Photorealistic Image Background */}
      {currentPhoto ? (
        <div className="absolute inset-0 w-full h-full bg-white flex items-center justify-center">
          <img
            src={currentPhoto}
            alt={`${type} pose reference`}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div className="font-mono text-xs text-slate-400">No photo available</div>
      )}

      {/* 2. Active Pose Label overlay (Top right) */}
      <div className="absolute top-3 right-3 pointer-events-none select-none z-10">
        <div className="flex items-center bg-slate-950 px-2 py-0.5 rounded text-[8px] font-mono font-black text-white hover:opacity-100 shadow-sm uppercase">
          {type === 'low-lunge' && 'LUNGE • PELVIS'}
          {type === 'half-split' && 'HALF SPLIT • HAMSTRING'}
          {type === 'pigeon' && 'PIGEON • GLUTEUS'}
          {type === 'butterfly' && 'BUTTERFLY • ADDUCTORS'}
          {type === 'straddle' && 'STRADDLE • PANCAKE'}
          {type === 'frog' && 'FROG • DEEP ADDUCTION'}
          {type === 'lizard' && 'LIZARD LUNGE • HIPS'}
          {type === 'hamstring-fold' && 'STAND FOLD • HAMSTRINGS'}
          {type === 'front-split' && 'FRONT SPLIT • HIP FLEXORS & HAMS'}
          {type === 'left-split' && 'LEFT SPLIT • HIP FLEXORS & HAMS'}
          {type === 'right-split' && 'RIGHT SPLIT • HIP FLEXORS & HAMS'}
          {type === 'middle-split' && 'MIDDLE SPLIT • INNER THIGHS & GROIN'}
          {type === 'kneeling-quad-left' && 'KNEELING QUAD • LEFT'}
          {type === 'kneeling-quad-right' && 'KNEELING QUAD • RIGHT'}
          {type === 'yogi-squat' && 'YOGI SQUAT • HIPS & ADDUCTORS'}
        </div>
      </div>
    </div>
  );
};

