import React from 'react';
import { X, User, Mail, Award, LogOut } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header Profil dengan Background Banner */}
        <div className="bg-indigo-600 h-24 relative flex items-end justify-center">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          {/* Avatar */}
          <div className="absolute -bottom-8 w-16 h-16 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-md">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Informasi Akun */}
        <div className="pt-10 pb-6 px-6 text-center space-y-4">
          <div>
            <h3 className="font-bold text-lg leading-tight">Satrya</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Software Engineering Student</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-left">
            <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              <span>satrya@example.com</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Level: Productive Master 🔥</span>
            </div>
          </div>

          <button 
            onClick={() => { alert('Berhasil keluar akun.'); onClose(); }}
            className="w-full py-2.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>
        </div>

      </div>
    </div>
  );
}