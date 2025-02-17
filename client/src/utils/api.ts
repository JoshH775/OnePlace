import { getDownloadURL } from "firebase/storage";
import { Photo, User } from "./types";
import ExifReader from "exifreader";
import moment from "moment";
import { resolve } from "path";

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


async function uploadPhotos(acceptedFiles: File[]) {
  // const files = acceptedFiles.map((file) => {
  //   return { filename: file.name, type: file.type };
  // })

  // const { data: signedUrls } = await req("/photos/generate-signed-url", {
  //   method: "POST",
  //   body: { files },
  // });

  // //firebase upload

  // const uploadPromises = acceptedFiles.map(async (file, index) => {
   
  //   const { url } = signedUrls[index];
  //   const response = await fetch(url, {
  //     method: "PUT",
  //     body: file,
  //   });

  //   if (!response.ok) {
  //     throw new Error(`Failed to upload ${file.name}`);
  //   }
  // });

  // await Promise.all(uploadPromises);

  //Save to db

  // const savePromises = acceptedFiles.map(async (file, index) => {
  //   const buffer = await new Uint8Array(await file.arrayBuffer());
  //   const metadata = ExifReader.load(buffer);
  //   const dimensions = sizeOf(buffer);

  //   const firebasePath = signedUrls[index].path;

  //   const downloadUrl = await getDownloadURL(firebasePath);
    

  //   let date = null
  //   if (metadata.DateTime) {
  //     date = moment(metadata.DateTime.description).toDate()
  //   } else {
  //     if (file.lastModified) {
  //       date = moment(file.lastModified).toDate()
  //     }
  //   }

  //   const photo: Omit<Photo, 'userId' | 'id'> = {
  //     filename: file.name,
  //     url: downloadUrl,
  //     createdAt: moment().toDate(),
  //     lastAccessed: new Date(),
  //     alias: null,
  //     compressed: 0,
  //     size: file.size,
  //     googleId: null,
  //     date: date ,
  //     type: file.type,
  //     width: metadata.ImageWidth?.value,
  //     height: metadata.ImageHeight?.value,

  //   };


  // })

  console.log("Upload complete");
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
  getDimensionsFromFile,
};

export default api;


function getDimensionsFromFile(file: File) {
  console.log('here');
  const url = URL.createObjectURL(file);
  const img = new Image();
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(url); // Revoke the object URL after use
    };
    img.onerror = (error) => {
      console.log('error');
      console.log(error);
      reject(error);
      URL.revokeObjectURL(url); // Revoke the object URL in case of error
    };
    img.src = url;
  });
}