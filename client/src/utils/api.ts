import {
  Collection,
  Filters,
  Photo,
  ProtoPhoto,
  SettingKeyType,
  UserData,
} from "@shared/types";
import imageCompression, { Options } from "browser-image-compression";
import moment from "moment";

type APIOptions = {
  method: string;
  body?: object;
  throwError?: boolean;
};

type APIResponse<T> = {
  status: number;
  data: T | null;
  error?: string;
};

// Usage:
// Include the type the response is supposed to be in the function call
// If the response is not successful, the error message will be in the error field
// If the response is successful, the data will be in the data field
// If the response is successful but the data is null, the data field will be null

async function req<T>(
  path: string,
  options: APIOptions = { method: "GET" }
): Promise<APIResponse<T>> {
  const fetchOptions: RequestInit = {
    method: options.method,
    credentials: "include",
  };

  if (options.body) {
    if (options.body instanceof FormData) {
      fetchOptions.body = options.body;
    } else {
      fetchOptions.body = JSON.stringify(options.body);
      fetchOptions.headers = { "Content-Type": "application/json" };
    }
  }

  try {
    const response = await fetch(`/api${path}`, fetchOptions);

    let data = null;

    try {
      data = await response.json();
    } catch (jsonError) {
      console.error("Error parsing response JSON:", jsonError);
    }

    if (!response.ok) {
      // Check if the error message is returned from the server
      const errorMessage = data?.error || response.statusText;
      return {
        status: response.status,
        data: null,
        error: errorMessage,
      };
    }

    return {
      status: response.status,
      data,
    };
  } catch (error) {
    //Error in the making of the request
    console.error("Error in req function:", error);

    if (options.throwError) {
      throw error;
    }

    return {
      status: 500,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function getUser(): Promise<UserData | null> {
  const { data: userData, error } = await req<UserData>("/user");

  if (error || !userData) {
    console.error("Error getting user:", error);
    return null;
  }

  const user: UserData = {
    id: userData.id,
    email: userData.email,
    integrations: userData.integrations,
    createdAt: userData.createdAt,
    settings: userData.settings,
  };

  return user;
}

async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const { status, error } = await req("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  if (error || !statusIsOk(status)) {
    console.error("Error logging in:", error);
    return { success: false, error: error || "Unknown error" };
  }

  return { success: true };
}

async function disconnectIntegration(
  provider: string
): Promise<{ success: boolean; error?: string }> {
  const { status, error } = await req(`/auth/disconnect/${provider}`, {
    method: "DELETE",
  });

  if (error || !statusIsOk(status)) {
    console.error("Error disconnecting integration:", error);
    return { success: false, error: error || "Unknown error" };
  }

  return { success: true };
}

async function uploadPhotos(
  fileDataArray: { file: File; metadata: ProtoPhoto }[],
  compress: boolean = true
) {
  try {
    const formData = new FormData();

    for (let i = 0; i < fileDataArray.length; i++) {
      const { file, metadata } = fileDataArray[i];
      const fileToUpload = compress ? await compressPhoto(file) : file;

      if (metadata.date) {
        metadata.date = moment(metadata.date).format("YYYY-MM-DD HH:mm:ss");
      }

      formData.append(`file_${i}`, fileToUpload);
      formData.append(`metadata_${i}`, JSON.stringify(metadata));
    }

    console.log("Uploading photos:", formData);

    const response = await fetch("/api/photos/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to upload photos. Check response." + response);
    }
    return true;
  } catch (error) {
    console.error("Error during photo upload:", error);
    throw error;
  }
}

async function getPhotos(filters: Filters = {}): Promise<Photo[]> {
  const { data, error } = await req<Photo[]>("/photos", {
    method: "POST",
    body: filters,
  });

  if (error || !data) {
    console.error("Error getting photos:", error);
    return [];
  }

  return data;
}

async function updateSetting(setting: {
  key: SettingKeyType;
  value: string;
}): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await req("/user/settings", {
    method: "POST",
    body: setting,
  });

  if (error || !data) {
    console.error("Error updating setting:", error);
    return { success: false, error: error || "Unknown error" };
  }

  return { success: true };
}

async function getCollections(query?: string): Promise<Collection[] | null> {
  const queryString = query ? `?query=${query}` : "";
  const { data, error } = await req<Collection[]>(`/collections${queryString}`);

  if (error || !data) {
    console.error("Error getting collections:", error);
    return null;
  }

  return data;
}

async function createCollection(collection: {
  name: string;
  description: string;
}): Promise<Collection | null> {
  const { data, error } = await req<Collection>("/collections", {
    method: "POST",
    body: collection,
  });

  if (error || !data) {
    console.error("Error creating collection:", error);
    return null;
  }

  return data;
}

async function addPhotosToCollection(
  collectionId: string,
  photoIds: number[]
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await req(`/collections/${collectionId}/photos`, {
    method: "PUT",
    body: { photoIds },
    throwError: true,
  });

  if (error || !data) {
    console.error("Error adding photos to collection:", error);
    return { success: false, error: error || "Unknown error" };
  }

  return { success: true };
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

function statusIsOk(status: number): boolean {
  return status >= 200 && status < 300;
}

export async function compressPhoto(file: File): Promise<File> {
  const options: Options = {
    useWebWorker: true,
    maxSizeMB: 1,
    alwaysKeepResolution: true,
    preserveExif: true,
  };

  const supportedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/webp",
  ];

  if (!supportedFileTypes.includes(file.type)) {
    return file;
  }

  return imageCompression(file, options);
}
