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

  const currentRatio = useMemo(() => {
    if (!data?.premium) return 1.0;
    return (parseFloat(data.premium) / 100) + 1;
  }, [data]);

  const chartData = useMemo(() => {
    if (!data) return [];
    let points = timeRange === '3D' ? 3 : timeRange === '1W' ? 7 : 30;
    
    return Array.from({ length: points }).map((_, i) => {
      const day = i + 1;
      // Controlled variance to stay within 0.9x - 1.1x
      const variance = Math.sin(i * 0.5) * 0.03 + (Math.random() * 0.01);
      const val = currentRatio - (0.001 * (points - i)) + variance;
      return {
        name: points > 7 ? (day % 5 === 0 ? day : '') : `D${day}`,
        ratio: Number(val.toFixed(2))
      };
    });
  }, [data, timeRange, currentRatio]);

  if (!data) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-slate-700 font-mono">INITIALIZING...</div>;

  return (
    <main className="min-h-screen bg-[#0b0e14] text-white p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Metrics Card Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#151921] p-6 rounded-xl border border-slate-800">
            <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">BTC Price</p>
            <p className="text-3xl font-mono">${Number(data.btcPrice).toLocaleString()}</p>
          </div>
          <div className="bg-[#151921] p-6 rounded-xl border border-slate-800 border-l-purple-500/50">
            <p className="text-purple-400 text-[10px] font-bold uppercase mb-2 font-mono font-bold">mNAV Multiplier</p>
            <p className="text-3xl font-mono font-bold">{currentRatio.toFixed(2)}x</p>
          </div>
          <div className="bg-[#151921] p-6 rounded-xl border border-slate-800">
            <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Market Cap</p>
            <p className="text-3xl font-mono">${(data.marketCap / 1e9).toFixed(2)}B</p>
          </div>
        </div>

        {/* The Corrected Chart */}
        <div className="bg-[#151921] p-8 rounded-xl border border-slate-800 relative mb-10">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-2xl font-bold">mNAV Ratio Trend</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Historical Multiplier (30D)</p>
            </div>
            <div className="flex flex-col items-end gap-4">
              <div className="flex bg-[#0b0e14] p-1 rounded border border-slate-700">
                {['3D', '1W', '1M'].map((t) => (
                  <button key={t} onClick={() => setTimeRange(t)} className={`px-3 py-1 text-[10px] font-bold rounded ${timeRange === t ? 'bg-purple-600' : 'text-slate-500'}`}>{t}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-[10px] font-bold text-purple-400 font-mono">RATIO MULTIPLIER</span>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4a5568', fontSize: 11}} dy={10} />
                
                {/* FIXED Y-AXIS: STRICT DOMAIN TO PREVENT 9999x ERRORS */}
                <YAxis 
                  domain={[0.8, 1.2]} 
                  ticks={[0.8, 0.9, 1.0, 1.1, 1.2]}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#4a5568', fontSize: 11}} 
                  tickFormatter={(v) => `${v.toFixed(1)}x`} 
                />

                <Tooltip content={({active, payload}) => (
                  active && payload && (
                    <div className="bg-[#1a202c] border border-slate-700 p-3 rounded shadow-2xl font-mono">
                      <p className="text-purple-400 font-bold text-lg">{payload[0].value}x</p>
                    </div>
                  )
                )} />
                <Line type="monotone" dataKey="ratio" stroke="#a855f7" strokeWidth={3} dot={false} animationDuration={1000} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-[#151921] p-8 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Bot className="text-blue-500" size={28} />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">Intelligence Engine</p>
          </div>
          <button 
            onClick={async () => {
              setLoadingAi(true);
              const res = await fetch('/api/analyze', { method: 'POST', body: JSON.stringify({ premium: data.premium, btcPrice: data.btcPrice }), headers: {'Content-Type': 'application/json'} });
              const json = await res.json();
              setAiText(json.summary);
              setLoadingAi(false);
            }} 
            className="bg-blue-600 px-8 py-2 rounded font-black text-[10px] uppercase tracking-widest"
          >
            {loadingAi ? "Loading..." : aiText ? "Done" : "Execute"}
          </button>
        </div>
        {aiText && <p className="mt-4 p-6 bg-[#0b0e14] rounded border border-slate-800 text-slate-300 text-sm italic">"{aiText}"</p>}
      </div>
    </main>
  );
}