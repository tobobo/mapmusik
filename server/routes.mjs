import wordpressWebhook from './routes/wordpressWebhook.mjs';
import coconutWebhook from './routes/coconutWebhook.mjs';
import authentication from './routes/authentication.mjs';
import graphql from './routes/graphql';

export default app => {
  const { isAuthenticated } = authentication(app);
  wordpressWebhook(app);
  coconutWebhook(app);
  graphql(app, { isAuthenticated });
};
