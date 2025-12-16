import supabase from "@/lib/supabaseClient";
import type { Recipe } from "@/types/recipe";

export async function saveRecipe(
    recipe: Recipe, 
    userId: string, 
    generationId: string
) {
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
