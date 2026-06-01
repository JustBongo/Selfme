import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { LEAGUES, fetchScores } from '../lib/espn';
import { ESPNGame } from '../types';
import { ScoreCard } from '../components/ScoreCard';
import { Loader2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { profile } = useAuth();
  const [games, setGames] = useState<ESPNGame[]>([]);
  const [historicalGames, setHistoricalGames] = useState<ESPNGame[]>([]);
  const [nbaPlayoffGames, setNbaPlayoffGames] = useState<ESPNGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllScores = async () => {
      try {
        const promises = LEAGUES.map(l => fetchScores(l.path));
        const results = await Promise.all(promises);
        const allGames = results.flat().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Filter by favorites if user has any
        if (profile && profile.favoriteTeams.length > 0) {
          const favoriteGames = allGames.filter(g => {
            const team1 = g.competitors[0].team.displayName;
            const team2 = g.competitors[1].team.displayName;
            return profile.favoriteTeams.some(fav => team1.includes(fav) || team2.includes(fav));
          });
          // If no favorite games today, just show live ones or top ones
          if (favoriteGames.length > 0) {
            setGames(favoriteGames);
          } else {
            // Show all if no favorites are playing
            setGames(allGames.slice(0, 12)); // Just show 12 games to not overwhelm
          }
        } else {
          setGames(allGames.slice(0, 12));
        }

        // Specifically find NBA games for the current playoff section
        const nbaIndex = LEAGUES.findIndex(l => l.path === 'basketball/nba');
        if (nbaIndex !== -1 && results[nbaIndex]) {
          setNbaPlayoffGames(results[nbaIndex]);
        }

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const loadHistorical = async () => {
      try {
        // Fetch past games from THESE playoffs (Current Year 2026 Playoff dates)
        // Using late May 2026 dates to capture recent playoff actions
        const nba1 = await fetchScores('basketball/nba', '20260528'); 
        const nba2 = await fetchScores('basketball/nba', '20260530'); 
        const nhl1 = await fetchScores('hockey/nhl', '20260529'); 
        const nhl2 = await fetchScores('hockey/nhl', '20260531'); 
        
        const historical = [...nba1, ...nba2, ...nhl1, ...nhl2];
        const validGames = historical.filter(g => g !== undefined && g.status !== 'Scheduled');
        setHistoricalGames(validGames.slice(0, 4));
      } catch (e) {
        console.error(e);
      }
    };

    loadAllScores();
    loadHistorical();
    const interval = setInterval(loadAllScores, 30000);
    return () => clearInterval(interval);
  }, [profile]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">FAVORITES</h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">Bento Dashboard for {profile?.displayName?.split(' ')[0]}</p>
        </div>
        
        {(!profile?.favoriteTeams || profile.favoriteTeams.length === 0) && (
          <Link to="/settings" className="flex items-center gap-2 text-sm text-[#E4FF00] hover:text-[#c7df00] bg-white/5 border border-white/10 px-4 py-2 rounded-full transition font-bold">
            <Settings className="w-4 h-4" />
            CONFIGURE DASHBOARD
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2 w-fit mb-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-white">Top Matches</span>
        </div>
      </div>

      {loading && games.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#E4FF00] animate-spin" />
        </div>
      ) : games.length === 0 ? (
        <div className="text-gray-500 py-10 font-bold uppercase tracking-widest">No games found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
          {games.map(game => (
            <ScoreCard key={game.id} game={game} />
          ))}
        </div>
      )}

      {/* NBA Playoffs - Real Time */}
      <div className="bg-[#111111] rounded-3xl border border-white/10 p-5 relative overflow-hidden mt-8">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          Current NBA Playoff Games (Live / Today)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {nbaPlayoffGames.length > 0 ? nbaPlayoffGames.map(game => (
            <ScoreCard key={game.id} game={game} />
          )) : (
            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest col-span-4 py-8 text-center">No games today or loading...</div>
          )}
        </div>
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-orange-500 rounded-full opacity-5 blur-3xl pointer-events-none"></div>
      </div>

      {/* Past Playoff History */}
      <div className="bg-[#111111] rounded-3xl border border-white/10 p-5 relative overflow-hidden mt-8">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Recent Playoff Games</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {historicalGames.length > 0 ? historicalGames.map(game => (
            <ScoreCard key={game.id} game={game} />
          )) : (
            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest col-span-4 py-8 text-center">Loading Recent Playoffs...</div>
          )}
        </div>
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-[#E4FF00] rounded-full opacity-5 blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
}
