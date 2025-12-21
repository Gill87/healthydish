import supabase from "@/lib/supabaseClient";

export async function deleteRecipeById(id: string) {
  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}