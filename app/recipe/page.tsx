'use client';

import React, { useEffect, useRef, useState } from "react";
import { postRecipe } from '@/lib/api'; // adjust path if needed

import {
  ArrowLeft,
  Clock,
  Users,
  Flame,
  ChefHat,
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
  const [isEditing, setIsEditing] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesRef = useRef<HTMLDivElement | null>(null);

  // Load initial recipe from URL params (same as before)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get("prompt");
    const cookTime = params.get("cookTime") || "30 min";

    if (prompt) {
      // Generate initial recipe (reuse your existing /api/recipe endpoint)
      (async () => {
        setLoading(true);
        setError(null);
        try {
          // ACTUAL INTEGRATION CODE
          // const res = await fetch("/api/recipe", {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({ prompt, cookTime }),
          // });
          // if (!res.ok) {
          //   const body = await res.json().catch(() => null);
          //   throw new Error(body?.error || `Server error: ${res.status}`);
          // }
          // const data = await res.json();
          // const parsedRecipe = data.recipe;

          const data = await postRecipe(prompt, cookTime);
          const parsedRecipe = data.recipe;

          if (!parsedRecipe) throw new Error("Invalid recipe from server");
          setRecipe(normalizeRecipe(parsedRecipe, cookTime));
        } catch (err: any) {
          console.error(err);
          setError(err?.message || "Failed to generate recipe");
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages]);

  const normalizeRecipe = (r: any, cookTimeFallback = "30 min"): RecipeType => {
    return {
      title: r.title || "Untitled Recipe",
      description: r.description || "",
      prepTime: r.prepTime || "15 min",
      cookTime: r.cookTime || cookTimeFallback,
      servings: typeof r.servings === "number" ? r.servings : Number(r.servings) || 4,
      calories: typeof r.calories === "number" ? r.calories : Number(r.calories) || 0,
      difficulty: r.difficulty || "Medium",
      ingredients: Array.isArray(r.ingredients) ? r.ingredients.map((i: any) => ({ item: String(i.item || i.name || ""), amount: String(i.amount || i.qty || "") })) : [],
      instructions: Array.isArray(r.instructions) ? r.instructions.map((s: any) => String(s)) : [],
      nutrition: {
        protein: r.nutrition?.protein || "0g",
        carbs: r.nutrition?.carbs || "0g",
        fat: r.nutrition?.fat || "0g",
        fiber: r.nutrition?.fiber || "0g",
      },
      tips: Array.isArray(r.tips) ? r.tips.map((t: any) => String(t)) : [],
    };
  };

  // Chat send handler
  const sendChat = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    // Enforce max 5 messages (user messages only count)
    const userMessagesCount = chatMessages.filter((m) => m.author === "user").length;
    if (userMessagesCount >= 5) {
      setError("You can only make up to 5 chat edits per recipe.");
      return;
    }

    // Add user message locally
    const userMsg: ChatMsg = { id: String(Date.now()) + "-u", author: "user", text: trimmed };
    setChatMessages((prev) => {
      // keep total messages but we only cap user messages; still keep overall list sensible
      const next = [...prev, userMsg];
      // noop trimming here — we'll drop oldest user messages if we exceed 5 next time
      return next;
    });
    setChatInput("");
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          cookTime: recipe?.cookTime,
          recipe: recipe, // provide current recipe as context for edits
          messages: chatMessages.map((m) => ({ role: m.author === "user" ? "user" : "assistant", content: m.text })),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Server error: ${res.status}`);
      }

      const data = await res.json();
      const assistantReply = String(data.reply || "No reply.");
      const assistantMsg: ChatMsg = { id: String(Date.now()) + "-a", author: "assistant", text: assistantReply };

      // Append assistant message, then apply recipe update if provided
      setChatMessages((prev) => {
        let next = [...prev, assistantMsg];

        // Maintain chat length: enforce at most last 10 messages or so, but enforce user-message cap to 5
        // We'll drop oldest user messages if user messages > 5
        const userCount = next.filter((m) => m.author === "user").length;
        if (userCount > 5) {
          // drop oldest user messages (and adjacent assistant replies if any)
          let toDrop = userCount - 5;
          const newNext: ChatMsg[] = [];
          for (const m of next) {
            if (toDrop > 0 && m.author === "user") {
              toDrop--;
              // skip this user message, and also skip the next assistant msg if it's directly after
              continue;
            }
            newNext.push(m);
          }
          next = newNext;
        }

        // Trim overall messages to 12 to avoid unbounded growth
        if (next.length > 12) next = next.slice(next.length - 12);
        return next;
      });

      // If server returned an updated recipe, apply it
      if (data.recipe) {
        try {
          const parsed = normalizeRecipe(data.recipe, recipe?.cookTime || "30 min");
          setRecipe(parsed);
        } catch (e) {
          console.warn("Failed to apply server recipe:", e);
        }
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err?.message || "Chat failed");
    } finally {
      setSending(false);
    }
  };

  // Simple inline edit UI toggling; when saved, update recipe state
  const toggleEditMode = () => setIsEditing((v) => !v);

  const updateRecipeField = (path: string, value: any) => {
    if (!recipe) return;
    const copy: any = { ...recipe };
    // support simple dot paths for top-level fields and nutrition (no arrays)
    if (path.includes(".")) {
      const [a, b] = path.split(".");
      (copy as any)[a] = { ...(copy as any)[a], [b]: value };
    } else {
      (copy as any)[path] = value;
    }
    setRecipe(copy as RecipeType);
  };

  // Ingredient helpers
  const updateIngredient = (index: number, key: "item" | "amount", value: string) => {
    if (!recipe) return;
    const newIngredients = recipe.ingredients.slice();
    newIngredients[index] = { ...newIngredients[index], [key]: value };
    setRecipe({ ...recipe, ingredients: newIngredients });
  };
  const addIngredient = () => {
    if (!recipe) return;
    setRecipe({ ...recipe, ingredients: [...recipe.ingredients, { item: "", amount: "" }] });
  };
  const removeIngredient = (index: number) => {
    if (!recipe) return;
    const newIngredients = recipe.ingredients.slice();
    newIngredients.splice(index, 1);
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  // Instruction helpers
  const updateInstruction = (index: number, value: string) => {
    if (!recipe) return;
    const newInst = recipe.instructions.slice();
    newInst[index] = value;
    setRecipe({ ...recipe, instructions: newInst });
  };
  const addInstruction = () => {
    if (!recipe) return;
    setRecipe({ ...recipe, instructions: [...recipe.instructions, ""] });
  };
  const removeInstruction = (index: number) => {
    if (!recipe) return;
    const newInst = recipe.instructions.slice();
    newInst.splice(index, 1);
    setRecipe({ ...recipe, instructions: newInst });
  };

  // UI States
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#459e85] animate-spin mx-auto mb-4" />
          <p className="text-lg text-slate-600">Generating recipe…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Oops!</h2>
          <p className="text-slate-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center">
        <p className="text-slate-600">No recipe data available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0FDF4]">
      {/* Two-column layout */}
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: chat column (1/3 width on large screens) */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-4 shadow-sm h-[70vh] flex flex-col">
            <h3 className="text-lg font-semibold mb-3">Chat & Edit</h3>

            <div ref={messagesRef} className="flex-1 overflow-auto space-y-3 mb-4 px-2">
              {chatMessages.length === 0 && <div className="text-sm text-slate-400">Ask the assistant to tweak the recipe (max 5 edits).</div>}
              {chatMessages.map((m) => (
                <div key={m.id} className={`p-3 rounded-xl ${m.author === "user" ? "bg-emerald-50 self-end text-slate-800" : "bg-slate-100 text-slate-800"}`}>
                  <div className="text-sm">{m.text}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }}
                placeholder={sending ? "Sending..." : "Ask to tweak the recipe (e.g. 'make it nut-free and higher-protein')"}
                className="flex-1 rounded-2xl border border-slate-100 px-4 py-2 focus:outline-none"
                disabled={sending || chatMessages.filter((m) => m.author === "user").length >= 5}
                aria-label="Chat input"
              />
              <button
                onClick={sendChat}
                disabled={sending || chatMessages.filter((m) => m.author === "user").length >= 5}
                className="p-3 bg-[#96CBB7] hover:bg-[#7dbba3] text-white rounded-xl disabled:opacity-60"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-400 mt-2">Tip: Ask the assistant to adjust ingredients, portion size, or calories. Up to 5 user edits per recipe.</div>
          </div>
        </aside>

        {/* Right: recipe column (2/3 width on large screens) */}
        <section className="lg:col-span-2">
          <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl p-8 mb-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                {isEditing ? (
                  <input value={recipe.title} onChange={(e) => updateRecipeField("title", e.target.value)} className="text-4xl font-semibold text-slate-800 mb-2 w-full bg-transparent border-b border-dashed pb-2" />
                ) : (
                  <h1 className="text-4xl font-semibold text-slate-800 mb-2">{recipe.title}</h1>
                )}
                {isEditing ? (
                  <textarea value={recipe.description} onChange={(e) => updateRecipeField("description", e.target.value)} className="text-lg text-slate-600 mb-4 w-full bg-transparent border rounded-md p-2" />
                ) : (
                  <p className="text-lg text-slate-600 mb-4">{recipe.description}</p>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm text-slate-600"><Clock className="w-4 h-4 text-emerald-600" /> <strong className="text-slate-800">{recipe.prepTime}</strong> prep + <strong className="text-slate-800">{recipe.cookTime}</strong> cook</div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><Users className="w-4 h-4 text-emerald-600" /> <strong className="text-slate-800">{recipe.servings}</strong> servings</div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><Flame className="w-4 h-4 text-emerald-600" /> <strong className="text-slate-800">{recipe.calories}</strong> cal/serving</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Ingredients</h2>

                {isEditing ? (
                  <div className="space-y-3">
                    {recipe.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input value={ing.amount} onChange={(e) => updateIngredient(idx, "amount", e.target.value)} className="w-28 rounded-md border px-2 py-1" />
                        <input value={ing.item} onChange={(e) => updateIngredient(idx, "item", e.target.value)} className="flex-1 rounded-md border px-2 py-1" />
                        <button onClick={() => removeIngredient(idx)} className="text-sm text-red-500 px-2">Remove</button>
                      </div>
                    ))}
                    <button onClick={addIngredient} className="mt-3 text-sm text-emerald-700">+ Add ingredient</button>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#459e85] mt-2 flex-shrink-0" />
                        <span className="text-slate-700">
                          <strong className="font-medium">{ingredient.amount}</strong> {ingredient.item}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Nutrition */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Nutrition per serving</h3>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><label className="text-xs text-slate-500">Protein</label><input value={recipe.nutrition.protein} onChange={(e) => updateRecipeField("nutrition.protein", e.target.value)} className="w-full rounded-md border px-2 py-1" /></div>
                      <div><label className="text-xs text-slate-500">Carbs</label><input value={recipe.nutrition.carbs} onChange={(e) => updateRecipeField("nutrition.carbs", e.target.value)} className="w-full rounded-md border px-2 py-1" /></div>
                      <div><label className="text-xs text-slate-500">Fat</label><input value={recipe.nutrition.fat} onChange={(e) => updateRecipeField("nutrition.fat", e.target.value)} className="w-full rounded-md border px-2 py-1" /></div>
                      <div><label className="text-xs text-slate-500">Fiber</label><input value={recipe.nutrition.fiber} onChange={(e) => updateRecipeField("nutrition.fiber", e.target.value)} className="w-full rounded-md border px-2 py-1" /></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-slate-500">Protein</span><p className="font-semibold text-slate-800">{recipe.nutrition.protein}</p></div>
                      <div><span className="text-slate-500">Carbs</span><p className="font-semibold text-slate-800">{recipe.nutrition.carbs}</p></div>
                      <div><span className="text-slate-500">Fat</span><p className="font-semibold text-slate-800">{recipe.nutrition.fat}</p></div>
                      <div><span className="text-slate-500">Fiber</span><p className="font-semibold text-slate-800">{recipe.nutrition.fiber}</p></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-slate-800">Instructions</h2>
                  {isEditing && <button onClick={addInstruction} className="text-sm text-emerald-700">+ Add step</button>}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    {recipe.instructions.map((step, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#D5EFE6] text-[#2C6E5D] flex items-center justify-center font-semibold text-sm">{idx + 1}</div>
                        <textarea value={step} onChange={(e) => updateInstruction(idx, e.target.value)} className="flex-1 rounded-md border p-2" />
                        <button onClick={() => removeInstruction(idx)} className="text-sm text-red-500 px-2">Remove</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ol className="space-y-4">
                    {recipe.instructions.map((step, idx) => (
                      <li key={idx} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D5EFE6] text-[#2C6E5D] flex items-center justify-center font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <p className="text-slate-700 pt-1">{step}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {recipe.tips && recipe.tips.length > 0 && (
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Chef's Tips</h3>
                  <ul className="space-y-2">
                    {recipe.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <span className="text-[#459e85] font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
