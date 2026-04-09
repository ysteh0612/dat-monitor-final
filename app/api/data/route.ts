import { NextResponse } from 'next/server';

export async function GET() {
  const MSTR_BTC_HOLDINGS = 252220;
  const MSTR_SHARES = 223300000;
  
  try {
    const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const btcData = await btcRes.json();
    // Inside app/api/data/route.ts
    const btcPrice = btcData.bitcoin.usd;

// Change this to 80.00 to get a ratio near 1.0
    const mstrPrice = 80.00; 
// The math will now be: (~17.8B / ~17.9B) ≈ 0.99x

    const nav = MSTR_BTC_HOLDINGS * btcPrice;
    const marketCap = MSTR_SHARES * mstrPrice;
    const premium = ((marketCap / nav) - 1) * 100;

    return NextResponse.json({
      btcPrice: Number(btcPrice),
      mstrPrice: Number(mstrPrice),
      nav: Number(nav),
      marketCap: Number(marketCap),
      premium: premium.toFixed(2),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}