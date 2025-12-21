import type { VercelRequest, VercelResponse } from "vercel";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { history, language } = req.body;

    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: "Missing history" });
    }

    const systemPrompt =
      language === "no"
        ? "Du er PT Michael, en erfaren personlig trener. Svar konkret, praktisk og motiverende."
        : "You are PT Michael, an experienced personal trainer. Be concrete, practical and motivating.";

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 600,
    });

    const text =
      completion.choices[0]?.message?.content ??
      "No response from AI";

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error("PT ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
      detail: error?.message ?? "Unknown error",
    });
  }
}
