import supabase from "@/lib/supabaseClient";
import type { Recipe } from "@/types/recipe";
import guestSession from "@/lib/guestSession";

export async function saveRecipe(
  recipe: Recipe,
  userId?: string,
  generationId?: string
) {
  // Client-side guest fallback
  if (typeof window !== 'undefined' && !userId) {
    const stored = guestSession.saveGuestRecipe(recipe, generationId);
    return stored;
  }

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      user_id: userId,
      generation_id: generationId,
      title: recipe.title,
      description: recipe.description,
      prep_time: recipe.prepTime,
      cook_time: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tips: recipe.tips,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
