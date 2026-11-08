import React, { useState } from 'react';
import { Sliders, Volume2, RotateCcw, Check, Play, Minus, Plus, Music, Clock } from 'lucide-react';
import { DEFAULT_SETTINGS, SOUND_OPTIONS, playAlarm } from '../settings';

const PRESETS = [
  { label: '25/5', values: { focusTime: 25, shortBreak: 5, longBreak: 15 } },
  { label: '50/10', values: { focusTime: 50, shortBreak: 10, longBreak: 20 } },
];

const card =
  'bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-surface-container-high/40';

function SectionTitle({ Icon, children, aside }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 font-headline-sm text-headline-sm font-semibold text-on-surface">
        {Icon ? <Icon className="w-[18px] h-[18px] text-primary" /> : <span className="w-2 h-2 rounded-full bg-primary-container" />}
        <span>{children}</span>
      </div>
      {aside && <span className="text-xs text-on-surface-variant font-medium">{aside}</span>}
    </div>
  );
}

function Stepper({ label, value, onChange }) {
  const btn =
    'w-8 h-8 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high shadow-xs flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors active:scale-95';
  return (
    <div className="p-space-md bg-surface-container-low/70 rounded-xl border border-surface-container-high/60 space-y-2 text-center">
      <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
      <div className="flex items-center justify-between px-2 py-1.5 bg-surface-container rounded-lg">
        <button type="button" aria-label={`Kurangi ${label}`} onClick={() => onChange(Math.max(1, value - 1))} className={btn}>
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-mono font-bold text-lg text-on-surface tabular-nums">{value}</span>
        <button type="button" aria-label={`Tambah ${label}`} onClick={() => onChange(Math.min(180, value + 1))} className={btn}>
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 p-space-md bg-surface-container-low/70 rounded-xl border border-surface-container-high/60">
      <div className="min-w-0">
        <p className="font-label-md text-label-md text-on-surface font-semibold">{label}</p>
        {description && <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container/40 ${
          checked ? 'bg-primary-container' : 'bg-outline-variant'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsTab({ settings = DEFAULT_SETTINGS, onSave }) {
  const [saved, setSaved] = useState(settings);
  const [draft, setDraft] = useState(saved);
  const [notice, setNotice] = useState('');

  const set = (key) => (value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setNotice('');
  };
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const handleSave = () => {
    onSave?.(draft);
    setSaved(draft);
    setNotice('Pengaturan berhasil disimpan.');
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-space-lg pb-space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm border border-surface-container-high/40">
        <div>
          <div className="flex items-center gap-1.5 text-primary text-[11px] font-bold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferensi Ringkas</span>
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight mt-1">Pengaturan</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Sesuaikan durasi waktu, suara bel, dan preferensi tampilan kerja Anda.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-full self-start sm:self-auto">
          {PRESETS.map(({ label, values }) => {
            const active = Object.entries(values).every(([k, v]) => draft[k] === v);
            return (
              <button
                key={label}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, ...values }))}
                className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all ${
                  active ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Durasi */}
      <div className={`${card} space-y-space-md`}>
        <SectionTitle Icon={Clock} aside={`Siklus: ${draft.focusTime} • ${draft.shortBreak} • ${draft.longBreak}`}>
          Durasi Waktu (Menit)
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
          <Stepper label="Fokus" value={draft.focusTime} onChange={set('focusTime')} />
          <Stepper label="Istirahat Pendek" value={draft.shortBreak} onChange={set('shortBreak')} />
          <Stepper label="Istirahat Panjang" value={draft.longBreak} onChange={set('longBreak')} />
        </div>
      </div>

      {/* Suara */}
      <div className={`${card} space-y-space-md`}>
        <SectionTitle Icon={Volume2}>Suara &amp; Volume Alarm</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md items-center">
          <div className="flex items-center gap-3 px-space-md py-2.5 bg-surface-container-low/70 rounded-xl border border-surface-container-high/60">
            <Music className="w-4 h-4 text-primary shrink-0" />
            <select
              value={draft.sound}
              onChange={(e) => set('sound')(e.target.value)}
              aria-label="Pilih suara alarm"
              className="flex-1 min-w-0 bg-transparent text-xs font-semibold text-on-surface focus:outline-none cursor-pointer"
            >
              {SOUND_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-surface text-on-surface">
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              title="Putar pratinjau suara"
              aria-label="Putar pratinjau suara"
              onClick={() => playAlarm(draft.sound, draft.volume)}
              className="p-1.5 rounded-lg bg-primary-container/10 text-primary hover:bg-primary-container/20 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          <div className="flex items-center gap-4 px-space-md py-3 bg-surface-container-low/70 rounded-xl border border-surface-container-high/60">
            <Volume2 className="w-4 h-4 text-on-surface-variant shrink-0" />
            <input
              type="range"
              min="0"
              max="100"
              value={draft.volume}
              onChange={(e) => set('volume')(Number(e.target.value))}
              aria-label="Volume alarm"
              className="flex-1 accent-primary-container cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-primary w-10 text-right">{draft.volume}%</span>
          </div>
        </div>
      </div>

      {/* Preferensi otomatis */}
      <div className={`${card} space-y-space-md`}>
        <SectionTitle Icon={Sliders}>Preferensi Otomatis</SectionTitle>
        <div className="space-y-space-sm">
          <Toggle
            label="Mulai istirahat otomatis"
            description="Lanjut ke sesi istirahat begitu sesi fokus berakhir."
            checked={draft.autoBreak}
            onChange={set('autoBreak')}
          />
          <Toggle
            label="Notifikasi peramban & judul tab"
            description="Tampilkan sisa waktu di judul tab dan kirim notifikasi saat sesi selesai."
            checked={draft.browserNotif}
            onChange={set('browserNotif')}
          />
        </div>
      </div>

      {/* Aksi */}
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <button
          type="button"
          onClick={() => {
            setDraft(DEFAULT_SETTINGS);
            setNotice('');
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Default
        </button>

        <div className="flex items-center gap-3">
          {notice && (
            <span className="flex items-center gap-1 text-xs font-medium text-tertiary" role="status">
              <Check className="w-3.5 h-3.5" />
              {notice}
            </span>
          )}
          <button
            type="button"
            disabled={!dirty}
            onClick={() => setDraft(saved)}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface-variant disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!dirty}
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary-container hover:bg-[#4338ca] text-on-primary shadow-md shadow-primary-container/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}