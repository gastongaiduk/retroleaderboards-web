import {defineStore} from 'pinia';
import type {GameList} from "../models/RecentlyPlayedGames.ts";
import {GameLeaderboards} from "../models/GameLeaderboards.ts";

// Define the state interface
interface GamesState {
    lastPlayedGames: GameList | null;
    gamesLeaderboards: Map<number, GameLeaderboards> | null;
}

// Define the store using TypeScript
export const useGamesStore = defineStore('games', {
    state: (): GamesState => ({
        lastPlayedGames: null,
        gamesLeaderboards: null,
    }),
    actions: {
        setLastPlayedGames(list: GameList | null) {
            this.lastPlayedGames = list;
        },
        addGameLeaderboards(gameId: number, list: GameLeaderboards) {
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
        }
    },
});
