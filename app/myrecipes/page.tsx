'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";
import { deleteRecipeById } from "@/lib/deleteRecipe";
import { Heart, Trash2 } from "lucide-react";

type RecipeRow = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  is_favorited: boolean;
};

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setIsAuthed(!!user);

        if (!user) {
          // keep list empty for unauthenticated users (show signup CTA)
          setRecipes([]);
          return;
        }

        const { data, error } = await supabase
          .from("recipes")
          .select("id, title, description, created_at, is_favorited")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setRecipes(data ?? []);
      } catch (e: any) {
        setError(e.message ?? "Failed to load recipes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="page flex items-center justify-center">
        <p className="text-muted">Loading recipes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  const favorited = recipes.filter(r => r.is_favorited);
  const recent = recipes.slice(0, 5); // last 5 created

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes(recipes.filter(r => r.id !== recipeId));
  };

  return (
    <div className="page">
      <main className="container space-y-10 py-8">

        {/* FAVORITES */}
        <section>
          <h2 className="mb-4">Favorited Recipes</h2>

          {favorited.length === 0 ? (
            isAuthed ? (
              <p className="text-muted">No favorited recipes yet.</p>
            ) : (
              <p className="text-muted">
                <Link className="text-accent underline" href="/signup">Sign up</Link> or{" "}
                <Link className="text-accent underline" href="/signin">Log in</Link> to favorite and save recipes
              </p>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorited.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDeleteRecipe} />
              ))}
            </div>
          )}
        </section>

        {/* RECENT */}
        <section>
          <h2 className="mb-4">Recently Created</h2>

          {recent.length === 0 ? (
            isAuthed ? (
              <p className="text-muted">No recipes created yet.</p>
            ) : (
              <p className="text-muted">
                <Link className="text-accent underline" href="/signup">Sign up</Link> or{" "}
                <Link className="text-accent underline" href="/signin">Log in</Link> to favorite and save recipes
              </p>            
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recent.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDeleteRecipe} />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

/* ---------------- CARD ---------------- */

function RecipeCard({ recipe, onDelete }: { recipe: RecipeRow; onDelete: (id: string) => void }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteRecipeById(recipe.id);
      onDelete(recipe.id);
      setShowConfirm(false);
    } catch (e: any) {
      alert("Failed to delete recipe: " + (e.message ?? "Unknown error"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Link href={`/recipe?id=${recipe.id}`}>
        <div className="card p-4 h-full flex flex-col justify-between cursor-pointer relative">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2">{recipe.title}</h3>
            {recipe.is_favorited && (
              <Heart className="w-4 h-4 fill-current" />
            )}
          </div>

          {recipe.description && (
            <p className="text-sm mt-2 line-clamp-3">
              {recipe.description}
            </p>
          )}

          <div className="flex items-end justify-between mt-4">
            <p className="text-xs text-muted">
              {new Date(recipe.created_at).toLocaleDateString()}
            </p>
            <button
              
              onClick={handleDelete}
              className="text-muted rounded-full p-1 hover:bg-black/10 transition-colors"
              title="Delete recipe"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>

      {showConfirm && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="modal-panel rounded-lg p-6 max-w-sm mx-4 shadow-lg">
            <h3 className="mb-2">Delete Recipe?</h3>
            <p className="mb-6">
              Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-md transition-colors has-bubble"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md transition-colors disabled:opacity-50 has-bubble"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
