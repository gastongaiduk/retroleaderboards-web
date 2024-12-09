import {defineStore} from 'pinia';
import {Friends} from "../models/Friends.ts";
import UserRepository from "../repositories/UserRepository.ts";

// Define the state interface
interface FriendsState {
    friends: Friends | null;
}

// Define the store using TypeScript
export const useFriendsState = defineStore('friends', {
    state: (): FriendsState => ({
        friends: null,
    }),
    actions: {
        async load() {
            if (this.friends !== null) {
                return this.friends;
            }

            const userRepository = new UserRepository();
            this.friends = await userRepository.fetchFriends();
        },
    },
});
