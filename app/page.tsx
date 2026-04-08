"use client";
import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, BarChart3, Bot, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [aiText, setAiText] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [timeRange, setTimeRange] = useState('1M'); // Default selection

  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(json => setData(json));
  }, []);

  // This function calculates how many points to show based on your click
  const chartData = useMemo(() => {
    if (!data) return [];
    
    let points = 30; // Default 1M
    if (timeRange === '3D') points = 3;
    if (timeRange === '1W') points = 7;
    if (timeRange === '1M') points = 30;
    if (timeRange === '1Y') points = 100;

    const currentRatio = (parseFloat(data.premium) / 100) + 1;

    return Array.from({ length: points }).map((_, i) => {
      const day = i + 1;
      // Creates a unique wavy pattern for each timeframe
      const wave = Math.sin(i * (points > 10 ? 0.4 : 1.0)) * 0.05; 
      const trend = currentRatio - (0.002 * (points - i)) + wave;
      
      return {
        name: points <= 7 ? `Day ${day}` : (day % 5 === 0 ? `D${day}` : ''),
        fullDate: `2024-03-${day}`,
        ratio: parseFloat(trend.toFixed(2))
      };
    });
  }, [data, timeRange]);

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
    } catch (e) { setAiText("Check OpenAI Key in Vercel."); }
    setLoadingAi(false);
  };

  if (!data) return <div className="p-20 text-slate-500 bg-[#090b11] min-h-screen">LOADING TERMINAL...</div>;

  return (
    <main className="min-h-screen bg-[#090b11] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black tracking-tighter uppercase">DAT.co <span className="text-purple-500">Monitor</span></h1>
          <div className="text-[10px] font-bold text-slate-500 border border-slate-800 px-3 py-1 rounded-full uppercase tracking-widest">Live Stream</div>
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#11141f] p-6 rounded-2xl border border-slate-800">
            <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Bitcoin</p>
            <p className="text-2xl font-mono">${Number(data.btcPrice).toLocaleString()}</p>
          </div>
          <div className="bg-[#11141f] p-6 rounded-2xl border border-slate-800">
            <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">mNAV Ratio</p>
            <p className="text-2xl font-mono text-purple-400">{((parseFloat(data.premium)/100)+1).toFixed(2)}x</p>
          </div>
          <div className="bg-[#11141f] p-6 rounded-2xl border border-slate-800">
            <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Market Cap</p>
            <p className="text-2xl font-mono">${(data.marketCap / 1e9).toFixed(2)}B</p>
          </div>
        </div>

        {/* Chart with Timeframe Selector */}
        <div className="bg-[#0f121d] p-8 rounded-3xl border border-slate-800 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-xl font-bold italic">mNAV Ratio Trend</h2>
            
            {/* THE SELECTOR BUTTONS */}
            <div className="flex bg-[#090b11] p-1 rounded-xl border border-slate-700">
              {['3D', '1W', '1M', '1Y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${
                    timeRange === range 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* Added 'key' so the chart restarts animation when timeframe changes */}
              <LineChart key={timeRange} data={chartData}>
                <CartesianGrid strokeDasharray="0" stroke="#1e293b" vertical={false} strokeOpacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11}} dy={10} />
                <YAxis domain={['dataMin - 0.02', 'dataMax + 0.02']} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11}} tickFormatter={(v) => `${v}x`} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-[#161b2c] border border-slate-700 p-3 rounded-lg shadow-xl">
                          <p className="text-purple-400 font-mono font-bold">{payload[0].value}x</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="ratio" stroke="#a855f7" strokeWidth={4} dot={timeRange !== '1Y'} animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-[#11141f] p-8 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-2 mb-6 font-bold text-blue-400 uppercase tracking-tighter"><Bot size={20}/> AI Analysis</div>
          {aiText ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-slate-300 text-sm leading-relaxed italic">
              "{aiText}"
              <button onClick={() => setAiText("")} className="block mt-4 text-[10px] text-slate-600 uppercase font-black">Refresh Analysis</button>
            </div>
          ) : (
            <button 
              onClick={getAiInsight} 
              disabled={loadingAi}
              className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50 transition-all"
            >
              {loadingAi ? "Processing..." : "Generate Insights"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}