import { NextResponse } from 'next/server';

export async function GET() {
  const MSTR_BTC_HOLDINGS = 252220;
  const MSTR_SHARES = 223300000;
  try {
    const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const btcData = await btcRes.json();
    const btcPrice = btcData.bitcoin.usd;
    const mstrPrice = 350.00; // Mock price (can be replaced with live API later)

    const nav = MSTR_BTC_HOLDINGS * btcPrice;
    const marketCap = MSTR_SHARES * mstrPrice;
    const premium = ((marketCap / nav) - 1) * 100;

    return NextResponse.json({
      btcPrice,
      mstrPrice,
      nav,
      marketCap,
      premium: premium.toFixed(2),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}