import React from 'react';

// Notifikasi melayang di kanan atas. Selalu dirender; `visible` mengatur muncul/hilangnya.
export default function Toast({ visible, title, message, icon }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-24 right-5 z-50 max-w-[calc(100vw-2.5rem)] transform transition-all duration-300 pointer-events-none bg-[#FFFBF5] dark:bg-[#2A233A] border-2 border-[#FED7AA] dark:border-[#533F73] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-[-150%] opacity-0'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <div>
        <h4 className="text-xs font-extrabold text-[#43281C] dark:text-[#F7F3EA]">{title}</h4>
        <p className="text-[11px] font-bold text-[#8D7060] dark:text-[#BFAFCF]">{message}</p>
      </div>
    </div>
  );
}