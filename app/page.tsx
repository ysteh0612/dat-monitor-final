"use client";
import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, BarChart3, Bot, Loader2, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [aiText, setAiText] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [timeRange, setTimeRange] = useState('1M'); // Timeframe state

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
      setAiText("Connection error. Check OpenAI Key in Vercel.");
    }
    setLoadingAi(false);
  };

  // Generate dynamic chart data based on selected timeframe
  const chartData = useMemo(() => {
    if (!data) return [];
    
    let days = 30;
    if (timeRange === '3D') days = 3;
    if (timeRange === '1W') days = 7;
    if (timeRange === '1M') days = 30;
    if (timeRange === '1Y') days = 90; // Mocking 1Y with 90 data points for performance

    const currentRatio = (parseFloat(data.premium) / 100) + 1;

    return Array.from({ length: days }).map((_, i) => {
      const day = i + 1;
      const waveFreq = days > 7 ? 0.4 : 1.2;
      const wave = Math.sin(i * waveFreq) * 0.04; 
      const trend = currentRatio - (0.002 * (days - i)) + wave;
      
      return {
        date: `MAR ${day}`,
        // Only show labels at specific intervals so it doesn't look crowded
        displayDate: days <= 7 ? `Day ${day}` : (day % 5 === 0 ? day : ''),
        ratio: parseFloat(trend.toFixed(2))
      };
    });
  }, [data, timeRange]);

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen bg-[#090b11] text-slate-500 font-mono italic">
      AUTHENTICATING DATA STREAM...
    </div>
  );

  const currentRatio = (parseFloat(data.premium) / 100) + 1;

  return (
    <main className="min-h-screen bg-[#090b11] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
              DAT.co <span className="text-purple-500 text-xl ml-1">Terminal</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
              Institutional Digital Asset Intelligence
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[#11141f] border border-slate-800 rounded-full px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Online</span>
          </div>
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#11141f] p-6 rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-all group">
            <p className="text-slate-500 mb-3 uppercase text-[10px] font-bold tracking-[0.2em] group-hover:text-purple-400 transition">Bitcoin Spot</p>
            <div className="text-3xl font-mono font-bold">${Number(data.btcPrice).toLocaleString()}</div>
          </div>

          <div className="bg-[#11141f] p-6 rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-all group border-l-purple-500/50">
            <p className="text-slate-500 mb-3 uppercase text-[10px] font-bold tracking-[0.2em] group-hover:text-purple-400 transition">mNAV Multiplier</p>
            <div className="text-3xl font-mono font-bold text-purple-400">{currentRatio.toFixed(2)}x</div>
          </div>

          <div className="bg-[#11141f] p-6 rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-all group">
            <p className="text-slate-500 mb-3 uppercase text-[10px] font-bold tracking-[0.2em] group-hover:text-purple-400 transition">Market Cap</p>
            <div className="text-3xl font-mono font-bold">${(data.marketCap / 1e9).toFixed(2)}B</div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-[#0f121d] p-8 rounded-3xl border border-slate-800 shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">mNAV Ratio Trend</h2>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mt-1">Historical Multiplier Analysis</p>
            </div>
            
            {/* TIMEFRAME SELECTOR */}
            <div className="flex bg-[#090b11] p-1 rounded-xl border border-slate-800">
              {['3D', '1W', '1M', '1Y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${
                    timeRange === range 
                    ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="#1e293b" vertical={false} strokeOpacity={0.3} />
                <XAxis 
                  dataKey="displayDate" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }}
                  dy={15}
                />
                <YAxis 
                  domain={['dataMin - 0.05', 'dataMax + 0.05']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }}
                  tickFormatter={(val) => `${val}x`}
                />
                <Tooltip 
                  cursor={{ stroke: '#334155', strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#161b2c] border border-purple-500/20 p-4 rounded-xl shadow-2xl backdrop-blur-sm">
                          <p className="text-slate-500 text-[9px] font-black uppercase mb-1 tracking-widest">{payload[0].payload.date}</p>
                          <p className="text-purple-400 font-mono font-bold text-xl uppercase leading-none">
                            {payload[0].value}x
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
                  dot={timeRange === '3D' || timeRange === '1W'} // Show dots only on short ranges
                  activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
                  style={{ filter: 'url(#glow)' }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="bg-[#11141f] p-8 rounded-3xl border border-slate-800 border-t-blue-500/20">
          <div className="flex items-center gap-3 mb-6">
            <Bot className="text-blue-500" size={24} />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">AI Quantitative Insight</h3>
          </div>

          {aiText ? (
            <div className="bg-[#090b11] p-6 rounded-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-500">
              <p className="text-slate-300 leading-relaxed text-sm font-medium italic">"{aiText}"</p>
              <button onClick={() => setAiText("")} className="mt-6 text-[9px] text-slate-600 hover:text-blue-400 font-black uppercase tracking-[0.2em] transition">
                ↺ Request New Analysis
              </button>
            </div>
          ) : (
            <button 
              onClick={getAiInsight} 
              disabled={loadingAi}
              className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] active:scale-95 disabled:opacity-50"
            >
              {loadingAi ? <Loader2 className="animate-spin" size={18} /> : "Run Intelligence Engine"}
            </button>
          )}
        </div>

        <p className="mt-12 text-center text-slate-700 text-[9px] font-black uppercase tracking-[0.4em]">
          End of Transmission // Data Secured
        </p>
      </div>
    </main>
  );
}