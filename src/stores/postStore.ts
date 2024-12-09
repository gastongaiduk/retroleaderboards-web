import { defineStore } from 'pinia';
import { Router } from 'vue-router';

// Define the state interface
interface PostState {
    selectedGameId: number | null;
    selectedGameName: string | null;
    selectedLeaderboardId: number | null;
    selectedLeaderboardName: string | null;
}

// Define the store using TypeScript
export const usePostStore = defineStore('post', {
    state: (): PostState => ({
        selectedGameId: null,
        selectedGameName: null,
        selectedLeaderboardId: null,
        selectedLeaderboardName: null,
    }),
    actions: {
        selectGame(id: number, title: string): void {
            this.selectedGameId = id;
            this.selectedGameName = title;
            this.router.push({ name: 'GameLeaderboards', params: { id } });
        },
        selectLeaderboard(id: number, title: string): void {
            this.selectedLeaderboardId = id;
            this.selectedLeaderboardName = title;
            this.router.push({ name: 'Leaderboard', params: { id } });
        },
    },
});

declare module 'pinia' {
    export interface PiniaCustomProperties {
        router: Router;
    }
}
