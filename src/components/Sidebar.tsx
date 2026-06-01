import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, Settings as SettingsIcon, LogOut, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { LEAGUES } from '../lib/espn';
import { logout } from '../lib/firebase';

export function Sidebar() {
  const location = useLocation();
  
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-[#0A0A0A] border-r border-white/10 p-4 h-full shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <h1 className="text-2xl font-black tracking-tighter text-[#E4FF00]">selfme</h1>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavItem to="/" icon={<Home className="w-5 h-5" />} label="Dashboard" active={location.pathname === '/'} />
          <NavItem to="/player" icon={<Search className="w-5 h-5" />} label="Player Intel" active={location.pathname === '/player'} />
          
          <div className="pt-6 pb-2 px-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Leagues
          </div>
          {LEAGUES.map(league => (
            <NavItem 
              key={league.id} 
              to={`/league/${league.id}`} 
              label={league.name} 
              active={location.pathname === `/league/${league.id}`} 
            />
          ))}
          
        </nav>

        <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
          <NavItem to="/settings" icon={<SettingsIcon className="w-5 h-5" />} label="Settings" active={location.pathname === '/settings'} />
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white hover:bg-white/5 w-full text-left transition"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-white/10 flex justify-around p-2 z-50">
        <NavItemMobile to="/" icon={<Home />} label="Home" active={location.pathname === '/'} />
        <NavItemMobile to="/player" icon={<Search />} label="Search" active={location.pathname === '/player'} />
        <NavItemMobile to="/league/nba" icon={<Trophy />} label="Scores" active={location.pathname.startsWith('/league')} />
        <NavItemMobile to="/settings" icon={<SettingsIcon />} label="Settings" active={location.pathname === '/settings'} />
      </div>
    </>
  );
}

const NavItem: React.FC<{ to: string, icon?: React.ReactNode, label: string, active: boolean }> = ({ to, icon, label, active }) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition",
        active ? "bg-white/10 border border-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

const NavItemMobile: React.FC<{ to: string, icon: React.ReactNode, label: string, active: boolean }> = ({ to, icon, label, active }) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex flex-col items-center gap-1 p-2 rounded-lg",
        active ? "text-[#E4FF00]" : "text-gray-400"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
