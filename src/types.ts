export interface UserProfile {
  displayName: string;
  email: string;
  favoriteTeams: string[];
  favoritePlayers: string[];
  createdAt: number;
}

export interface Comment {
  id: string;
  userId: string;
  userDisplayName: string;
  gameId: string;
  text: string;
  createdAt: number;
}

export interface Reaction {
  id: string;
  userId: string;
  gameId: string;
  emoji: string;
  createdAt: number;
}

// ESPN API Types
export interface ESPNGame {
  id: string;
  name: string;
  shortName: string;
  date: string;
  status: {
    type: {
      name: string;
      description: string;
      completed: boolean;
    };
    displayClock: string;
    period: number;
  };
  competitors: {
    id: string;
    homeAway: string;
    score: string;
    team: {
      id: string;
      displayName: string;
      shortDisplayName: string;
      abbreviation: string;
      logo: string;
      color: string;
    };
  }[];
}
