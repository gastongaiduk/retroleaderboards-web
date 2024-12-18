import CryptoJS from 'crypto-js';

export function encryptData(data: string): string {
    const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY as string || 'test_key';
    return CryptoJS.AES.encrypt(data, encryptionKey).toString();
}

export function decryptData(ciphertext: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, import.meta.env.VITE_ENCRYPTION_KEY as string || 'test_key');
    return bytes.toString(CryptoJS.enc.Utf8);
}
