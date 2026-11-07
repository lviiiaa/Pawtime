import React from 'react';
import { NotebookPen, Trash2 } from 'lucide-react';

export default function Scratchpad({ scratchpad, setScratchpad }) {
  return (
    <div className="w-full min-w-0 rounded-3xl border border-[#EBDCC8] bg-[#FFFBF5] p-5 sm:p-6 shadow-sm dark:border-[#382D4F] dark:bg-[#251E33] flex flex-col justify-between min-h-[320px] transition-colors duration-300">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FDE68A] text-[#43281C] dark:bg-[#6B5522] dark:text-[#FFF7D6]">
            <NotebookPen className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <h3 className="break-words text-base font-semibold leading-tight text-[#43281C] dark:text-[#F7F3EA]">
              Catatan Cepat (Scratchpad)
            </h3>
            <p className="mt-0.5 text-xs leading-tight text-[#8D7060] dark:text-[#A898B5] truncate">
              Tuliskan ide santaimu tanpa terdistraksi
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            title="Kosongkan catatan"
            onClick={() => setScratchpad('')}
            className="px-2.5 py-1 rounded-full bg-[#FAF6F0] hover:bg-[#FDE7A9] text-[#765949] hover:text-[#8B4B3B] text-xs font-semibold flex items-center gap-1 transition-all border border-[#DCC9B8] dark:bg-[#201A2E] dark:text-[#A898B5] dark:border-[#382D4F] dark:hover:bg-[#2C243B] dark:hover:text-[#F7F3EA]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Bersihkan
          </button>
        </div>
      </div>

      <textarea
        value={scratchpad}
        onChange={(e) => setScratchpad(e.target.value)}
        placeholder="Tulis ide kilat, tautan, atau catatan saat sesi fokus berjalan..."
        rows={8}
        className="my-3 flex-1 min-h-[180px] w-full resize-y rounded-2xl border border-[#EBDCC8] bg-[#FAF6F0] p-3 text-xs sm:text-sm leading-relaxed text-[#43281C] placeholder:text-[#9A7B68]/70 transition-all focus:border-[#F6C85F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F6C85F]/20 dark:border-[#382D4F] dark:bg-[#201A2E] dark:text-[#F7F3EA] dark:placeholder:text-[#BFAFCF]/70 dark:focus:border-[#B88710]"
      />

      <div className="flex items-center justify-between gap-3 text-[11px] sm:text-xs text-[#8D7060] dark:text-[#A898B5]">
        <div className="flex items-center gap-1 text-[#0F766E] dark:text-[#7DE0B7]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34D399]" />
          <span>Tersimpan otomatis</span>
        </div>
        <span className="shrink-0 font-mono">{scratchpad.length} karakter</span>
      </div>
    </div>
  );
}