import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import TimerCard from './components/TimerCard';
import Scratchpad from './components/Scratchpad';
import TaskManager from './components/TaskManager';
import StatsTab from './components/StatsTab';
import HistoryTab from './components/HistoryTab';
import SettingsTab from './components/SettingsTab';
import Footer from './components/Footer';
import Toast from './components/Toast';
import AmbientSound from './components/AmbientSound';
import WeeklyStats from './components/WeeklyStats';
import { loadSettings, saveSettings, playAlarm, DEFAULT_SETTINGS } from './settings';
import * as db from './db';
import { useAmbient } from './useAmbient';
import AuthScreen, { FullScreenLoader, SupabaseSetupNotice } from './components/AuthScreen';
import { useAuth } from './useAuth';
import { logout } from './auth';
import { isSupabaseConfigured } from './supabase';

const todayAt = (h, m) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
};

const pad = (n) => String(n).padStart(2, '0');
const hhmm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// Setelah sesi fokus ke-4, 8, 12, ... istirahatnya panjang
const nextBreakMode = (completedCount) => (completedCount % 4 === 0 ? 'longBreak' : 'shortBreak');

// ---------- Data lokal (mode tamu) ----------
const loadLocalTasks = () => {
  const saved = localStorage.getItem('pawtime_tasks');
  return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Menyelesaikan wireframe Pawtime desktop & mobile', time: '12:00', priority: 'Tinggi', pomoEst: 4, pomoDone: 3, completed: false },
      { id: 2, text: 'Review feedback klien untuk modul autentikasi', time: '15:30', priority: 'Sedang', pomoEst: 2, pomoDone: 1, completed: false },
      { id: 3, text: 'Dokumentasi token sistem desain dan komponen Tailwind', time: '17:00', priority: 'Rendah', pomoEst: 1, pomoDone: 0, completed: false },
      { id: 4, text: 'Morning standup dan sinkronisasi backlog sprint', time: '09:30', priority: 'Sedang', pomoEst: 1, pomoDone: 1, completed: true },
    ];
};

const loadLocalHistory = () => {
  const saved = localStorage.getItem('pawtime_history');
  return saved ? JSON.parse(saved) : [
      { id: 1, ts: todayAt(11, 0), time: 'Hari ini, 11:00 - 11:25', text: 'Menyelesaikan wireframe Pawtime desktop', category: 'Desain', type: 'focus', duration: 25 },
      { id: 2, ts: todayAt(10, 30), time: 'Hari ini, 10:30 - 10:35', text: 'Istirahat sejenak & hidrasi', category: 'Rehat', type: 'shortBreak', duration: 5 },
      { id: 3, ts: todayAt(10, 5), time: 'Hari ini, 10:05 - 10:30', text: 'Review feedback klien untuk modul autentikasi', category: 'Coding', type: 'focus', duration: 25 },
      { id: 4, ts: todayAt(9, 35), time: 'Hari ini, 09:35 - 10:00', text: 'Dokumentasi token sistem desain dan komponen', category: 'Desain', type: 'focus', duration: 25 },
      { id: 5, ts: todayAt(9, 0), time: 'Hari ini, 09:00 - 09:25', text: 'Morning standup dan sinkronisasi backlog sprint', category: 'Admin', type: 'focus', duration: 25 },
    ];
};

const loadLocalScratch = () => localStorage.getItem('pawtime_scratchpad') || '';

