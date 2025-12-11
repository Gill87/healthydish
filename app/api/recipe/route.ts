// app/api/generate/route.ts
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, cookTime } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), { status: 500 });
    }

    // Server-side fetch to DeepSeek
    const deepseekRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a professional chef and nutritionist. Create detailed, healthy recipes in JSON format..."
          },
          {
            role: "user",
            content: `Create a healthy recipe for: ${prompt}. Cook time should be around ${cookTime}. Return ONLY valid JSON.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!deepseekRes.ok) {
      const errText = await deepseekRes.text().catch(() => "unknown error");
      return new Response(JSON.stringify({ error: errText }), { status: deepseekRes.status });
    }

    const data = await deepseekRes.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Server error" }), { status: 500 });
  }
}
