export interface Subscription {
  game_id: any;
  created_at: any;
  games: SubscriptionGame | null;
}

export interface SubscriptionGame {
  name: any;
  image_icon: any;
}
