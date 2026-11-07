import { supabase } from './supabase';

// Jembatan antara bentuk data di aplikasi dan kolom tabel Supabase:
//   tasks             : title, completed, priority, time_label, due_date, category,
//                       pomodoros_needed, pomodoros_completed, created_at
//   pomodoro_sessions : task_id, session_title, category, session_type, duration_minutes, completed_at
//   profiles          : id, email, full_name, scratchpad, settings, updated_at

const pad = (n) => String(n).padStart(2, '0');
const hhmm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function dayText(d) {
  const now = new Date();
  if (sameDay(d, now)) return 'Hari ini';
  const yesterday = new Date(now.getTime() - 86400000);
  if (sameDay(d, yesterday)) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

// ---------- Tugas ----------
const taskFromRow = (r) => ({
  id: r.id,
  text: r.title,
  completed: Boolean(r.completed),
  priority: r.priority || 'Sedang',
  time: r.time_label || '12:00',
  date: r.due_date || undefined,
  category: r.category || undefined,
  pomoEst: r.pomodoros_needed ?? 1,
  pomoDone: r.pomodoros_completed ?? 0,
});

const FIELD_MAP = {
  text: 'title',
  completed: 'completed',
  priority: 'priority',
  time: 'time_label',
  date: 'due_date',
  category: 'category',
  pomoEst: 'pomodoros_needed',
  pomoDone: 'pomodoros_completed',
};

function toRow(patch) {
  const row = {};
  Object.entries(patch).forEach(([k, v]) => {
    if (FIELD_MAP[k]) row[FIELD_MAP[k]] = v === undefined ? null : v;
  });
  return row;
}

export async function fetchTasks(userId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(taskFromRow);
}

export async function insertTask(task, userId) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ user_id: userId, ...toRow(task) })
    .select()
    .single();
  if (error) throw error;
  return taskFromRow(data);
}

export async function updateTask(id, patch) {
  const { error } = await supabase.from('tasks').update(toRow(patch)).eq('id', id);
  if (error) throw error;
}

export async function deleteTask(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Riwayat sesi ----------
function sessionToLog(r) {
  const done = new Date(r.completed_at);
  const isTask = r.session_type === 'task';
  const mins = r.duration_minutes || 0;
  const start = new Date(done.getTime() - mins * 60000);
  return {
    id: r.id,
    ts: done.getTime(),
    type: r.session_type,
    category: r.category,
    duration: isTask ? null : mins,
    text: r.session_title || '',
    time: isTask ? `${dayText(done)}, ${hhmm(done)}` : `${dayText(done)}, ${hhmm(start)} - ${hhmm(done)}`,
  };
}

export async function fetchSessions(userId) {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data.map(sessionToLog);
}

export async function insertSession(entry, userId) {
  const { error } = await supabase.from('pomodoro_sessions').insert({
    user_id: userId,
    task_id: entry.taskId ?? null,
    session_title: entry.text,
    category: entry.category,
    session_type: entry.type,
    duration_minutes: entry.type === 'task' ? 0 : entry.duration ?? 0,
  });
  if (error) throw error;
}

// ---------- Profil: catatan cepat + pengaturan ----------
export async function fetchProfile(user) {
  const { data, error } = await supabase
    .from('profiles')
    .select('scratchpad, settings')
    .eq('id', user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    // pengguna baru: buat baris profilnya
    const { error: e2 } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: user.displayName || null,
      updated_at: new Date().toISOString(),
    });
    if (e2) throw e2;
    return {};
  }
  return data;
}

export async function saveProfile(user, patch) {
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    full_name: user.displayName || null,
    ...patch,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}