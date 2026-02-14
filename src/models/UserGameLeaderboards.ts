export interface UserGameLeaderboards {
  Count: number;
  Total: number;
  Results: UserGameLeaderboard[];
}

export interface UserGameLeaderboard {
  ID: number;
  RankAsc: boolean;
  Title: string;
  Description: string;
  Format: string;
  UserEntry: UserLeaderboardEntry | null;
}

export interface UserLeaderboardEntry {
  User: string;
  ULID?: string;
  Score: number;
  FormattedScore: string;
  Rank: number;
  DateUpdated: string;
}
