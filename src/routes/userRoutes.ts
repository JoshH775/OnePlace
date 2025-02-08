import { FastifyInstance } from "fastify";
import { User } from "../database/repositories/UserRepository";
import { getAllIntegrationsForUser } from "../database/repositories/IntegrationUtils";

export function registerUserRoutes(server: FastifyInstance) {
  server.get("/api/user", async (request, reply) => {
    const user = request.user as User;
    const integrations = await getAllIntegrationsForUser(user.id);
    return { user, integrations };
  });
}