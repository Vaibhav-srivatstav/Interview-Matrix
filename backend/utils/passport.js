const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// ── Google OAuth ────────────────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'), null);

        let user = await User.findOne({ email });

        if (!user) {
          // Auto-register OAuth users (no password needed)
          user = await User.create({
            name: profile.displayName || 'Google User',
            email,
            password: `oauth_google_${profile.id}_${Date.now()}`, // random, never used
            avatar: profile.photos?.[0]?.value || '',
            oauthProvider: 'google',
            oauthId: profile.id,
          });
        } else if (!user.oauthProvider) {
          // Existing email user — link Google account
          user.oauthProvider = 'google';
          user.oauthId = profile.id;
          if (!user.avatar && profile.photos?.[0]?.value) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ── GitHub OAuth ────────────────────────────────────────────────────────────
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.find((e) => e.primary)?.value ||
          profile.emails?.[0]?.value ||
          `${profile.username}@github.noemail`;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName || profile.username || 'GitHub User',
            email,
            password: `oauth_github_${profile.id}_${Date.now()}`,
            avatar: profile.photos?.[0]?.value || '',
            oauthProvider: 'github',
            oauthId: String(profile.id),
          });
        } else if (!user.oauthProvider) {
          user.oauthProvider = 'github';
          user.oauthId = String(profile.id);
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Passport session serialization (minimal — we use JWT, not sessions)
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
