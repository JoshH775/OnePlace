import { Authenticator } from "@fastify/passport";
import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from "fastify";
import { GoogleIntegrationRepository } from "./database/repositories/GoogleIntegrationRepository";
import { User } from "./database/repositories/UserRepository";
import { getAllIntegrationsForUser } from "./database/repositories/IntegrationUtils";

const GoogleIntegrations = new GoogleIntegrationRepository();

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

  server.post(
    "/api/auth/login",
    { preValidation: fastifyPassport.authenticate("local") },
    async (request, reply) => {
      return { message: "Successfully logged in" };
    }
  );

  server.delete("/api/auth/disconnect/google", async (request, reply) => {
    const user = request.user as User;
    console.log(user);

    const { status, message } =
      await GoogleIntegrations.deleteIntegrationForUser(user.id);
    reply.code(status);
    return { message };
  });

  server.get("/api/auth/logout", async (request, reply) => {
    request.logOut();
    await request.session.destroy();
    reply.clearCookie("sessionId", { path: "/" });
    return { message: "Logged out" };
  });

  server.get(
    "/api/auth/google",
    {
      preValidation: async (request, reply) => {
        const user = request.user as User;
        if (!request.isAuthenticated()) {
          reply.redirect(
            "http://localhost:3000/login?error=You need to log in first"
          );
          return;
        }

        if (await GoogleIntegrations.findByUserId(user.id)) {
          reply.redirect(
            "http://localhost:3000/settings?error=You already have a Google account connected"
          );
          return;
        }

        //@ts-expect-error
        fastifyPassport.authenticate("google", {
          scope: [
            "profile",
            "email",
            "https://www.googleapis.com/auth/photospicker.mediaitems.readonly",
          ],
          accessType: "offline",
        })(request, reply);
      },
    },
    async (request, reply) => {
      // Normally, this won't be reached because the user will be redirected to Google's auth page.
      return { message: "Redirecting to Google" };
    }
  );

  server.get(
    "/api/auth/google/callback",
    {
      preValidation: fastifyPassport.authenticate("google", { session: false }),
    },
    async (request, reply) => {
      const redirectUrl = "http://localhost:3000/settings";
      reply.redirect(redirectUrl);
    }
  );

  server.get("/api/auth/check-session", async (request, reply) => {
    if (request.isAuthenticated()) {
      return { message: "Logged in" };
    }
    reply.code(401);
    return { message: "Not logged in" };
  });

  server.get("/api/user", async (request, reply) => {
    const user = request.user as User;
    const integrations = await getAllIntegrationsForUser(user.id);
    return { user, integrations };
  });
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
