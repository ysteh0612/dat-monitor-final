import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  // If the key is missing, the website will now TELL YOU clearly.
  if (!apiKey || apiKey.includes("placeholder")) {
    return NextResponse.json({ summary: "ERROR: You have not added a real OpenAI API Key to Vercel Settings." });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const { premium, btcPrice } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a crypto analyst. Give a 3-sentence market insight." },
        { role: "user", content: `BTC: ${btcPrice}, Premium: ${premium}%` }
      ],
    });

    return NextResponse.json({ summary: response.choices[0].message.content });
  } catch (error: any) {
    // This sends the specific OpenAI error (like 'Out of credits') to your screen
    return NextResponse.json({ summary: "OpenAI Error: " + error.message });
  }
}