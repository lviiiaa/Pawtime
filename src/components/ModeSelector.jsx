import React from 'react';
const MODES = [
  { id: 'focus', label: 'Fokus' },
  { id: 'shortBreak', label: 'Rehat Pendek' },
  { id: 'longBreak', label: 'Rehat Panjang' },
];

const DAILY_TARGET = 10;

function getCycleName() {
  const h = new Date().getHours();
  if (h < 12) return 'Siklus Pagi';
  if (h < 15) return 'Siklus Siang';
  if (h < 18) return 'Siklus Sore';
  return 'Siklus Malam';
}

export default function ModeSelector({ currentMode, setMode, completedSessions = 0, durations = { focus: 25, shortBreak: 5, longBreak: 15 } }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-space-md bg-[#FFFBF5] p-2.5 rounded-3xl shadow-sm border border-[#F1E8DC]">
      <div role="tablist" className="flex w-full lg:w-auto max-w-full items-center justify-start gap-1 overflow-x-auto overscroll-x-contain bg-[#FAF6F0] p-1 rounded-2xl sm:rounded-full self-start">

        {MODES.map(({ id, label }) => {
          const minutes = durations[id];
          const active = currentMode === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setMode(id, minutes)}
              className={`shrink-0 px-2.5 sm:px-space-md py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
                active
                   ? 'bg-[#FDE7A9] text-[#2D2838] shadow-sm font-bold'
                   : 'text-[#8B7163] hover:text-[#5C4033] hover:bg-[#FFF4D6]'

              }`}
            >
              {label}
              <span className={`text-[11px] font-normal ${active ? 'opacity-80' : 'opacity-70'}`}>({minutes}m)</span>
            </button>
          );
        })}
      </div>

      <div className="flex w-full lg:w-auto flex-wrap items-center justify-center lg:justify-end gap-2">
        <div className="flex items-center bg-[#FDE7A9] px-space-md py-2 rounded-full text-[#2D2838]">
          <span className="font-label-md text-label-md font-semibold">
            Siklus Fokus: <span className="font-normal">Sesi {(completedSessions % 4) + 1} dari 4</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center text-[#356B58] font-label-sm text-label-sm bg-[#CDEFD9] px-space-md py-2 rounded-full">
          <span>Target Harian: {DAILY_TARGET} Sesi</span>
        </div>
      </div>
    </div>
  );
}