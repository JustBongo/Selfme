import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Comment, Reaction, ESPNGame } from '../types';
import { ArrowLeft, Send, Sparkles, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { LEAGUES, fetchScores } from '../lib/espn';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const EMOJIS = ['🔥', '🥶', '👀', '🤯', '🐐', '😂'];

const generateMockWinProbability = () => {
  return Array.from({ length: 48 }, (_, i) => ({
    time: i,
    homeProb: 50 + (Math.sin(i * 0.2) * 20) + (Math.random() * 20 - 10)
  }));
};

export function GameDetail() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [game, setGame] = useState<ESPNGame | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [commentText, setCommentText] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  const winProbData = useMemo(() => generateMockWinProbability(), []);

  // Fetch Game specific logic (ESPN doesn't have a direct easy way to fetch a single game without knowing its league, so we'll check all leagues if we have to, or just check NBA for now. Since this app maps multiple leagues, we'll try to find it).
  useEffect(() => {
    const fetchGame = async () => {
      let foundGame = null;
      for (const league of LEAGUES) {
        const scores = await fetchScores(league.path);
        const match = scores.find(s => s.id === gameId);
        if (match) {
          foundGame = match;
          break;
        }
      }
      if (foundGame) setGame(foundGame);
    };
    fetchGame();
    const intv = setInterval(fetchGame, 30000);
    return () => clearInterval(intv);
  }, [gameId]);

  // Fetch Comments & Reactions
  useEffect(() => {
    if (!gameId) return;
    
    const commentsRef = collection(db, 'games', gameId, 'comments');
    const qComments = query(commentsRef, orderBy('createdAt', sortOrder));
    
    const unsubC = onSnapshot(qComments, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment)));
    }, (error) => handleFirestoreError(error, OperationType.GET, `games/${gameId}/comments`));

    const reactionsRef = collection(db, 'games', gameId, 'reactions');
    const unsubR = onSnapshot(reactionsRef, (snap) => {
      setReactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reaction)));
    }, (error) => handleFirestoreError(error, OperationType.GET, `games/${gameId}/reactions`));

    return () => {
      unsubC();
      unsubR();
    }
  }, [gameId, sortOrder]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !profile || !gameId) return;

    try {
      await addDoc(collection(db, 'games', gameId, 'comments'), {
        userId: user.uid,
        userDisplayName: profile.displayName,
        gameId: gameId,
        text: commentText.trim(),
        createdAt: Date.now()
      });
      setCommentText('');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `games/${gameId}/comments`);
    }
  };

  const handleAddReaction = async (emoji: string) => {
    if (!user || !gameId) return;
    try {
      await addDoc(collection(db, 'games', gameId, 'reactions'), {
        userId: user.uid,
        gameId: gameId,
        emoji,
        createdAt: Date.now()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `games/${gameId}/reactions`);
    }
  };

  if (!game) {
    return <div className="p-8 text-neutral-400">Loading game details...</div>;
  }

  const comp1 = game.competitors[0];
  const comp2 = game.competitors[1];
  const home = comp1.homeAway === 'home' ? comp1 : comp2;
  const away = comp1.homeAway === 'away' ? comp1 : comp2;

  // Group reactions by emoji
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="p-4 border-b border-white/10 flex items-center justify-between gap-4 bg-[#0A0A0A] z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-bold text-gray-400">{game.name}</div>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 max-w-7xl mx-auto w-full">
        {/* Main Column */}
        <div className="flex-1 space-y-8">
          {/* Scoreboard */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col relative overflow-hidden group">
            <div className="flex justify-between items-start z-10 w-full">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E4FF00]">
                <span className="bg-[#E4FF00] text-black px-2 py-0.5 rounded">{game.status.type.completed ? 'FINAL' : 'LIVE'}</span>
                <span>{game.status.type.completed ? 'Final' : `Q${game.status.period} • ${game.status.displayClock}`}</span>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-around py-4 z-10 w-full mt-4">
              <div className="text-center">
                <div className="w-24 h-24 bg-white/5 rounded-full mb-3 flex items-center justify-center border border-white/10 p-3">
                  <img src={away.team.logo} className="w-full h-full object-contain drop-shadow-xl" />
                </div>
                <h3 className="font-bold text-lg">{away.team.shortDisplayName}</h3>
                <p className="text-5xl font-black mt-2">{away.score}</p>
              </div>
              <div className="text-gray-500 font-black text-2xl">VS</div>
              <div className="text-center">
                <div className="w-24 h-24 bg-white/5 rounded-full mb-3 flex items-center justify-center border border-white/10 p-3">
                  <img src={home.team.logo} className="w-full h-full object-contain drop-shadow-xl" />
                </div>
                <h3 className="font-bold text-lg">{home.team.shortDisplayName}</h3>
                <p className="text-5xl font-black mt-2">{home.score}</p>
              </div>
            </div>
            
            {/* Reaction Bar */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 z-10">
              {EMOJIS.map(emoji => (
                <button 
                  key={emoji}
                  onClick={() => handleAddReaction(emoji)}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xl transition flex items-center gap-2 border border-white/5"
                >
                  {emoji} {reactionCounts[emoji] > 0 && <span className="text-xs text-gray-400 font-bold">{reactionCounts[emoji]}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Win Probability Chart Component */}
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-6">
            <h3 className="font-bold text-sm mb-4 uppercase tracking-widest text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E4FF00]" /> 
              Win Probability (Simulated)
            </h3>
            <div className="relative w-full h-64 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={winProbData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E4FF00" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#E4FF00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 100]} tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#E4FF00' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Home Win %']}
                  />
                  <Area type="monotone" dataKey="homeProb" stroke="#E4FF00" fillOpacity={1} fill="url(#colorProb)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-between w-full mt-2 text-[10px] text-gray-500 uppercase font-bold tracking-widest px-8">
                <span>Start</span>
                <span>End</span>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Column: Chat */}
        <div className="w-full md:w-96 flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden h-[600px] shrink-0">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <span className="uppercase tracking-widest">COMMUNITY</span>
              <span className="text-[#E4FF00] text-xs">Live Chat</span>
            </h3>
            <button 
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition uppercase tracking-widest font-bold"
            >
              <Filter className="w-3 h-3" />
              {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse gap-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 shrink-0 flex items-center justify-center text-xs font-black">{comment.userDisplayName.charAt(0).toUpperCase()}</div>
                <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-blue-400">@{comment.userDisplayName.replace(/\s+/g, '')}</p>
                    <span className="text-[10px] text-gray-500">{formatDistanceToNow(comment.createdAt)}</span>
                  </div>
                  <p className="text-xs leading-relaxed mt-1">{comment.text}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && <p className="text-gray-500 text-sm text-center my-auto font-bold uppercase tracking-widest">No comments.</p>}
          </div>

          <form onSubmit={handlePostComment} className="p-4 border-t border-white/10 flex gap-2 bg-black/40">
            <input 
              type="text" 
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="React..."
              className="bg-black/80 border border-white/10 rounded-full px-4 py-2 text-xs flex-1 text-white focus:outline-none focus:border-[#E4FF00] transition"
            />
            <button 
              type="submit"
              disabled={!commentText.trim()}
              className="bg-[#E4FF00] hover:bg-[#c7df00] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
