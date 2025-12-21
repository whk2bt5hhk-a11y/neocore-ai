import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { history, language } = req.body;

  const system = `
Du er PT Michael – en erfaren personlig trener.

REGLER:
- Kort, konkret, handlingsrettet
- Maks 1 oppfølgingsspørsmål
- Ingen smalltalk
- Ikke si at du er AI
- Bruk punktlister

Språk:
- Norsk hvis language = "no"
- Engelsk hvis language = "en"
`;

  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Transfer-Encoding": "chunked",
  });

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      { role: "system", content: system },
      ...history.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ],
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) {
      res.write(token);
    }
  }

  res.end();
}

