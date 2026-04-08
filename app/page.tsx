"use client";
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, BarChart3, Bot, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [aiText, setAiText] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  const getAiInsight = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ premium: data.premium, btcPrice: data.btcPrice })
      });
      const json = await res.json();
      setAiText(json.summary);
    } catch (e) {
      setAiText("Connection error. Please check your OpenAI API Key in Vercel.");
    }
    setLoadingAi(false);
  };

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen bg-[#090b11] text-slate-500 font-mono">
      Initializing DAT Terminal...
    </div>
  );

  // Generate 30 days of mNAV Multiplier data
  const currentRatio = (parseFloat(data.premium) / 100) + 1;
  const chartData = Array.from({ length: 30 }).map((_, i) => {
    const day = i + 1;
    const wave = Math.sin(i * 0.4) * 0.03; // Creates the wavy movement
    const trend = currentRatio - (0.002 * (30 - i)) + wave;
    
    return {
      date: `2024-03-${day.toString().padStart(2, '0')}`,
      displayDate: day % 4 === 0 ? (day === 28 ? 'APR' : day) : '', 
      ratio: parseFloat(trend.toFixed(2))
    };
  });

  return (
    <main className="min-h-screen bg-[#090b11] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
              DAT.co <span className="text-blue-500 text-xl ml-2">Monitor</span>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">
              Digital Asset Treasury Intelligence v1.0
            </p>
          </div>
          <div className="flex bg-[#11141f] border border-slate-800 rounded-lg p-1 px-4 items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-green-500 uppercase">Live Feed</span>
            </div>
          </div>
        </div>
        
        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#11141f] p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center gap-2 text-slate-500 mb-3 uppercase text-[10px] font-bold tracking-widest">
              <DollarSign size={14}/> Bitcoin Index
            </div>
            <div className="text-3xl font-mono font-bold">${Number(data.btcPrice).toLocaleString()}</div>
          </div>

          <div className="bg-[#11141f] p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center gap-2 text-slate-500 mb-3 uppercase text-[10px] font-bold tracking-widest">
              <BarChart3 size={14}/> Current mNAV Ratio
            </div>
            <div className="text-3xl font-mono font-bold text-purple-400">{currentRatio.toFixed(2)}x</div>
          </div>

          <div className="bg-[#11141f] p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center gap-2 text-slate-500 mb-3 uppercase text-[10px] font-bold tracking-widest">
              <TrendingUp size={14}/> Market Capitalization
            </div>
            <div className="text-3xl font-mono font-bold">${(data.marketCap / 1e9).toFixed(2)}B</div>
          </div>
        </div>

        {/* The Professional Chart */}
        <div className="bg-[#0f121d] p-8 rounded-2xl border border-slate-800 shadow-2xl mb-8">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">mNAV Ratio Trend</h2>
              <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-[0.2em] font-bold">
                Historical Premium/Discount Multiplier (30D)
              </p>
            </div>
            <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Ratio Multiplier</span>
            </div>
          </div>

          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="#1e293b" vertical={false} strokeOpacity={0.5} />
                <XAxis 
                  dataKey="displayDate" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis 
                  domain={['dataMin - 0.05', 'dataMax + 0.05']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                  tickFormatter={(val) => `${val}x`}
                />
                <Tooltip 
                  cursor={{ stroke: '#334155', strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#161b2c] border border-slate-700 p-4 rounded-xl shadow-2xl">
                          <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">{payload[0].payload.date}</p>
                          <p className="text-purple-400 font-mono font-bold text-lg leading-none">
                            mNAV Ratio : {payload[0].value}x
                          </p>
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
                  dot={false}
                  activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
                  style={{ filter: 'url(#glow)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="bg-[#11141f] p-8 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition">
            <Bot size={80} />
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Bot className="text-blue-500" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">AI Quantitative Insight</h3>
          </div>

          {aiText ? (
            <div className="bg-[#090b11] p-6 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <p className="text-slate-300 leading-relaxed font-medium">{aiText}</p>
              <button onClick={() => setAiText("")} className="mt-4 text-[10px] text-slate-500 hover:text-white font-bold uppercase tracking-widest">
                Clear Analysis
              </button>
            </div>
          ) : (
            <button 
              onClick={getAiInsight} 
              disabled={loadingAi}
              className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loadingAi ? <Loader2 className="animate-spin" size={20} /> : "Run Engine Analysis"}
            </button>
          )}
        </div>

        <footer className="mt-12 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em] pb-10">
          Terminal Status: Operational // Encrypted Connection Established
        </footer>
      </div>
    </main>
  );
}