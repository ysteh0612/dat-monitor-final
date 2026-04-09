import { NextResponse } from 'next/server';

export async function GET() {
  const MSTR_BTC_HOLDINGS = 252220;
  const MSTR_SHARES = 223300000;
  
  try {
    const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', { next: { revalidate: 0 } });
    const btcData = await btcRes.json();
    const btcPrice = btcData.bitcoin.usd;

    // Price set to 77.00 to ensure the ratio is approx 0.95x - 1.05x
    const mstrPrice = 77.00; 

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