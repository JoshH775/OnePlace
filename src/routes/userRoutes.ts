import { FastifyInstance } from "fastify";
import { getAllIntegrationsForUser } from "../database/repositories/IntegrationUtils";
import SettingsRepository from "../database/repositories/SettingsRepository";
import { User, UserSettingsKeysType } from "../../shared/types";
import TagsRepository from "@backend/database/repositories/TagsRepository";
import { UsersRepository } from "@backend/database/repositories/UserRepository";

const Settings = new SettingsRepository();
const Tags = new TagsRepository();
const Users = new UsersRepository();

export function registerUserRoutes(server: FastifyInstance) {
  server.get("/api/user", async (request, reply) => {
    const user = request.user as User;
    const integrations = await getAllIntegrationsForUser(user.id, false);
    const settings = await Settings.getAllForUser(user.id);
    return { user, integrations, settings };
  });

  server.get("/api/user/settings", async (request, reply) => {
    const user = request.user as User;
    const settings = await Settings.getAllForUser(user.id);
    return settings;
  });

  server.post("/api/user/settings", async (request, reply) => {
    const user = request.user as User;
    const { key, value } = request.body as {
      key: UserSettingsKeysType;
      value: string;
    };
    await Settings.setUserSetting(user.id, key, value);
    return reply.status(204);
  });

  server.get("/api/user/last-accessed", async (request, reply) => {
    const user = request.user as User;
    const lastAccessed = await Users.getLastAccessed(user.id);

    return lastAccessed;
  });
}
