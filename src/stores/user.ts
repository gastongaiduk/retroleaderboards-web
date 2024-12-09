import {defineStore} from 'pinia';
import encryptStorage from './encryption.ts';

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
            if (localStorage.getItem('username') !== null) {
                this.username = <string>encryptStorage.getItem('username');
            }
            if (localStorage.getItem('key') !== null) {
                this.key = <string>encryptStorage.getItem('key');
            }

            return this.username !== null && this.key !== null;
        },
        set(username: string, key: string): void {
            this.username = username;
            this.key = key;
            encryptStorage.setItem('username', username);
            encryptStorage.setItem('key', key);
        },
    },
});
