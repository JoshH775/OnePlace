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
import { registerCollectionRoutes } from "./collectionRoutes";

export function registerRoutes(
  server: FastifyInstance,
  fastifyPassport: Authenticator
) {
  server.addHook("preHandler", routeLogger);

  server.addHook("preHandler", async (request, reply) => {
    if (!request.isAuthenticated()) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    return;
  });

  server.setErrorHandler((error, request, reply) => {
    console.error(error); // Log the error for debugging

    // Check for custom error types or default to generic
    if (error.validation) {
      return reply.status(400).send({
        error: "Validation error",
        details: error.validation,
      });
    }

    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      error: "Internal Server Error",
    });
  });

  registerGoogleRoutes(server);
  registerAuthRoutes(server, fastifyPassport);
  registerUserRoutes(server);
  registerPhotosRoutes(server);
  registerCollectionRoutes(server);

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
