export interface Update {
  leaderboard_id: any;
  friend_name: any;
  user_score: any;
  friend_score: any;
  created_at: any;
  read_at: any;
  leaderboards: UpdateLeaderboard;
}

export interface UpdateLeaderboard {
  name: any;
  description: any;
  game_id: any;
  games: UpdateGame;
}

export interface UpdateGame {
  name: any;
  image_icon: any;
}
