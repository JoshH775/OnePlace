import { Photo, ProtoPhoto, SettingKeyType, UserData, UserSettingsKeysType } from "@shared/types";
import imageCompression, { Options } from 'browser-image-compression';


type APIOptions = {
  method: string;
  body?: object;
};

const defaultOptions: APIOptions = {
  method: "GET",
};

async function req(path: string, options: APIOptions = defaultOptions) {
  const fetchOptions: RequestInit = {
    method: options.method,
    credentials: "include",
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
    fetchOptions.headers = {
      "Content-Type": "application/json",
    };
  }

  const response = await fetch(`/api${path}`, fetchOptions);

  if (response.status === 401) {
    return { status: 401, data: "Unauthorized" };
  }

  return { status: response.status, data: await response.json() };
}

async function getUser(): Promise<UserData | null> {
  const { data, status } = await req("/user");

  if (status !== 200) {
    return null;
  }

  const user: UserData = {
    id: data.user.id,
    email: data.user.email,
    integrations: data.integrations,
    createdAt: new Date(data.user.createdAt),
    settings: data.settings,
  };

  return user;
}

async function login(email: string, password: string): Promise<boolean> {
  const { status } = await req("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  return status === 200;
}

async function disconnectIntegration(provider: string): Promise<boolean> {
  const { status } = await req(`/auth/disconnect/${provider}`, {
    method: "DELETE",
  });

  return status === 200;
}


async function uploadPhotos(fileDataArray: { file: File, metadata: ProtoPhoto }[]) {
  try {
    const formData = new FormData();

    for (let i = 0; i < fileDataArray.length; i++) {
      const { file, metadata } = fileDataArray[i];
      const compressedFile = await compressPhoto(file);
      formData.append(`file_${i}`, compressedFile);
      formData.append(`metadata_${i}`, JSON.stringify(metadata));
    }

    console.log("Uploading photos:", formData);

    const response = await fetch('/api/photos/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to upload photos. Check response.' +  response);
    }
    return true;

  } catch (error) {
    console.error("Error during photo upload:", error);
    throw error
  }
}


async function getPhotos(filters = {}): Promise<Photo[]> {
  const { data } = await req("/photos", {
    method: "POST",
    body: filters,
  });

  return data;
}

async function fetchUserSettings(): Promise<Record<UserSettingsKeysType, { value: string}>> {
  const { data } = await req("/user/settings");

  return data as Record<UserSettingsKeysType, { value: string}>;
}

async function updateSetting(setting: { key: SettingKeyType, value: string }): Promise<{ key: SettingKeyType, value: string, success: boolean }> {
  const { status } = await req("/user/settings", {
    method: "POST",
    body: setting,
  });

  return { key: setting.key, value: setting.value, success: status === 200 };
}

const api = {
  req,
  getUser,
  disconnectIntegration,
  getPhotos,
  login,
  uploadPhotos,
  updateSetting,
  fetchUserSettings,
};

export default api;

//local functions

export async function compressPhoto(file: File): Promise<File> {
  const options: Options = {
    useWebWorker: true,
    maxSizeMB: 1,
    alwaysKeepResolution: true,
    preserveExif: true,

  }

  const supportedFileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']

  if (!supportedFileTypes.includes(file.type)) {
    return file
  }

  
  return imageCompression(file, options);


}