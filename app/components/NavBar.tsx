'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { ChefHat, Menu, X, User } from 'lucide-react';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  const links = [
    { href: '/home', label: 'Home' },
    { href: '/myrecipes', label: 'My Recipes' },
    { href: '/groceries', label: 'Groceries' },
    { href: '/popular-recipes', label: 'Popular Recipes' },
  ];

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="bg-white/70 backdrop-blur sticky top-0 border-b z-50">
      <div className="container flex items-center py-4">
        <Link href="/home" className="flex items-center gap-2">
          <ChefHat className="accent" />
          <span className="font-medium">HealthyDish</span>
        </Link>

        <nav className="hidden lg:flex gap-2 ml-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-lg text-sm ${
                pathname.startsWith(l.href)
                  ? 'accent-soft'
                  : 'text-muted hover:bg-slate-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex-1" />

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <Link
              href="/account"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <div className="w-9 h-9 rounded-full accent-soft flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm">
                {user.user_metadata?.full_name ?? user.email}
              </span>
            </Link>
          ) : (
            <>
            <Link
              href="/signin"
              className="px-4 py-2 text-sm rounded-lg text-muted hover:bg-slate-100 transition"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="px-4 py-2 text-sm rounded-lg accent hover:bg-slate-100 transition"
            >
              Sign up
            </Link>
            </>
          )}
        </div>


        <button
          className="lg:hidden ml-4 p-2"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden border-t">
          {/* User Profile */}
          <div className="border-b">
            {user ? (
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-4"
              >
                <div className="w-9 h-9 rounded-full accent-soft flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-sm">
                  {user.user_metadata?.full_name ?? user.email}
                </span>
              </Link>
            ) : (
              <div className="flex flex-col gap-2 px-4 py-4">
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg text-center accent-soft"
                >
                  Log in
                </Link>

                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg text-center accent"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <nav className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-4 text-sm"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
