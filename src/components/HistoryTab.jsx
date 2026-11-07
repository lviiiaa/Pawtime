import React, { useMemo, useState } from 'react';
import { Award, CalendarDays, Check, Clock3, Coffee, Download, FileText, Flame, Hourglass, Leaf, Search, Timer, TrendingUp, Watch } from 'lucide-react';

const DAY = 24 * 60 * 60 * 1000;

const PERIODS = [
  { id: 'all', label: 'Semua Tanggal' },
  { id: 'today', label: 'Hari Ini' },
  { id: '7days', label: '7 Hari Terakhir' },
  { id: 'month', label: 'Bulan Ini' },
];

const STATUSES = [
  { id: 'all', label: 'Semua Sesi' },
  { id: 'focus', label: 'Fokus Selesai' },
  { id: 'break', label: 'Istirahat' },
  { id: 'cancelled', label: 'Dibatalkan' },
];

const CATEGORY_STYLE = {
  Desain: 'bg-[#E5DEFF] text-[#6356A8]',
  Coding: 'bg-[#DDF4E8] text-[#39765A]',
  Rehat: 'bg-[#FDE9A9] text-[#8B6A25]',
  Admin: 'bg-[#FCE0E1] text-[#9B4D52]',
};
const TYPE_INFO = {
  focus: { label: 'Selesai Sempurna', session: 'Sesi Fokus', Icon: Flame, icon: 'bg-[#FCE0E1] text-[#C35F65]', status: 'bg-[#DDF4E8] text-[#39765A]' },
  shortBreak: { label: 'Istirahat', session: 'Istirahat Pendek', Icon: Coffee, icon: 'bg-[#DDF4E8] text-[#39765A]', status: 'bg-[#DDF4E8] text-[#39765A]' },
  longBreak: { label: 'Istirahat', session: 'Istirahat Panjang', Icon: Coffee, icon: 'bg-[#DDF4E8] text-[#39765A]', status: 'bg-[#DDF4E8] text-[#39765A]' },
  task: { label: 'Selesai Sempurna', session: 'Tugas Selesai', Icon: Check, icon: 'bg-[#FDE9A9] text-[#8B6A25]', status: 'bg-[#DDF4E8] text-[#39765A]' },
};

function normalize(log, index) {
  const raw = log.text ?? '';
  let type = log.type;
  if (!type) type = raw.startsWith('Menyelesaikan tugas') ? 'task' : raw.includes('shortBreak') ? 'shortBreak' : raw.includes('longBreak') ? 'longBreak' : 'focus';
  let name = raw;
  if (raw.startsWith('Menyelesaikan tugas:')) name = raw.replace('Menyelesaikan tugas:', '').trim();
  const isBreak = type === 'shortBreak' || type === 'longBreak';
  const duration = log.duration ?? (type === 'focus' ? 25 : isBreak ? 5 : null);
  return {
    key: log.id ?? index,
    ts: log.ts ?? (log.created_at ? new Date(log.created_at).getTime() : 0),
    time: log.time ?? '-',
    name: name || (isBreak ? 'Waktu istirahat' : 'Sesi fokus'),
    description: log.description ?? (isBreak ? 'Jeda untuk memulihkan energi sebelum kembali fokus.' : 'Sesi produktif tercatat dalam perjalanan fokusmu.'),
    category: log.category ?? (isBreak ? 'Rehat' : type === 'task' ? 'Tugas' : 'Fokus'),
    tags: log.tags ?? [],
    ambient: log.ambient ?? (isBreak ? 'Suara Hujan Gerimis (40%)' : 'Suara Hujan Gerimis (40%)'),
    type,
    duration,
    status: log.status ?? 'Selesai',
    isBreak,
  };
}

function inRange(ts, filter) {
  if (filter === 'all') return true;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (filter === 'today') return ts >= start;
  if (filter === '7days') return ts >= start - 6 * DAY;
  return new Date(ts).getMonth() === now.getMonth() && new Date(ts).getFullYear() === now.getFullYear();
}

