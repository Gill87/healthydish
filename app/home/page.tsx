'use client';
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const handleGenerateRecipe = () => {
    if (!prompt.trim()) return;
    const params = new URLSearchParams({
      prompt: prompt,
      cookTime: cookTime
     });
    router.push(`/recipe?${params.toString()}`);
  };

  const handleKeyPress = (e: { key: string; }) => {
    if (e.key === 'Enter') {
      handleGenerateRecipe();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] text-slate-800 font-sans relative">       
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