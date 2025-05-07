import { FastifyInstance } from "fastify";
import { getAllIntegrationsForUser } from "../database/repositories/IntegrationUtils";
import SettingsRepository from "../database/repositories/SettingsRepository";
import { User, UserSettingsKeysType } from "../../shared/types";
import TagsRepository from "@backend/database/repositories/TagsRepository";

const Settings = new SettingsRepository()
const Tags = new TagsRepository()

export function registerUserRoutes(server: FastifyInstance) {
  server.get("/api/user", async (request, reply) => {
    const user = request.user as User;
    const integrations = await getAllIntegrationsForUser(user.id, false);
    const settings = await Settings.getAllForUser(user.id);
    return reply.send({ user, integrations, settings });
  });

  server.get("/api/user/settings", async (request, reply) => {
    const user = request.user as User;
    const settings = await Settings.getAllForUser(user.id);
    return reply.send(settings);
  });

  server.post("/api/user/settings", async (request, reply) => {
      const user = request.user as User;
      const { key, value } = request.body as { key: UserSettingsKeysType; value: string };
      await Settings.setUserSetting(user.id, key, value);
      return reply.status(204).send();
})
}