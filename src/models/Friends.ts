export interface Friends {
  Count: number;
  Total: number;
  Results: Friend[];
}

export interface Friend {
  User: string;
  Points: number;
  PointsSoftcore: number;
  IsFollowingMe: boolean;
}
