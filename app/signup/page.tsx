// app/signup/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChefHat, Mail, Lock, Eye, User } from 'lucide-react';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      alert('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    setLoading(true);
    // UI-only: integrate Supabase here later.
    setTimeout(() => setLoading(false), 700);
  };

  return (
    <div className="min-h-screen bg-emerald-50/50 flex items-center justify-center py-6">
      <div className="w-full max-w-xl px-4">
        <div className="mx-auto bg-white/90 rounded-2xl shadow-lg">
          <div className="w-full px-6 py-6 md:py-8">
            {/* Header */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-100/60 flex items-center justify-center mb-2">
                <ChefHat className="w-7 h-7 text-emerald-700" />
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 leading-tight">Create Account</h1>
              <p className="mt-1 text-sm text-slate-500">Join HealthyDish and start cooking healthy</p>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-emerald-700/90">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-emerald-700/90">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-emerald-700/90">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-emerald-50 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-emerald-700/90">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-emerald-50 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((s) => !s)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500"
                    aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="h-4 w-4 rounded-sm text-emerald-600 border-slate-300"
                />
                <label htmlFor="agree" className="text-xs md:text-sm text-slate-600">
                  I agree to the{' '}
                  <a className="text-emerald-700 hover:underline" href="/terms">Terms of Service</a> and{' '}
                  <a className="text-emerald-700 hover:underline" href="/privacy">Privacy Policy</a>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg shadow-sm disabled:opacity-60 transition text-sm"
                >
                  {loading ? 'Creating…' : 'Create Account'}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <div className="text-xs md:text-sm text-slate-400">Or continue with</div>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => { /* wire Google sign-up later */ }}
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
              </div>

              <div className="text-center text-xs md:text-sm text-slate-500">
                Already have an account?{' '}
                <Link href="/signin" className="text-emerald-700 hover:underline">Sign in</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
