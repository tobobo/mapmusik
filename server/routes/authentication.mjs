import session from 'express-session';
import uuidv4 from 'uuid/v4';
import passport from 'passport';
import passportOAuth from 'passport-oauth';
import config from '../../config/server.js';

const { OAuth2Strategy } = passportOAuth;

passport.use(
  'wordpress',
  new OAuth2Strategy(
    {
      authorizationURL: 'https://mapmusik.live/oauth/authorize',
      tokenURL: 'https://mapmusik.live/oauth/token',
      ...config.wordpressOAuth,
    },
    (token, _, profile, done) => {
      done(null, { token, authenticated: 'true' });
    }
  )
);

console.log('secret', config.sessionSecret);

export default app => {
  app.use(
    session({
      genId: () => uuidv4(),
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: true,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  app.get('/auth/wordpress', passport.authenticate('wordpress', { scope: 'basic' }));
  app.get('/auth/wordpress/callback', (req, res, next) => {
    passport.authenticate('wordpress', (passportErr, user) => {
      if (passportErr) {
        res.redirect('/');
      }
      req.login(user, loginErr => {
        if (loginErr) {
          res.redirect('/');
        }
        res.redirect('/admin');
      });
    })(req, res, next);
  });

  return {
    isAuthenticated: req => !!(
        req.session.passport &&
        req.session.passport.user &&
        req.session.passport.user.authenticated
      ),
  };
};
