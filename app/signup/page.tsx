'use client';

import { useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { useRedirectIfAuthenticated } from '@/lib/hooks/useRedirectIfAuthenticated';
import { ChefHat, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const signUp = async (e: any) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setLoading(false);
      setError('Passwords do not match.');
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess('Check your email to confirm your account.');
  };

  const signUpWithGoogle = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) setError(error.message);
  };

  const { checkingAuth } = useRedirectIfAuthenticated();
  if (checkingAuth) {
    return (
      <div className="page flex items-center justify-center">
        <Loader2 className="w-12 h-12 accent animate-spin" />
      </div>
    );
  }
  // Prevent landing page flash
  if (checkingAuth) {
    return (
      <div className="page flex items-center justify-center">
        <Loader2 className="w-12 h-12 accent animate-spin" />
      </div>
    );  
  }

  return (
    <div className="page flex items-center justify-center">
      <div className="card w-full max-w-md p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <ChefHat className="w-12 h-12 accent" />
          <h2 className="mt-2">Create your account</h2>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm mb-4 text-center">
            {error}
          </p>
        )}

        {/* Success */}
        {success && (
          <p className="text-sm mb-4 text-center">
            {success}
          </p>
        )}

        {/* Form */}
        <form onSubmit={signUp} className="space-y-4">
          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
            <input
              type="text"
              required
              placeholder="Full Name"
              className="input pl-12"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
            <input
              type="email"
              required
              placeholder="Email"
              className="input pl-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              className="input pl-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Confirm Password"
              className="input pl-12"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Switch */}
        <p className="text-center text-sm mt-4">
          Already have an account?{' '}
          <a href="/signin" className="hover:underline">
            Sign in
          </a>
        </p>

        {/* Google */}
        <button
          type="button"
          onClick={signUpWithGoogle}
          className="
            btn-secondary
            w-full
            flex items-center justify-center gap-3
            border
            py-3
            mt-6
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
          <span>Sign Up with Google</span>
        </button>
      </div>
    </div>
  );
}
