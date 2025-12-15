'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

export function useRedirectIfAuthenticated(redirectTo = '/home') {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      if (data.session) {
        router.replace(redirectTo);
      } else {
        setCheckingAuth(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [router, redirectTo]);

  return { checkingAuth };
}
