import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { systemPrompt } = req.body;

    if (!systemPrompt) {
      return res.status(400).json({ error: "Missing systemPrompt" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";

    // 🔒 Tving ren tekst (JSON)
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(content);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "PT generation failed" });
  }
}
