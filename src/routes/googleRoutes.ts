import { FastifyInstance } from "fastify";
import { User } from "../database/repositories/UserRepository";
import {
  GoogleIntegration,
  GoogleIntegrationRepository,
} from "../database/repositories/GoogleIntegrationRepository";

const GoogleIntegrations = new GoogleIntegrationRepository();

async function fetchGooglePickerAPI(
  endpoint: string,
  method: string,
  token: string,
  body?: object,
  queryParams?: Record<string, string>
) {

  const url = new URL(`https://photospicker.googleapis.com/v1/${endpoint}`);
  if (queryParams) {
    Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));
  }

  console.log(url.toString());

  const response = await fetch(
    url.toString(),
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    }
  );

  const responseData = await response.json();
  if (!response.ok) {
    throw {
      status: response.status,
      message: responseData.message || "Google API error",
      data: responseData,
    };
  }

  return responseData;
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
  });

  server.get("/api/google/picker", async (request, reply) => {
    try {
      const user = request.user as User;
      const accessToken = await getValidAccessToken(user.id);
      const sessionData = await fetchGooglePickerAPI(
        "sessions",
        "POST",
        accessToken
      );

      return sessionData;
    } catch (error: any) {
      console.error(error);
      return reply.code(error.status || 500).send({ message: error.message });
    }
  });

  server.post("/api/google/picker/poll", async (request, reply) => {
    const user = request.user as User;
    const { sessionId } = request.body as { sessionId: string };

    try {
      const accessToken = await getValidAccessToken(user.id);
      const sessionData = await fetchGooglePickerAPI(
        `sessions/${sessionId}`,
        "GET",
        accessToken
      );

      return sessionData;
    } catch (error: any) {
      console.error(error);
      return reply.code(error.status || 500).send({ message: error.message });
    }
  });

  server.delete("/api/google/picker/delete", async (request, reply) => {
    const user = request.user as User;
    const { sessionId } = request.body as { sessionId: string };

    try {
      const accessToken = await getValidAccessToken(user.id);
      await fetchGooglePickerAPI(
        `sessions/${sessionId}`,
        "DELETE",
        accessToken
      );

      return { message: "Session deleted" };
    } catch (error: any) {
      console.error(error);
      return reply.code(error.status || 500).send({ message: error.message });
    }
  });

  server.post("/api/google/picker/media", async (request, reply) => {
    const user = request.user as User;
    const { sessionId } = request.body as { sessionId: string };

    try {
      const accessToken = await getValidAccessToken(user.id);
      const mediaItems = await fetchGooglePickerAPI(
        'mediaItems',
        'GET',
        accessToken,
        undefined,
        { session_id: sessionId}
      );

      return mediaItems;
    } catch (error: any) {
      console.error('Error getting media items', error.data.error.details[1].fieldViolations);
      return reply.code(error.status || 500).send({ message: error.message });
  }})
}
