import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

const app = initializeApp({
    credential: cert('./firebase-service-account.json'),
    storageBucket: "jchfyp-37005.firebasestorage.app",
})

export const storage = getStorage(app);