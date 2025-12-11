'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChefHat, Menu, X, User, ChevronDown } from 'lucide-react';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/myrecipes', label: 'My Recipes' },
    { href: '/groceries', label: 'Groceries' },
    { href: '/popular', label: 'Popular Recipes' },
  ];

  return (
    <header className="bg-white/50 backdrop-blur-sm sticky top-0 z-50 border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-[#459e85]" />
            <span className="text-xl font-medium text-slate-700">HealthyDish</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-2 ml-6">
          {navLinks.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active ? 'bg-[#E0F2F1] text-[#2d5e52]' : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* spacer */}
        <div className="flex-1" />

        {/* Right-side (profile or actions) */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#2d5e52]">
            <User className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-slate-700">Sarah Chen</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* Mobile menu toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="p-2 text-slate-600 hover:bg-emerald-50 rounded-full transition-colors"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden bg-white shadow-md border-t border-slate-100">
          <div className="px-4 pb-6 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium ${
                  pathname === link.href ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-slate-100 my-3" />
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#2d5e52]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-medium text-slate-700">Sarah Chen</div>
                <div className="text-sm text-slate-500">View profile</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
