import { Collection, Filters, Photo, ProtoPhoto, SettingKeyType, UserData } from "@shared/types";
import imageCompression, { Options } from 'browser-image-compression';
import moment from "moment";


type APIOptions = {
  method: string;
  body?: object;
  throwError?: boolean;
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

  if (!response.ok) {
    if (response.status === 401) {
      if (options.throwError) {
        throw new Error("Unauthorized");
      }
      return { status: 401, data: "Unauthorized" };
    }

    if (options.throwError) {
      throw new Error("Failed to fetch data");
  }
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


async function uploadPhotos(fileDataArray: { file: File, metadata: ProtoPhoto }[], compress: boolean = true) {
  try {
    const formData = new FormData();

    for (let i = 0; i < fileDataArray.length; i++) {
      const { file, metadata } = fileDataArray[i];
      const fileToUpload = compress ? await compressPhoto(file) : file;
      
      if (metadata.date) {
        metadata.date = moment(metadata.date).format("YYYY-MM-DD HH:mm:ss")
      }

      formData.append(`file_${i}`, fileToUpload);
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


async function getPhotos(filters: Filters = {}): Promise<Photo[]> {
  const { data } = await req("/photos", {
    method: "POST",
    body: filters,
  });

  return data;
}

async function updateSetting(setting: { key: SettingKeyType, value: string }): Promise<{ key: SettingKeyType, value: string, success: boolean }> {
  const { status } = await req("/user/settings", {
    method: "POST",
    body: setting,
  });

  return { key: setting.key, value: setting.value, success: status === 200 };
}

async function getCollections(query?: string): Promise<Collection[] | null> {
  const queryString = query ? `?query=${query}` : '';
  const { data } = await req(`/collections${queryString}`);
  return data;
}

async function createCollection(collection: { name: string, description: string }): Promise<Collection> {
  try {
    const { data } = await req('/collections', {
      method: 'POST',
      body: collection,
      throwError: true,
    });

    return data as Collection;
  } catch (error) {
    console.error("Error creating collection:", error);
    throw error;
  }
}

async function addPhotosToCollection(collectionId: string, photoIds: number[]): Promise<boolean> {
  try {
    const { status } = await req(`/collections/${collectionId}/photos`, {
      method: 'PUT',
      body: { photoIds },
      throwError: true,
    });

    return status === 200;
  } catch (error) {
    console.error("Error adding photos to collection:", error);
    throw error;
  }
}

const api = {
  req,
  getUser,
  disconnectIntegration,
  getPhotos,
  login,
  uploadPhotos,
  updateSetting,
  getCollections,
  createCollection,
  addPhotosToCollection,
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