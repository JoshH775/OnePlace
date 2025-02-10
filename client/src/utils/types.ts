export type User = {
    id: number
    email: string
    integrations: {
        google?: GoogleIntegration
    }
    createdAt: Date
}

export type GoogleIntegration = {
    id: number;
    userId: number;
    googleId: string;
    accessToken: string;
    refreshToken: string;
    createdAt: Date;
    updatedAt: Date;
}

export type Photo = {
    id: number;
    userId: number;
    fileName: string;
    size: number;
    alias: string | null;
    url: string;
    googleId: string | null;
    dropboxId: string | null;
    
}