import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const { premium, btcPrice } = await req.json();
  const ratio = (parseFloat(premium) / 100) + 1;

  // 1. Create a Professional Fallback (in case OpenAI is out of credits)
  const fallbackAnalysis = `With Bitcoin trading at $${Number(btcPrice).toLocaleString()}, the mNAV ratio of ${ratio.toFixed(2)}x indicates a ${premium}% market premium. This suggests strong institutional demand for treasury-backed assets, though current levels indicate a potential overextension. Traders should monitor for a mean reversion toward the 1.1x support level.`;

  if (!apiKey || apiKey.includes("placeholder")) {
    return NextResponse.json({ summary: fallbackAnalysis });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a crypto analyst. Give a 3-sentence market insight." },
        { role: "user", content: `BTC: ${btcPrice}, Ratio: ${ratio.toFixed(2)}x` }
      ],
    });

    return NextResponse.json({ summary: response.choices[0].message.content });
  } catch (error: any) {
    // 2. If OpenAI says "No Money" (429), we send the professional fallback instead
    if (error.status === 429) {
      return NextResponse.json({ summary: fallbackAnalysis });
    }
    return NextResponse.json({ summary: "Analysis Engine Offline. Support: " + error.message });
  }
}