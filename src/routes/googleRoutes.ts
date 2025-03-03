import { FastifyInstance } from "fastify";
import {
  GoogleIntegrationRepository,
} from "../database/repositories/GoogleIntegrationRepository";
import { GoogleIntegration, User } from "@shared/types";

const GoogleIntegrations = new GoogleIntegrationRepository();

interface fetchOptions {
  endpoint: string;
  method: string;
  token: string;
  headers?: Record<string, string>;
  body?: object;
  queryParams?: Record<string, string>;
}

async function fetchGoogleLibraryApi(options: fetchOptions) {
  const { method, token, body, queryParams, headers: customHeaders, endpoint } = options

  const url = new URL(`https://photoslibrary.googleapis.com/v1/${endpoint}`)
  if (queryParams) {
    Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]))
  }

  let headers = new Headers(customHeaders || {})
  headers.append('Authorization', `Bearer ${token}`)

  const isRawBuffer = Buffer.isBuffer(body)

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: isRawBuffer ? body : body ? JSON.stringify(body) : undefined, // Handle buffers
  })

  const contentType = response.headers.get('Content-Type')
  const responseData = contentType?.includes('application/json')
    ? await response.json()
    : await response.text() 

  if (!response.ok) {
    throw {
      status: response.status,
      message: responseData.message || "Google API error",
      data: responseData,
    }
  }

  return responseData
}


async function getValidAccessToken(userId: number) {
  let integration = await GoogleIntegrations.findByUserId(userId);
  if (!integration) throw { status: 401, message: "Google not connected" };

  let { accessToken } = integration as GoogleIntegration;
  const isTokenValid = await isAccessTokenValid(accessToken);

  if (!isTokenValid) {
    await GoogleIntegrations.refreshAccessToken(userId, integration.id);
    integration = await GoogleIntegrations.findByUserId(userId);
    if (!integration) throw { status: 401, message: "Google not connected" };
    accessToken = (integration as GoogleIntegration).accessToken;
  }

  return accessToken;
}

async function isAccessTokenValid(token: string): Promise<boolean> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v1/tokeninfo",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.ok;
}

export function registerGoogleRoutes(server: FastifyInstance) {
  server.delete("/api/auth/disconnect/google", async (request, reply) => {
    const user = request.user as User;

    const { status, message } =
      await GoogleIntegrations.deleteIntegrationForUser(user.id);
    return reply.code(status).send({ message });
  })
  }


  export async function uploadPhotoToGoogle(userId: number, fileDataArray: { file: Buffer, metadata: Photo | ProtoPhoto }[]): Promise<boolean> {
    try {
      const token = await getValidAccessToken(userId);
  
      // First have to upload bytes to Google Photos
      const uploadResponses = await Promise.all(fileDataArray.map(async ({ file, metadata }) => {
        return await fetchGoogleLibraryApi({
          endpoint: 'uploads',
          method: 'POST',
          token,
          headers: {
            'Content-type': 'application/octet-stream',
            'X-Goog-Upload-Protocol': 'raw',
            'X-Goog-Upload-Content-Type': metadata.type,
          },
          body: file
        });
      }));
  
      // Draft new media items with upload tokens and metadata
      const newMediaItems = uploadResponses.map((uploadResponse, index) => {
        const metadata = fileDataArray[index].metadata;
        return {
          description: metadata.filename,
          simpleMediaItem: {
            fileName: metadata.filename,
            uploadToken: uploadResponse
          }
        };
      });
  
      // Create media items in Google Photos
      await fetchGoogleLibraryApi({
        endpoint: 'mediaItems:batchCreate',
        method: 'POST',
        token,
        body: {
          newMediaItems
        }
      });
  
      return true;
    } catch (error) {
      console.error("Error uploading photo to Google Photos:", error);
      return false;
    }
  }