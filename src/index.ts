import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";
import { googleStrategy, localStrategy } from "./authStrategies";
import { Authenticator } from "@fastify/passport";
import { UsersRepository } from "./database/repositories/UserRepository";
import { registerRoutes } from "./routes/routes";
import { fastifyMultipart } from '@fastify/multipart';
import { User } from "@shared/types";
import { CHUNK_SIZE } from "@shared/constants";

const Users = new UsersRepository();

export const server = Fastify();
server.register(cors, {
  origin: true,
  credentials: true,
});

server.register(fastifyMultipart, {
  limits: {
    fileSize: CHUNK_SIZE
  }
})

export const fastifyPassport = new Authenticator();

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
  return user.id; 
});

fastifyPassport.registerUserDeserializer(async (id: number, request) => {
  const user = await Users.findById(id);
  return user;
});

fastifyPassport.use("google", googleStrategy);
fastifyPassport.use("local", localStrategy);



//Routes
registerRoutes(server, fastifyPassport);

server.listen({ port: 8000, host: "0.0.0.0" }, (err: any, address: any) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
