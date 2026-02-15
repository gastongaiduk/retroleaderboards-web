export interface RivalryGame {
    gameId: number;
    gameName: string;
    imageIcon: string;
    rivals: RivalryFriend[];
    totalLeaderboards: number;
}

export interface RivalryFriend {
    username: string;
    wins: RivalryBattle[];
    losses: RivalryBattle[];
}

export interface RivalryBattle {
    leaderboardId: number;
    leaderboardTitle: string;
    myRank: number;
    friendRank: number;
    myScore: string;
    friendScore: string;
}
