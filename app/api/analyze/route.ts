import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ summary: "API Key is missing. Please add OPENAI_API_KEY to Vercel." });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const { premium, btcPrice } = await req.json();
    const ratio = (parseFloat(premium) / 100) + 1;

    // This is the "Prompt" - we tell the AI exactly how to behave
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a senior macro strategist at a top-tier investment bank. You specialize in Bitcoin treasury companies." 
        },
        { 
          role: "user", 
          content: `Bitcoin is currently trading at $${btcPrice}. The company's mNAV ratio is ${ratio.toFixed(2)}x (which is a ${premium}% premium). Provide a 3-sentence professional market outlook. Do not mention that you are an AI.` 
        }
      ],
      temperature: 0.7, // Makes the response more natural
    });

    const aiAnalysis = response.choices[0].message.content;

    return NextResponse.json({ summary: aiAnalysis });
  } catch (error: any) {
    return NextResponse.json({ summary: "AI Engine Error: " + error.message });
  }
}