'use client';

import { useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Mail, Lock, Loader2, ChefHat } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) return setError(error.message);
    window.location.href = '/home';
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <div className="page flex items-center justify-center">
      <div className="card w-full max-w-md p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <ChefHat className="w-12 h-12 accent" />
          <h2 className="mt-2">Welcome back</h2>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm mb-4 text-center">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={signIn} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-12"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="password"
              className="input pl-12"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn-primary w-full">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Sign In'}
          </button>
        </form>

        {/* Create Account */}
        <p className="text-center text-sm mt-4">
          Don’t have an account?{' '}
          <a href="/signup" className="hover:underline">
            Create one
          </a>
        </p>

        {/* Divider + Google */}
        <div className="mt-6">
          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="
              btn-secondary
              w-full
              flex items-center justify-center gap-3
              border
              py-3
              transition
              active:scale-[0.98]
            "
            disabled={loading}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5 shrink-0"
            />
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
