import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, LoaderCircle, TriangleAlert, CircleCheck } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, updatePassword, authErrorMessage } from '../auth';

function Logo({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 32 32" className={`${className} text-primary-container`} fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="9.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2.6" opacity="0.6" />
      <path d="M16 10.5V16l3.6 2.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-3 text-on-surface-variant">
      <Logo />
      <LoaderCircle className="w-5 h-5 animate-spin text-primary" />
      <span className="font-label-md text-label-md">Memuat Pawtime…</span>
    </div>
  );
}

export function SupabaseSetupNotice({ onBack }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-space-md">
      <div className="max-w-lg w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-md border border-surface-container-high/40 space-y-3">
        <div className="flex items-center gap-2 text-error font-headline-sm text-headline-sm font-semibold">
          <TriangleAlert className="w-5 h-5" />
          Supabase belum dikonfigurasi
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Buat file <code className="font-mono text-primary">.env</code> di folder yang sama dengan{' '}
          <code className="font-mono text-primary">package.json</code>, isi dengan nilai dari Supabase (Project Settings → API, lihat{' '}
          <code className="font-mono text-primary">.env.example</code>), lalu jalankan ulang{' '}
          <code className="font-mono text-primary">npm run dev</code>.
        </p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full h-10 rounded-lg border border-surface-container-high text-on-surface-variant hover:bg-surface-container-low font-label-md text-label-md transition-colors"
          >
            Kembali ke aplikasi
          </button>
        )}
      </div>
    </div>
  );
}

const field =
  'w-full h-11 pl-10 pr-3 rounded-xl bg-[#FDF8F0] dark:bg-[#252130] border border-[#E8D8C8] dark:border-[#4B4258] text-[#5C4033] dark:text-[#F7F4EF] font-body-md text-body-md placeholder:text-[#A08B7A] dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F6C85F]/50 focus:border-[#F6C85F] transition-all';

export default function AuthScreen({ recovery = false, onRecoveryDone, onBack }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');


  const run = async (fn) => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await fn();
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    run(async () => {
      if (recovery) {
        await updatePassword(password);
        onRecoveryDone?.();
        return;
      }
      if (mode === 'register') {
        const data = await registerWithEmail(name.trim(), email.trim(), password);
        if (!data.session) setInfo('Akun berhasil dibuat. Cek email untuk konfirmasi sebelum masuk.');
      } else {
        await loginWithEmail(email.trim(), password);
      }
    });
  };

  const handleReset = () => {
    if (!email.trim()) {
      setError('Isi email dulu, lalu tekan "Lupa password?".');
      setInfo('');
      return;
    }
    run(async () => {
      await resetPassword(email.trim());
      setInfo('Tautan reset password sudah dikirim. Periksa kotak masuk (dan folder spam) emailmu.');
    });
  };

  return (
    <div className="relative min-h-screen bg-[#FDF6EC] dark:bg-[#1E1B24] flex items-center justify-center p-4 sm:p-6 overflow-hidden transition-colors duration-300">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-fixed/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-tertiary-fixed/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#FDF8F0] dark:bg-[#2D2838] rounded-3xl p-5 sm:p-7 shadow-md border border-[#E8D8C8] dark:border-[#3D374A] space-y-4 transition-colors duration-300">
        <div className="flex flex-col items-center text-center gap-2">
          <Logo />
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
            {recovery ? 'Atur password baru' : mode === 'register' ? 'Buat akun Pawtime' : 'Selamat datang kembali'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {recovery ? 'Masukkan password baru untuk akunmu.' : mode === 'register' ? 'Simpan tugas dan riwayat fokusmu di semua perangkat.' : 'Masuk untuk melanjutkan alur fokusmu.'}
          </p>
        </div>

        {!recovery && (
        <>
        <div className="flex items-center gap-1 rounded-full bg-[#FAF6F0] dark:bg-[#201A2E] p-1 border border-[#EBDCC8] dark:border-[#3D374A]">
          {['login', 'register'].map((item) => (
            <button key={item} type="button" onClick={() => { setMode(item); setError(''); setInfo(''); }} className={`flex-1 rounded-full py-2 text-xs font-bold transition-colors ${mode === item ? 'bg-[#FDE68A] text-[#2D2838] shadow-sm' : 'text-[#8D7060] dark:text-[#C9BDC9]'}`}>
              {item === 'login' ? 'Masuk' : 'Daftar'}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => run(loginWithGoogle)}
          className="w-full h-11 rounded-full border border-[#E8D8C8] dark:border-[#4B4258] bg-[#FFFDF9] dark:bg-[#252130] hover:bg-[#FFF4D6] dark:hover:bg-[#383048] text-[#5C4033] dark:text-[#F7F4EF] font-label-lg text-label-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:pointer-events-none"
        >
          <GoogleIcon />
          Lanjutkan dengan Google
        </button>

        <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-on-surface-variant">
          <span className="flex-1 h-px bg-surface-container-high" />
          atau dengan email
          <span className="flex-1 h-px bg-surface-container-high" />
        </div>

        </>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && !recovery && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                autoComplete="name"
                className={field}
              />
            </div>
          )}

          <div className={recovery ? 'hidden' : 'relative'}>
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
            <input
              type="email"
              required={!recovery}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className={field}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={recovery ? 'Password baru (min. 6 karakter)' : mode === 'register' ? 'Password (min. 6 karakter)' : 'Password'}
              autoComplete={recovery ? 'new-password' : 'current-password'}
              className={`${field} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-on-surface-variant hover:text-on-surface"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

{mode === 'login' && !recovery && (
             <div className="text-right -mt-1">
              <button
                type="button"
                onClick={handleReset}
                disabled={busy}
                className="text-xs font-semibold text-primary hover:underline disabled:opacity-60"
              >
                Lupa password?
              </button>
            </div>
          )}

          {error && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-error-container text-on-error-container text-xs">
              <TriangleAlert className="w-4 h-4 shrink-0 mt-px" />
              <span>{error}</span>
            </div>
          )}
          {info && (
            <div role="status" className="flex items-start gap-2 p-3 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed text-xs">
              <CircleCheck className="w-4 h-4 shrink-0 mt-px" />
              <span>{info}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full h-11 rounded-full bg-yellow-200 hover:bg-yellow-300 text-yellow-900 font-label-lg text-label-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none active:scale-[0.99]"
          >
            {busy && <LoaderCircle className="w-4 h-4 animate-spin" />}
            {recovery ? 'Simpan Password' : mode === 'register' ? 'Buat Akun' : 'Masuk'}
          </button>
          {!recovery && (
            <p className="text-center text-xs text-[#8D7060] dark:text-[#C9BDC9]">
              {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
              <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setInfo(''); }} className="font-bold text-[#B7791F] hover:underline">
                {mode === 'login' ? 'Daftar di sini' : 'Masuk di sini'}
              </button>
            </p>
          )}
        </form>

        {onBack && !recovery && (
          <button
            type="button"
            onClick={onBack}
            className="w-full h-11 rounded-lg border border-surface-container-high bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors"
          >
            Lihat-lihat dulu sebagai Tamu →
          </button>
        )}
      </div>
    </div>
  );
}