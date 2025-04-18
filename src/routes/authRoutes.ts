import { FastifyInstance } from "fastify";
import { Authenticator } from "@fastify/passport";
import { GoogleIntegrationRepository } from "../database/repositories/GoogleIntegrationRepository";
import { User } from "@shared/types";
import { asyncHandler } from "../index";

const GoogleIntegrations = new GoogleIntegrationRepository();

export function registerAuthRoutes(server: FastifyInstance, fastifyPassport: Authenticator) {
  server.post(
    "/api/auth/login",
    { preValidation: fastifyPassport.authenticate("local") },
    asyncHandler(async (request, reply) => {
      return { message: "Successfully logged in" };
    })
  );

  server.get(
    "/api/auth/logout",
    asyncHandler(async (request, reply) => {
      request.logOut();
      await request.session.destroy();
      reply.clearCookie("sessionId", { path: "/" });
      return { message: "Logged out" };
    })
  );

  server.get(
    "/api/auth/google",
    {
      preValidation: asyncHandler(async (request, reply) => {
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
            "https://www.googleapis.com/auth/photoslibrary.appendonly"
          ],
          accessType: "offline",
        })(request, reply);
      }),
    },
    asyncHandler(async (request, reply) => {
      return { message: "Redirecting to Google" };
    })
  );

  server.get(
    "/api/auth/google/callback",
    {
      preValidation: fastifyPassport.authenticate("google", { session: false }),
    },
    asyncHandler(async (request, reply) => {
      const redirectUrl = "http://localhost:3000/settings";
      reply.redirect(redirectUrl);
    })
  );
}