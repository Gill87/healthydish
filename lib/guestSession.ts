// Client-side guest session utilities (uses localStorage)
import type { Recipe } from '@/types/recipe';

const GUEST_ID_KEY = 'hd_guest_id';
const GUEST_RECIPES_KEY_PREFIX = 'hd_guest_recipes_';

function ensureWindow() {
  if (typeof window === 'undefined') throw new Error('guestSession is client-only');
}

export function getGuestId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_ID_KEY);
}

export function ensureGuestId(): string {
  ensureWindow();
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

function recipesKey(guestId: string) {
  return `${GUEST_RECIPES_KEY_PREFIX}${guestId}`;
}

export function listGuestRecipes(): Array<any> {
  if (typeof window === 'undefined') return [];
  const guestId = getGuestId();
  if (!guestId) return [];
  const raw = localStorage.getItem(recipesKey(guestId));
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveGuestRecipe(recipe: Recipe, generationId?: string) {
  ensureWindow();
  const guestId = ensureGuestId();
  const list = listGuestRecipes();
  const id = `guest_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const stored = {
    id,
    guest_id: guestId,
    generation_id: generationId ?? null,
    title: recipe.title,
    description: recipe.description,
    prep_time: recipe.prepTime,
    cook_time: recipe.cookTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    tips: recipe.tips,
    is_favorited: false,
    created_at: now,
    updated_at: now,
  };
  list.push(stored);
  localStorage.setItem(recipesKey(guestId), JSON.stringify(list));
  return stored;
}

export function getGuestRecipeByGenerationId(generationId: string) {
  if (typeof window === 'undefined') return null;
  const list = listGuestRecipes();
  return list.find((r: any) => r.generation_id === generationId) || null;
}

export function getGuestRecipeById(id: string) {
  if (typeof window === 'undefined') return null;
  const list = listGuestRecipes();
  return list.find((r: any) => r.id === id) || null;
}

export function updateGuestRecipe(id: string, recipe: Recipe) {
  ensureWindow();
  const guestId = getGuestId();
  if (!guestId) throw new Error('No guest session');
  const key = recipesKey(guestId);
  const list = listGuestRecipes();
  const idx = list.findIndex((r: any) => r.id === id);
  if (idx === -1) throw new Error('Guest recipe not found');
  const now = new Date().toISOString();
  list[idx] = {
    ...list[idx],
    title: recipe.title,
    description: recipe.description,
    prep_time: recipe.prepTime,
    cook_time: recipe.cookTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    tips: recipe.tips,
    updated_at: now,
  };
  localStorage.setItem(key, JSON.stringify(list));
  return list[idx];
}

export default {
  ensureGuestId,
  getGuestId,
  listGuestRecipes,
  saveGuestRecipe,
  getGuestRecipeByGenerationId,
  getGuestRecipeById,
  updateGuestRecipe,
};
