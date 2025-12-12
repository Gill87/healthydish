'use client';

import React, { useEffect, useRef, useState } from "react";
import { postRecipe } from '@/lib/api';
import {
  Clock,
  Users,
  Flame,
  Loader2,
  AlertCircle,
  Send,
} from "lucide-react";

type Ingredient = { item: string; amount: string };
type Nutrition = { protein: string; carbs: string; fat: string; fiber: string };
type RecipeType = {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  calories: number;
  difficulty: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: Nutrition;
  tips: string[];
};

type ChatMsg = { id: string; author: "user" | "assistant"; text: string };

export default function RecipePage() {
  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);

  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get("prompt");
    const cookTime = params.get("cookTime") || "30 min";

    if (!prompt) return;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await postRecipe(prompt, cookTime);
        if (!data?.recipe) throw new Error("Invalid recipe");
        setRecipe(normalizeRecipe(data.recipe, cookTime));
      } catch (e: any) {
        setError(e?.message || "Failed to generate recipe");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatMessages]);

  const normalizeRecipe = (r: any, cookTimeFallback: string): RecipeType => ({
    title: r.title || "Untitled Recipe",
    description: r.description || "",
    prepTime: r.prepTime || "15 min",
    cookTime: r.cookTime || cookTimeFallback,
    servings: Number(r.servings) || 4,
    calories: Number(r.calories) || 0,
    difficulty: r.difficulty || "Medium",
    ingredients: Array.isArray(r.ingredients)
      ? r.ingredients.map((i: any) => ({
          item: String(i.item || i.name || ""),
          amount: String(i.amount || i.qty || ""),
        }))
      : [],
    instructions: Array.isArray(r.instructions)
      ? r.instructions.map(String)
      : [],
    nutrition: {
      protein: r.nutrition?.protein || "0g",
      carbs: r.nutrition?.carbs || "0g",
      fat: r.nutrition?.fat || "0g",
      fiber: r.nutrition?.fiber || "0g",
    },
    tips: Array.isArray(r.tips) ? r.tips.map(String) : [],
  });

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userCount = chatMessages.filter(m => m.author === "user").length;
    if (userCount >= 5) {
      setError("You can only make up to 5 edits per recipe.");
      return;
    }

    const msg: ChatMsg = {
      id: Date.now().toString(),
      author: "user",
      text: chatInput.trim(),
    };

    setChatMessages(prev => [...prev, msg]);
    setChatInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: msg.text,
          recipe,
        }),
      });

      const data = await res.json();
      setChatMessages(prev => [
        ...prev,
        { id: `${Date.now()}-a`, author: "assistant", text: data.reply },
      ]);

      if (data.recipe) {
        setRecipe(normalizeRecipe(data.recipe, recipe!.cookTime));
      }
    } catch (e: any) {
      setError(e?.message || "Chat failed");
    } finally {
      setSending(false);
    }
  };

  /* ---------------- STATES ---------------- */

  if (loading) {
    return (
      <div className="page flex items-center justify-center">
        <Loader2 className="w-12 h-12 accent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="page flex items-center justify-center">
        <p className="text-muted">No recipe data available.</p>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="page">
      <main className="container grid grid-cols-1 lg:grid-cols-3 gap-6 py-8">
        {/* Chat */}
        <aside className="lg:col-span-1">
          <div className="card h-[70vh] flex flex-col p-4">
            <h3 className="mb-3">Chat & Edit</h3>

            <div
              ref={messagesRef}
              className="flex-1 overflow-auto space-y-3 mb-4"
            >
              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl ${
                    m.author === "user"
                      ? "accent-soft self-end"
                      : "bg-slate-100"
                  }`}
                >
                  <p className="text-sm">{m.text}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Ask to tweak the recipe"
              />
              <button
                className="btn-primary p-3"
                disabled={sending}
                onClick={sendChat}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Recipe */}
        <section className="lg:col-span-2 space-y-6">
          <div className="card p-8">
            <h1>{recipe.title}</h1>
            <p className="mt-2">{recipe.description}</p>

            <div className="flex gap-6 mt-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 accent" /> {recipe.prepTime} +{" "}
                {recipe.cookTime}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 accent" /> {recipe.servings}
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-4 h-4 accent" /> {recipe.calories} cal
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Ingredients */}
            <div className="md:col-span-1 card p-6">
              <h3 className="mb-4">Ingredients</h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((i, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full accent mt-2" />
                    <span>
                      <strong>{i.amount}</strong> {i.item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="md:col-span-2 card p-6">
              <h3 className="mb-4">Instructions</h3>
              <ol className="space-y-4">
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full accent-soft flex items-center justify-center font-semibold text-sm">
                      {idx + 1}
                    </div>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {recipe.tips.length > 0 && (
            <div className="card p-6">
              <h3 className="mb-3">Chef’s Tips</h3>
              <ul className="space-y-2">
                {recipe.tips.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="accent font-bold">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