function PawtimeApp({ user, onLogin, onLogout }) {
  const [activeTab, setActiveTab] = useState('timer');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('pawtime_theme') === 'dark');

  // Notifikasi toast melayang
  const [toast, setToast] = useState({ visible: false, title: '', message: '', icon: '✨' });
  const toastTimerRef = useRef(null);
  const showToast = (title, message, icon = '✨') => {
    setToast({ visible: true, title, message, icon });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3200);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('pawtime_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    showToast(
      next ? 'Mode Gelap Aktif' : 'Mode Terang Santai Aktif',
      next ? 'Nuansa malam yang hangat dan nyaman untuk mata.' : 'Kembali ke keceriaan warna pastel hangat.',
      next ? '🌙' : '☀️',
    );
  };

  const [settings, setSettings] = useState(loadSettings);
  const [timer, setTimer] = useState(() => settings.focusTime * 60);
  const [originalTime, setOriginalTime] = useState(() => settings.focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState('focus');
  const [completedSessions, setCompletedSessions] = useState(0);

  const [tasks, setTasks] = useState(loadLocalTasks);
  
  const [activeTaskLabel, setActiveTaskLabel] = useState('');
  const [cloudReady, setCloudReady] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [ambientSound, setAmbientSound] = useState('rain');
  const [ambientPreview, setAmbientPreview] = useState(false);
  const lastAmbientRef = useRef('rain');
  const previewTimerRef = useRef(null);

  const [historyLogs, setHistoryLogs] = useState(loadLocalHistory);

  const [scratchpad, setScratchpad] = useState(loadLocalScratch);

  const reportError = (e, msg = 'Gagal menyinkronkan data ke server. Periksa koneksi lalu coba lagi.') => {
    console.error(e);
    setSyncError(msg);
  };

  useEffect(() => {
    if (!syncError) return undefined;
    const id = setTimeout(() => setSyncError(''), 6000);
    return () => clearTimeout(id);
  }, [syncError]);

  // Terapkan durasi baru hanya jika timer belum disentuh
  const applyDurations = (next) => {
    if (!isRunning && timer === originalTime) {
      const minutes = { focus: next.focusTime, shortBreak: next.shortBreak, longBreak: next.longBreak }[currentMode];
      setOriginalTime(minutes * 60);
      setTimer(minutes * 60);
    }
  };

  // Masuk: muat data akun dari Supabase. Keluar: kembali ke data lokal (mode tamu).
  const userId = user?.id;
  useEffect(() => {
    let cancelled = false;
    setCloudReady(false);

    if (!userId) {
      setTasks(loadLocalTasks());
      setHistoryLogs(loadLocalHistory());
      setScratchpad(loadLocalScratch());
      return undefined;
    }

    (async () => {
      try {
        const [t, h, p] = await Promise.all([db.fetchTasks(userId), db.fetchSessions(userId), db.fetchProfile(user)]);
        if (cancelled) return;
        setTasks(t);
        setHistoryLogs(h);
        setScratchpad(p.scratchpad ?? '');
        if (p.settings) {
          const merged = { ...DEFAULT_SETTINGS, ...p.settings };
          setSettings(merged);
          saveSettings(merged);
          applyDurations(merged);
        }
        setCloudReady(true);
      } catch (e) {
        if (!cancelled) reportError(e, 'Gagal memuat data akun. Pastikan SQL di Supabase sudah dijalankan.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Simpan catatan cepat ke akun (ditunda 0,8 detik setelah berhenti mengetik)
  useEffect(() => {
    if (!userId || !cloudReady) return undefined;
    const id = setTimeout(() => db.saveProfile(user, { scratchpad }).catch(reportError), 800);
    return () => clearTimeout(id);
  }, [scratchpad, userId, cloudReady]);

  const durations = {
    focus: settings.focusTime,
    shortBreak: settings.shortBreak,
    longBreak: settings.longBreak,
  };

  // Suara ambien menyala saat sesi fokus berjalan (atau sebagai pratinjau 4 detik)
  useAmbient({ sound: ambientSound, playing: (isRunning && currentMode === 'focus') || ambientPreview });

  const chooseAmbient = (id) => {
    setAmbientSound(id);
    if (id !== 'mute') {
      lastAmbientRef.current = id;
      setAmbientPreview(true);
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = setTimeout(() => setAmbientPreview(false), 4000);
    } else {
      clearTimeout(previewTimerRef.current);
      setAmbientPreview(false);
    }
  };

  const toggleAmbient = () => chooseAmbient(ambientSound === 'mute' ? lastAmbientRef.current : 'mute');

  const timerRef = useRef(timer);
  const endRef = useRef(0);
  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

  // Hitung mundur berbasis jam sistem: tetap akurat walau tab di latar belakang
  useEffect(() => {
    if (!isRunning) return;
    endRef.current = Date.now() + timerRef.current * 1000;
    const id = setInterval(() => {
      setTimer(Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000)));
    }, 250);
    return () => clearInterval(id);
  }, [isRunning]);

  const addHistory = (entry) => {
    setHistoryLogs((logs) => [{ id: Date.now(), ts: Date.now(), ...entry }, ...logs]);
    if (user) db.insertSession(entry, user.id).catch(reportError);
  };

  // Saat waktu habis: bunyikan alarm, catat riwayat, hitung Pomo, pindah mode
  useEffect(() => {
    if (!isRunning || timer !== 0) return;

    const minutes = Math.round(originalTime / 60);
    const end = new Date();
    const start = new Date(end.getTime() - minutes * 60000);
    const range = `Hari ini, ${hhmm(start)} - ${hhmm(end)}`;

    playAlarm(settings.sound, settings.volume, 3);
    if (settings.browserNotif && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Pawtime', {
        body: currentMode === 'focus' ? 'Sesi fokus selesai. Saatnya istirahat!' : 'Istirahat selesai. Siap fokus lagi?',
      });
    }

    if (currentMode === 'focus') {
      const activeTask = tasks.find((t) => t.text === activeTaskLabel);
      if (user && activeTask && !activeTask.completed) {
        db.updateTask(activeTask.id, { pomoDone: (activeTask.pomoDone ?? 0) + 1 }).catch(reportError);
      }
      addHistory({ type: 'focus', category: activeTask?.category || 'Fokus', taskId: activeTask?.id, duration: minutes, time: range, text: activeTaskLabel || 'Sesi fokus selesai' });
      setCompletedSessions((c) => c + 1);
      if (activeTaskLabel) {
        setTasks((ts) =>
          ts.map((t) =>
            t.text === activeTaskLabel && !t.completed ? { ...t, pomoDone: (t.pomoDone ?? 0) + 1 } : t,
          ),
        );
      }
      setMode(nextBreakMode(completedSessions + 1), undefined, settings.autoBreak);
    } else {
      addHistory({
        type: currentMode,
        category: 'Rehat',
        duration: minutes,
        time: range,
        text: currentMode === 'shortBreak' ? 'Istirahat pendek selesai' : 'Istirahat panjang selesai',
      });
      setMode('focus');
    }
  }, [timer, isRunning]);

  // Judul tab menampilkan sisa waktu saat timer berjalan
  useEffect(() => {
    document.title =
      settings.browserNotif && isRunning ? `${formatTime(timer)} · Pawtime` : 'Pawtime - Fokus & Produktivitas';
  }, [timer, isRunning, settings.browserNotif]);

  useEffect(() => {
    if (user) return;
    localStorage.setItem('pawtime_history', JSON.stringify(historyLogs));
  }, [historyLogs, user]);

  // Pintasan keyboard (sesuai footer): Spasi = mulai/jeda, R = atur ulang, S = lewati
  useEffect(() => {
    const onKey = (e) => {
      if (activeTab !== 'timer' || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = e.target.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(tag) || e.target.isContentEditable) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      } else if (e.key === 'r' || e.key === 'R') {
        resetTimer();
      } else if (e.key === 's' || e.key === 'S') {
        skipTimer();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (user) return;
    localStorage.setItem('pawtime_tasks', JSON.stringify(tasks));
  }, [tasks, user]);

  useEffect(() => {
    if (user) return;
    localStorage.setItem('pawtime_scratchpad', scratchpad);
  }, [scratchpad, user]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Pindah mode. Tanpa `minutes`, durasi diambil dari Pengaturan.
  const setMode = (mode, minutes = durations[mode], autoStart = false) => {
    setCurrentMode(mode);
    setOriginalTime(minutes * 60);
    setTimer(minutes * 60);
    setIsRunning(autoStart);
  };

  const toggleTimer = () => {
    if (!isRunning && settings.browserNotif && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning((r) => !r);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimer(originalTime);
  };

  // Lewati: fokus -> istirahat, istirahat -> fokus (tidak dihitung sebagai sesi selesai)
  const skipTimer = () => {
    if (currentMode === 'focus') setMode(nextBreakMode(completedSessions + 1));
    else setMode('focus');
  };

  const handleSaveSettings = (next) => {
    setSettings(next);
    saveSettings(next);
    applyDurations(next);
    if (user) db.saveProfile(user, { settings: next }).catch(reportError);
  };

  // Tambah/kurangi waktu sesi (dalam detik), minimal 1 menit
  const adjustTime = (delta) => {
    const nextOriginal = Math.max(60, originalTime + delta);
    const applied = nextOriginal - originalTime;
    const nextTimer = Math.max(1, timer + applied);
    setOriginalTime(nextOriginal);
    setTimer(nextTimer);
    if (isRunning) endRef.current = Date.now() + nextTimer * 1000;
  };

  const addTask = async (newTask) => {
    if (!user) {
      setTasks((ts) => [...ts, newTask]);
      return;
    }
    try {
      const saved = await db.insertTask(newTask, user.id);
      setTasks((ts) => [...ts, saved]);
    } catch (e) {
      reportError(e, 'Gagal menyimpan tugas ke akun.');
    }
  };

  const toggleTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const completed = !task.completed;
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, completed } : t)));
    if (user) db.updateTask(id, { completed }).catch(reportError);
    if (completed) {
      addHistory({
        type: 'task',
        taskId: user ? id : undefined,
        category: task.category || 'Tugas',
        text: `Menyelesaikan tugas: ${task.text}`,
        time: `Hari ini, ${hhmm(new Date())}`,
      });
    }
  };

  const deleteTask = (id) => {
    setTasks((ts) => ts.filter((t) => t.id !== id));
    if (user) db.deleteTask(id).catch(reportError);
  };

  const selectTask = (task) => {
    setActiveTaskLabel(task.text);
  };

  return (
    <div className="bg-[#FDF6EC] dark:bg-[#181520] text-[#43281C] dark:text-[#F7F3EA] font-sans antialiased selection:bg-[#FED7AA] selection:text-[#43281C] min-h-screen flex flex-col w-full overflow-x-hidden transition-colors duration-300">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={darkMode} 
        onToggleTheme={toggleTheme} 
        ambientSound={ambientSound} 
        ambientMuted={ambientSound === 'mute'} 
        onToggleAmbient={toggleAmbient} 
        mood={isRunning ? (currentMode === 'focus' ? 'Fokus Penuh' : 'Rehat Santai') : 'Tenang'} 
        user={user} 
        onLogin={onLogin} 
        onLogout={onLogout} 
      />

      <main className="w-full flex-1 max-w-[1280px] mx-auto px-4 md:px-8 py-6 space-y-6">
        {activeTab === 'timer' && (
          <div className="space-y-6">
            <ModeSelector 
              currentMode={currentMode} 
              setMode={setMode} 
              completedSessions={completedSessions} 
              durations={durations} 
            />

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <TimerCard 
                  timer={timer} 
                  originalTime={originalTime} 
                  currentMode={currentMode} 
                  formatTime={formatTime} 
                  isRunning={isRunning} 
                  toggleTimer={toggleTimer} 
                  resetTimer={resetTimer} 
                  skipTimer={skipTimer} 
                  adjustTime={adjustTime} 
                  activeTaskLabel={activeTaskLabel} 
                />
                <AmbientSound 
                  ambientSound={ambientSound} 
                  setAmbientSound={chooseAmbient} 
                />
              </div>

              <aside className="space-y-6">
                <TaskManager 
                  tasks={tasks} 
                  addTask={addTask} 
                  toggleTask={toggleTask} 
                  deleteTask={deleteTask} 
                  selectTask={selectTask} 
                  activeTaskLabel={activeTaskLabel} 
                />
                <Scratchpad 
                  scratchpad={scratchpad} 
                  setScratchpad={setScratchpad} 
                />
              </aside>
            </div>

            <WeeklyStats 
              completedSessions={completedSessions} 
              setActiveTab={setActiveTab} 
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <StatsTab completedSessions={completedSessions} />
        )}

        {activeTab === 'history' && (
          <HistoryTab historyLogs={historyLogs} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab settings={settings} onSave={handleSaveSettings} />
        )}
      </main>

      <Footer showToast={showToast} />

      <Toast {...toast} />

      {syncError && (
        <div
          role="alert"
          className="fixed bottom-4 right-4 z-[90] max-w-xs bg-error-container text-on-error-container text-xs font-medium px-4 py-3 rounded-xl shadow-lg"
        >
          {syncError}
        </div>
      )}
    </div>
  );
}

// Halaman depan = aplikasi (mode tamu). Layar login hanya muncul jika pengunjung menekan "Masuk".
export default function App() {
  const { user, loading, recovery, finishRecovery } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  // Begitu berhasil masuk, tutup layar login
  useEffect(() => {
    if (user) setShowAuth(false);
  }, [user]);

  if (loading) return <FullScreenLoader />;
  if (recovery) return <AuthScreen recovery onRecoveryDone={finishRecovery} />;

  return (
    <>
      <PawtimeApp user={user} onLogin={() => setShowAuth(true)} onLogout={logout} />

      {/* Layar login sebagai lapisan di atas aplikasi, jadi timer yang sedang jalan tidak terhenti */}
      {showAuth && !user && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-surface">
          {isSupabaseConfigured ? (
            <AuthScreen onBack={() => setShowAuth(false)} />
          ) : (
            <SupabaseSetupNotice onBack={() => setShowAuth(false)} />
          )}
        </div>
      )}
    </>
  );
}