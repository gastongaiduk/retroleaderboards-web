export interface GameLeaderboards {
    Count: number
    Total: number
    Results: Leaderboard[]
}

export interface Leaderboard {
    ID: number
    RankAsc: boolean
    Title: string
    Description: string
    Format: string
    TopEntry: TopEntry|null
}

export interface TopEntry {
    User: string
    Score: number
    FormattedScore: string
}
