// stores/postStore.js
import {defineStore} from 'pinia';

export const usePostStore = defineStore('post', {
    state: () => ({
        selectedGameId: null,
        selectedLeaderboardId: null,
    }),
    actions: {
        selectGame(id, title) {
            this.selectedGameId = id;
            this.router.push({name: 'GameLeaderboards', params: {id, title}});
        },
        selectLeaderboard(id, title) {
            this.selectedLeaderboardId = id;
            this.router.push({name: 'Leaderboard', params: {id, title}});
        },
    },
});
