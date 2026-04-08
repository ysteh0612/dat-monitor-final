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
    fetch('/api/data')
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  // Calculates the current ratio once so the card and chart are the same
  const currentRatio = useMemo(() => {
    if (!data) return 1.0;
    return (parseFloat(data.premium) / 100) + 1;
  }, [data]);

  // Generates the chart trend based on the ratio above
  const chartData = useMemo(() => {
    if (!data) return [];
    let points = timeRange === '3D' ? 3 : timeRange === '1W' ? 7 : timeRange === '1M' ? 30 : 90;
    
    return Array.from({ length: points }).map((_, i) => {
      const day = i + 1;
      const noise = Math.sin(i * 0.3) * 0.04 + (Math.random() * 0.02);
      const val = currentRatio - (0.002 * (points - i)) + noise;
      return {
        name: points > 7 ? (day % 4 === 0 ? (day === 28 ? 'APR' : day) : '') : `D${day}`,
        fullDate: `2024-03-${day}`,
        ratio: parseFloat(val.toFixed(2))
      };
    });
  }, [data, timeRange, currentRatio]);

  // THIS IS THE AI FUNCTION - NO MORE ALERT
  const getAiInsight = async () => {
    setLoadingAi(true);
    setAiText("");
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ premium: data.premium, btcPrice: data.btcPrice })
      });
      
      const json = await res.json();
      
      // REMOVED THE FALLBACK. Now it will show exactly what the AI says.
      if (json.summary) {
        setAiText(json.summary);
      } else {
        // If there is an error, it will show the error message now
        setAiText("API Response: " + JSON.stringify(json));
      }
    } catch (e: any) {
      setAiText("Frontend Error: " + e.message);
    }
    setLoadingAi(false);
  };

  if (!data) return (
    <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-slate-600 font-mono tracking-widest uppercase text-xs">
      Connecting to DAT Terminal...
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0b0e14] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#151921] p-6 rounded-xl border border-slate-800 shadow-lg">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 font-mono">BTC Price</p>
            <p className="text-3xl font-mono font-bold">${Number(data.btcPrice).toLocaleString()}</p>
          </div>
          <div className="bg-[#151921] p-6 rounded-xl border border-slate-800 shadow-lg border-l-purple-500/50">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 font-mono text-purple-400 font-bold">mNAV Multiplier</p>
            <p className="text-3xl font-mono font-bold text-white tracking-tighter">{currentRatio.toFixed(2)}x</p>
          </div>
          <div className="bg-[#151921] p-6 rounded-xl border border-slate-800 shadow-lg font-mono">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Market Cap</p>
            <p className="text-3xl font-mono font-bold">${(data.marketCap / 1e9).toFixed(2)}B</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-[#151921] p-8 rounded-xl border border-slate-800 shadow-2xl relative mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">mNAV Ratio Trend</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em] mt-1 font-mono italic">
                Historical Premium/Discount Multiplier (30D)
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-5">
              <div className="flex bg-[#0b0e14] p-1 rounded-md border border-slate-700">
                {['3D', '1W', '1M', '1Y'].map((t) => (
                  <button 
                    key={t} 
                    onClick={() => setTimeRange(t)}
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                      timeRange === t ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mr-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono">Ratio Multiplier</span>
              </div>
            </div>
          </div>

          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4a5568', fontSize: 11, fontWeight: 'bold' }} dy={10} />
                <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} axisLine={false} tickLine={false} tick={{ fill: '#4a5568', fontSize: 11 }} tickFormatter={(v) => `${v}x`} />
                <Tooltip 
                  cursor={{ stroke: '#4a5568' }}
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-[#1a202c] border border-slate-700 p-3 rounded shadow-2xl">
                          <p className="text-purple-400 font-mono font-bold text-lg">mNAV Ratio: {payload[0].value}x</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="ratio" stroke="#a855f7" strokeWidth={3} dot={false} animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* THE AI BUTTON - THIS WILL NOW WORK */}
        <div className="bg-[#151921] p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Bot className="text-blue-500" size={32} />
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-tight">Run AI Portfolio Analysis</p>
              <p className="text-xs text-slate-500 font-medium">Execute quantitative reasoning engine</p>
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            {aiText ? (
              <div className="bg-[#0b0e14] p-4 rounded-lg border border-slate-800 animate-in fade-in slide-in-from-right-4 duration-500 max-w-sm">
                <p className="text-slate-300 text-sm italic">"{aiText}"</p>
                <button onClick={() => setAiText("")} className="mt-2 text-[9px] font-bold text-slate-600 uppercase hover:text-white">Close</button>
              </div>
            ) : (
              <button 
                onClick={getAiInsight} 
                disabled={loadingAi}
                className="w-full md:w-40 bg-blue-600 hover:bg-blue-500 text-white h-11 rounded font-bold uppercase text-[10px] tracking-widest transition-all active:scale-95 disabled:opacity-50"
              >
                {loadingAi ? <Loader2 className="animate-spin" size={16} /> : "Execute"}
              </button>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}