import Fastify from "fastify";
import cors from '@fastify/cors'
import fastifySession from '@fastify/session'
import fastifyCookie from "@fastify/cookie";
import type { CookieOptions } from "@fastify/session";
import LocalStrategy from "passport-local";
import GoogleStrategy from "passport-google-oauth20";
import { Authenticator } from "@fastify/passport";

type User = {
  id: string
  username?: string
  password?: string
  provider: 'google' | 'local'
}

const dummyUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin',
    provider: 'local'
  }
]
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

fastifyPassport.registerUserSerializer(async (user: User, request) => {
  return user.id; // Store the user ID in the session
});

// Deserialising user: retrieve the user object from the session ID
fastifyPassport.registerUserDeserializer(async (id, request) => {
  console.log('Deserialising user with ID:', id);
  const user = dummyUsers.find(user => user.id === id); // Fetch user based on ID
  if (!user) {
    console.log('Cannot FInd User!')
  }
  return user || null;
});

const localStrategy = new LocalStrategy.Strategy(function (username, password, done) {
  const user = dummyUsers.find(user => user.username === username && user.password === password && user.provider === 'local')
  if (user) {
    console.log('User found:', user)
    return done(null, user)
  }

  console.log('Invalid credentials')
  return done(null, false)
})

const googleStrategy = new GoogleStrategy.Strategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: 'http://localhost:8000/api/auth/google/callback'
},

function (accessToken, refreshToken, profile, done) {
  let user = dummyUsers.find(user => user.id === profile.id && user.provider === 'google')
  if (!user) {
    console.log('Creating User')
    user = {
      id: profile.id,
      provider: 'google'
    }
    dummyUsers.push(user)
  }

  console.log(dummyUsers)
  return done(null, profile)
})


fastifyPassport.use('google', googleStrategy)
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

server.get('/api/auth/google', { preValidation: fastifyPassport.authenticate('google', { scope: ['profile'] }) }, async (request, reply) => {
  return { message: 'Redirecting to Google' }
})

server.get('/api/auth/google/callback', { preValidation: fastifyPassport.authenticate('google', { session: true} ) }, async (request, reply) => {  
    const redirectUrl = 'http://localhost:3000/' // Change this to the URL of your dashboard in React
    reply.redirect(redirectUrl)
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