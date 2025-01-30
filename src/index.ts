import Fastify from "fastify";
import cors from '@fastify/cors'
import fastifySession from '@fastify/session'
import fastifyCookie from "@fastify/cookie";
import LocalStrategy from "passport-local";
import passport, { Authenticator } from "@fastify/passport";

const server = Fastify();
server.register(cors, {
  origin: true
  })

const fastifyPassport = new Authenticator()

server.register(fastifyCookie)
server.register(fastifySession, { secret: process.env.SECRET_KEY! })

server.register(fastifyPassport.initialize())
server.register(fastifyPassport.secureSession())

const localStrategy = new LocalStrategy.Strategy(function (username, password, done) {
  if (username === 'admin' && password === 'admin') {
    return done(null, { username, password })
  }

  console.log('Invalid credentials')
  return done(null, false)
})

fastifyPassport.use('local', localStrategy)

server.post('/login',
  { preValidation: fastifyPassport.authenticate('local') },
  async (request) => {
    console.log('lognn')
    return request.user
  }
)

server.listen({ port: 8000, host: '0.0.0.0' }, (err: any, address: any) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`Server listening at ${address}`);
});