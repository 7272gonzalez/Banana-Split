import { useState, useEffect } from 'react';
import { Routine, RoutineLog, ProgressPhoto, UserStats } from './types';
import { 
  getAllProgressPhotos, 
  getAllRoutineLogs, 
  getUserStats, 
  saveProgressPhoto, 
  saveRoutineLog,
  deleteProgressPhoto 
} from './lib/db';
import { Dashboard } from './components/Dashboard';
import { RoutineTimer } from './components/RoutineTimer';
import { ProgressTracker } from './components/ProgressTracker';
import { PrivacySecurity } from './components/PrivacySecurity';
import { Instructions } from './components/Instructions';
import { Compass, CalendarDays, StretchHorizontal, Banana, Sparkles, Footprints, ShieldCheck, CircleHelp } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab ] = useState<'dashboard' | 'progress' | 'privacy' | 'instructions'>('dashboard');
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);

  // Core model state
  const [stats, setStats] = useState<UserStats>({
    streak: 0,
    lastCompletedDate: null,
    totalSessions: 0,
    totalMinutes: 0
  });
  const [logs, setLogs] = useState<RoutineLog[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Scroll to the absolute top when a routine is launched or closed
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeRoutine]);

  // Load stats and progress reports from DB on mount
  const loadData = async () => {
    try {
      const dbPhotos = await getAllProgressPhotos();
      const dbLogs = await getAllRoutineLogs();
      const dbStats = await getUserStats();

      setPhotos(dbPhotos);
      // Sort logs descending by date
      setLogs(dbLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setStats(dbStats);
    } catch (e) {
      console.error('Error loading data from database', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save routine completion
  const handleRoutineComplete = async (durationSeconds: number) => {
    if (!activeRoutine) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newLog: RoutineLog = {
      id: `log-${Date.now()}`,
      date: todayStr,
      routineId: activeRoutine.id,
      routineName: activeRoutine.name,
      completed: true,
      durationCompleted: durationSeconds
    };

    try {
      await saveRoutineLog(newLog);
      await loadData(); // Reload stats and logs dynamically
    } catch (e) {
      console.error('Failed to log routine completion', e);
    } finally {
      setActiveRoutine(null);
    }
  };

  // Save progress photo
  const handleSaveProgressPhoto = async (photo: ProgressPhoto) => {
    try {
      await saveProgressPhoto(photo);
      await loadData();
    } catch (e) {
      console.error('Failed to save progress snap', e);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      await deleteProgressPhoto(id);
      await loadData();
    } catch (e) {
      console.error('Failed to delete progress picture', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEFCE8] flex flex-col items-center justify-center space-y-4 font-sans p-6 text-center">
        <div className="w-16 h-16 bg-yellow-400 border-4 border-slate-900 rounded-3xl flex items-center justify-center text-3xl shadow-[4px_4px_0px_#1e293b] animate-bounce">
          🍌
        </div>
        <p className="text-sm font-mono font-black tracking-widest text-slate-900 uppercase">Peeling stats & guides...</p>
      </div>
    );
  }

  // Active workout fullscreen overlay modal
  if (activeRoutine) {
    return (
      <div className="min-h-screen bg-[#FEFCE8] py-2 px-2 sm:py-8 sm:px-4 flex items-center justify-center font-sans overflow-hidden">
        <RoutineTimer 
          routine={activeRoutine}
          onClose={() => setActiveRoutine(null)}
          onComplete={handleRoutineComplete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFCE8] flex flex-col font-sans text-slate-900">
      
      {/* Top Brand Hero Navigation Header (Bento Vibe Navbar with thick slate borders) */}
      <header className="bg-white border-b-4 border-slate-900 sticky top-0 z-40 shadow-[0_2px_0px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-400 border-2 border-slate-900 rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_#1e293b] shrink-0">
              <span className="text-2xl">🍌</span>
            </div>
            <div>
              <span className="text-[9px] font-mono leading-none tracking-widest text-slate-500 uppercase font-black block">LEARN HOW TO SPLIT</span>
              <h1 className="text-xl font-sans font-black leading-none text-slate-900 tracking-tight flex items-center gap-1.5 mt-0.5">
                Banana Split
                <span className="text-[10px] font-mono font-bold text-slate-900 bg-yellow-300 border border-slate-900 px-1.5 py-0.5 rounded-md">v1.2</span>
              </h1>
            </div>
          </div>

          {/* Nav Tabs & Guide */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <nav className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex-1 sm:flex-initial justify-around">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center justify-center gap-1.5 min-h-[44px] py-2 px-4 rounded-xl text-xs font-mono font-black transition-all cursor-pointer flex-1 sm:flex-none ${
                  activeTab === 'dashboard'
                    ? 'bg-yellow-400 text-slate-900 border-2 border-slate-900'
                    : 'text-slate-550 border-2 border-transparent hover:text-slate-900'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                ROUTINES
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`flex items-center justify-center gap-1.5 min-h-[44px] py-2 px-4 rounded-xl text-xs font-mono font-black transition-all cursor-pointer flex-1 sm:flex-none ${
                  activeTab === 'progress'
                    ? 'bg-yellow-400 text-slate-900 border-2 border-slate-900'
                    : 'text-slate-550 border-2 border-transparent hover:text-slate-900'
                }`}
              >
                <Compass className="w-4 h-4" />
                TRACKER
              </button>
            </nav>

            {/* Guide Button with question mark - guaranteed min 44x44px target */}
            <button
              id="header-instructions-btn"
              onClick={() => setActiveTab('instructions')}
              title="How to Use App"
              className={`w-11 h-11 flex items-center justify-center rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#1e293b] transition-all cursor-pointer shrink-0 ${
                activeTab === 'instructions'
                  ? 'bg-yellow-400 text-slate-900 border-2 border-slate-900'
                  : 'bg-white hover:bg-yellow-100 text-slate-900'
              }`}
            >
              <CircleHelp className="w-5 h-5 font-black" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {activeTab === 'dashboard' ? (
          <Dashboard 
            stats={stats}
            logs={logs}
            photos={photos}
            onSelectRoutine={(routine) => setActiveRoutine(routine)}
            onNavigateToProgress={() => setActiveTab('progress')}
            onNavigateToInstructions={() => setActiveTab('instructions')}
          />
        ) : activeTab === 'progress' ? (
          <ProgressTracker 
            photos={photos}
            logs={logs}
            onSavePhoto={handleSaveProgressPhoto}
            onDeletePhoto={handleDeletePhoto}
          />
        ) : activeTab === 'instructions' ? (
          <Instructions 
            onBack={() => setActiveTab('dashboard')}
          />
        ) : (
          <PrivacySecurity 
            onBack={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {/* Footer Branding - clean custom footer */}
      <footer className="bg-white border-t-4 border-slate-900 py-8 text-center text-xs font-semibold text-slate-550 flex flex-col items-center justify-center gap-3">
        <p>© {new Date().getFullYear()} Made by Saranndipity - Banana Split.</p>
        <div className="flex items-center gap-4">
          <button
            id="footer-privacy-link"
            onClick={() => setActiveTab('privacy')}
            className={`font-mono text-[11px] font-black tracking-wider uppercase underline hover:text-[#1e293b] cursor-pointer transition-all min-h-[44px] px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 ${
              activeTab === 'privacy' ? 'text-amber-600 bg-yellow-100 border-2 border-slate-900 shadow-[1px_1px_0px_#1e293b]' : 'text-slate-550 border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-100'
            }`}
          >
            🛡️ Privacy & Security Details
          </button>
        </div>
      </footer>
    </div>
  );
}
