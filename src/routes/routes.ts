import { Authenticator } from "@fastify/passport";
import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from "fastify";
import { registerGoogleRoutes } from "./googleRoutes";
import { registerAuthRoutes } from "./authRoutes";
import { registerUserRoutes } from "./userRoutes";
import registerPhotosRoutes from "./photosRoutes";

export function registerRoutes(
  server: FastifyInstance,
  fastifyPassport: Authenticator
) {
  server.addHook("preHandler", routeLogger);

  server.addHook("preHandler", async (request, reply) => {
    if (!request.isAuthenticated()) {
      return reply.code(401).send({ message: "Not logged in" });
    }

    return;
  });

  registerGoogleRoutes(server);
  registerAuthRoutes(server, fastifyPassport);
  registerUserRoutes(server);
  registerPhotosRoutes(server);

}

function routeLogger(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${request.method} ${request.url}`);
  done();
}
