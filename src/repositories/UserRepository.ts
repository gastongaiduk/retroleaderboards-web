import axios from "axios";
import {Friends} from "../models/Friends.ts";

export async function fetchFriends() {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/API/API_GetUsersIFollow.php`, {
            params: {y: import.meta.env.VITE_API_KEY}
        });
        return response.data as Friends;
    } catch (error) {
        console.error('Error fetching request:', error);
        throw error;
    }
}