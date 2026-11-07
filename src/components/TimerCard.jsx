import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, Pencil, CircleDot } from 'lucide-react';
import { Mascot } from './Mascot';

// Radius & keliling lingkaran mengikuti viewBox 260 di desain
const RADIUS = 115;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MODE_STYLE = {
  focus: { ring: 'text-[#F6B84A]', status: 'Sesi Fokus Aktif' },
  shortBreak: { ring: 'text-[#F7C98B]', status: 'Istirahat Pendek' },
  longBreak: { ring: 'text-[#E9B98A]', status: 'Istirahat Panjang' },
};

const chip =
  'px-space-md py-2 rounded-full bg-[#FAF6F0] hover:bg-[#FFF4D6] text-[#765949] font-label-sm text-label-sm transition-all active:scale-95';

const textBtn =
  'w-full sm:w-auto px-3 sm:px-5 h-11 sm:h-12 bg-[#FAF6F0] hover:bg-[#FFF4D6] text-[#765949] border border-[#DCC9B8] rounded-full transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm';

export default function TimerCard({
  timer,
  originalTime,
  currentMode = 'focus',
  formatTime,
  isRunning,
  toggleTimer,
  resetTimer,
  skipTimer,
  adjustTime,
  activeTaskLabel,
}) {
  const style = MODE_STYLE[currentMode] ?? MODE_STYLE.focus;
  const remaining = originalTime > 0 ? Math.min(1, Math.max(0, timer / originalTime)) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - remaining);

  const statusText = isRunning
    ? style.status
    : timer === originalTime
      ? 'Siap Dimulai'
      : 'Sesi Dijeda';

  return (
    <div className="relative overflow-hidden bg-[#FFFBF5] rounded-3xl p-space-lg md:p-space-xl shadow-md border border-[#F1E8DC] flex flex-col items-center justify-center text-center">
      <div className="absolute -top-28 -left-28 w-96 h-96 bg-[#FDE7A9]/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-28 w-96 h-96 bg-[#F6C8A8]/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center mb-space-lg">
        <div className="relative max-w-[320px] rounded-3xl rounded-br-md bg-[#FFF4D6] border border-[#EBDCC8] px-5 py-3 text-center text-[#765949] text-sm font-semibold shadow-sm mb-4">
          Semangat ya! Kamu pasti bisa menyelesaikan sesi ini~
        </div>
        <div className="w-44 h-44 sm:w-52 sm:h-52"><Mascot /></div>
      </div>

      <div
        title="Pilih tugas dari Daftar Tugas untuk mengganti target fokus"
        className="relative z-10 flex items-center gap-2 px-space-md py-1 bg-surface-container-low hover:bg-surface-container rounded-full transition-colors cursor-pointer group mb-space-lg border border-[#EBDCC8]"
      >
        <CircleDot className="w-[18px] h-[18px] text-primary" />
        <span className="font-label-md text-label-md text-on-surface font-medium">
          {activeTaskLabel ? (
            <>
              Fokus pada: <span className="font-semibold text-primary">{activeTaskLabel}</span>
            </>
          ) : (
            <span className="text-on-surface-variant">Belum ada tugas dipilih</span>
          )}
        </span>
        <Pencil className="w-4 h-4 text-on-surface-variant group-hover:text-primary" />
      </div>

      {/* Lingkaran hitung mundur */}
      <div className="relative z-10 w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-space-xs">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260" aria-hidden="true">
          <circle className="text-[#F3E9DA]" cx="130" cy="130" r={RADIUS} fill="transparent" stroke="currentColor" strokeWidth="8" />
          <circle
            className={`${style.ring} transition-all duration-1000 ease-linear`}
            cx="130"
            cy="130"
            r={RADIUS}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span
            role="timer"
            className="font-display-timer-mobile sm:font-display-timer-desktop text-display-timer-mobile sm:text-display-timer-desktop text-[#5C4033] font-bold tracking-tighter tabular-nums select-none"
          >
            {formatTime(timer)}
          </span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium mt-1">
            {statusText}
          </span>
        </div>
      </div>

      {/* Penyesuaian waktu */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-space-sm mb-space-lg mt-2">
        <button type="button" className={chip} title="Kurangi 5 Menit" onClick={() => adjustTime(-300)}>
          -5 Menit
        </button>
        <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
        <button type="button" className={chip} title="Tambah 5 Menit" onClick={() => adjustTime(300)}>
          +5 Menit
        </button>
      </div>

      {/* Kontrol utama */}
      <div className="relative z-10 grid grid-cols-2 sm:flex items-center gap-2 sm:gap-space-md w-full justify-center">
        <button
          type="button"
          onClick={toggleTimer}
          className="col-span-2 sm:col-span-1 flex-1 w-full sm:max-w-[220px] h-12 sm:h-14 bg-[#FCE38A] hover:bg-[#F8D96F] text-[#5C4033] rounded-full font-label-lg text-label-lg shadow-md shadow-primary-container/20 hover:shadow-lg hover:shadow-primary-container/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {isRunning ? (
            <>
              <Pause className="w-6 h-6 fill-current" />
              <span>Jeda Sesi</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current" />
              <span>Mulai Sesi</span>
            </>
          )}
        </button>

        <button type="button" onClick={resetTimer} className={textBtn} title="Atur Ulang Waktu">
          <RotateCcw className="w-[18px] h-[18px]" />
          <span>Atur Ulang</span>
        </button>
        <button type="button" onClick={skipTimer} className={textBtn} title="Lewati Sesi">
          <SkipForward className="w-[18px] h-[18px]" />
          <span>Lewati</span>
        </button>
      </div>
    </div>
  );
}