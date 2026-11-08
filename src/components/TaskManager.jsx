import React, { useState, useEffect, useRef } from 'react';
import { AlarmClock, Flag, Plus, Check, Timer, CircleCheck, Trash2, Calendar, Tag, X } from 'lucide-react';

const FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'active', label: 'Aktif' },
  { id: 'completed', label: 'Selesai' },
];

// Warna badge prioritas & warna jam, mengikuti desain
const PRIORITY_STYLE = {
  Tinggi: { badge: 'bg-[#FCE0E1] text-[#9B4D52]', time: 'text-[#9B4D52]', dot: 'bg-[#E88B91]' },
  Sedang: { badge: 'bg-[#DDF4E8] text-[#39765A]', time: 'text-[#39765A]', dot: 'bg-[#72C99A]' },
  Rendah: { badge: 'bg-[#FDE9A9] text-[#8B6A25]', time: 'text-[#8B6A25]', dot: 'bg-[#E6B94F]' },
};

// Label bawaan; label yang pernah kamu buat otomatis ikut muncul di daftar
const DEFAULT_LABELS = ['Kerja', 'Belajar', 'Pribadi', 'Kesehatan', 'Rumah'];
const POMO_OPTIONS = [1, 2, 3, 4, 5, 6, 8];

const pad = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const nowHHMM = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISO(d);
};

