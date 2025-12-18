import supabase from "@/lib/supabaseClient";
import type { Recipe } from "@/types/recipe";
import guestSession from "@/lib/guestSession";

export async function updateRecipe(
  recipeId: string,
  recipe: Recipe,
) {
  // Client-side guest update
  if (typeof window !== 'undefined' && recipeId.startsWith('guest_')) {
    return guestSession.updateGuestRecipe(recipeId, recipe);
  }

  const { error } = await supabase
    .from("recipes")
    .update({
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
    .eq("id", recipeId);

  if (error) throw error;
}
