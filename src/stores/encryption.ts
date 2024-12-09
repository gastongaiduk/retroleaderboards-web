import { EncryptStorage } from 'encrypt-storage';

const encryptStorage = new EncryptStorage(import.meta.env.VITE_API_URL as string, {
    storageType: 'localStorage'
});

export default encryptStorage;