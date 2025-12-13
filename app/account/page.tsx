'use client';

import supabase from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/signin');
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-medium mb-4">Account</h1>

      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded-lg border hover:accent-soft text-sm"
      >
        Log out
      </button>
    </main>
  );
}