function formatGroup(ts, index) {
  const date = new Date(ts);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const prefix = date.getTime() >= start ? 'Hari Ini' : date.getTime() >= start - DAY ? 'Kemarin' : date.toLocaleDateString('id-ID', { weekday: 'long' });
  return `${prefix} — ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}` || String(index);
}

function downloadCsv(rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [r.time, r.name, r.category, r.type, r.duration ?? '', r.status].map(esc).join(','));
  const blob = new Blob(['\uFEFF' + [ ['Waktu', 'Nama Sesi / Tugas', 'Kategori', 'Tipe', 'Durasi (menit)', 'Status'].map(esc).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'riwayat-pawtime.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function HistoryTab({ historyLogs = [] }) {
  const [period, setPeriod] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const all = useMemo(() => historyLogs.map(normalize), [historyLogs]);
  const rows = useMemo(() => all.filter((row) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${row.name} ${row.category} ${row.description}`.toLowerCase().includes(query);
    const matchesStatus = status === 'all' || (status === 'break' ? row.isBreak : status === 'focus' ? !row.isBreak && row.type !== 'task' : row.status.toLowerCase().includes('batal'));
    return inRange(row.ts, period) && matchesSearch && matchesStatus;
  }), [all, period, search, status]);
  const totalMinutes = rows.reduce((sum, row) => sum + (row.duration ?? 0), 0);
  const focusCount = rows.filter((row) => !row.isBreak).length;
  const groups = rows.reduce((result, row) => {
    const key = new Date(row.ts).toDateString();
    if (!result[key]) result[key] = { title: formatGroup(row.ts), rows: [] };
    result[key].rows.push(row);
    return result;
  }, {});

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-[#EBDCC8] bg-gradient-to-br from-[#FFFBF5] via-[#FFF4D6] to-[#F6C8A8]/35 p-5 sm:p-7 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <p className="text-xs font-semibold text-[#0F766E]">Tersimpan otomatis</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#5C4033]">Catatan &amp; Riwayat Sesi</h1>
          <p className="mt-2 text-sm text-[#8D7060]">“Sedikit demi sedikit, fokusmu membentuk hasil yang berarti.”</p>
        </div>
        <button type="button" onClick={() => downloadCsv(rows)} className="w-fit px-4 py-2.5 rounded-full bg-[#FCE38A] text-[#5C4033] font-semibold text-sm flex items-center gap-2 shadow-sm hover:bg-[#F8D96F] transition-colors">
          <Download className="w-4 h-4" /> Ekspor Log (.CSV)
        </button>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ['Total Sesi Tercatat', rows.length, '+8 sesi pekan ini', TrendingUp, 'bg-[#E5DEFF] text-[#6356A8]', 'text-[#3D9B68]', Timer],
          ['Total Durasi Terakumulasi', `${totalMinutes} menit`, 'Rata-rata 2.1 jam/hari', Hourglass, 'bg-[#5CD894] text-[#17663A]', 'text-[#8D7060]', Watch],
          ['Tingkat Keberhasilan Sesi', `${rows.length ? Math.round((focusCount / rows.length) * 100) : 0}%`, 'Konsistensi terjaga', Leaf, 'bg-[#E8D7B9] text-[#765231]', 'text-[#8D7060]', Award],
        ].map(([label, value, detail, DetailIcon, iconClass, detailClass, Icon]) => (
          <div key={label} className="rounded-3xl border border-[#EBDCC8] bg-gradient-to-br from-[#FFFBF5] to-[#FAF6F0] p-5 shadow-sm flex items-center justify-between gap-4 min-h-[136px]">
            <div className="min-w-0"><p className="text-xs text-[#8D7060]">{label}</p><p className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#5C4033]">{value}</p><p className={`mt-2 flex items-center gap-1 text-[11px] font-semibold ${detailClass}`}><DetailIcon className="h-3.5 w-3.5 shrink-0" />{detail}</p></div>
            <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center ${iconClass}`}><Icon className="w-6 h-6" /></div>
          </div>
        ))}
      </div>

      <section className="rounded-[32px] border border-[#EBDCC8] bg-[#FFFBF5] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3">
          <div className="relative min-w-0 xl:flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A7B68]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari riwayat tugas atau catatan sesi..." className="w-full rounded-full border border-[#EBDCC8] bg-[#FAF6F0] py-3 pl-11 pr-4 text-sm text-[#5C4033] outline-none focus:border-[#F6C85F]" /></div>
          <div className="flex items-center gap-2 overflow-x-auto xl:flex-1"><span className="text-xs font-bold uppercase tracking-wide text-[#8D7060] whitespace-nowrap">Periode</span>{PERIODS.map((option) => <button key={option.id} type="button" onClick={() => setPeriod(option.id)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${period === option.id ? 'bg-[#FCE38A] text-[#5C4033]' : 'bg-[#FAF6F0] text-[#8D7060] hover:bg-[#FFF4D6]'}`}>{option.label}</button>)}</div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto border-t border-[#EBDCC8]/70 pt-3"><span className="text-xs font-bold uppercase tracking-wide text-[#8D7060] whitespace-nowrap">Status Sesi</span>{STATUSES.map((option) => <button key={option.id} type="button" onClick={() => setStatus(option.id)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${status === option.id ? 'bg-[#FCE38A] text-[#5C4033]' : 'bg-[#FAF6F0] text-[#8D7060] hover:bg-[#FFF4D6]'}`}>{option.label}</button>)}</div>
      </section>

      <div className="space-y-6">
        {Object.values(groups).length === 0 ? <div className="rounded-3xl border border-[#EBDCC8] bg-[#FFFBF5] py-12 text-center text-sm text-[#8D7060]">Belum ada aktivitas pada filter ini.</div> : Object.values(groups).map((group) => (
          <section key={group.title}>
            <div className="flex items-center justify-between mb-3"><h2 className="font-semibold text-[#5C4033]">{group.title}</h2><span className="text-xs text-[#8D7060]">{group.rows.length} sesi selesai</span></div>
            <div className="space-y-3">{group.rows.map((row) => { const info = TYPE_INFO[row.type] ?? TYPE_INFO.focus; const Icon = info.Icon; const durationLabel = `${info.session} (${row.duration ?? '-'}m)`; return <article key={row.key} className="rounded-3xl border border-[#EBDCC8] bg-white p-4 sm:p-5 shadow-sm flex items-start gap-3 sm:gap-4"><div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center ${info.icon}`}><Icon className="w-5 h-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="px-2.5 py-1 rounded-full bg-[#FAF6F0] text-[#765949] text-[11px] font-semibold">{durationLabel}</span><span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${info.status}`}>{info.label}</span></div><h3 className="mt-2 font-bold text-[#5C4033] truncate">{row.name}</h3><p className="mt-1 text-xs text-[#8D7060]">{row.description}</p></div><div className="shrink-0 lg:text-right"><p className="flex items-center gap-1 text-xs font-semibold text-[#765949] lg:justify-end"><Clock3 className="w-3.5 h-3.5" />{row.time} WIB</p><p className="mt-1 text-[11px] text-[#8D7060]">{row.isBreak ? 'Jeda Pulih Energi' : 'Kepadatan: Fokus Penuh'}</p></div></div><div className="mt-3 flex flex-wrap items-center gap-2"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_STYLE[row.category] ?? 'bg-[#FDE9A9] text-[#8B6A25]'}`}>#{row.category}</span>{row.tags.map((tag) => <span key={tag} className="px-2.5 py-1 rounded-full bg-[#E5DEFF] text-[#6356A8] text-xs font-semibold">#{tag}</span>)}<span className="text-[11px] text-[#8D7060]">• {row.ambient}</span></div></div></article>; })}</div>
          </section>
        ))}
      </div>
      <button type="button" className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF6F0] border border-[#EBDCC8] text-sm font-semibold text-[#765949] hover:bg-[#FFF4D6] transition-colors"><CalendarDays className="w-4 h-4" /> Muat Catatan Lebih Awal</button>
    </div>
  );
}
