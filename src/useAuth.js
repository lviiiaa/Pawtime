import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// Ratakan objek user Supabase ke bentuk sederhana yang dipakai Header
function toUser(u) {
  if (!u) return null;
  const meta = u.user_metadata || {};
  return {
    id: u.id,
    email: u.email,
    displayName: meta.full_name || meta.name || '',
    photoURL: meta.avatar_url || meta.picture || '',
  };
}

// Memantau status login.
// `loading` true sampai sesi tersimpan selesai diperiksa.
// `recovery` true saat pengguna datang dari tautan "reset password".
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    if (!supabase) return undefined;

    supabase.auth.getSession().then(({ data }) => {
      setUser(toUser(data.session?.user));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(toUser(session?.user));
      setLoading(false);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, recovery, finishRecovery: () => setRecovery(false) };
}