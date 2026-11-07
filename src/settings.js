// Pengaturan aplikasi + pemutar alarm, dipakai bersama oleh App dan SettingsTab

const STORAGE_KEY = 'pawtime_settings';

export const DEFAULT_SETTINGS = {
  focusTime: 25,
  shortBreak: 5,
  longBreak: 15,
  sound: 'Lonceng Zen (Disarankan)',
  volume: 75,
  autoBreak: true,
  browserNotif: true,
};

export const SOUND_OPTIONS = ['Lonceng Zen (Disarankan)', 'Bip Digital', 'Gong Lembut', 'Kicau Burung'];

// Nada (Hz) per suara, dibuat langsung dengan Web Audio
const SOUND_PITCH = {
  'Lonceng Zen (Disarankan)': 880,
  'Bip Digital': 1200,
  'Gong Lembut': 330,
  'Kicau Burung': 1568,
};

export function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* penyimpanan penuh / diblokir */
  }
}

// Bunyikan alarm sebanyak `repeats` kali. Volume 0 = senyap.
export function playAlarm(sound, volume, repeats = 1) {
  if (!volume) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const pitch = SOUND_PITCH[sound] ?? 880;
    for (let i = 0; i < repeats; i += 1) {
      const t = ctx.currentTime + i * 0.7;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = pitch;
      gain.gain.setValueAtTime((volume / 100) * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    }
    setTimeout(() => ctx.close(), repeats * 700 + 300);
  } catch {
    /* peramban tidak mendukung audio */
  }
}