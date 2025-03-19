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
// The other functions work as abstractions for the req function

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

const userAPI = {
  async getUser(): Promise<UserData | null> {
    const { data: userData, error } = await req<UserData>("/user");

    if (error || !userData) {
      console.error("Error getting user:", error);
      return null;
    }

    return userData;
  },
  async updateSetting(setting: {
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
  },
};

const authAPI = {
  async login(
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
  },

  async disconnectIntegration(
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
  },
};

const photosAPI = {
  async uploadPhotos(
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
  },

  async getPhotos(filters: Filters = {}): Promise<Photo[]> {
    const { data, error } = await req<Photo[]>("/photos", {
      method: "POST",
      body: filters,
    });

    if (error || !data) {
      console.error("Error getting photos:", error);
      return [];
    }

    return data;
  },

  async updatePhoto(photo: Photo): Promise<{ success: boolean; error?: string }> {
    const { status, error } = await req("/photos", {
      method: "PUT",
      body: { photo },
    });

    if (error || !statusIsOk(status)) {
      console.error("Error updating photo:", error);
      return { success: false, error: error || "Unknown error" };
    }

    return { success: true };
  },

  async deletePhoto(photoId: number): Promise<{ success: boolean; error?: string }> {
    const { status, error } = await req(`/photos/${photoId}`, {
      method: "DELETE",
    });

    if (error || !statusIsOk(status)) {
      console.error("Error deleting photo:", error);
      return { success: false, error: error || "Unknown error" };
    }

    return { success: true };
},

  async bulkDeletePhotos(photoIds: number[]): Promise<{ success: boolean; error?: string }> {
    const { status, error } = await req("/photos/bulk-delete", {
      method: "POST",
      body: { ids: photoIds },
    });

    if (error || !statusIsOk(status)) {
      console.error("Error bulk deleting photos:", error);
      return { success: false, error: error || "Unknown error" };
    }

    return { success: true };
  }

}

const collectionsAPI = {
  async getCollections(query?: string): Promise<Collection[]> {
    const queryString = query ? `?query=${query}` : "";
    const { data, error } = await req<Collection[]>(
      `/collections${queryString}`
    );

    if (error || !data) {
      console.error("Error getting collections:", error);
      return [];
    }

    return data;
  },

  async getCollectionById(collectionId: number): Promise<Collection | null> {
    const { data, error } = await req<Collection>(`/collections/${collectionId}`);

    if (error || !data) {
      console.error("Error getting collection by ID:", error);
      return null;
    }

    return data
  },

  async getPhotosForCollection(collectionId: number): Promise<Photo[]> {
    const { data, error } = await req<Photo[]>(
      `/collections/${collectionId}/photos`
    );

    if (error || !data) {
      console.error("Error getting photos for collection:", error);
      return [];
    }

    return data;
  },

  async createCollection(collection: {
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
  },

  async addPhotosToCollection(
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
  },

  async deleteCollection(
    collectionId: string
  ): Promise<{ success: boolean; error?: string }> {
    const { status, error } = await req(`/collections/${collectionId}`, {
      method: "DELETE",
    });

    if (error || !statusIsOk(status)) {
      console.error("Error deleting collection:", error);
      return { success: false, error: error || "Unknown error" };
    }

    return { success: true };
  },
};

const api = {
  user: userAPI,
  auth: authAPI,
  photos: photosAPI,
  collections: collectionsAPI,
  req,
};

export default api;

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
