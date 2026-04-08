"use client";
import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, BarChart3, Bot, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [aiText, setAiText] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [timeRange, setTimeRange] = useState('1M');

  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(json => setData(json));
  }, []);
  // Inside your app/page.tsx, make sure this part is solid:

  const currentPremium = data?.premium ? parseFloat(data.premium) : 0;
  const currentRatio = (currentPremium / 100) + 1;

// Use currentRatio for your chart and metrics

  const chartData = useMemo(() => {
    if (!data) return [];
    let points = timeRange === '3D' ? 3 : timeRange === '1W' ? 7 : timeRange === '1M' ? 30 : 90;
    
    // We base the mock data around 1.0x to match your friend's visual style
    return Array.from({ length: points }).map((_, i) => {
      const day = i + 1;
      const noise = Math.sin(i * 0.3) * 0.05 + Math.random() * 0.02;
      const val = 1.0 - (0.003 * (points - i)) + noise;
      return {
        name: points > 7 ? (day % 4 === 0 ? (day === 28 ? 'APR' : day) : '') : `Day ${day}`,
        ratio: parseFloat(val.toFixed(2))
      };
    });
  }, [data, timeRange]);

  if (!data) return <div className="min-h-screen bg-[#0f111a] flex items-center justify-center text-slate-500 font-mono">LOADING TERMINAL...</div>;

  return (
    <main className="min-h-screen bg-[#0b0e14] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Metric Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#151921] p-5 rounded-lg border border-slate-800">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">BTC Index</p>
            <p className="text-2xl font-mono">${Number(data.btcPrice).toLocaleString()}</p>
          </div>
          <div className="bg-[#151921] p-5 rounded-lg border border-slate-800">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">mNAV Multiplier</p>
            <p className="text-2xl font-mono text-purple-500">{(parseFloat(data.premium)/100 + 1).toFixed(2)}x</p>
          </div>
          <div className="bg-[#151921] p-5 rounded-lg border border-slate-800">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Market Cap</p>
            <p className="text-2xl font-mono">${(data.marketCap / 1e9).toFixed(2)}B</p>
          </div>
        </div>

        {/* PRO CHART SECTION */}
        <div className="bg-[#151921] p-8 rounded-xl border border-slate-800 shadow-xl relative">
          
          {/* Header & Legend */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-2xl font-bold mb-1">mNAV Ratio Trend</h2>
              <p className="text-slate-500 text-xs font-mono">Historical Premium/Discount Multiplier (30D)</p>
            </div>
            <div className="flex flex-col items-end gap-4">
               {/* Timeframe selector like your friend's UI usually has hidden in the corner */}
              <div className="flex bg-[#0b0e14] p-1 rounded-md border border-slate-700">
                {['3D', '1W', '1M', '1Y'].map((t) => (
                  <button key={t} onClick={() => setTimeRange(t)} className={`px-3 py-1 text-[10px] font-bold rounded ${timeRange === t ? 'bg-purple-600 text-white' : 'text-slate-500'}`}>{t}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono">Ratio Multiplier</span>
              </div>
            </div>
          </div>

          {/* Chart Core */}
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                {/* Dashed Grid Lines - Matches Friend's Image */}
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4a5568', fontSize: 11, fontWeight: 'bold' }} 
                  dy={10} 
                />
                
                <YAxis 
                  domain={[0.8, 1.1]} // Fixes the "zoom" so it matches the friend's range
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4a5568', fontSize: 11 }} 
                  tickFormatter={(v) => `${v}x`} 
                />

                <Tooltip 
                  cursor={{ stroke: '#4a5568' }}
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-[#1a202c] border border-slate-700 p-4 rounded shadow-2xl">
                          <p className="text-purple-400 font-mono font-bold text-lg">mNAV Ratio : {payload[0].value}x</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Line 
                  key={timeRange}
                  type="monotone" 
                  dataKey="ratio" 
                  stroke="#a855f7" 
                  strokeWidth={3} 
                  dot={false}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Action */}
        <div className="mt-8 bg-[#151921] p-6 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="text-blue-500" />
            <p className="text-sm font-bold text-slate-300">Run AI Portfolio Analysis</p>
          </div>
          <button onClick={() => alert("Check API Configuration")} className="bg-blue-600 px-6 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition">Execute</button>
        </div>

      </div>
    </main>
  );
}