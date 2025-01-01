import {defineStore} from 'pinia';
import {decryptData, encryptData} from "../utils/crypto.ts";

interface UserState {
    user_id: string | null;
    token: string | null;
    username: string | null;
    key: string | null;
}

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        user_id: null,
        token: null,
        username: null,
        key: null,
    }),
    actions: {
        init(): boolean {
            if (localStorage.getItem('user_id') !== null) {
                this.user_id = localStorage.getItem('user_id');
            }
            if (localStorage.getItem('token') !== null) {
                this.token = localStorage.getItem('token');
            }
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
        },
        isSet(): boolean {
            this.init();
            return this.username !== null && this.key !== null;
        },
        set(username: string, key: string): void {
            this.username = username;
            this.key = key;
            localStorage.setItem('username', encryptData(username));
            localStorage.setItem('key', encryptData(key));
        },
        isLoggedIn(): boolean {
            this.init();
            return this.user_id !== null && this.token !== null;
        },
        login(user_id: string, access_token: string): void {
            this.user_id = user_id;
            this.token = access_token;
            localStorage.setItem('user_id', user_id)
            localStorage.setItem('token', access_token)
        },
    },
});
