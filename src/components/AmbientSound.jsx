import React from 'react';
import { AudioLines, CloudRain, Waves, VolumeX } from 'lucide-react';

const SOUNDS = [
  { id: 'rain', label: 'Hujan Lembut', Icon: CloudRain },
  { id: 'whitenoise', label: 'Derau Putih', Icon: Waves },
  { id: 'mute', label: 'Hening', Icon: VolumeX },
];

export default function AmbientSound({ ambientSound = 'rain', setAmbientSound }) {
  const current = SOUNDS.find((s) => s.id === ambientSound) ?? SOUNDS[0];

  return (
    <div className="w-full min-w-0 rounded-3xl border border-[#EBDCC8] bg-[#FFFBF5] p-4 sm:p-5 shadow-sm dark:border-[#382D4F] dark:bg-[#251E33] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 transition-colors duration-300">
      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
        <div className="w-10 h-10 shrink-0 rounded-2xl bg-[#FDE68A] text-[#43281C] dark:bg-[#6B5522] dark:text-[#FFF7D6] flex items-center justify-center shadow-xs">
          <AudioLines className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="text-base font-semibold leading-tight text-[#43281C] dark:text-[#F7F3EA] truncate">
            Suara Ambien Pendukung
          </h3>
          <p className="mt-0.5 text-xs text-[#8D7060] dark:text-[#A898B5] truncate">
            {current.id === 'mute' ? 'Suara ambien dimatikan' : `Memutar alur audio: ${current.label}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto justify-start sm:justify-end shrink-0">
        {SOUNDS.map(({ id, label, Icon }) => {
          const active = ambientSound === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setAmbientSound(id)}
              aria-pressed={active}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                active
                  ? 'bg-[#FCE38A] text-[#5C4033] shadow-xs border border-[#F6C85F] dark:bg-[#6B5522] dark:text-[#FFF7D6] dark:border-[#8C702E]'
                  : 'bg-[#FAF6F0] text-[#765949] hover:bg-[#FFF4D6] border border-[#EBDCC8] dark:bg-[#201A2E] dark:text-[#A898B5] dark:border-[#382D4F] dark:hover:bg-[#2C243B]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}