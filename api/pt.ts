import type { VercelRequest, VercelResponse } from "vercel";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { history, language } = req.body;

    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: "Missing or invalid history" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OpenAI API key" });
    }

    const systemPrompt =
      language === "en"
        ? `
You are PT Michael.
You are an experienced personal trainer and coach.
You give practical, direct and motivating answers.
You focus on progression, recovery, volume, intensity and consistency.
You never give generic motivational quotes.
You speak like a real coach, not like a chatbot.
`
        : `
Du er PT Michael.
Du er en erfaren personlig trener og coach.
Du gir konkrete, tydelige og motiverende svar.
Du fokuserer på progresjon, restitusjon, volum, intensitet og konsistens.
Du gir aldri generiske motivasjonssvar.
Du snakker som en ekte trener, ikke som en chatbot.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
    ];

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 600,
        temperature: 0.7,
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

