import CryptoJS from 'crypto-js';

export function encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, import.meta.env.VITE_ENCRIPTION_KEY as string).toString();
}

export function decryptData(ciphertext: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, import.meta.env.VITE_ENCRIPTION_KEY as string);
    return bytes.toString(CryptoJS.enc.Utf8);
}
