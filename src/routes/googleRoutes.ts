import { FastifyInstance } from "fastify";
import { User } from "../database/repositories/UserRepository";
import { GoogleIntegrationRepository } from "../database/repositories/GoogleIntegrationRepository";

const GoogleIntegrations = new GoogleIntegrationRepository();

export function registerGoogleRoutes(server: FastifyInstance) {
  server.delete("/api/auth/disconnect/google", async (request, reply) => {
    const user = request.user as User;
    console.log(user);

    const { status, message } =
      await GoogleIntegrations.deleteIntegrationForUser(user.id);
    reply.code(status);
    return { message };
  });

  server.get("/api/google/picker", async (request, reply) => {
    const user = request.user as User;
    const integration = await GoogleIntegrations.findByUserId(user.id);

    if (!integration) {
      reply.code(401);
      return { message: "Google not connected" };
    }

    const { accessToken } = integration;

    try {
      const response = await fetch("https://photospicker.googleapis.com/v1/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const config: PickerSessionConfig = await response.json();

      if (!response.ok) {
        reply.code(await response.json());
        return { message: "Failed to create session" };
      }

      console.log("Session created:", config);

      return { config };
    } catch (error) {
      console.error("Error creating session:", error);
      reply.code(500);
      return { message: "Internal server error" };
    }
  });

  server.post("/api/google/picker/poll", async (request, reply) => {
    const user = request.user as User;
    const { sessionId } = request.body as { sessionId: string };

    const integration = await GoogleIntegrations.findByUserId(user.id);

    if (!integration) {
      reply.code(401);
      return { message: "Google not connected" };
    }

    const { accessToken } = integration;

    const response = await fetch(`https://photospicker.googleapis.com/v1/sessions/${sessionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const sessionData = await response.json();

    if (!response.ok) {
      reply.code(response.status);
      console.log(sessionData);
      return { message: "Failed to poll session" };
    }

    console.log("Session data:", sessionData);

    return sessionData;
  });

  server.delete("/api/google/picker/delete", async (request, reply) => {
    const user = request.user as User;
    const { sessionId } = request.body as { sessionId: string };

    const integration = await GoogleIntegrations.findByUserId(user.id);

    if (!integration) {
      reply.code(401);
      return { message: "Google not connected" };
    }

    const { accessToken } = integration;

    const response = await fetch(`https://photospicker.googleapis.com/v1/sessions/${sessionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      reply.code(response.status);
      console.log(await response.json());
      return { message: "Failed to delete session" };
    }

    return { message: "Session deleted" };
  });
}

interface PickerSessionConfig {
  id: string;
  pickerUri: string;
  pollingConfig: object;
  mediaItemsSet: boolean;
}