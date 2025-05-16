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
    clientID: process.env.GOOGLE_CLIENT_ID!, // Google OAuth client ID from environment variables
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // Google OAuth client secret from environment variables
    callbackURL: "http://localhost:8000/api/auth/google/callback", // Callback URL for Google OAuth
    passReqToCallback: true, // Pass the request object to the callback function
  },

  async function (request, accessToken, refreshToken, profile, done) {
    const user = request.user as User; // Retrieve the currently logged-in user from the request

    if (!user) {
      // If no user is logged in, return an error message
      console.log("Exit 1");
      return done(null, false, {
        message: "You must log in before connecting your Google account",
      });
    }

    // Check if a Google integration already exists for the given Google profile ID
    const existingIntegration = await GoogleIntegrations.findByGoogleId(
      profile.id
    );

    if (!existingIntegration) {
      // If no integration exists, extract the email from the Google profile
      const email = profile.emails?.[0].value as string; // Email is required for integration

      if (!refreshToken) {
        // If no refresh token is provided, revoke the access token and return an error
        await GoogleIntegrations.revokeToken(accessToken);
        return done(null, false, {
          message: "Google account connection failed. Please try again",
        });
      }

      // Create a new Google integration for the user
      await GoogleIntegrations.createIntegrationForUser(
        user.id,
        profile.id,
        email,
        accessToken,
        refreshToken
      );
      console.log("Google account successfully created");
      return done(null, user); // Return the user after successful integration
    }

    // If the integration exists but belongs to a different user, return an error
    if (existingIntegration.userId != user.id) {
      console.log("Exit 3");
      return done(null, false, {
        message: "This Google account is already connected to another user",
      });
    }

    // If the integration exists and belongs to the current user, return the user
    console.log("Exit 4");
    return done(null, user);
  }
);

