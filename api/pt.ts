import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { history, systemPrompt } = req.body;

    // 🔒 Valider input (men ikke styr logikk)
    if (!systemPrompt || typeof systemPrompt !== "string") {
      return res.status(400).json({ error: "Missing systemPrompt" });
    }

    if (!Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: "Missing history" });
    }

    /**
     * 🔑 KRITISK:
     * - Backend skal IKKE rekonstruere meldinger
     * - IKKE overstyre språk
     * - IKKE stille egne spørsmål
     * - IKKE filtrere historikk
     *
     * System prompt + full historikk sendes direkte til modellen.
     */
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...history,
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages,
    });

    const content = completion.choices[0]?.message?.content ?? "";

    // 🔒 Returner ren tekst (frontend streamer linje for linje)
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(content);

  } catch (error) {
    console.error("PT API error:", error);
    res.status(500).json({ error: "PT generation failed" });
  }
}
