import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { history, language } = req.body;

  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: "Missing history" });
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        {
          role: "system",
          content: `Du er PT Michael. Svar på ${language}.`,
        },
        ...history,
      ],
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content;
      if (token) {
        res.write(token);
      }
    }

    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).end("Server error");
  }
}
