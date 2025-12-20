// app/api/chat/route.ts
import type { NextRequest } from "next/server";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

function makeError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = (body?.prompt || "").toString().trim();
    const cookTime = (body?.cookTime || "").toString().trim();
    const priorRecipe = body?.recipe ?? null; // optional current recipe
    const conversation: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];

    if (!prompt) return makeError("Missing prompt", 400);

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return makeError("Server misconfigured (missing API key)", 500);

    // Build system message instructing the model how to behave for edits
    const systemMessage = {
      role: "system",
      content:
        "You are a helpful recipe assistant and professional chef. The user has a recipe (if provided). " +
        "When the user asks to modify or improve the recipe, respond in JSON with the exact shape " +
        `{"title": "...", "description":"...", "prepTime":"...", "cookTime":"...", "servings": num, "difficulty":"...", "ingredients":[{"item":"...","amount":"..."}], "instructions":["..."], "tips":["..."]}` +
        " — and *only* return that JSON (no markdown). If the user is asking a question or wants advice, reply with a plain text assistant message in the 'reply' field. If you return both a reply and an updated recipe, the server will parse and forward both." + 
        "If the user enters something completely random with no context to editing the recipe or food in general, then reply with a plain text message in the 'reply' field saying 'Unable to understand the user request'"

    };

    // Compose messages: system + optional prior conversation + user prompt
    const messages = [systemMessage, ...conversation.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: prompt }];

    // Optionally include the current recipe as context (non-mandatory)
    if (priorRecipe) {
      messages.unshift({
        role: "system",
        content: `Current recipe (JSON): ${JSON.stringify(priorRecipe)}`,
      });
    }

    const providerRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!providerRes.ok) {
      const text = await providerRes.text().catch(() => `provider status ${providerRes.status}`);
      return makeError(`Provider error: ${text}`, providerRes.status);
    }

    const providerJson = await providerRes.json().catch(() => null);
    const content = providerJson?.choices?.[0]?.message?.content;
    if (!content) return makeError("Provider returned no content", 502);

    // Try to parse a JSON recipe out of the content. Accept either raw JSON or a wrapper with reply+recipe.
    let parsedRecipe = null;
    let replyText = content;


    // If the assistant returned fenced code or text, strip fences
    const clean = content.replace(/```json|```/g, "").trim();

    // If content looks like JSON object, try parse
    if (clean.startsWith("{") || clean.startsWith("[")) {
      try {
        const parsed = JSON.parse(clean);
        // If parsed has recipe-like keys, assume it's the recipe
        const looksLikeRecipe = parsed && typeof parsed === "object" && (parsed.title || parsed.ingredients || parsed.instructions);
        if (looksLikeRecipe) {
          parsedRecipe = parsed;
          replyText = "Recipe updated.";
        } else if (parsed && parsed.reply) {
          replyText = parsed.reply;
          if (parsed.recipe) parsedRecipe = parsed.recipe;
        } else {
          replyText = typeof parsed === "string" ? parsed : JSON.stringify(parsed);
        }

      } catch (e) {
        // not valid JSON -> treat as plain text reply (do nothing)
        replyText = content;
      }
    } else {
      // not JSON -> plain text reply
      replyText = content;
    }

    // Clean "reply: ..." junk if model sends that
    replyText = replyText.replace(/^reply\s*:\s*/i, "").trim();

    return new Response(JSON.stringify({ reply: replyText, recipe: parsedRecipe }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Route error /api/chat:", err);
    return makeError(err?.message || "Server error", 500);
  }
}
