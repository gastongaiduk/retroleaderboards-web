import axios from "axios";
import type {GameList} from "../models/RecentlyPlayedGames";
import {GameLeaderboards} from "../models/GameLeaderboards.ts";
import {LeaderboardEntries} from "../models/LeaderboardEntries.ts";

export async function fetchLastPlayedGames(username: string) {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/API/API_GetUserRecentlyPlayedGames.php`, {
            params: {y: import.meta.env.VITE_API_KEY, u: username, c: 20}
        });
        return response.data as GameList;
    } catch (error) {
        console.error('Error fetching request:', error);
        throw error;
    }
}

export async function fetchLeaderboards(gameId: string) {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/API/API_GetGameLeaderboards.php`, {
            params: {y: import.meta.env.VITE_API_KEY, i: gameId}
        });
        return response.data as GameLeaderboards;
    } catch (error) {
        console.error('Error fetching request:', error);
        throw error;
    }
}

export async function fetchLeaderboardEntries(leaderboardId: string) {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/API/API_GetLeaderboardEntries.php`, {
            params: {y: import.meta.env.VITE_API_KEY, i: leaderboardId, c: 500}
        });
        return response.data as LeaderboardEntries;
    } catch (error) {
        console.error('Error fetching request:', error);
        throw error;
    }
}