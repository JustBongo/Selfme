import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { LeagueScores } from './pages/LeagueScores';
import { GameDetail } from './pages/GameDetail';
import { PlayerSearch } from './pages/PlayerSearch';
import { Settings } from './pages/Settings';
import { useAuth } from './components/AuthProvider';
import { loginWithGoogle } from './lib/firebase';
import { Trophy } from 'lucide-react';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center font-sans">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white font-sans flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-[#E4FF00] rounded-full flex items-center justify-center mb-6">
          <Trophy className="w-8 h-8 text-black" />
        </div>
        <h1 className="text-4xl font-black mb-2 tracking-tighter text-[#E4FF00]">selfme</h1>
        <p className="text-gray-400 mb-8 max-w-sm text-center">Your personalized real-time sports dashboard. NBA, NFL, MLB, NHL & NCAA.</p>
        <button 
          onClick={loginWithGoogle}
          className="bg-[#E4FF00] text-black px-6 py-3 rounded-full font-bold hover:bg-[#c7df00] transition"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/league/:leagueId" element={<LeagueScores />} />
          <Route path="/player" element={<PlayerSearch />} />
          <Route path="/game/:gameId" element={<GameDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
