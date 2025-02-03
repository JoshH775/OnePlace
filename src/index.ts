import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";
import LocalStrategy from "passport-local";
import GoogleStrategy from "passport-google-oauth20";
import { Authenticator } from "@fastify/passport";
import { User, UsersRepository } from "./database/repositories/UserRepository";
import { GoogleIntegrationRepository } from "./database/repositories/GoogleIntegrationRepository";
import { getAllIntegrationsForUser } from "./database/repositories/IntegrationUtils";

const Users = new UsersRepository();
const GoogleIntegrations = new GoogleIntegrationRepository();

const server = Fastify();
server.register(cors, {
  origin: true,
  credentials: true,
});

const fastifyPassport = new Authenticator();

server.register(fastifyCookie);
server.register(fastifySession, {
  secret: process.env.SECRET_KEY!,
  saveUninitialized: false,
  cookieName: "sessionId",
  cookie: {
    secure: process.env.NODE_ENV === "prod",
    httpOnly: true,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
});

server.register(fastifyPassport.initialize());
server.register(fastifyPassport.secureSession());

fastifyPassport.registerUserSerializer(async (user: User, request) => {
  return user.id; // Store the user ID in the session
});

// Deserialising user: retrieve the user object from the session ID
fastifyPassport.registerUserDeserializer(async (id: number, request) => {
  const user = await Users.findById(id);
  return user;
});

const localStrategy = new LocalStrategy.Strategy(
  { usernameField: "email", passwordField: "password" },
  async function (email, password, done) {
    const user = await Users.findByEmail(email);
    if (!user || user.password !== password) {
      return done(null, false, { message: "Invalid email or password" });
    }
    return done(null, user);
  }
);

const googleStrategy = new GoogleStrategy.Strategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "http://localhost:8000/api/auth/google/callback",
    passReqToCallback: true,
  },

  async function (request, accessToken, refreshToken, profile, done) {
    const user = request.user as User;
    
    if (!user) {
      console.log('Exit 1')
      return done(null, false, { message: "You must log in before connecting your Google account" })
    }

    const existingIntegration = await GoogleIntegrations.findByGoogleId(profile.id);

    if (!existingIntegration) {
      await GoogleIntegrations.createIntegrationForUser(user.id, profile.id, accessToken, refreshToken);
      console.log('Exit 2')
      return done(null, user);
    }

    if (existingIntegration.userId != user.id) {
      console.log('Exit 3')
      return done(null, false, { message: "This Google account is already connected to another user" });
    }

    console.log('Exit 4')
    return done(null, user);

}
);

fastifyPassport.use("google", googleStrategy);
fastifyPassport.use("local", localStrategy);

server.addHook("preHandler", async (request, reply) => {
  if (!request.isAuthenticated()){
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

server.delete(
  '/api/auth/disconnect/google',
  async (request, reply) => {
    const user = request.user as User;
    console.log(user)

    const { status, message } = await GoogleIntegrations.deleteIntegrationForUser(user.id);
    reply.code(status);
    return { message }
  }
)

server.get("/api/auth/logout", async (request, reply) => {
  request.logOut();
  await request.session.destroy();
  reply.clearCookie("sessionId", { path: "/" });
  return { message: "Logged out" };
});

server.get(
  "/api/auth/google",
  {
    preValidation: (request, reply) => {
      if (!request.isAuthenticated()) {
        reply.redirect("http://localhost:3000/login?error=You need to log in first")
        return
      }

      //@ts-expect-error
      fastifyPassport.authenticate("google", {
        scope: ["profile", "email", "https://www.googleapis.com/auth/photospicker.mediaitems.readonly"],
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
  { preValidation: fastifyPassport.authenticate("google", { session: false }) },
  async (request, reply) => {
    const redirectUrl = "http://localhost:3000/";
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
})

server.listen({ port: 8000, host: "0.0.0.0" }, (err: any, address: any) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
