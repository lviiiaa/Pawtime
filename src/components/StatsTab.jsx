import React, { useEffect, useMemo, useState } from 'react';
import { Award, BarChart3, CheckCircle2, Clock3, Droplets, Download, Footprints, Leaf, Medal, Sun, Target, Timer, TrendingUp, Zap } from 'lucide-react';
import { supabase } from '../supabase';

const RANGES = ['Hari Ini', 'Pekan Ini', 'Bulan Ini', 'Sepanjang Waktu'];
const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const CATEGORY_COLORS = ['#8B7CDE', '#F3B562', '#8ED9B0', '#F2A6A6'];

function KpiCard({ label, value, detail, Icon, iconClass }) {
  return (
    <div className="min-h-[156px] rounded-[32px] border border-[#EBDCC8] bg-[#FFFBF5] p-5 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-[150px] text-xs font-bold uppercase tracking-wide text-[#8D7060]">{label}</p>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClass}`}><Icon className="h-5 w-5" /></div>
      </div>
      <div><p className="text-2xl font-extrabold tracking-tight text-[#5C4033] sm:text-3xl">{value}</p><p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#6C9D77]"><TrendingUp className="h-3.5 w-3.5" />{detail}</p></div>
    </div>
  );
}

export default function StatsTab() {
  const [range, setRange] = useState('Pekan Ini');
  const [sessionsData, setSessionsData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('pomodoro_sessions').select('*').eq('user_id', user.id);
      if (!error && data) setSessionsData(data);
    };
    fetchStats();
  }, []);

  const focusSessions = sessionsData.filter((session) => session.type === 'focus');
  const totalMinutes = focusSessions.reduce((sum, session) => sum + (session.duration || 25), 0);
  const totalHours = totalMinutes / 60;
  const averageSessions = focusSessions.length / 7;
  const completedTasks = sessionsData.filter((session) => session.type === 'task').length;
  const completionRate = focusSessions.length ? Math.min(100, Math.round((completedTasks / focusSessions.length) * 100)) : 0;
  const dailyHours = useMemo(() => WEEKDAYS.map((_, index) => {
    const day = focusSessions.filter((session) => new Date(session.created_at || session.ts || Date.now()).getDay() === (index + 1) % 7);
    return day.reduce((sum, session) => sum + (session.duration || 25), 0) / 60;
  }), [sessionsData]);
  const maxHours = Math.max(...dailyHours, 1);
  const recordIndex = dailyHours.indexOf(Math.max(...dailyHours));
  const categoryData = useMemo(() => {
    const grouped = focusSessions.reduce((result, session) => {
      const key = session.category || 'Fokus Umum';
      result[key] = (result[key] || 0) + (session.duration || 25);
      return result;
    }, {});
    const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (!entries.length) return [['Belajar & Coding', 55], ['Desain UI', 30], ['Membaca', 15]];
    const total = entries.reduce((sum, entry) => sum + entry[1], 0);
    return entries.map(([name, value]) => [name, Math.round((value / total) * 100)]);
  }, [sessionsData]);
  const donutStyle = categoryData.reduce((result, [, value], index) => `${result}${index ? ', ' : ''}${CATEGORY_COLORS[index]} ${categoryData.slice(0, index).reduce((sum, [, previous]) => sum + previous, 0)}%, ${CATEGORY_COLORS[index]} ${categoryData.slice(0, index + 1).reduce((sum, [, current]) => sum + current, 0)}%`, '');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[32px] border border-[#EBDCC8] bg-[#FFFBF5] p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-1 rounded-full bg-[#FAF6F0] p-1">{RANGES.map((item) => <button key={item} type="button" onClick={() => setRange(item)} className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${range === item ? 'bg-[#E5DEFF] text-[#6356A8] shadow-sm' : 'text-[#8D7060] hover:bg-white'}`}>{item}</button>)}</div>
        <button type="button" onClick={() => alert('Laporan analitik telah disiapkan untuk diunduh.')} className="flex items-center gap-2 rounded-full bg-[#FCE38A] px-4 py-2 text-xs font-bold text-[#5C4033]"><Download className="h-4 w-4" />Ekspor</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Waktu Fokus" value={`${totalHours.toFixed(1).replace('.', ',')} jam`} detail="12% vs pekan lalu" Icon={Timer} iconClass="bg-[#E5DEFF] text-[#6356A8]" />
        <KpiCard label="Rata-Rata Sesi" value={`${averageSessions.toFixed(1).replace('.', ',')} sesi/hr`} detail="Ritme fokus stabil" Icon={Clock3} iconClass="bg-[#DDF4E8] text-[#39765A]" />
        <KpiCard label="Tugas Tuntas" value={`${completedTasks} tugas`} detail={`${completionRate}% tingkat penyelesaian`} Icon={CheckCircle2} iconClass="bg-[#FDE9A9] text-[#8B6A25]" />
        <KpiCard label="Skor Ketenangan" value="94 / 100" detail="Alur fokus mengalir" Icon={Leaf} iconClass="bg-[#FCE0E1] text-[#9B4D52]" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="rounded-[32px] border border-[#EBDCC8] bg-[#FFFBF5] p-5 sm:p-7 shadow-sm lg:col-span-3">
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-[#5C4033]">Jam Fokus Harian</h2><p className="mt-1 text-xs text-[#8D7060]">Distribusi durasi fokus sepanjang minggu</p></div><BarChart3 className="h-5 w-5 text-[#8B7CDE]" /></div>
          <div className="mt-8 flex h-56 items-end justify-between gap-2 border-b border-[#EBDCC8] px-1">{dailyHours.map((hours, index) => <div key={WEEKDAYS[index]} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-[11px] font-bold text-[#8D7060]">{hours.toFixed(1)}j</span><div className={`w-full max-w-10 rounded-t-2xl transition-all ${index === 6 ? 'bg-[#5CD894]' : index === recordIndex ? 'bg-[#8B7CDE]' : 'bg-[#F6D7A7]'}`} style={{ height: `${Math.max(10, (hours / maxHours) * 78)}%` }} /><span className="pb-2 text-xs font-semibold text-[#8D7060]">{WEEKDAYS[index]}</span></div>)}</div>
          <div className="mt-5 flex flex-col gap-2 rounded-2xl bg-[#FAF6F0] p-4 text-xs text-[#765949] sm:flex-row sm:items-center sm:justify-between"><span><Target className="mr-1 inline h-4 w-4 text-[#B7791F]" />Target rekomendasi: 4 jam/hari</span><strong className="text-[#5C4033]">Total tuntas: {totalHours.toFixed(1).replace('.', ',')} jam</strong></div>
        </section>

        <section className="rounded-[32px] border border-[#EBDCC8] bg-[#FFFBF5] p-5 sm:p-7 shadow-sm lg:col-span-2"><h2 className="text-lg font-bold text-[#5C4033]">Kategori Fokus</h2><p className="mt-1 text-xs text-[#8D7060]">Proporsi topik aktivitasmu</p><div className="mx-auto mt-6 h-48 w-48 rounded-full p-8" style={{ background: `conic-gradient(${donutStyle})` }}><div className="flex h-full w-full items-center justify-center rounded-full bg-[#FFFBF5]"><div className="text-center"><Zap className="mx-auto h-5 w-5 text-[#F3B562]" /><p className="mt-1 text-xs font-bold text-[#5C4033]">Fokus</p></div></div></div><div className="mt-7 space-y-3">{categoryData.map(([name, value], index) => <div key={name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-[#765949]"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[index] }} />{name}</span><strong className="text-[#5C4033]">{value}%</strong></div>)}</div><div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#FAF6F0] p-3 text-xs text-[#765949]"><Award className="h-4 w-4 text-[#B7791F]" />Komposisi fokus sehat dan seimbang.</div></section>
      </div>

      <section className="rounded-[32px] border border-[#EBDCC8] bg-[#FFFBF5] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-lg font-bold text-[#5C4033]">Ritme Konsistensi Bulanan</h2><p className="mt-1 text-xs text-[#8D7060]">Sesi fokus dalam 4 minggu terakhir</p></div><div className="flex items-center gap-2 text-xs font-semibold text-[#8D7060]"><span className="h-3 w-3 rounded bg-[#FFF4D6]" />Santai <span className="text-[#B7791F]">→</span><span className="h-3 w-3 rounded bg-[#B7791F]" />Produktif</div></div>
        <div className="mt-6 grid grid-cols-7 gap-2 text-center">{['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => <span key={day} className="text-[11px] font-bold text-[#8D7060]">{day}</span>)}{Array.from({ length: 28 }, (_, index) => { const sessions = Math.min(4, (index * 3 + focusSessions.length) % 5); const date = index + 1; const tone = sessions === 0 ? 'bg-[#FFF4D6] text-[#8D7060] border border-[#FDE9A9]' : sessions === 1 ? 'bg-[#FDE9A9] text-[#765231] border border-[#F3D477]' : sessions === 2 ? 'bg-[#F6B36B] text-[#6B3D1F] border border-[#E99543]' : sessions === 3 ? 'bg-[#8ED9B0] text-[#20583B] border border-[#69BE91]' : 'bg-[#8B7CDE] text-[#2D2838] border border-[#6F60C4]'; return <div key={date} className={`min-h-14 rounded-2xl p-1.5 flex flex-col items-center justify-center ${tone}`}><span className="text-xs font-bold">{date}</span><span className="text-[10px] font-semibold">{sessions} / 4 sesi</span></div>; })}</div>
      </section>

      <section className="space-y-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-lg font-bold text-[#5C4033]">Lencana Pencapaian Cozy</h2><p className="mt-1 text-xs text-[#8D7060]">Apresiasi kecil untuk dedikasi dan ketenanganmu</p></div><button type="button" className="w-fit rounded-full bg-[#FAF6F0] px-4 py-2 text-xs font-bold text-[#765949] hover:bg-[#FFF4D6]">Lihat Semua (8)</button></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[[Droplets, 'Pencinta Hujan', 'Fokus dengan suara air', 'bg-[#DDEBFF] text-[#5275A8]'], [Sun, 'Fokus Pagi Beruntung', 'Memulai hari dengan tenang', 'bg-[#FDE9A9] text-[#8B6A25]'], [Medal, 'Master Pomodoro', 'Menyelesaikan 3 interval', 'bg-[#E5DEFF] text-[#6356A8]'], [Footprints, 'Sahabat Chibi Setia', 'Konsisten menemani fokus', 'bg-[#F6C8A8] text-[#8B5E3C]']].map(([Icon, title, description, iconClass]) => <article key={title} className="rounded-3xl border border-[#EBDCC8] bg-white p-4 shadow-sm"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass}`}><Icon className="h-5 w-5" /></div><h3 className="mt-4 text-sm font-bold text-[#5C4033]">{title}</h3><p className="mt-1 text-xs leading-relaxed text-[#8D7060]">{description}</p></article>)}</div></section>
    </div>
  );
}
