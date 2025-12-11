'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Flame,
  ChefHat,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function RecipePage() {
  const [recipe, setRecipe] = useState<{
    title: string;
    description: string;
    prepTime: string;
    cookTime: string;
    servings: number;
    calories: number;
    difficulty: string;
    ingredients: Array<{ item: string; amount: string }>;
    instructions: string[];
    nutrition: {
      protein: string;
      carbs: string;
      fat: string;
      fiber: string;
    };
    tips: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get parameters from URL
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get('prompt');
    const cookTime = params.get('cookTime');

    if (prompt && cookTime) {
      generateRecipe(prompt, cookTime);
    }
  }, []);

  // Replace your existing generateRecipe with this function inside RecipePage
  const generateRecipe = async (prompt: string, cookTime: string) => {
  setLoading(true);
  setError(null);

  try {
    // Call your server-side route handler (same-origin) 
    const response = await fetch("/api/generate", { // Fetch automatically finds and calls route.ts
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, cookTime }),
    });

    // If route returns non-200, show helpful message
    if (!response.ok) {
      // try to parse JSON error from your route
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.error || `Server error: ${response.status}`);
    }

    const data = await response.json();

    // Keep your existing API-schema checks (DeepSeek-style)
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid API response structure");
    }

    const content: string = data.choices[0].message.content;

    // Clean backticks/code fences and parse JSON
    const cleanContent = content.replace(/```json|```/g, "").trim();
    const parsedRecipe = JSON.parse(cleanContent);

    // Validate required fields
    if (!parsedRecipe.title || !parsedRecipe.ingredients || !parsedRecipe.instructions) {
      throw new Error("Recipe is missing required fields");
    }

    // Normalize defaults like you had before
    const recipeData = {
      title: parsedRecipe.title || "Untitled Recipe",
      description: parsedRecipe.description || "A delicious and nutritious meal",
      prepTime: parsedRecipe.prepTime || "15 min",
      cookTime: parsedRecipe.cookTime || cookTime,
      servings: parsedRecipe.servings || 4,
      calories: parsedRecipe.calories || 0,
      difficulty: parsedRecipe.difficulty || "Medium",
      ingredients: parsedRecipe.ingredients || [],
      instructions: parsedRecipe.instructions || [],
      nutrition: parsedRecipe.nutrition || {
        protein: "0g",
        carbs: "0g",
        fat: "0g",
        fiber: "0g",
      },
      tips: parsedRecipe.tips || [],
    };

    setRecipe(recipeData);
  } catch (err) {
    console.error("Recipe generation error:", err);
    let errorMessage = "Failed to generate recipe. Please try again.";

    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === "string") {
      errorMessage = err;
    } else if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
      errorMessage = (err as any).message;
    }

    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#459e85] animate-spin mx-auto mb-4" />
          <p className="text-lg text-slate-600">Creating your perfect recipe...</p>
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
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.history.back();
              }
            }}
            className="px-6 py-3 bg-[#459e85] text-white rounded-xl hover:bg-[#3a8570] transition-colors"
          >
            Go Back
          </button>
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
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-sm sticky top-0 z-50 border-b border-emerald-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.history.back();
              }
            }}
            className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-[#459e85]" />
            <span className="font-medium text-slate-700">HealthyDish</span>
          </div>
        </div>
      </header>

      {/* Recipe Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Recipe Header */}
        <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl p-8 mb-6 shadow-sm">
          <h1 className="text-4xl font-semibold text-slate-800 mb-4">{recipe.title}</h1>
          <p className="text-lg text-slate-600 mb-6">{recipe.description}</p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#459e85]" />
              <span className="text-sm text-slate-600">
                <strong className="text-slate-800">{recipe.prepTime}</strong> prep + <strong className="text-slate-800">{recipe.cookTime}</strong> cook
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#459e85]" />
              <span className="text-sm text-slate-600">
                <strong className="text-slate-800">{recipe.servings}</strong> servings
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#459e85]" />
              <span className="text-sm text-slate-600">
                <strong className="text-slate-800">{recipe.calories}</strong> cal/serving
              </span>
            </div>
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
              {recipe.difficulty}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Ingredients */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Ingredients</h2>
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

              {/* Nutrition */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Nutrition per serving</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Protein</span>
                      <p className="font-semibold text-slate-800">{recipe.nutrition.protein}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Carbs</span>
                      <p className="font-semibold text-slate-800">{recipe.nutrition.carbs}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Fat</span>
                      <p className="font-semibold text-slate-800">{recipe.nutrition.fat}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Fiber</span>
                      <p className="font-semibold text-slate-800">{recipe.nutrition.fiber}</p>
                    </div>
                  </div>
                </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Instructions</h2>
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
            </div>

            {/* Tips */}
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
      </main>
    </div>
  );
}