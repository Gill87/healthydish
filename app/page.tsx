'use client';

import React, { useState } from 'react';
import { 
  User, 
  ChevronDown, 
  Menu, 
  X,
  ChefHat, 
  Sparkles, 
  Send,
  HelpCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility for Tailwind classes ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function HealthyDishPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cookTime, setCookTime] = useState('30 min');
  const [prompt, setPrompt] = useState('');

  const navLinks = [
    { name: 'Recipes', active: true },
    { name: 'Groceries', active: false },
    { name: 'Meal Plans', active: false },
    { name: 'Popular Recipes', active: false },
    { name: 'Fast Food Reimagined', active: false },
  ];

  const handleGenerateRecipe = () => {
    if (!prompt.trim()) return;
    const params = new URLSearchParams({
      prompt: prompt,
      cookTime: cookTime
     });
    window.location.href = `/recipe?${params.toString()}`;
  };

  const handleKeyPress = (e: { key: string; }) => {
    if (e.key === 'Enter') {
      handleGenerateRecipe();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] text-slate-800 font-sans relative">
      
      {/* --- Navigation Bar --- */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-[#459e85]" />
          <span className="text-xl font-medium text-slate-700">HealthyDish</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => (
            <button
              key={link.name}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                link.active 
                  ? "bg-[#E0F2F1] text-[#2d5e52]" 
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
              )}
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* User Profile (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#2d5e52]">
            <User className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-slate-700">Sarah Chen</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-emerald-50 rounded-full transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* --- Mobile Drawer (Top Right) --- */}
      {/* This renders conditionally based on state */}
      <div className={cn(
        "fixed inset-0 z-40 lg:hidden transition-all duration-300 pointer-events-none",
        isMobileMenuOpen ? "bg-black/20 pointer-events-auto" : "bg-transparent"
      )} onClick={() => setIsMobileMenuOpen(false)}>
        
        <div 
          onClick={(e) => e.stopPropagation()} 
          className={cn(
            "absolute top-0 right-0 h-full w-3/4 max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col pt-20 px-6",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                className={cn(
                  "px-4 py-3 rounded-xl text-left text-base font-medium transition-all",
                  link.active 
                    ? "bg-emerald-50 text-emerald-800" 
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {link.name}
              </button>
            ))}
            
            <div className="h-px bg-slate-100 my-4" />
            
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-10 h-10 rounded-full bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#2d5e52]">
                <User className="w-5 h-5" />
              </div>
              <span className="text-base font-medium text-slate-700">Sarah Chen</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <main className="flex flex-col items-center justify-center pt-16 md:pt-24 px-4 max-w-4xl mx-auto text-center animate-in fade-in duration-500">
        
        {/* AI Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D5EFE6] text-[#2C6E5D] rounded-full text-sm font-medium mb-8 shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Recipe Generator</span>
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl md:text-6xl font-medium text-[#1a3d2f] mb-6 tracking-tight">
          HealthyDish
        </h1>
        <p className="text-lg md:text-xl text-[#2d5242] mb-12">
          Create delicious, nutritious recipes tailored to your needs.
        </p>
        <p className="text-xl md:text-2xl text-[#1a3d2f] mb-8 font-light">
          What would you like to cook today?
        </p>

        {/* Inputs Container */}
        <div className="w-full max-w-xl space-y-8 mb-20">
          
          {/* Cook Time Select */}
          <div className="text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">
              Cook Time
            </label>
            <div className="relative group">
              <select 
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                className="w-full appearance-none bg-white border border-emerald-100/50 rounded-2xl py-4 px-6 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#A7D7C5] focus:border-transparent shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <option>15 min</option>
                <option>30 min</option>
                <option>45 min</option>
                <option>1 hour+</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>

          {/* Prompt Input */}
          <div className="relative group">
            <input 
              type="text" 
              placeholder="What do you want to cook?"
              className="w-full bg-white border border-emerald-100/50 rounded-2xl py-5 px-6 pr-16 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A7D7C5] focus:border-transparent shadow-sm hover:shadow-md transition-shadow"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown = {handleKeyPress}
            />
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-[#96CBB7] hover:bg-[#7dbba3] text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
              onClick = {handleGenerateRecipe}>
              <Send className="w-5 h-5 fill-current" />
            </button>
          </div>

        </div>
      </main>

      {/* --- Floating Help Button --- */}
      <button className="fixed bottom-6 right-6 p-3 bg-slate-900 text-white rounded-full shadow-xl hover:bg-slate-800 transition-transform hover:scale-110 active:scale-95 z-30">
        <HelpCircle className="w-6 h-6" />
      </button>

    </div>
  );
}