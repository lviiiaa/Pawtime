import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { supabase } from '../supabase';

const INITIAL_WEEK = [
  { short: 'Sen', full: 'Senin', hours: 0 },
  { short: 'Sel', full: 'Selasa', hours: 0 },
  { short: 'Rab', full: 'Rabu', hours: 0 },
  { short: 'Kam', full: 'Kamis', hours: 0 },
  { short: 'Jum', full: 'Jumat', hours: 0 },
  { short: 'Sab', full: 'Sabtu', hours: 0 },
  { short: 'Min', full: 'Minggu', hours: 0 },
];

const SESSION_TARGET = 10;
const fmt = (n) => n.toFixed(1).replace('.', ',');

export default function WeeklyStats({ completedSessions = 0, setActiveTab }) {
  const [weekData, setWeekData] = useState(INITIAL_WEEK);
  const [totalFocusHours, setTotalFocusHours] = useState(0);
  const [dbCompletedCount, setDbCompletedCount] = useState(0);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        const focusSessions = data.filter((s) => s.type === 'focus');
        setDbCompletedCount(focusSessions.length);

        // Hitung total jam
        const totalMins = focusSessions.reduce((sum, s) => sum + (s.duration || 25), 0);
        setTotalFocusHours(totalMins / 60);

        // Petakan sesi ke hari dalam seminggu (Senin - Minggu)
        const daysHours = [0, 0, 0, 0, 0, 0, 0]; // Sen, Sel, Rab, Kam, Jum, Sab, Min
        focusSessions.forEach((s) => {
          const date = new Date(s.ts || s.created_at);
          let dayIdx = date.getDay(); // 0 = Minggu, 1 = Senin, dst.
          // Ubah indeks agar 0 jadi Senin dan 6 jadi Minggu
          dayIdx = (dayIdx + 6) % 7;
          daysHours[dayIdx] += (s.duration || 25) / 60;
        });

        const updatedWeek = INITIAL_WEEK.map((item, idx) => ({
          ...item,
          hours: Number(daysHours[idx].toFixed(1)),
        }));
        setWeekData(updatedWeek);
      }
    };

    fetchWeeklyData();
  }, []);

  // getDay(): 0 = Minggu -> ubah supaya 0 = Senin
  const todayIndex = (new Date().getDay() + 6) % 7;
  const max = Math.max(...weekData.map((d) => d.hours), 1);
  const best = weekData.reduce((a, b) => (b.hours > a.hours ? b : a), weekData[0]);
  const bestIndex = weekData.indexOf(best);

  return (
    <section className="rounded-[32px] border border-[#F2E4D2] bg-[#FFFBF5] p-5 shadow-sm dark:border-[#382D4F] dark:bg-[#251E33] sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#43281C] dark:text-[#F7F3EA]">Ringkasan Produktivitas Pekan Ini</h2>
          <p className="mt-1 text-sm text-[#8D7060] dark:text-[#A898B5]">Lihat perkembangan fokusmu sepanjang minggu ini.</p>
        </div>
        <button type="button" onClick={() => setActiveTab?.('stats')} className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#E8E2EF] px-4 py-2 text-sm font-bold text-[#4A3C50] transition hover:bg-[#D8D0E2] dark:bg-[#201A2E] dark:text-[#F7F3EA] dark:hover:bg-[#2C243B]">
          Buka Analisis Lengkap <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#F2E4D2] bg-[#FFFDF9] p-4 shadow-[0_4px_14px_rgba(180,140,110,0.08)] dark:border-[#382D4F] dark:bg-[#201A2E]">
          <span className="text-sm font-semibold text-[#8D7060] dark:text-[#A898B5]">Total Waktu Fokus</span>
          <strong className="mt-2 block text-2xl font-bold text-[#43281C] dark:text-[#F7F3EA]">{fmt(totalFocusHours)} Jam</strong>
          <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#0F766E] dark:text-[#7DE0B7]"><TrendingUp className="h-3.5 w-3.5" />Terhubung ke database</span>
        </div>
        <div className="rounded-2xl border border-[#F2E4D2] bg-[#FFFDF9] p-4 shadow-[0_4px_14px_rgba(180,140,110,0.08)] dark:border-[#382D4F] dark:bg-[#201A2E]">
          <span className="text-sm font-semibold text-[#8D7060] dark:text-[#A898B5]">Sesi Diselesaikan</span>
          <strong className="mt-2 block text-2xl font-bold text-[#43281C] dark:text-[#F7F3EA]">{dbCompletedCount || completedSessions} Sesi</strong>
          <span className="mt-1 block text-xs text-[#8D7060] dark:text-[#BFAFCF]">Target harian: {SESSION_TARGET}</span>
        </div>
        <div className="rounded-2xl border border-[#F2E4D2] bg-[#FFFDF9] p-4 shadow-[0_4px_14px_rgba(180,140,110,0.08)] dark:border-[#382D4F] dark:bg-[#201A2E]">
          <span className="text-sm font-semibold text-[#8D7060] dark:text-[#A898B5]">Streak Beruntun</span>
          <strong className="mt-2 block text-2xl font-bold text-[#43281C] dark:text-[#F7F3EA]">5 Hari</strong>
          <span className="mt-1 block text-xs font-semibold text-[#B45309] dark:text-[#FCD34D]">Konsisten setiap hari</span>
        </div>
      </div>

      <div className="mt-7">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div><h3 className="text-base font-bold text-[#43281C] dark:text-[#F7F3EA]">Grafik Jam Fokus Harian</h3><p className="text-xs text-[#8D7060] dark:text-[#A898B5]">Distribusi waktu fokusmu minggu ini</p></div>
          <span className="rounded-full bg-[#FEF3C7] px-3 py-1.5 text-xs font-bold text-[#92400E] dark:bg-[#49391D] dark:text-[#FCD34D]">Tertinggi: {best.hours > 0 ? `${best.full} (${fmt(best.hours)} Jam)` : 'Belum ada data'}</span>
        </div>
        <div className="mt-5 flex h-44 items-end justify-between gap-2 px-1 sm:gap-4">
          {weekData.map((d, i) => {
            const isToday = i === todayIndex;
            const isBest = i === bestIndex && d.hours > 0;
            const height = Math.max(10, (d.hours / max) * 100);
            return <div key={d.short} title={`${d.full}: ${fmt(d.hours)} jam fokus`} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className={`text-xs font-bold ${isToday || isBest ? 'text-[#43281C] dark:text-[#F7F3EA]' : 'text-transparent group-hover:text-[#8D7060]'}`}>{fmt(d.hours)}j</span>
              <div style={{ height: `${height}%` }} className={`w-full max-w-9 rounded-full transition-all ${isToday ? 'bg-[#34D399] dark:bg-[#168A68]' : isBest ? 'bg-[#FBBF24] dark:bg-[#B88710]' : 'bg-[#E8D8C8] dark:bg-[#4A3C50]'}`} />
              <span className={`text-xs font-bold ${isToday ? 'text-[#059669] dark:text-[#7DE0B7]' : 'text-[#8D7060] dark:text-[#BFAFCF]'}`}>{d.short}</span>
            </div>;
          })}
        </div>
      </div>
    </section>
  );
}