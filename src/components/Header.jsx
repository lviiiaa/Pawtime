import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Settings, LogOut, LogIn } from 'lucide-react';
import { ChibiDuo } from './Mascot';

const TABS = [
  { id: 'timer', label: 'Timer & Tugas', mobile: 'Timer' },
  { id: 'stats', label: 'Statistik', mobile: 'Statistik' },
  { id: 'history', label: 'Riwayat', mobile: 'Riwayat' },
];

const AMBIENT_LABEL = {
  rain: 'Hujan Lembut',
  whitenoise: 'Derau Putih',
  cafe: 'Hening Kafe',
  mute: 'Senyap',
};

const pillBtn =
  'rounded-full bg-[#FFFBF5] dark:bg-[#251E33] border-2 border-[#EEDCC7] dark:border-[#382D4F] text-[#43281C] dark:text-[#F7F3EA] hover:bg-[#F7EBDC] dark:hover:bg-[#2E2540] transition-all soft-pill-shadow';

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const name = user?.displayName || user?.email?.split('@')[0] || 'Pengguna';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Menu profil"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="block rounded-full focus:outline-none focus:ring-2 focus:ring-[#FCD34D] hover:scale-105 active:scale-95 transition-all"
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={name}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border-2 border-[#EEDCC7] dark:border-[#382D4F]"
          />
        ) : (
          <span className="w-10 h-10 rounded-full bg-[#FDE68A] text-[#43281C] text-sm font-extrabold flex items-center justify-center border-2 border-[#FCD34D]">
            {initial}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 bg-[#FFFBF5] dark:bg-[#251E33] border-2 border-[#F2E4D2] dark:border-[#382D4F] rounded-2xl cozy-card-shadow overflow-hidden z-50">
          <div className="px-4 py-3 border-b-2 border-[#F2E4D2] dark:border-[#382D4F]">
            <p className="text-sm font-extrabold text-[#43281C] dark:text-[#F7F3EA] truncate">{name}</p>
            <p className="text-xs font-bold text-[#8D7060] dark:text-[#A898B5] truncate">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
            className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-[#8D7060] dark:text-[#A898B5] hover:text-[#E11D48] hover:bg-[#FFF1F2] dark:hover:bg-[#3A2230] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
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
  ambientSound = 'rain',
  ambientMuted = false,
  onToggleAmbient,
  mood = 'Tenang',
  user,
  onLogin,
  onLogout,
}) {
  const ambientLabel = AMBIENT_LABEL[ambientSound] ?? AMBIENT_LABEL.rain;

  return (
    <header className="sticky top-0 z-40 bg-[#FDF6EC]/90 dark:bg-[#181520]/90 backdrop-blur-md border-b border-[#F2E4D2] dark:border-[#2C243B] transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand & karakter */}
        <button
          type="button"
          onClick={() => setActiveTab('timer')}
          title="Pawtime"
          className="flex items-center gap-3.5 group cursor-pointer focus:outline-none text-left"
        >
          <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#FFFBF5] dark:bg-[#251E33] border-2 border-[#F3E2CF] dark:border-[#382D4F] p-1.5 flex items-center justify-center shadow-sm group-hover:scale-105 transition-all duration-300">
            <ChibiDuo />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold text-[#43281C] dark:text-[#F7F3EA] tracking-tight">Pawtime</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] animate-pulse" />
            </div>
            <span className="text-xs font-bold text-[#8D7060] dark:text-[#A898B5]">Teman Fokus Santai</span>
          </div>
        </button>

        {/* Navigasi tab kapsul */}
        <nav className="hidden md:flex items-center gap-2 p-1.5 bg-[#F7EBDC] dark:bg-[#251E33] rounded-full border border-[#EEDCC7] dark:border-[#382D4F]">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-6 py-2.5 rounded-full text-xs transition-all ${
                activeTab === id
                  ? 'font-extrabold bg-[#FDE68A] text-[#43281C] dark:text-[#2D2838] shadow-sm soft-pill-shadow'
                  : 'font-bold text-[#8D7060] dark:text-[#A898B5] hover:text-[#43281C] dark:hover:text-[#F7F3EA] hover:bg-[#FFFBF5] dark:hover:bg-[#2F2740]'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Kanan: suasana, ambien, tema, pengaturan, profil */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#E8F8F0] dark:bg-[#1A382E] border border-[#C5ECD6] dark:border-[#225843] text-[#065F46] dark:text-[#7DE0B7] text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#34D399]" />
            <span>Suasana: {mood}</span>
          </div>

          <button
            type="button"
            aria-label="Toggle Suara Ambien"
            aria-pressed={!ambientMuted}
            onClick={onToggleAmbient}
            className={`${pillBtn} px-3.5 sm:px-4 py-2 text-xs font-bold flex items-center gap-2`}
          >
            {ambientMuted ? (
              <VolumeX className="w-4 h-4 text-[#8D7060] dark:text-[#BFAFCF]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#8D7060] dark:text-[#BFAFCF]" />
            )}
            <span className="hidden sm:inline">{ambientLabel}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            title="Ganti Mode Gelap / Terang"
            className="px-3.5 sm:px-4 py-2 rounded-full bg-[#FEF3C7] dark:bg-[#34274E] border-2 border-[#FDE68A] dark:border-[#4E3A75] text-[#92400E] dark:text-[#E9D5FF] text-xs font-extrabold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all soft-pill-shadow cursor-pointer"
          >
            <span>{darkMode ? '☀️' : '🌙'}</span>
            <span className="hidden sm:inline">{darkMode ? 'Mode Santai' : 'Mode Gelap'}</span>
          </button>

          <button
            type="button"
            aria-label="Pengaturan"
            title="Pengaturan"
            onClick={() => setActiveTab('settings')}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all soft-pill-shadow ${
              activeTab === 'settings'
                ? 'bg-[#FDE68A] border-[#FCD34D] text-[#43281C]'
                : 'bg-[#FFFBF5] dark:bg-[#251E33] border-[#EEDCC7] dark:border-[#382D4F] text-[#8D7060] dark:text-[#BFAFCF] hover:bg-[#F7EBDC] dark:hover:bg-[#2E2540]'
            }`}
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>

          {user ? (
            <ProfileMenu user={user} onLogout={onLogout} />
          ) : (
            <button
              type="button"
              onClick={onLogin}
              className="h-10 px-4 rounded-full bg-[#FDE68A] hover:bg-[#FCD34D] border-2 border-[#FCD34D] text-[#43281C] text-xs font-extrabold flex items-center gap-1.5 soft-pill-shadow hover:scale-105 active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Masuk
            </button>
          )}
        </div>
      </div>

      {/* Navigasi mobile */}
      <div className="flex md:hidden border-t border-[#F2E4D2] dark:border-[#2C243B] px-4 py-2.5 bg-[#FFFBF5] dark:bg-[#1E1929] justify-around">
        {TABS.map(({ id, mobile }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`text-xs flex flex-col items-center gap-0.5 ${
              activeTab === id
                ? 'font-extrabold text-[#D97706] dark:text-[#FDE68A]'
                : 'font-bold text-[#8D7060] dark:text-[#A898B5]'
            }`}
          >
            {mobile}
          </button>
        ))}
      </div>
    </header>
  );
}