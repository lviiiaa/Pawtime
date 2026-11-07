import { supabase } from './supabase';

// Semua fungsi melempar error jika gagal, supaya bisa ditangkap AuthScreen

export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function loginWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  if (error) throw error;
}

export async function updatePassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Terjemahkan error Supabase ke pesan yang ramah
export function authErrorMessage(error) {
  const code = error?.code || '';
  const msg = (error?.message || '').toLowerCase();

  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) return 'Email atau password salah.';
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed'))
    return 'Email belum dikonfirmasi. Buka kotak masuk emailmu dan klik tautan konfirmasi.';
  if (code === 'user_already_exists' || msg.includes('already registered'))
    return 'Email ini sudah terdaftar. Coba masuk, atau gunakan "Lupa password?".';
  if (code === 'weak_password' || msg.includes('at least')) return 'Password terlalu lemah. Gunakan minimal 6 karakter.';
  if (code === 'validation_failed' || msg.includes('valid email') || msg.includes('invalid format'))
    return 'Format email tidak valid.';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || msg.includes('rate limit') || msg.includes('seconds'))
    return 'Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.';
  if (code === 'signup_disabled') return 'Pendaftaran akun baru sedang dinonaktifkan di Supabase.';
  if (code === 'provider_disabled' || msg.includes('provider is not enabled'))
    return 'Login Google belum diaktifkan di Supabase (Authentication > Providers).';
  if (code === 'same_password' || msg.includes('different from the old'))
    return 'Password baru harus berbeda dari password lama.';
  if (msg.includes('failed to fetch') || msg.includes('network')) return 'Koneksi internet bermasalah. Periksa jaringanmu.';
  return 'Terjadi kesalahan. Silakan coba lagi.';
}