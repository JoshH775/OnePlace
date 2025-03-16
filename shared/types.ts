import { GlobalSettingsKeys, UserSettingsKeys } from "./constants";

export type User = {
  id: number;
  email: string;
password: string;
createdAt: Date;
};

export type UserData = Omit<User, 'password'> & {
  integrations: Record<string, GoogleClientIntegration>; // key is the integration name (e.g. "google") and value is the integration object (e.g. GoogleIntegration)
  settings: SettingsObject;
};


export type GoogleIntegration = {
  id: number;
  userId: number;
  email: string;
  googleId: string;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GoogleClientIntegration = Omit<GoogleIntegration, 'accessToken' | 'refreshToken' | 'userId'>;


export interface Photo {
  id: number;
  userId: number;
  filename: string;
  size: number;
  alias: string | null;
  type: string;
  location: string | null;
  date: string | null;
  googleId: string | null;
  createdAt: string;
  lastAccessed: string;
  compressed: boolean;
}

export interface UpdatablePhotoProperties {
  filename?: Photo['filename']
  location?: Photo['location']
  date?: Photo['date']
}

export type ProtoPhoto = Omit<
  Photo,
  "userId" | "id" | "googleId" | "createdAt" | "lastAccessed"
>;

export type ProtoUser = {
  email: string;
  password: string | null;
};

export type UserSettingsKeysType = typeof UserSettingsKeys[keyof typeof UserSettingsKeys];
export type GlobalSettingsKeysType = typeof GlobalSettingsKeys[keyof typeof GlobalSettingsKeys];
export type SettingKeyType = UserSettingsKeysType | GlobalSettingsKeysType;

export type Setting = {
  key: SettingKeyType;
  value: string;
};

export type SettingsObject = Record<SettingKeyType, string>;

export type Collection = {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  coverPhotoId: number | null;
  createdAt: Date;
  updatedAt: Date;
  lastAccessed: Date;
}

export type ProtoCollection = Omit<Collection, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'lastAccessed'>;