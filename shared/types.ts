import { GlobalSettingsKeys, UserSettingsKeys } from "./constants";

export type User = {
  id: number;
  email: string;
password: string;
createdAt: Date;
};

export type UserData = Omit<User, 'password'> & {
  integrations: Record<string, GoogleIntegration | DropboxIntegration>; // key is the integration name (e.g. "google") and value is the integration object (e.g. GoogleIntegration)
  settings: Record<SettingKeyType, string>;
};


export type GoogleIntegration = {
  id: number;
  userId: number;
  googleId: string;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DropboxIntegration = {
  id: number;
  userId: number;
  dropboxId: string;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
  id: number;
  userId: number;
  filename: string;
  size: number;
  alias: string | null;
  type: string;
  location: string | null;
  date: Date | null;
  googleId: string | null;
  createdAt: Date;
  lastAccessed: Date;
  compressed: boolean;
}

export type ProtoPhoto = Omit<
  Photo,
  "userId" | "id" | "googleId" | "createdAt" | "lastAccessed"
>;

export type ProtoUser = {
  email: string;
  password: string | null;
};

export type UserSettingsKeysType = keyof typeof UserSettingsKeys;


export type GlobalSettingsKeysType = keyof typeof GlobalSettingsKeys;

export type SettingKeyType = UserSettingsKeysType | GlobalSettingsKeysType;
