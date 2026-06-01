import { ESPNGame } from '../types';

export const LEAGUES = [
  { id: 'nba', name: 'NBA', path: 'basketball/nba' },
  { id: 'nfl', name: 'NFL', path: 'football/nfl' },
  { id: 'mlb', name: 'MLB', path: 'baseball/mlb' },
  { id: 'nhl', name: 'NHL', path: 'hockey/nhl' },
  { id: 'ncaaf', name: 'NCAA FB', path: 'football/college-football' },
  { id: 'ncaab', name: 'NCAA BB', path: 'basketball/mens-college-basketball' },
];

export async function fetchScores(leaguePath: string, date?: string): Promise<ESPNGame[]> {
  try {
    const url = date 
      ? `https://site.api.espn.com/apis/site/v2/sports/${leaguePath}/scoreboard?dates=${date}`
      : `https://site.api.espn.com/apis/site/v2/sports/${leaguePath}/scoreboard`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch espn scores');
    const data = await response.json();
    return data.events.map((event: any) => {
      const comp = event.competitions[0];
      return {
        id: event.id,
        name: event.name,
        shortName: event.shortName,
        date: event.date,
        status: event.status,
        competitors: comp.competitors.map((c: any) => ({
          id: c.id,
          homeAway: c.homeAway,
          score: c.score,
          team: {
            id: c.team.id,
            displayName: c.team.displayName,
            shortDisplayName: c.team.shortDisplayName,
            abbreviation: c.team.abbreviation,
            logo: c.team.logo,
            color: c.team.color,
          }
        }))
      };
    }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error("Fetch scores error:", error);
    return [];
  }
}
