import {defineStore} from 'pinia';
import type {GameList} from "../models/RecentlyPlayedGames.ts";
import {GameLeaderboards} from "../models/GameLeaderboards.ts";
import {LeaderboardEntries} from "../models/LeaderboardEntries.ts";

interface GamesState {
    lastPlayedGames: GameList | null;
    gamesLeaderboards: Map<number, GameLeaderboards> | null;
    leaderboardEntries: Map<number, LeaderboardEntries> | null;
}

export const useGamesStore = defineStore('games', {
    state: (): GamesState => ({
        lastPlayedGames: null,
        gamesLeaderboards: null,
        leaderboardEntries: null,
    }),
    actions: {
        setLastPlayedGames(list: GameList | null) {
            this.lastPlayedGames = list;
        },
        setGameLeaderboards(gameId: number, list: GameLeaderboards) {
            if (this.gamesLeaderboards === null) {
                this.gamesLeaderboards = new Map();
            }

            this.gamesLeaderboards.set(gameId, list);
        },
        hasGameLeaderboard(gameId: number): boolean {
            if (this.gamesLeaderboards === null) {
                this.gamesLeaderboards = new Map();
            }

            return this.gamesLeaderboards.has(gameId);
        },
        getGameLeaderboards(gameId: number) {
            if (this.gamesLeaderboards === null) {
                this.gamesLeaderboards = new Map();
            }

            return this.gamesLeaderboards.get(gameId) as GameLeaderboards | null;
        },
        setLeaderboardEntries(leaderboardId: number, list: LeaderboardEntries) {
            if (this.leaderboardEntries === null) {
                this.leaderboardEntries = new Map();
            }

            this.leaderboardEntries.set(leaderboardId, list);
        },
        hasLeaderboardEntries(leaderboardId: number): boolean {
            if (this.leaderboardEntries === null) {
                this.leaderboardEntries = new Map();
            }

            return this.leaderboardEntries.has(leaderboardId);
        },
        getLeaderboardEntries(leaderboardId: number) {
            if (this.leaderboardEntries === null) {
                this.leaderboardEntries = new Map();
            }

            return this.leaderboardEntries.get(leaderboardId) as LeaderboardEntries | null;
        },
    },
});
