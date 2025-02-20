import { Photo, ProtoPhoto, User } from "./types";
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

async function getUser(): Promise<User | null> {
  const { data, status } = await req("/user");

  if (status !== 200) {
    return null;
  }

  const user = {
    id: data.user.id,
    email: data.user.email,
    integrations: data.integrations,
    createdAt: new Date(data.user.createdAt),
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


async function uploadPhotos(fileData: { file: File, metadata: ProtoPhoto }[]) {
  try {
    const files = fileData.map((data) => {
      return { filename: data.metadata.filename, type: data.metadata.type };
    });

    const { data: signedUrls } = await req("/photos/generate-signed-url", {
      method: "POST",
      body: { files },
    });

    // Firebase upload
    const uploadPromises = fileData.map(async (data, index) => {
      const { url } = signedUrls[index];

      const compressedFile = await compressPhoto(data.file)

      console.log('Pre-compression size:', data.file.size, 'Post-compression size:', compressedFile.size)

      const response = await fetch(url, {
        method: "PUT",
        body: compressedFile,

      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${data.metadata.filename}`);
      }
    });

    await Promise.all(uploadPromises);

    // Collect photo metadata
    const photos = await Promise.all(
      fileData.map(async (data, index) => {

        return {
          ...data.metadata,
          url: '',
        };
      })
    );

    // Save to db
    const saveResponse = await req("/photos/save", {
      method: "POST",
      body: { photos },
    });

    if (saveResponse.status !== 200) {
      throw new Error(`Failed to save photos to the database: ${saveResponse.data}`);
    }

    console.log("Upload complete");
  } catch (error) {
    console.error("Error during photo upload:", error);
  }
}

async function getPhotos(filters = {}): Promise<Photo[]> {
  const { data } = await req("/photos", {
    method: "POST",
    body: filters,
  });

  return data;
}

const api = {
  req,
  getUser,
  disconnectIntegration,
  getPhotos,
  login,
  uploadPhotos,
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