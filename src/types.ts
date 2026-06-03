export interface Stretch {
  id: string;
  name: string;
  target: string;
  instructions: string[];
  duration: number; // in seconds
  tips: string;
  illustrationType: 'hamstring-fold' | 'low-lunge' | 'half-split' | 'pigeon' | 'butterfly' | 'frog' | 'lizard' | 'straddle';
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  focus: 'Front Split' | 'Middle Split' | 'Hips & Hamstrings';
  stretches: Stretch[];
  bananaMultiplier: number; // badges/points
}

export interface ProgressPhoto {
  id: string;
  date: string;
  imageBlob?: Blob;      // If using Blobs
  imageDataUrl: string; // Base64 or object URL
  notes: string;
  angleValue: number; // in degrees
  markers: { x: number; y: number }[]; // 3 points to determine the angle
}

export interface RoutineLog {
  id: string;
  date: string; // YYYY-MM-DD
  routineId: string;
  routineName: string;
  completed: boolean;
  durationCompleted: number; // in seconds
}

export interface UserStats {
  streak: number;
  lastCompletedDate: string | null;
  totalSessions: number;
  totalMinutes: number;
}
