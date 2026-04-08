"use client";
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, BarChart3, Bot } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [aiText, setAiText] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(json => setData(json));
  }, []);

  const getAiInsight = async () => {
    setLoadingAi(true);
    const res = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ premium: data.premium, btcPrice: data.btcPrice })
    });
    const json = await res.json();
    setAiText(json.summary);
    setLoadingAi(false);
  };

  if (!data) return <div className="p-20 text-white bg-slate-950 min-h-screen">Loading Indicators...</div>;

  const chartData = [
    { name: 'Day 1', p: (data.premium - 5) },
    { name: 'Day 2', p: (data.premium - 2) },
    { name: 'Current', p: data.premium },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">DAT.co Monitoring Platform</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 mb-1"><DollarSign size={16}/> BTC Price</div>
          <div className="text-2xl font-mono">${Number(data.btcPrice).toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 mb-1"><BarChart3 size={16}/> Premium to NAV</div>
          <div className="text-2xl font-mono text-green-400">{data.premium}%</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 mb-1"><TrendingUp size={16}/> Market Cap</div>
          <div className="text-2xl font-mono">${(data.marketCap / 1e9).toFixed(2)}B</div>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-10">
        <h2 className="text-lg mb-4">Premium Trend</h2>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{backgroundColor: '#0f172a'}} />
              <Line type="monotone" dataKey="p" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-500/30">
        <div className="flex items-center gap-2 mb-4 font-bold text-blue-400"><Bot/> AI Insights</div>
        {aiText ? <p className="text-slate-200">{aiText}</p> : 
          <button onClick={getAiInsight} disabled={loadingAi} className="bg-blue-600 px-4 py-2 rounded-lg">
            {loadingAi ? "Analyzing..." : "Generate AI Summary"}
          </button>
        }
      </div>
    </main>
  );
}