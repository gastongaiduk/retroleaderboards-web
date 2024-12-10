import {defineStore} from 'pinia';
import {decryptData, encryptData} from "../utils/crypto.ts";

interface UserState {
    username: string | null;
    key: string | null;
}

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        username: null,
        key: null,
    }),
    actions: {
        isSet(): boolean {
            if (localStorage.getItem('username') !== null) {
                const encryptedSecret = localStorage.getItem('username');
                if (encryptedSecret) {
                    this.username = decryptData(encryptedSecret);
                }
            }
            if (localStorage.getItem('key') !== null) {
                const encryptedSecret = localStorage.getItem('key');
                if (encryptedSecret) {
                    this.key = decryptData(encryptedSecret);
                }
            }

            return this.username !== null && this.key !== null;
        },
        set(username: string, key: string): void {
            this.username = username;
            this.key = key;
            localStorage.setItem('username', encryptData(username));
            localStorage.setItem('key', encryptData(key));
        },
    },
});
