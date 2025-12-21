'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Loader2, ShoppingCart } from 'lucide-react';

// 🔁 Reuse shared domain types
import type { Recipe as BaseRecipe } from '@/types/recipe';

/* -----------------------------
   Extend Recipe for this page
   (we need an id for selection)
--------------------------------*/
type GroceryRecipe = BaseRecipe & {
  id: string;
};

/* -----------------------------
   Parsing helpers
--------------------------------*/
function roundToNearestHalf(value: number) {
  return Math.round(value * 2) / 2;
}

function parseAmount(raw: string) {
  const str = raw.toLowerCase().trim();

  const fractionMatch = str.match(/(\d+)\s*\/\s*(\d+)/);
  let value = 0;

  if (fractionMatch) {
    value = Number(fractionMatch[1]) / Number(fractionMatch[2]);
  } else {
    const num = parseFloat(str);
    if (!isNaN(num)) value = num;
  }

  // normalize units
  let unit = 'unit';
  if (str.includes('teaspoon') || str.includes('tsp')) unit = 'tsp';
  if (str.includes('tablespoon') || str.includes('tbsp')) unit = 'tbsp';
  if (str.includes('cup')) unit = 'cup';
  if (str.includes('gram')) unit = 'g';
  if (str.includes('ml')) unit = 'ml';

  return { value, unit };
}

function formatAmount(value: number, unit: string) {
  const rounded = roundToNearestHalf(value);

  // exactly 1/2
  if (rounded === 0.5) return `1/2 ${unit}`;

  // whole number
  if (Number.isInteger(rounded)) return `${rounded} ${unit}`;

  // .5 AND greater than 1 → show decimal like 1.5
  if (rounded % 1 === 0.5 && rounded > 1) {
    return `${rounded} ${unit}`;
  }

  return `${rounded} ${unit}`;
}


export default function GroceriesPage() {
  /* -----------------------------
     State
  --------------------------------*/
  const [recipes, setRecipes] = useState<GroceryRecipe[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ⬇️ CHANGE: grocery list now stores merged numeric values + unit
  const [groceryList, setGroceryList] = useState<
    Record<string, { value: number; unit: string }>
  >({});

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -----------------------------
     Load favorited recipes
  --------------------------------*/
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from('recipes')
          .select(`
            id,
            title,
            description,
            prep_time,
            cook_time,
            servings,
            difficulty,
            ingredients,
            instructions,
            tips
          `)
          .eq('user_id', user.id)
          .eq('is_favorited', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const cleaned: GroceryRecipe[] = (data ?? []).map((r: any) => ({
          id: r.id,
          title: r.title ?? '',
          description: r.description ?? '',
          prepTime: r.prep_time ?? '',
          cookTime: r.cook_time ?? '',
          servings: r.servings ?? 0,
          difficulty: r.difficulty ?? '',
          ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
          instructions: Array.isArray(r.instructions) ? r.instructions : [],
          tips: Array.isArray(r.tips) ? r.tips : [],
        }));

        setRecipes(cleaned);
      } catch (e: any) {
        console.error('Failed to load grocery recipes:', e.message ?? e);
        setError('Failed to load favorited recipes');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* -----------------------------
     Toggle recipe selection
  --------------------------------*/
  const toggleRecipe = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* -----------------------------
     Generate grocery list
     (MERGES NUMERIC VALUES NOW)
  --------------------------------*/
  const generateGroceryList = () => {
    setGenerating(true);

    const list: Record<string, { value: number; unit: string }> = {};

    for (const recipe of recipes) {
      if (!selected.has(recipe.id)) continue;

      for (const ing of recipe.ingredients) {
        if (!ing?.item || !ing?.amount) continue;

        const key = ing.item.toLowerCase().trim();
        const { value, unit } = parseAmount(ing.amount);

        if (!list[key]) {
          list[key] = { value, unit };
        } else {
          // Only combine if units match
          if (list[key].unit === unit) {
            list[key].value += value;
          } else {
            // fallback: don't lose data; still add
            list[key].value += value;
          }
        }
      }
    }

    setGroceryList(list);
    setGenerating(false);
  };

  /* -----------------------------
     Loading state
  --------------------------------*/
  if (loading) {
    return (
      <div className="page flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin opacity-70" />
      </div>
    );
  }

  /* -----------------------------
     Render
  --------------------------------*/
  return (
    <div className="page max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-6 h-6" />
        <h1 className="text-2xl font-semibold">Groceries</h1>
      </div>

      {/* Recipe selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-medium">Select From Favorited Recipes</h2>

        {recipes.length === 0 && (
          <p className="opacity-70">
            You don’t have any favorited recipes yet.
          </p>
        )}

        <div className="grid gap-3">
          {recipes.map(recipe => (
            <label
              key={recipe.id}
              className="flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:bg-muted transition"
            >
              <span className="font-medium">{recipe.title}</span>

              <input
                type="checkbox"
                checked={selected.has(recipe.id)}
                onChange={() => toggleRecipe(recipe.id)}
                className="w-5 h-5"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generateGroceryList}
        disabled={selected.size === 0 || generating}
        className="w-full py-3 rounded-xl font-medium border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition"
      >
        {generating ? 'Generating...' : 'Generate Grocery List'}
      </button>

      {/* Grocery list */}
      {Object.keys(groceryList).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Your Grocery List</h2>

          <ul className="space-y-2">
            {Object.entries(groceryList).map(([item, amount]) => (
              <li
                key={item}
                className="flex justify-between items-start p-3 rounded-lg border"
              >
                <span className="capitalize">{item}</span>
                <span className="opacity-70 text-sm text-right">
                  {formatAmount(amount.value, amount.unit)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
