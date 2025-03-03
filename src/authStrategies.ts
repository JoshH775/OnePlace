import LocalStrategy from "passport-local";
import GoogleStrategy from "passport-google-oauth20";
import { User, UsersRepository } from "./database/repositories/UserRepository";
import { GoogleIntegrationRepository } from "./database/repositories/GoogleIntegrationRepository";

const Users = new UsersRepository();
const GoogleIntegrations = new GoogleIntegrationRepository();

export const localStrategy = new LocalStrategy.Strategy(
  { usernameField: "email", passwordField: "password" },
  async function (email, password, done) {
    const user = await Users.findByEmail(email);
    if (!user || user.password !== password) {
      return done(null, false, { message: "Invalid email or password" });
    }
    return done(null, user);
  }
);

export const googleStrategy = new GoogleStrategy.Strategy(
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
      //this will always be defined, they have to accept email scope
      const email = profile.emails?.[0].value as string

      if (!refreshToken) {
        await GoogleIntegrations.revokeToken(accessToken);
        return done(null, false, { message: "Google account connection failed. Please try again" });
      }
      await GoogleIntegrations.createIntegrationForUser(user.id, profile.id, email, accessToken, refreshToken);
      console.log('Google account successfully created')
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

