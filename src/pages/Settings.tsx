import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Plus, X, Save, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

export function Settings() {
  const { profile, updateProfile } = useAuth();
  
  const [teamInput, setTeamInput] = useState('');
  const [teams, setTeams] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [pushStatus, setPushStatus] = useState<string>('default');

  useEffect(() => {
    if (profile) {
      setTeams(profile.favoriteTeams || []);
    }
    if ('Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, [profile]);

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamInput.trim()) return;
    if (!teams.includes(teamInput.trim())) {
      setTeams([...teams, teamInput.trim()]);
    }
    setTeamInput('');
  };

  const handleRemoveTeam = (teamToRemove: string) => {
    setTeams(teams.filter(t => t !== teamToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ favoriteTeams: teams });
    setSaving(false);
  };

  const enablePush = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);
      if (permission === 'granted') {
        new Notification("Selfme Push Notifications", { body: "You will now receive updates for your favorite teams!" });
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black tracking-tighter text-white">SETTINGS</h1>
        <p className="text-gray-400 mt-2 font-medium text-sm">Personalize your Selfme dashboard.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#E4FF00]" /> Notifications
        </h2>
        <div className="flex items-center justify-between bg-black p-4 rounded-xl border border-white/5">
          <div>
            <h3 className="font-bold">Push Notifications</h3>
            <p className="text-sm text-gray-400">Get alerts for game starts, major plays, and milestones.</p>
          </div>
          <button 
            onClick={enablePush}
            disabled={pushStatus === 'granted' || pushStatus === 'denied'}
            className={cn("px-4 py-2 rounded-lg font-bold transition", 
              pushStatus === 'granted' ? "bg-green-500/20 text-green-400" :
              pushStatus === 'denied' ? "bg-red-500/20 text-red-400" :
              "bg-[#E4FF00] text-black hover:bg-[#c7df00]"
            )}
          >
            {pushStatus === 'granted' ? 'Enabled' : pushStatus === 'denied' ? 'Blocked' : 'Enable'}
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <h2 className="text-xl font-bold mb-4">Favorite Teams</h2>
        <p className="text-sm text-gray-400 mb-6">
          Add your favorite teams (e.g. "Knicks", "Lakers", "Yankees"). We'll prioritize their games on your dashboard and send you real-time push notifications.
        </p>

        <form onSubmit={handleAddTeam} className="flex gap-2 mb-6">
          <input 
            type="text" 
            value={teamInput}
            onChange={(e) => setTeamInput(e.target.value)}
            placeholder="Enter team name..."
            className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#E4FF00] transition text-white"
          />
          <button 
            type="submit"
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition font-bold"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-8">
          {teams.length === 0 && <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">No favorite teams added yet.</span>}
          {teams.map(team => (
            <div key={team} className="bg-[#E4FF00]/10 text-[#E4FF00] border border-[#E4FF00]/30 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 font-bold tracking-tight">
              {team}
              <button onClick={() => handleRemoveTeam(team)} className="hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button 
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "bg-[#E4FF00] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#c7df00] transition flex items-center gap-2",
              saving && "opacity-50 cursor-not-allowed"
            )}
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
