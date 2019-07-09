import passport from 'passport';
import { Strategy as GithubStrategy } from 'passport-github';
import * as repository from './repository';

export default function setupAuth(app: any) {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new GithubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID || '08ef0856146abe921c21',
        clientSecret:
          process.env.GITHUB_CLIENT_SECRET ||
          'a923caa1e98e61b2d9fa9f089339cd314ad343da',
        callbackURL: `http://${process.env.BASE_URL}/auth/github/callback`
      },
      function(accessToken, refreshToken, profile, callback) {
        const user = {
          accessToken,
          ...profile
        };
        if (!repository.getUser(user.id)) {
          console.log('Save', user.id, user.displayName);
          repository.addUser(user);
        }
        console.log('Login', user.id, user.displayName);
        callback(null, user);
      }
    )
  );

  passport.serializeUser(function(user, done) {
    console.log('Serialize', user.id, user.displayName);
    done(null, user.id);
  });

  passport.deserializeUser(function(userId, done) {
    const user = repository.getUser(userId);
    console.log('Deserialize', user.id, user.displayName);
    done(null, user);
  });

  app.get('/auth/github', passport.authenticate('github'));

  app.get(
    '/auth/github/callback',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }),
    (req, res) => {
      console.log('Sucessful login', req.user.id, req.user.displayName);
      res.redirect('/');
    }
  );
}
