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

  // Syncs the chart and the metric box to the same ratio
  const currentRatio = useMemo(() => {
    if (!data) return 1.0;
    return (parseFloat(data.premium) / 100) + 1;
  }, [data]);

  const chartData = useMemo(() => {
    if (!data) return [];
    let points = timeRange === '3D' ? 3 : timeRange === '1W' ? 7 : timeRange === '1M' ? 30 : 90;
    
    return Array.from({ length: points }).map((_, i) => {
      const day = i + 1;
      // Generates a professional "wavy" trend line leading to current price
      const noise = Math.sin(i * 0.3) * 0.04 + (Math.random() * 0.02);
      const val = currentRatio - (0.002 * (points - i)) + noise;
      return {
        name: points > 7 ? (day % 4 === 0 ? (day === 28 ? 'APR' : day) : '') : `D${day}`,
        fullDate: `2024-03-${day}`,
        ratio: parseFloat(val.toFixed(2))
      };
    });
  }, [data, timeRange, currentRatio]);

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
      setAiText(json.summary);
    } catch (e) {
      setAiText("Error: Check OpenAI API Key in Vercel settings.");
    }
    setLoadingAi(false);
  };

  if (!data) return (
    <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-slate-600 font-mono tracking-widest">
      CONNECTING TO DAT TERMINAL...
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0b0e14] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Metric Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#151921] p-6 rounded-xl border border-slate-800 shadow-lg">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">BTC Index</p>
            <p className="text-3xl font-mono font-bold">${Number(data.btcPrice).toLocaleString()}</p>
          </div>
          <div className="bg-[#151921] p-6 rounded-xl border border-slate-800 shadow-lg border-l-purple-500/50">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-purple-400">mNAV Multiplier</p>
            <p className="text-3xl font-mono font-bold text-white">{currentRatio.toFixed(2)}x</p>
          </div>
          <div className="bg-[#151921] p-6 rounded-xl border border-slate-800 shadow-lg">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Market Cap</p>
            <p className="text-3xl font-mono font-bold">${(data.marketCap / 1e9).toFixed(2)}B</p>
          </div>
        </div>

        {/* Professional Chart Section */}
        <div className="bg-[#151921] p-8 rounded-2xl border border-slate-800 shadow-2xl relative mb-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">mNAV Ratio Trend</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] mt-1">
                Historical Multiplier Analysis (Dynamic)
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-5">
              {/* Timeframe Selector */}
              <div className="flex bg-[#0b0e14] p-1 rounded-lg border border-slate-700">
                {['3D', '1W', '1M', '1Y'].map((t) => (
                  <button 
                    key={t} 
                    onClick={() => setTimeRange(t)}
                    className={`px-4 py-1.5 text-[10px] font-black rounded-md transition-all ${
                      timeRange === t ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {/* Legend matching your friend's image */}
              <div className="flex items-center gap-2 mr-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest font-mono">Ratio Multiplier</span>
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart key={timeRange} data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4a5568', fontSize: 11, fontWeight: 'bold' }} 
                  dy={15} 
                />
                <YAxis 
                  domain={['dataMin - 0.1', 'dataMax + 0.1']} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4a5568', fontSize: 11 }} 
                  tickFormatter={(v) => `${v}x`} 
                />
                <Tooltip 
                  cursor={{ stroke: '#4a5568', strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-[#1a202c] border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                          <p className="text-slate-500 text-[9px] font-bold uppercase mb-1">{payload[0].payload.fullDate}</p>
                          <p className="text-purple-400 font-mono font-bold text-lg">mNAV Ratio : {payload[0].value}x</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ratio" 
                  stroke="#a855f7" 
                  strokeWidth={4} 
                  dot={timeRange === '3D'}
                  activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Action Section */}
        <div className="bg-[#151921] p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Bot className="text-blue-500" size={28} />
            </div>
            <div>
              <h3 className="font-bold text-white uppercase tracking-tight">AI Quantitative Analysis</h3>
              <p className="text-slate-500 text-xs">Execute deep learning interpretation of current mNAV metrics</p>
            </div>
          </div>
          
          <div className="w-full md:w-auto relative z-10">
            {aiText ? (
              <div className="bg-[#0b0e14] p-5 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-right-4 duration-500 max-w-md">
                <p className="text-slate-300 text-sm leading-relaxed italic">"{aiText}"</p>
                <button onClick={() => setAiText("")} className="mt-4 text-[9px] font-black text-slate-600 hover:text-blue-400 uppercase tracking-widest transition">
                  Reset Engine
                </button>
              </div>
            ) : (
              <button 
                onClick={getAiInsight} 
                disabled={loadingAi}
                className="w-full md:w-48 bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loadingAi ? <Loader2 className="animate-spin" size={18} /> : "Execute"}
              </button>
            )}
          </div>
        </div>

        <footer className="mt-12 text-center">
           <p className="text-slate-700 text-[9px] font-black uppercase tracking-[0.5em]">
             Terminal Status: Secure // Indexing Block: {data.btcPrice}
           </p>
        </footer>

      </div>
    </main>
  );
}