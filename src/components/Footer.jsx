import React from 'react';
import { FooterChick } from './Mascot';

const LINKS = [
  { label: 'Metode Pomodoro', title: 'Metode Pomodoro', msg: '25 menit kerja fokus tanpa interupsi, dilanjutkan istirahat 5 menit.', icon: '💡' },
  { label: 'Pintasan Tombol', title: 'Pintasan Keyboard', msg: '[Spasi]: Mulai/Jeda | [R]: Reset | [S]: Skip Sesi', icon: '⌨️' },
  { label: 'Privasi', title: 'Privasi Aman', msg: 'Data tugas & riwayat milikmu hanya bisa diakses olehmu.', icon: '🔒' },
];

export default function Footer({ showToast }) {
  return (
    <footer className="w-full bg-[#FFFBF5] dark:bg-[#201A2E] border-t-2 border-[#F2E4D2] dark:border-[#2C243B] mt-10 transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-[#FEF9C3] border border-[#FDE68A] flex items-center justify-center">
            <FooterChick />
          </div>
          <span className="text-sm font-extrabold text-[#43281C] dark:text-[#F7F3EA]">Pawtime</span>
          <span className="text-xs text-[#8D7060] dark:text-[#A898B5] font-semibold">
            © 2024 — Dirancang untuk Alur Kerja Fokus Santai &amp; Bahagia
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs font-bold text-[#8D7060] dark:text-[#A898B5]">
          {LINKS.map(({ label, title, msg, icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => showToast?.(title, msg, icon)}
              className="hover:text-[#43281C] dark:hover:text-[#F7F3EA] transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}