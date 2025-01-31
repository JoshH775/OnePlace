import Fastify from "fastify";
import cors from '@fastify/cors'
import fastifySession from '@fastify/session'
import fastifyCookie from "@fastify/cookie";
import type { CookieOptions } from "@fastify/session";
import LocalStrategy from "passport-local";
import { Authenticator } from "@fastify/passport";

const server = Fastify();
server.register(cors, {
  origin: true,
  credentials: true
  })


const fastifyPassport = new Authenticator()

server.register(fastifyCookie)
server.register(fastifySession, { secret: process.env.SECRET_KEY!, saveUninitialized: false, cookieName: 'sessionId', cookie: {
  secure: process.env.NODE_ENV === 'prod',
  httpOnly: true,
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
}, })

server.register(fastifyPassport.initialize())
server.register(fastifyPassport.secureSession())

fastifyPassport.registerUserSerializer(async (user, request) => user.username); // Store only the email
fastifyPassport.registerUserDeserializer(async (email, request) => {
  console.log('here')
  if (email === "admin") {
    return { email, password: "admin" };
  }
  return null;
});

const localStrategy = new LocalStrategy.Strategy(function (username, password, done) {
  if (username === 'admin' && password === 'admin') {
    return done(null, { username, password })
  }

  console.log('Invalid credentials')
  return done(null, false)
})

fastifyPassport.use('local', localStrategy)

server.post('/api/auth/login', { preValidation: fastifyPassport.authenticate('local') }, async (request, reply) => {
  return { message: 'Successfully logged in' }
})

server.get('/api/auth/logout', async (request, reply) => {
  request.logOut()
  await request.session.destroy()
  reply.clearCookie('sessionId', { path: '/' })
  return { message: 'Logged out' }
})

server.get('/api/auth/check-session', async (request, reply) => {
  if (request.isAuthenticated()) {
    return { message: 'Logged in' }
  }
  reply.code(401)
  return { message: 'Not logged in' }
})

server.listen({ port: 8000, host: '0.0.0.0' }, (err: any, address: any) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`Server listening at ${address}`);
});