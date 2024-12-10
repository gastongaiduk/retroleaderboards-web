import { defineStore } from 'pinia';
import { Router } from 'vue-router';
import {Game} from "../models/RecentlyPlayedGames.ts";
import {Leaderboard} from "../models/GameLeaderboards.ts";

interface PostState {
    selectedGameLeaderboards: Game | null;
    selectedLeaderboard: Leaderboard | null;
}

export const usePostStore = defineStore('post', {
    state: (): PostState => ({
        selectedGameLeaderboards: null,
        selectedLeaderboard: null,
    }),
    actions: {
        selectGameLeaderboards(game: Game): void {
            this.selectedGameLeaderboards = game;
            localStorage.setItem('selectedGameLeaderboards', JSON.stringify(game));
            this.router.push({ name: 'GameLeaderboards', params: { id: game.GameID } });
        },
        getSelectedGameLeaderboards() {
            if (this.selectedGameLeaderboards === null) {
                this.selectedGameLeaderboards = JSON.parse(<string>localStorage.getItem('selectedGameLeaderboards'));
            }
            return this.selectedGameLeaderboards;
        },
        selectLeaderboard(leaderboard: Leaderboard): void {
            this.selectedLeaderboard = leaderboard;
            localStorage.setItem("selectedLeaderboard", JSON.stringify(leaderboard));
            this.router.push({ name: 'Leaderboard', params: { id: leaderboard.ID } });
        },
        getSelectedLeaderboard() {
            if (this.selectedLeaderboard === null) {
                this.selectedLeaderboard = JSON.parse(<string>localStorage.getItem('selectedLeaderboard'));
            }
            return this.selectedLeaderboard;
        }
    },
});

declare module 'pinia' {
    export interface PiniaCustomProperties {
        router: Router;
    }
}
