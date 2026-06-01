import { Link } from 'react-router-dom';
import React from 'react';
import { ESPNGame } from '../types';
import { cn } from '../lib/utils';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const ScoreCard: React.FC<{ game: ESPNGame }> = ({ game }) => {
  const comp1 = game.competitors[0];
  const comp2 = game.competitors[1];

  const home = comp1.homeAway === 'home' ? comp1 : comp2;
  const away = comp1.homeAway === 'away' ? comp1 : comp2;

  const isLive = game.status.type.completed === false && game.status.type.name.includes('IN_PROGRESS');
  const isCompleted = game.status.type.completed;

  const getScoreColor = (teamScore: string, oppScore: string) => {
    if (!isCompleted && !isLive) return 'text-white';
    return parseInt(teamScore) > parseInt(oppScore) ? 'text-white font-bold' : 'text-neutral-500';
  };

  return (
    <Link 
      to={`/game/${game.id}`} 
      className="block bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition relative overflow-hidden group"
    >
      <div className="flex justify-between items-center mb-6 text-xs font-bold uppercase tracking-widest text-[#E4FF00]">
        <div className={cn("px-2 py-0.5 rounded", isLive ? "bg-[#E4FF00] text-black" : "bg-white/10 text-gray-400")}>
          {isLive ? `Live - Q${game.status.period} ${game.status.displayClock}` : isCompleted ? 'Final' : format(new Date(game.date), 'MMM d, h:mm a')}
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-around py-2 z-10">
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-full mb-3 flex items-center justify-center border border-white/10 overflow-hidden p-2">
            <img src={away.team.logo} alt={away.team.shortDisplayName} className="w-full h-full object-contain drop-shadow-lg" />
          </div>
          <h3 className="font-bold text-sm tracking-tight">{away.team.shortDisplayName}</h3>
          <p className={cn("text-3xl font-black mt-2", getScoreColor(away.score, home.score))}>
            {away.score}
          </p>
        </div>
        
        <div className="text-gray-500 font-black text-xl">VS</div>
        
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-full mb-3 flex items-center justify-center border border-white/10 overflow-hidden p-2">
            <img src={home.team.logo} alt={home.team.shortDisplayName} className="w-full h-full object-contain drop-shadow-lg" />
          </div>
          <h3 className="font-bold text-sm tracking-tight">{home.team.shortDisplayName}</h3>
          <p className={cn("text-3xl font-black mt-2", getScoreColor(home.score, away.score))}>
            {home.score}
          </p>
        </div>
      </div>
      
      {/* Footer bar */}
      <div className="mt-6 pt-4 border-t border-white/5 text-[10px] uppercase text-gray-500 flex items-center justify-center">
        <span>{game.name}</span>
      </div>
    </Link>
  );
}