// "Hari ini" / "Besok" / "5 Nov"
function dayLabel(iso) {
  if (!iso) return '';
  if (iso === addDays(0)) return 'Hari ini';
  if (iso === addDays(1)) return 'Besok';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

const chipBtn =
  'w-full h-10 px-3 rounded-full bg-[#FAF6F0] hover:bg-[#FFF4D6] text-[#765949] font-label-md text-label-md flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F6C85F]/50';

const menuBox =
  'absolute left-0 top-full mt-1.5 z-30 min-w-[12rem] bg-surface-container-lowest border border-surface-container-high/70 rounded-xl shadow-lg p-1.5';

const menuItem = (active) =>
  `w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-colors ${
    active ? 'bg-primary-fixed text-on-primary-fixed' : 'text-on-surface hover:bg-surface-container'
  }`;

export default function TaskManager({ tasks, addTask, toggleTask, deleteTask, selectTask, activeTaskLabel }) {
  const [filter, setFilter] = useState('all');

  // --- state form ---
  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState('');
  const [pomo, setPomo] = useState(1);
  const [priority, setPriority] = useState('Tinggi');
  const [date, setDate] = useState(() => addDays(0));
  const [time, setTime] = useState(nowHHMM);
  const [label, setLabel] = useState('');
  const [addMore, setAddMore] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [menu, setMenu] = useState(null); // 'pomo' | 'priority' | 'due' | 'label' | null

  const formRef = useRef(null);
  const inputRef = useRef(null);
  const firstRender = useRef(true);

  // Tutup menu saat klik di luar atau tekan Esc
  useEffect(() => {
    if (!menu) return undefined;
    const onDown = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) setMenu(null);
    };
    const onKey = (e) => e.key === 'Escape' && setMenu(null);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  // Fokus ke kolom judul saat form dibuka lagi (bukan saat pertama render)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (open) inputRef.current?.focus();
  }, [open]);

  const resetFields = () => {
    setTitle('');
    setPomo(1);
    setPriority('Tinggi');
    setDate(addDays(0));
    setTime(nowHHMM());
    setLabel('');
    setMenu(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      inputRef.current?.focus();
      return;
    }
    addTask({
      id: Date.now(),
      text: title.trim(),
      date,
      time: time || nowHHMM(),
      priority,
      ...(label ? { category: label } : {}),
      pomoEst: pomo,
      pomoDone: 0,
      completed: false,
    });
    setMenu(null);
    if (addMore) {
      setTitle('');
      inputRef.current?.focus();
    } else {
      resetFields();
      setOpen(false);
    }
  };

  const doneCount = tasks.filter((t) => t.completed).length;
  const visible = tasks.filter((t) =>
    filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true,
  );

  const toggleMenu = (name) => setMenu((m) => (m === name ? null : name));
  const labelOptions = [...new Set([...DEFAULT_LABELS, ...tasks.map((t) => t.category).filter(Boolean)])];

  const applyCustomLabel = () => {
    const value = customLabel.trim().slice(0, 20);
    if (!value) return;
    setLabel(value);
    setCustomLabel('');
    setMenu(null);
  };
  const priStyle = PRIORITY_STYLE[priority] ?? PRIORITY_STYLE.Sedang;
  const dueText = `${dayLabel(date)}, ${time || '--:--'}`;

  return (
      <div className="bg-[#FFFBF5] rounded-[32px] p-4 sm:p-6 shadow-sm border border-[#EBDCC8] flex flex-col space-y-space-md">
       <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h2 className="min-w-0 font-headline-sm text-headline-sm text-[#5C4033] font-semibold">Daftar Tugas Santai</h2>
           <span className="bg-[#FDE68A] text-[#5C4033] font-label-sm text-label-sm px-2.5 py-1 rounded-full font-bold whitespace-nowrap">
             {doneCount}/{tasks.length} Selesai
           </span>
         </div>
          <div className="flex flex-wrap items-center gap-1 self-start bg-[#FAF6F0] p-1 rounded-full border border-[#EBDCC8] max-w-full">
           {FILTERS.map(({ id, label: l }) => (
             <button
               key={id}
               type="button"
               onClick={() => setFilter(id)}
               className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-all ${
                 filter === id
                   ? 'bg-white text-[#5C4033] font-semibold shadow-sm'
                   : 'text-[#8D7060] hover:bg-[#FFF4D6] hover:text-[#5C4033]'
               }`}
             >
               {l}
             </button>
           ))}
         </div>
       </div>

      {/* Form tambah tugas */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full h-12 px-4 rounded-xl bg-surface-container-low/70 hover:bg-surface-container-low border border-dashed border-surface-container-highest text-on-surface-variant hover:text-on-surface font-body-md text-body-md flex items-center gap-2 transition-colors"
        >
          <Plus className="w-[18px] h-[18px] text-primary" />
          Tugas baru…
        </button>
      ) : (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-[#FFFBF5] border border-[#EBDCC8] rounded-3xl p-3 sm:p-4 flex flex-col gap-3 shadow-sm"
        >
          {/* Judul + tombol tutup */}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tugas baru..."
              className="flex-1 min-w-0 bg-white rounded-2xl px-4 py-3 font-body-lg text-body-lg text-[#5C4033] placeholder:text-[#9A7B68]/60 focus:outline-none"
            />
            <button
              type="button"
              aria-label="Tutup form"
              title="Tutup form"
              onClick={() => {
                setMenu(null);
                setOpen(false);
              }}
              className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Chip pilihan */}
          <div className="grid grid-cols-2 gap-2">
            {/* Estimasi Pomodoro */}
            <div className="relative">
              <button type="button" className={chipBtn} onClick={() => toggleMenu('pomo')} aria-expanded={menu === 'pomo'}>
                <Timer className="w-[18px] h-[18px] text-primary" />
                <span className="truncate">{pomo} Pomo</span>
              </button>
              {menu === 'pomo' && (
                <div className={menuBox}>
                  <p className="px-2.5 pt-1 pb-1.5 text-[11px] uppercase tracking-wider text-on-surface-variant">
                    Estimasi sesi fokus
                  </p>
                  <div className="grid grid-cols-4 gap-1">
                    {POMO_OPTIONS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          setPomo(n);
                          setMenu(null);
                        }}
                        className={`h-9 rounded-lg text-xs font-bold font-mono transition-colors ${
                          pomo === n
                            ? 'bg-primary-container text-on-primary'
                            : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Prioritas */}
            <div className="relative">
              <button type="button" className={chipBtn} onClick={() => toggleMenu('priority')} aria-expanded={menu === 'priority'}>
                <Flag className="w-[18px] h-[18px] text-on-surface-variant" />
                <span className="truncate">Prioritas {priority}</span>
                <span className={`ml-auto w-2 h-2 rounded-full shrink-0 ${priStyle.dot}`} />
              </button>
              {menu === 'priority' && (
                <div className={menuBox}>
                  {Object.keys(PRIORITY_STYLE).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPriority(p);
                        setMenu(null);
                      }}
                      className={menuItem(priority === p)}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${PRIORITY_STYLE[p].dot}`} />
                      Prioritas {p}
                      {priority === p && <Check className="w-3.5 h-3.5 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tanggal & jam */}
            <div className="relative">
              <button type="button" className={chipBtn} onClick={() => toggleMenu('due')} aria-expanded={menu === 'due'}>
                <Calendar className="w-[18px] h-[18px] text-on-surface-variant" />
                <span className="truncate">{dueText}</span>
              </button>
              {menu === 'due' && (
                <div className={`${menuBox} w-64 p-3 space-y-2.5`}>
                  <div className="flex gap-1.5">
                    {[
                      { l: 'Hari ini', v: addDays(0) },
                      { l: 'Besok', v: addDays(1) },
                    ].map(({ l, v }) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setDate(v)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          date === v
                            ? 'bg-primary-container text-on-primary'
                            : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center justify-between gap-2 text-xs text-on-surface-variant">
                    Tanggal
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-surface-container rounded-md px-2 py-1 text-on-surface font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-container/50 scheme-light dark:scheme-dark"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <AlarmClock className="w-3.5 h-3.5 text-primary" />
                      Jam (WIB)
                    </span>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="bg-surface-container rounded-md px-2 py-1 text-on-surface font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-container/50 scheme-light dark:scheme-dark"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Label */}
            <div className="relative">
              <button type="button" className={chipBtn} onClick={() => toggleMenu('label')} aria-expanded={menu === 'label'}>
                <Tag className="w-[18px] h-[18px] text-on-surface-variant" />
                <span className="truncate">{label || 'Label'}</span>
              </button>
              {menu === 'label' && (
                <div className={`${menuBox} left-auto right-0 w-56`}>
                  <div className="max-h-48 overflow-y-auto">
                  {labelOptions.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => {
                        setLabel(label === l ? '' : l);
                        setMenu(null);
                      }}
                      className={menuItem(label === l)}
                    >
                      <span className="truncate">{l}</span>
                      {label === l && <Check className="w-3.5 h-3.5 ml-auto shrink-0" />}
                    </button>
                  ))}
                  </div>
                  <input
                    type="text"
                    value={customLabel}
                    maxLength={20}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        applyCustomLabel();
                      }
                    }}
                    placeholder="+ Label baru, tekan Enter"
                    className="w-full mt-1 px-2.5 py-2 rounded-lg bg-surface-container text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary-container/50"
                  />
                  {label && (
                    <button
                      type="button"
                      onClick={() => {
                        setLabel('');
                        setMenu(null);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg text-left text-xs text-on-surface-variant hover:bg-surface-container"
                    >
                      Tanpa label
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer: tambah lebih banyak + tombol Tambah */}
          <div className="flex items-center justify-end gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant cursor-pointer select-none">
              <input
                type="checkbox"
                checked={addMore}
                onChange={(e) => setAddMore(e.target.checked)}
                className="w-4 h-4 rounded accent-primary-container cursor-pointer"
              />
              Tambah lebih banyak
            </label>
            <button
              type="submit"
              className="px-5 h-10 bg-[#FCE38A] hover:bg-[#F8D96F] text-[#5C4033] rounded-full font-label-lg text-label-lg font-semibold shadow-xs transition-all active:scale-95"
            >
              Tambah
            </button>
          </div>
        </form>
      )}

      {/* Daftar tugas */}
      <div className="space-y-space-sm pt-space-xs max-h-[560px] overflow-y-auto">
        {visible.length === 0 ? (
          <p className="text-xs text-on-surface-variant text-center py-6">
            {tasks.length === 0 ? 'Belum ada tugas terjadwal.' : 'Tidak ada tugas pada filter ini.'}
          </p>
        ) : (
          visible.map((t) => {
            const style = PRIORITY_STYLE[t.priority] ?? PRIORITY_STYLE.Sedang;
            const est = t.pomoEst ?? 1;
            const done = t.pomoDone ?? 0;
            const isActive = !t.completed && activeTaskLabel === t.text;
            const showDay = t.date && t.date !== addDays(0);

            return (
              <div
                key={t.id}
className={`group flex items-start gap-space-sm p-space-md rounded-3xl transition-all border-2 ${
                   t.completed
                     ? 'bg-[#FAF6F0] opacity-70 border-[#EBDCC8]'
                     : 'bg-white hover:bg-[#FFFDF9] shadow-sm border-[#EBDCC8]'
                 } ${isActive ? 'border-[#F6C85F] ring-2 ring-[#F6C85F]/25' : ''}`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={t.completed}
                  aria-label={t.completed ? 'Tandai belum selesai' : 'Tandai selesai'}
                  onClick={() => toggleTask(t.id)}
                  className={`mt-0.5 w-5 h-5 shrink-0 rounded-md flex items-center justify-center transition-all ${
                    t.completed
                      ? 'bg-tertiary text-on-tertiary dark:text-surface shadow-xs'
                      : 'bg-surface-container-highest hover:bg-primary-container/20 text-transparent'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${t.completed ? 'animate-scale-in' : ''}`} strokeWidth={3} />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`font-body-md text-body-md font-medium leading-snug ${
                        t.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'
                      }`}
                    >
                      {t.text}
                    </p>
                    {!t.completed && (
                      <button
                        type="button"
                        onClick={() => selectTask(t)}
                        title="Jadikan target fokus"
                        className={`shrink-0 text-xs transition-colors ${
                           isActive ? 'text-[#B7791F] font-semibold hover:underline' : 'text-[#8D7060] font-semibold hover:text-[#B7791F]'

                        }`}
                      >
                        Fokus ini
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteTask(t.id)}
                      title="Hapus tugas"
                      aria-label="Hapus tugas"
                      className="shrink-0 p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-error-container/50 transition-all sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {t.completed ? (
                      <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant font-medium">
                        Selesai
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-medium ${style.badge}`}>
                        Prioritas {t.priority}
                      </span>
                    )}

                    {t.category && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface-variant font-medium">
                        <Tag className="w-3 h-3" />
                        {t.category}
                      </span>
                    )}

                    <span
                      className={`flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold ${
                        t.completed ? 'text-on-surface-variant' : style.time
                      }`}
                    >
                      <AlarmClock className="w-3.5 h-3.5" />
                      {showDay ? `${dayLabel(t.date)}, ` : ''}
                      {t.time} WIB
                    </span>

                    {t.completed ? (
                      <span className="flex items-center gap-1 font-body-sm text-body-sm text-tertiary">
                        <CircleCheck className="w-[15px] h-[15px]" />
                        {est}/{est} Selesai
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
                        <Timer className="w-[15px] h-[15px] text-primary" />
                        {done}/{est} Pomo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}