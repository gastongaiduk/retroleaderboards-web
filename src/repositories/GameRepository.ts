import axios from "axios";
import type {GameList} from "../models/RecentlyPlayedGames";
import {GameLeaderboards} from "../models/GameLeaderboards.ts";
import {LeaderboardEntries} from "../models/LeaderboardEntries.ts";

import { useUserStore } from '../stores/user';

class GameRepository {
    private url = import.meta.env.VITE_API_URL;
    private user = useUserStore();

    public async fetchLastPlayedGames(): Promise<GameList> {
        try {
            const response = await axios.get(`${this.url}/API/API_GetUserRecentlyPlayedGames.php`, {
                params: {y: this.user.key, u: this.user.username, c: 10}
            });
            return response.data as GameList;
        } catch (error) {
            console.error('Error fetching request:', error);
            throw error;
        }
    }

    public async fetchLeaderboards(gameId: string) {
        try {
            const response = await axios.get(`${this.url}/API/API_GetGameLeaderboards.php`, {
                params: {y: this.user.key, i: gameId}
            });
            return response.data as GameLeaderboards;
        } catch (error) {
            console.error('Error fetching request:', error);
            throw error;
        }
    }

    public async fetchLeaderboardEntries(leaderboardId: string) {
        try {
            const response = await axios.get(`${this.url}/API/API_GetLeaderboardEntries.php`, {
                params: {y: this.user.key, i: leaderboardId, c: 500}
            });
            return response.data as LeaderboardEntries;
        } catch (error) {
            console.error('Error fetching request:', error);
            throw error;
        }
    }
}

export default GameRepository;