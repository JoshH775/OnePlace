import Fastify from "fastify";
import cors from '@fastify/cors'
import fastifySession from '@fastify/session'
import fastifyCookie from "@fastify/cookie";
import LocalStrategy from "passport-local";
import { Authenticator } from "@fastify/passport";

const server = Fastify();
server.register(cors, {
  origin: true,
  credentials: true
  })


const fastifyPassport = new Authenticator()

server.register(fastifyCookie)
server.register(fastifySession, { secret: process.env.SECRET_KEY!, cookieName: 'sessionId', cookie: {
  secure: process.env.NODE_ENV === 'prod',
  httpOnly: true,
  path: '/',
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
} })

server.register(fastifyPassport.initialize())
server.register(fastifyPassport.secureSession())

fastifyPassport.registerUserSerializer(async (user, request) => user.username); // Store only the email
fastifyPassport.registerUserDeserializer(async (email, request) => {
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

server.route({
  method: 'POST',
  url: '/api/login',
  preValidation: async (request, reply) => {
    if (request.isAuthenticated()) {
      reply.code(400).send({ message: 'Already logged in' })
      return
    }
    // @ts-expect-error
    await fastifyPassport.authenticate('local', { session: true })(request, reply)
  },
  handler: async (request, reply) => {
    return { message: 'Successfully logged in' }
  }
})

server.route({
  method: 'POST',
  url: '/api/logout',
  handler: async (request, reply) => {
    try {
      
      await request.session.destroy()
      reply.clearCookie('sessionId')
      return { message: 'Successfully logged out' }

    } catch (err) {
      console.error('Error during logout:', err)
      reply.code(500).send({ message: 'Logout failed' })
    }
  }
  
})

server.route({
  method: 'GET',
  url: '/api/check-session',
  handler: async (request, reply) => {
    if (request.isAuthenticated()) {
      return { message: 'Authenticated' }
    }
    reply.code(401).send({ message: 'Not authenticated' })
  }
})

server.listen({ port: 8000, host: '0.0.0.0' }, (err: any, address: any) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`Server listening at ${address}`);
});