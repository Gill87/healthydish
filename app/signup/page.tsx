'use client';

import { useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { ChefHat, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEmailSignUp = async (e: any) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
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

  const handleGoogleSignUp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0FDF4] px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <ChefHat className="w-12 h-12 text-[#459e85]" />
          <h1 className="text-2xl font-semibold text-slate-800 mt-2">
            Create your account
          </h1>
        </div>

        {/* Google Sign Up */}
        <button
          type="button"
          onClick={() => {handleGoogleSignUp}}
          className="w-full border border-emerald-100 bg-emerald-50 py-2.5 rounded-lg flex items-center justify-center gap-3 hover:bg-emerald-100 transition"
        >
          <span className="flex items-center">
            <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path fill="#4285F4" d="M533.5 278.4c0-17.5-1.6-34.3-4.6-50.6H272v95.7h146.9c-6.3 34.6-25.1 63.9-53.6 83.5v69.4h86.6c50.6-46.6 80.6-115.3 80.6-193.9z"/>
              <path fill="#34A853" d="M272 544.3c72.6 0 133.6-24 178.2-65.4l-86.6-69.4c-24 16.2-55 25.9-91.6 25.9-70.6 0-130.4-47.6-151.8-111.6H29.7v70.3C74.3 485 167.6 544.3 272 544.3z"/>
              <path fill="#FBBC05" d="M120.2 328.8c-10.6-31.2-10.6-64.8 0-96 0 0 0 0 0 0L29.7 162.5v-70.3C5.2 143.8 0 190.6 0 241.2 0 291.8 5.2 338.6 29.7 361.5l90.5-32.7z"/>
              <path fill="#EA4335" d="M272 107.7c39.5 0 75 13.6 102.9 40.3l77.4-77.4C401.6 23.8 344.6 0 272 0 167.6 0 74.3 59.3 29.7 162.5l90.5 70.3C141.6 155.3 201.4 107.7 272 107.7z"/>
            </svg>
          </span>
          <span className="text-slate-700 text-sm">Sign up with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-slate-200" />
          <span className="mx-3 text-slate-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-slate-200" />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        {/* Success */}
        {success && (
          <p className="text-green-600 text-sm mb-3">{success}</p>
        )}

        {/* Email Sign Up Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          
          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Full Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-300 outline-none"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-300 outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-300 outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#459e85] text-white rounded-xl text-lg font-medium hover:bg-[#3a7c6d] transition flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
          </button>
        </form>

        {/* Switch to Sign In */}
        <p className="text-center text-sm text-slate-600 mt-4">
          Already have an account?{" "}
          <a href="/signin" className="text-[#459e85] font-medium hover:underline">
            Sign in
          </a>
        </p>

      </div>
    </div>
  );
}
