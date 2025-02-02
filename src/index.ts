import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";
import LocalStrategy from "passport-local";
import GoogleStrategy from "passport-google-oauth20";
import { Authenticator } from "@fastify/passport";
import { User, UsersRepository } from "./database/repositories/UserRepository";
import { GoogleIntegrationRepository } from "./database/repositories/GoogleIntegrationRepository";

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
  },

  async function (accessToken, refreshToken, profile, done) {
    const email = profile.emails![0].value;
    let user = await Users.findByEmail(email);
    if (!user) {
      user = await Users.create({
        email: email,
        password: null,
        provider: "google",
        providerId: profile.id,
      });
    }

    if (!await GoogleIntegrations.findByUserId(user.id)) {
      await GoogleIntegrations.createIntegrationForUser(user.id, profile.id, accessToken, refreshToken);
  }
  return done(null, user);
}
);

fastifyPassport.use("google", googleStrategy);
fastifyPassport.use("local", localStrategy);

server.post(
  "/api/auth/login",
  { preValidation: fastifyPassport.authenticate("local") },
  async (request, reply) => {
    return { message: "Successfully logged in" };
  }
);

server.get("/api/auth/logout", async (request, reply) => {
  request.logOut();
  await request.session.destroy();
  reply.clearCookie("sessionId", { path: "/" });
  return { message: "Logged out" };
});

server.get(
  "/api/auth/google",
  {
    // @ts-expect-error-2769 (For some reason accessType is not defined on the type, but is functional.)
    preValidation: fastifyPassport.authenticate("google", {
      scope: ["profile", "email", "https://www.googleapis.com/auth/photospicker.mediaitems.readonly"],
      accessType: 'offline',
    },),
  },
  async (request, reply) => {
    return { message: "Redirecting to Google" };
  }
);

server.get(
  "/api/auth/google/callback",
  { preValidation: fastifyPassport.authenticate("google", { session: true }) },
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

server.listen({ port: 8000, host: "0.0.0.0" }, (err: any, address: any) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
