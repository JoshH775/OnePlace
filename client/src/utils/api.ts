import { Photo, User } from "./types";

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
    console.error("Failed to get user");
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

async function disconnectIntegration(provider: string): Promise<boolean> {
  const { status } = await req(`/auth/disconnect/${provider}`, {
    method: "DELETE",
  });

  return status === 200;
}

async function getPhotos(): Promise<Photo[]> {
  return [
    {
      id: 1,
      userId: 1,
      url: "https://brandingforthepeople.com/wp-content/uploads/2019/04/Stock-Photography-vs-Real-Imagery.jpg",
      fileName: 'Stock-Photography-vs-Real-Imagery.jpg',
      googleId: null,
      dropboxId: null,
      size: 1000,
      alias: null
    },
    {
      id: 2,
      userId: 1,
      url: "https://media.istockphoto.com/id/1587604256/photo/portrait-lawyer-and-black-woman-with-tablet-smile-and-happy-in-office-workplace-african.jpg?s=612x612&w=0&k=20&c=n9yulMNKdIYIQC-Qns8agFj6GBDbiKyPRruaUTh4MKs=",
      fileName: 'portrait-lawyer-and.jpg',
      size: 1000,
      alias: null,
      googleId: null,
      dropboxId: "456",
    }
  ]
}

const api = {
  req,
  getUser,
  disconnectIntegration,
  getPhotos
};

export default api;
