export type GameList = Game[]

export interface Game {
    GameID: number
    ConsoleID: number
    ConsoleName: string
    Title: string
    ImageIcon: string
    ImageTitle: string
    ImageIngame: string
    ImageBoxArt: string
    LastPlayed: string
    AchievementsTotal: number
    NumPossibleAchievements: number
    PossibleScore: number
    NumAchieved: number
    ScoreAchieved: number
    NumAchievedHardcore: number
    ScoreAchievedHardcore: number
}
