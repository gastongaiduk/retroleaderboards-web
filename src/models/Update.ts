export interface Update {
  leaderboard_id: number;
  friend_name: string;
  user_score: number;
  friend_score: number;
  created_at: string;
  read_at: string | null;
  leaderboards: UpdateLeaderboard;
}

export interface UpdateLeaderboard {
  name: string;
  description: string;
  game_id: number;
  format: string;
  rank_asc: boolean;
  games: UpdateGame;
}

export interface UpdateGame {
  name: string;
  image_icon: string;
}
