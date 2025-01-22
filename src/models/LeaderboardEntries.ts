export interface LeaderboardEntries {
  Count: number;
  Total: number;
  Results: Entry[];
}

export interface Entry {
  User: string;
  DateSubmitted: string;
  Score: number;
  FormattedScore: string;
  Rank: number;
}
