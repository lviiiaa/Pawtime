import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, History, LogIn, LogOut, Menu, Moon, Settings, Timer, Volume2, VolumeX, X } from 'lucide-react';
import { ChibiDuo } from './Mascot';

const TABS = [
  { id: 'timer', label: 'Timer', Icon: Timer },
  { id: 'stats', label: 'Statistik', Icon: BarChart3 },
  { id: 'history', label: 'Riwayat', Icon: History },
];

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const name = user?.displayName || user?.email?.split('@')[0] || 'Pengguna';

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label="Menu profil" onClick={() => setOpen((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-200 font-bold text-stone-800">
        {name.charAt(0).toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-amber-100 bg-[#FFFBF5] p-3 shadow-lg dark:border-stone-700 dark:bg-stone-900">
          <p className="truncate text-sm font-bold text-stone-800 dark:text-stone-100">{name}</p>
          <button type="button" onClick={onLogout} className="mt-3 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm font-bold text-stone-600 hover:bg-amber-50 dark:text-stone-300 dark:hover:bg-stone-800">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header({
  activeTab,
  setActiveTab,
  darkMode,
  onToggleTheme,
  ambientMuted = false,
  onToggleAmbient,
  user,
  onLogin,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const selectTab = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between border-b border-amber-100 bg-[#FDF6EC]/95 px-4 py-4 text-stone-800 backdrop-blur-md sm:px-6 lg:px-8 dark:border-stone-800 dark:bg-stone-950/95">
        <button type="button" onClick={() => selectTab('timer')} aria-label="Pawtime" className="flex min-w-0 items-center gap-2 text-left">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-100 bg-[#FFFBF5] p-1 shadow-sm dark:border-transparent dark:bg-transparent dark:shadow-none">
            <ChibiDuo />
          </span>
          <span className="min-w-0 flex flex-col">
            <span className="flex items-center gap-1 text-lg font-bold text-stone-800 dark:text-stone-100">Pawtime <span className="h-2 w-2 rounded-full bg-emerald-500" /></span>
            <span className="hidden text-xs font-semibold text-stone-500 sm:block dark:text-stone-400">Teman Fokus Santai</span>
          </span>
        </button>

        <nav className="hidden items-center rounded-full bg-[#F1E4D1] p-1 md:flex dark:bg-stone-800" aria-label="Navigasi utama">
          {TABS.map(({ id, label }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`rounded-full px-6 py-2 text-xs font-bold ${activeTab === id ? 'bg-amber-200 text-stone-800' : 'text-stone-600 hover:bg-white dark:text-stone-300 dark:hover:bg-stone-800'}`}>{label}</button>)}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button type="button" onClick={() => {}} className="flex items-center gap-2 rounded-full bg-yellow-200 px-4 py-2 text-xs font-bold text-yellow-900 dark:bg-yellow-600 dark:text-yellow-50">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Suasana: Tenang
          </button>
          <button type="button" onClick={onToggleAmbient} className="flex items-center gap-2 rounded-full bg-yellow-200 px-4 py-2 text-xs font-bold text-yellow-900 dark:bg-yellow-600 dark:text-yellow-50">
            {ambientMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />} Hujan Lembut
          </button>
<button type="button" onClick={onToggleTheme} className="flex items-center gap-2 rounded-full bg-yellow-200 px-4 py-2 text-xs font-bold text-yellow-900 dark:bg-yellow-600 dark:text-yellow-50">
             <Moon className="h-4 w-4" /> Mode Gelap
           </button>
           {user ? <ProfileMenu user={user} onLogout={onLogout} /> : <button type="button" onClick={onLogin} aria-label="Masuk" className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-yellow-300 bg-yellow-200 font-bold text-yellow-900 dark:border-yellow-500 dark:bg-yellow-600 dark:text-yellow-50">{(user?.displayName || user?.email || 'P').charAt(0).toUpperCase()}</button>}
         </div>

        <button type="button" aria-label="Buka menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)} className="flex md:hidden col-start-3 justify-self-end h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-transparent text-amber-900 dark:text-amber-200 hover:bg-amber-100/50 dark:hover:bg-stone-800">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {menuOpen && (
          <div className="absolute right-4 top-16 z-50 w-64 rounded-2xl border border-amber-100 bg-[#FFFBF5] p-3 shadow-xl dark:border-stone-700 dark:bg-stone-900">
            <div className="grid gap-2">
              <button type="button" onClick={onToggleAmbient} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-stone-700 hover:bg-amber-50 dark:text-stone-200 dark:hover:bg-stone-800">
                {ambientMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />} Suara ambien
              </button>
              <button type="button" onClick={onToggleTheme} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-stone-700 hover:bg-amber-50 dark:text-stone-200 dark:hover:bg-stone-800">
                <span>{darkMode ? '☀️' : '🌙'}</span> {darkMode ? 'Mode terang' : 'Mode gelap'}
              </button>
              <button type="button" onClick={() => selectTab('settings')} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-stone-700 hover:bg-amber-50 dark:text-stone-200 dark:hover:bg-stone-800">
                <Settings className="h-4 w-4" /> Pengaturan
              </button>
              {user ? <ProfileMenu user={user} onLogout={onLogout} /> : <button type="button" onClick={onLogin} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-stone-700 hover:bg-amber-50 dark:text-stone-200 dark:hover:bg-stone-800"><LogIn className="h-4 w-4" /> Masuk</button>}
            </div>
          </div>
        )}
      </header>


      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-amber-100 bg-[#FFFBF5]/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-lg backdrop-blur-md md:hidden dark:border-stone-800 dark:bg-stone-900/95" aria-label="Navigasi bawah">
        {TABS.map(({ id, label, Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex min-h-14 min-w-20 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold ${activeTab === id ? 'bg-amber-200 text-stone-800' : 'text-stone-500 dark:text-stone-300'}`}><Icon className="h-5 w-5" />{label}</button>)}
      </nav>
    </>
  );
}
