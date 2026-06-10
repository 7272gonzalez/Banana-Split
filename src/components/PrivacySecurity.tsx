import { Shield, Lock, HardDrive, Image, CheckCircle, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface PrivacySecurityProps {
  onBack: () => void;
}

export function PrivacySecurity({ onBack }: PrivacySecurityProps) {
  const [cleared, setCleared] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearAllData = () => {
    try {
      localStorage.clear();
      // Clear IndexedDB databases
      const deleteRequest = indexedDB.deleteDatabase('BananaSplitDB');
      deleteRequest.onsuccess = () => {
        setCleared(true);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      };
      deleteRequest.onerror = () => {
        // Even if IndexedDB fails, we cleared localStorage. Try to refresh anyway
        setCleared(true);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      };
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  };

  return (
    <div id="privacy-security-container" className="space-y-6 max-w-4xl mx-auto">
      
      {/* Back Button and Title Header */}
      <div id="privacy-header-section" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            id="privacy-back-btn"
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 min-h-[44px] py-2.5 px-4 text-xs font-mono font-black border-2 border-slate-900 bg-white hover:bg-yellow-100 text-slate-900 rounded-xl shadow-[2px_2px_0px_#1e293b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#1e293b] transition-all cursor-pointer mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO DASHBOARD
          </button>
          <span className="text-[10px] font-mono leading-none tracking-widest text-[#1e293b] uppercase font-black">YOUR TRUST IS MANDATORY</span>
          <h2 id="privacy-heading" className="text-3xl font-sans font-black text-slate-950 tracking-tight mt-1">
            Privacy & Data Security
          </h2>
        </div>
        <div id="privacy-hero-badge" className="flex items-center gap-2 bg-emerald-50 border-2 border-slate-900 p-2.5 rounded-2xl shadow-[3px_3px_0px_#1e293b]">
          <Shield className="w-6 h-6 text-emerald-600" />
          <div>
            <p className="text-[10px] font-mono leading-none font-bold text-emerald-800">DATA POLICY</p>
            <p className="text-xs font-sans font-black text-slate-900 mt-0.5">100% Client-Side Private</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Bento Box Items */}
      <div id="privacy-bento-grid" className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Core Philosophy card */}
        <div id="card-philosophy" className="bg-white border-4 border-slate-900 p-6 rounded-3xl shadow-[4px_4px_0px_#1e293b] space-y-4">
          <div className="w-12 h-12 bg-indigo-100 border-2 border-slate-900 rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#1e293b]">
            <Lock className="w-6 h-6 text-indigo-700" />
          </div>
          <div>
            <h3 className="text-lg font-sans font-extrabold text-slate-950">Local-Only Security Architecture</h3>
            <p className="text-xs text-slate-650 font-medium mt-2 leading-relaxed">
              We believe your stretching journey, routines, and physical benchmarks are your private business. 
              <strong> Banana Split does not use remote cloud servers, signup forms, trackers, or cookies</strong> to harvest, analyze, or trade your fitness results.
            </p>
          </div>
        </div>

        {/* Storage card */}
        <div id="card-storage" className="bg-white border-4 border-slate-900 p-6 rounded-3xl shadow-[4px_4px_0px_#1e293b] space-y-4">
          <div className="w-12 h-12 bg-amber-100 border-2 border-slate-900 rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#1e293b]">
            <HardDrive className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h3 className="text-lg font-sans font-extrabold text-slate-950">Where is Your Data Located?</h3>
            <p className="text-xs text-slate-650 font-medium mt-2 leading-relaxed">
              All split logs, workout stats, streak counts, and customized configuration settings are stored locally 
              inside your browser using <strong>IndexedDB</strong>—a robust sandbox database built into your browser. 
              If IndexedDB is temporarily unavailable (e.g., in a restrictive Private Browsing session), it gracefully falls back to your local <strong>LocalStorage</strong> block.
            </p>
          </div>
        </div>

        {/* Progress Photos card */}
        <div id="card-photos" className="bg-white border-4 border-slate-900 p-6 rounded-3xl shadow-[4px_4px_0px_#1e293b] space-y-4">
          <div className="w-12 h-12 bg-rose-100 border-2 border-slate-900 rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#1e293b]">
            <Image className="w-6 h-6 text-rose-700" />
          </div>
          <div>
            <h3 className="text-lg font-sans font-extrabold text-slate-950">How are Progress Photos Handled?</h3>
            <p className="text-xs text-slate-650 font-medium mt-2 leading-relaxed">
              When you snap or upload a flexibility comparison picture, the file is converted immediately into secure, 
              isolated <strong>base64 data strings</strong> within your browser's private directory memory database. 
              <strong> Your physical photos are never uploaded to any backend host.</strong> They are completely secure and sandboxed on your local device.
            </p>
          </div>
        </div>

        {/* Standards & Compliance card */}
        <div id="card-compliance" className="bg-white border-4 border-slate-900 p-6 rounded-3xl shadow-[4px_4px_0px_#1e293b] space-y-4">
          <div className="w-12 h-12 bg-emerald-100 border-2 border-slate-900 rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#1e293b]">
            <CheckCircle className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-lg font-sans font-extrabold text-slate-950">Implicit Compliance (GDPR/CCPA)</h3>
            <p className="text-xs text-slate-650 font-medium mt-2 leading-relaxed">
              Because Banana Split is client-side offline-first and contains no telemetry tracking scripts, we comply with 
              <strong> GDPR, CCPA, and global privacy standards by design</strong>. You do not have to opt-out because 
              none of your metrics are ever gathered or shared in the first place.
            </p>
          </div>
        </div>
      </div>

      {/* Wipe/Clear Data Feature - Action section */}
      <div id="privacy-danger-zone" className="bg-rose-50 border-4 border-rose-950 p-6 rounded-3xl shadow-[4px_4px_0px_#e11d48]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-lg font-sans font-black text-rose-950 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-700" />
              The Sovereign Option: Wipe Internal Local Storage
            </h3>
            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
              Need to clear out your routines history, reset your streak scores, and securely erase all client-side progress pictures? 
              This process deletes physical IndexedDB blocks and localStorage values immediately. This operation is permanent.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            {cleared ? (
              <div className="min-h-[44px] bg-emerald-100 border-2 border-emerald-950 px-4 py-2.5 rounded-xl font-mono text-xs font-black text-emerald-950 flex items-center justify-center gap-1.5 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                ERASED. RELOADING...
              </div>
            ) : confirmClear ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  id="privacy-confirm-clear"
                  onClick={handleClearAllData}
                  className="min-h-[44px] flex-1 sm:flex-none flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white font-mono font-black text-xs py-2.5 px-4 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] cursor-pointer"
                >
                  YES, ERASE EVERYTHING
                </button>
                <button
                  id="privacy-cancel-clear"
                  onClick={() => setConfirmClear(false)}
                  className="min-h-[44px] flex-1 sm:flex-none flex items-center justify-center bg-slate-200 hover:bg-slate-350 text-slate-950 font-mono font-black text-xs py-2.5 px-4 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            ) : (
              <button
                id="privacy-wipe-trigger-btn"
                onClick={() => setConfirmClear(true)}
                className="w-full min-h-[44px] flex items-center justify-center bg-white hover:bg-rose-100 hover:text-rose-900 text-rose-700 font-mono font-black text-xs py-3 px-5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer text-center"
              >
                SECURELY ERASE ALL MY DATA
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
