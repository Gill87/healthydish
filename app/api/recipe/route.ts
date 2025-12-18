import type { NextRequest } from "next/server";

type Ingredient = { item: string; amount: string };
type Recipe = {
  title: string;
  description?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  difficulty?: string;
  ingredients: Ingredient[];
  instructions: string[];
  tips?: string[];
};

function makeError(message: string, status = 502) {
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

    if (!prompt) return makeError("Missing prompt", 400);
    if(prompt.length > 2000) return makeError("Prompt is too long", 400); // Check Length

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return makeError("Server misconfigured (missing API key)", 500);

    // Run an AI-based classification to ensure the prompt is food-related
    try {
      const classifyRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are a classifier that determines whether a user's text is requesting a food or recipe-related task. Reply with ONLY valid JSON with these keys: {\"is_food\": true|false, \"confidence\": 0-1, \"reason\": \"short explanation\"}. Do NOT add any extra text."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0,
          max_tokens: 200,
        }),
      });

      if (!classifyRes.ok) {
        // if classifier fails, allow generation to continue (fail-open) but log
        const txt = await classifyRes.text().catch(() => `Classifier error: ${classifyRes.status}`);
        console.warn("Classifier warning:", txt);
      } else {
        const classifier = await classifyRes.json().catch(() => null);
        const rawClass = classifier?.choices?.[0]?.message?.content;
        if (rawClass) {
          try {
            const cleaned = rawClass.replace(/```json|```/g, "").trim();
            const parsedClass = JSON.parse(cleaned);
            if (!parsedClass.is_food) {
              return makeError("Please enter a food-related prompt and try again.", 400);
            }
          } catch (e) {
            // parse failed: ignore and proceed to generation
          }
        }
      }
    } catch (e) {
      console.warn("Classifier error", e);
    }

    // Call the provider
    const deepseekRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are a professional chef and nutritionist. Create detailed, healthy recipes in JSON format with the following structure: {\"title\": \"Recipe Name\", \"description\": \"Brief description\", \"prepTime\": \"X min\", \"cookTime\": \"X min\", \"servings\": X, \"difficulty\": \"Easy/Medium/Hard\", \"ingredients\": [{\"item\": \"ingredient\", \"amount\": \"quantity\"}], \"instructions\": [\"step 1\", \"step 2\"], \"tips\": [\"tip 1\", \"tip 2\"] }"
          },
          {
            role: "user",
            content: `Create a healthy recipe for: ${prompt}. Cook time should be around ${cookTime}. Return ONLY valid JSON, no markdown formatting.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!deepseekRes.ok) {
      const txt = await deepseekRes.text().catch(() => `Provider error: ${deepseekRes.status}`);
      return makeError(`Provider error: ${txt}`, deepseekRes.status);
    }

    const provider = await deepseekRes.json().catch(() => null);
    const rawContent = provider?.choices?.[0]?.message?.content;
    if (!rawContent) return makeError("Invalid provider response (missing content)", 502);

    // Clean fences and parse JSON
    let parsed: any;
    try {
      const clean = rawContent.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch (e: any) {
      return makeError("Failed to parse provider JSON: " + (e?.message || ""), 502);
    }

    // Basic validation
    if (
      !parsed ||
      typeof parsed.title !== "string" ||
      !Array.isArray(parsed.ingredients) ||
      !Array.isArray(parsed.instructions)
    ) {
      return makeError("Parsed recipe missing required fields (title/ingredients/instructions)", 502);
    }

    // Normalize fields and provide defaults
    const recipe: Recipe = {
      title: parsed.title,
      description: parsed.description || "",
      prepTime: parsed.prepTime || "15 min",
      cookTime: parsed.cookTime || cookTime || "30 min",
      servings: typeof parsed.servings === "number" ? parsed.servings : Number(parsed.servings) || 4,
      difficulty: parsed.difficulty || "Medium",
      ingredients: parsed.ingredients.map((ing: any) => ({
        item: String(ing.item || ing.name || ""),
        amount: String(ing.amount || ing.qty || ""),
      })),
      instructions: parsed.instructions.map((s: any) => String(s)),
      tips: Array.isArray(parsed.tips) ? parsed.tips.map((t: any) => String(t)) : [],
    };

    return new Response(JSON.stringify({ recipe }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Route error /api/recipe:", err);
    return makeError(err?.message || "Server error", 500);
  }
}
