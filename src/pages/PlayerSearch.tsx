import React, { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export function PlayerSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/player?name=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Player not found');
      }
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult('not_found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">PLAYER INTEL</h1>
          <p className="text-gray-400 mt-2 font-medium text-sm">Advanced stats & interactive shot charts</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search player..."
              className="pl-10 pr-4 py-2 bg-black border border-white/10 rounded-full focus:outline-none focus:border-[#E4FF00] text-white w-full md:w-64 transition"
            />
          </div>
          <button type="submit" className="bg-[#E4FF00] text-black px-6 py-2 rounded-full font-bold hover:bg-[#c7df00] transition disabled:opacity-50" disabled={loading || !query.trim()}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </form>
      </div>

      {result === 'not_found' && (
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center">
          <p className="text-gray-500 font-bold uppercase tracking-widest">No player found matching "{query}"</p>
        </div>
      )}

      {result && result !== 'not_found' && (
        <div className="space-y-6">
          {/* Player Header Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-black rounded-full border border-white/20 flex items-center justify-center">
                 <span className="text-2xl font-black">{result.name.charAt(0)}</span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-[#E4FF00] text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">{result.sport}</span>
                  <span className="text-gray-400 font-medium">Team: {result.team}</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">{result.name}</h2>
              </div>
            </div>
            <div className="text-right hidden md:block max-w-[200px]">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Status Summary</p>
              <p className="text-sm font-bold text-gray-300">{result.status}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Advanced Stats */}
            <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 lg:col-span-1">
              <h3 className="font-bold text-sm mb-6 uppercase tracking-widest text-[#E4FF00]">Advanced Metrics</h3>
              
              <div className="space-y-4">
                <StatRow label={result.stats.stat1Label} value={result.stats.stat1Value} />
                <StatRow label={result.stats.stat2Label} value={result.stats.stat2Value} />
                <StatRow label={result.stats.stat3Label} value={result.stats.stat3Value} />
                <StatRow label={result.stats.stat4Label} value={result.stats.stat4Value} />
              </div>

              {result.lastUpdated && (
                <div className="mt-8 pt-4 border-t border-white/10">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Auto-updated: {new Date(result.lastUpdated).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Visualizations */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Performance Trend */}
              <div className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-6">
                <h3 className="font-bold text-sm mb-6 uppercase tracking-widest text-white">Recent Performance Trend</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.recentGames}>
                      <defs>
                        <linearGradient id="colorPts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E4FF00" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#E4FF00" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="game" stroke="#555" tick={{fill: '#999', fontSize: 12}} />
                      <YAxis stroke="#555" tick={{fill: '#999', fontSize: 12}} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                        itemStyle={{ color: '#E4FF00' }}
                      />
                      <Area type="monotone" dataKey="points" stroke="#E4FF00" fillOpacity={1} fill="url(#colorPts)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Highlights & Playoffs (Any Sport) */}
              <div className="bg-[#111111] border border-white/10 rounded-3xl p-6">
                <h3 className="font-bold text-sm mb-6 uppercase tracking-widest text-[#E4FF00]">Notable Highlights & Playoffs</h3>
                <div className="space-y-6">
                   <div>
                     <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Highlights</h4>
                     <ul className="space-y-2">
                       {result.highlights.map((h: string, i: number) => (
                         <li key={i} className="text-sm font-medium text-white flex items-start gap-2">
                            <span className="text-[#E4FF00] mt-1">•</span>
                            <span>{h}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                   
                   <div>
                     <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Past Playoffs</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {result.pastPlayoffs.map((po: any, i: number) => (
                         <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                           <p className="text-[10px] text-[#E4FF00] font-bold uppercase tracking-widest mb-1">{po.title}</p>
                           <p className="text-sm font-black mb-1">{po.matchup}</p>
                           <p className="text-xs text-gray-400">{po.stats}</p>
                         </div>
                       ))}
                     </div>
                   </div>
                </div>
              </div>

              {/* Interactive Shot Chart (Basketball Only) */}
              {result.sport === 'NBA' && (
                <div className="bg-gradient-to-b from-[#111] to-[#0A0A0A] border border-white/10 rounded-3xl p-6 flex flex-col items-center relative overflow-hidden">
                  <h3 className="font-bold text-sm mb-4 uppercase tracking-widest text-white w-full flex items-center justify-between">
                    <span>Interactive Shot Chart</span>
                    <Sparkles className="w-4 h-4 text-[#E4FF00]" />
                  </h3>
                  
                  {/* Mock Court */}
                  <div className="relative w-full max-w-sm h-64 bg-black/50 border border-white/10 rounded-xl overflow-hidden mt-2 group">
                    <div className="absolute w-full h-[150%] border-t-2 border-x-2 border-red-500/20 top-[60%] rounded-t-full"></div>
                    <div className="absolute w-24 h-24 border-2 border-red-500/20 rounded-full top-[50%] left-1/2 -translate-x-1/2"></div>
                    <div className="absolute w-full h-1 bg-red-500/30 top-[50%]"></div>
                    
                    {/* Hover Dots */}
                    <ShotDot top="30%" left="30%" type="made" tip="3PT - 24ft" />
                    <ShotDot top="40%" left="60%" type="miss" tip="3PT - 26ft" />
                    <ShotDot top="60%" left="45%" type="made" tip="Midrange - 14ft" />
                    <ShotDot top="75%" left="50%" type="made" tip="Paint - Layup" />
                    <ShotDot top="80%" left="40%" type="miss" tip="Paint - Blocked" />
                    <ShotDot top="55%" left="80%" type="made" tip="3PT - Corner" />
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-4">Hover over chart for details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-white/5">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white font-black">{value}</span>
    </div>
  );
}

function ShotDot({ top, left, type, tip }: { top: string, left: string, type: 'made'|'miss', tip: string }) {
  return (
    <div 
      className="absolute group/dot cursor-crosshair transition-transform hover:scale-150 z-10" 
      style={{ top, left }}
    >
      <div className={cn(
        "w-3 h-3 rounded-full shadow-lg border border-black",
        type === 'made' ? "bg-green-500" : "bg-red-500"
      )}></div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/dot:opacity-100 transition whitespace-nowrap pointer-events-none border border-white/20">
        {tip}
      </div>
    </div>
  );
}
