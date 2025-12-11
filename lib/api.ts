// lib/api.ts
import fixture from "../fixtures/peanut_butter_cookies.json";

const useMocks = typeof window !== "undefined" && (process.env.NEXT_PUBLIC_USE_MOCKS === "true");

export async function postRecipe(prompt: string, cookTime: string) {
  if (useMocks) {
    // simulate the shape your server previously returned
    return Promise.resolve({ recipe: fixture });
  }

  const res = await fetch("/api/recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, cookTime }),
  });

  if (!res.ok) throw new Error((await res.json()).error || `Server ${res.status}`);
  return res.json();
}

// optional: simple mock for chat during UI dev
export async function postChat(prompt: string, cookTime?: string, recipe?: any, messages?: any[]) {
  if (useMocks) {
    // return a canned assistant reply and optionally updated recipe (use same fixture)
    return Promise.resolve({ reply: "Applied small change: reduced sugar and added protein.", recipe: fixture });
  }

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, cookTime, recipe, messages }),
  });

  if (!res.ok) throw new Error((await res.json()).error || `Server ${res.status}`);
  return res.json();
}
