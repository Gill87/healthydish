import supabase from "@/lib/supabaseClient";
import type { Recipe } from "@/types/recipe";

export async function updateRecipe(
  recipeId: string,
  recipe: Recipe,
) {
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
