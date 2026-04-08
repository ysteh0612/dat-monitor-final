import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ summary: "AI Analysis unavailable: Missing API Key in Vercel." });

  const openai = new OpenAI({ apiKey });
  try {
    const { premium, btcPrice } = await req.json();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a financial analyst specializing in Bitcoin treasury assets." },
        { role: "user", content: `MicroStrategy (MSTR) has a ${premium}% premium to NAV. BTC is at $${btcPrice}. Provide a 2-sentence risk summary.` }
      ],
    });
    return NextResponse.json({ summary: response.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: "AI failed" }, { status: 500 });
  }
}