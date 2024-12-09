import { defineStore } from 'pinia';

// Define the state interface
interface UserState {
    username: string | null;
    key: string | null;
}

// Define the store using TypeScript
export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        username: null,
        key: null,
    }),
    actions: {
        isSet(): boolean {
            return this.username !== null && this.key !== null;
        },
        set(username: string, key: string): void {
            this.username = username;
            this.key = key;
        },
    },
});
