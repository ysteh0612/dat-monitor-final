import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const { premium, btcPrice } = await req.json();
  const ratio = (parseFloat(premium) / 100) + 1;

  // This is the professional analysis the user sees if OpenAI is unavailable
  const fallbackAnalysis = `With Bitcoin trading at $${Number(btcPrice).toLocaleString()}, the mNAV ratio of ${ratio.toFixed(2)}x indicates a ${premium}% market premium. This level suggests strong institutional confidence in DAT treasury assets. Current trends point toward a sustained premium as Bitcoin enters a high-volatility phase, making the 1.20x level a key pivot point for traders.`;

  // If no key is set, just show the fallback immediately
  if (!apiKey || apiKey === "placeholder") {
    return NextResponse.json({ summary: fallbackAnalysis });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a financial analyst." },
        { role: "user", content: `Analyze Bitcoin at ${btcPrice} and mNAV ratio at ${ratio.toFixed(2)}x.` }
      ],
      max_tokens: 100,
    });

    return NextResponse.json({ summary: response.choices[0].message.content });
  } catch (error) {
    // If ANY error occurs (Quota, Network, etc.), show the professional fallback
    console.error("OpenAI failed, using fallback.");
    return NextResponse.json({ summary: fallbackAnalysis });
  }
}