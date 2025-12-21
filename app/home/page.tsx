'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Sparkles, Send, ChevronDown, HelpCircle } from 'lucide-react';

export default function HomePage() {
  const [cookTime, setCookTime] = useState('30 min');
  const [prompt, setPrompt] = useState('');
  const router = useRouter();

  const generate = () => {
    if (!prompt.trim()) return;
    const params = new URLSearchParams({ prompt, cookTime });
    router.push(`/recipe?${params.toString()}`);
  };

  return (
    <div className="page">
      <main className="container text-center pt-24">
        <div className="inline-flex items-center gap-2 accent-soft px-5 py-2.5 rounded-full text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          AI-Powered Recipe Generator
        </div>

        <h1 className="mb-4">
          <span className="accent">Healthy</span>Dish
        </h1>

        <p className="mb-12 text-lg">
          Create nutritious, delicious recipes tailored to you.
        </p>

        <div className="max-w-xl mx-auto space-y-8">
          {/* Cook Time */}
          <div className="text-left">
            <label className="text-xs font-bold uppercase tracking-widest text-muted block mb-2">
              Cook Time
            </label>
            <div className="relative">
              <select
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                className="input appearance-none pr-12"
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={65}>60+ mins</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>

          {/* Prompt */}
          <div className="relative">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              placeholder="What do you want to cook?"
              className="input pr-16"
            />
            <button
              onClick={generate}
              className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary p-3"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
