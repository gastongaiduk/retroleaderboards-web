import { EncryptStorage } from 'encrypt-storage';

// Initialize EncryptStorage with your secret key from environment variables
const encryptStorage = new EncryptStorage(import.meta.env.VITE_API_URL as string, {
    prefix: '@retroleaderboards', // Optional: Prefix for your keys
    storageType: 'localStorage', // Specify storage type
});

// Export the instance for use throughout your application
export default encryptStorage;