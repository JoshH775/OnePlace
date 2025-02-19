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
    url: string;
    filename: string;
    size: number;
    alias: string | null;
    type: string;
    location: string | null;
    date: Date | null;
    googleId: string | null;
    createdAt: Date;
    lastAccessed: Date;
    compressed: number;
  }

  export type ProtoPhoto = Omit<Photo, 'userId' | 'id' | 'googleId' | 'createdAt' | 'lastAccessed'>