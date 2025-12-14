import type { VercelRequest, VercelResponse } from "vercel";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, language } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OpenAI API key" });
    }

    const system =
      language === "en"
        ? "You are PT Michael, an experienced personal trainer. Be concrete and concise."
        : "Du er PT Michael, en erfaren personlig trener. Vær konkret og kort.";

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        max_tokens: 600,
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      return res.status(500).json({ error: "OpenAI error", detail: t });
    }

    const data = await r.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    return res.status(200).json({ text });
  } catch (e: any) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
