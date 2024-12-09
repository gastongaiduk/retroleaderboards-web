import { defineStore } from 'pinia';
import { Router } from 'vue-router';

// Define the state interface
interface PostState {
    selectedGameId: number | null;
    selectedLeaderboardId: number | null;
}

// Define the store using TypeScript
export const usePostStore = defineStore('post', {
    state: (): PostState => ({
        selectedGameId: null,
        selectedLeaderboardId: null,
    }),
    actions: {
        selectGame(id: number, title: string): void {
            this.selectedGameId = id;
            this.router.push({ name: 'GameLeaderboards', params: { id, title } });
        },
        selectLeaderboard(id: number, title: string): void {
            this.selectedLeaderboardId = id;
            this.router.push({ name: 'Leaderboard', params: { id, title } });
        },
    },
});

declare module 'pinia' {
    export interface PiniaCustomProperties {
        router: Router;
    }
}
