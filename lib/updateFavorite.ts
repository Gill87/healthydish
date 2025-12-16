import supabase from "@/lib/supabaseClient";

/**
 * Toggle favorite state for a recipe
 */
export async function updateFavorite(
  recipeId: string,
  isFavorited: boolean
) {
  const { error } = await supabase
    .from("recipes")
    .update({ is_favorited: isFavorited })
    .eq("id", recipeId);

  if (error) {
    console.error("Failed to update favorite", error);
    throw error;
  }
}
