import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LEAGUES, fetchScores } from '../lib/espn';
import { ESPNGame } from '../types';
import { ScoreCard } from '../components/ScoreCard';
import { Loader2 } from 'lucide-react';

export function LeagueScores() {
  const { leagueId } = useParams();
  const [games, setGames] = useState<ESPNGame[]>([]);
  const [loading, setLoading] = useState(true);

  const league = LEAGUES.find(l => l.id === leagueId);

  useEffect(() => {
    if (!league) return;
    
    const loadScores = async () => {
      // setLoading(true);
      const data = await fetchScores(league.path);
      setGames(data);
      setLoading(false);
    };

    loadScores();
    // Poll every 30 seconds
    const interval = setInterval(loadScores, 30000);
    return () => clearInterval(interval);
  }, [league]);

  if (!league) return <div className="p-8 text-neutral-400">League not found</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black tracking-tighter text-white">
          {league.name} SCORES
        </h1>
        <p className="text-gray-400 mt-2 font-medium text-sm">Real-time updates and highlights</p>
      </div>

      {loading && games.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#E4FF00] animate-spin" />
        </div>
      ) : games.length === 0 ? (
        <div className="text-gray-500 text-center py-20 font-bold uppercase tracking-widest">No games scheduled for today.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {games.map(game => (
            <ScoreCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
