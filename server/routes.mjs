import wordpressWebhook from './routes/wordpressWebhook.mjs';
import coconutWebhook from './routes/coconutWebhook.mjs';

export default app => {
  wordpressWebhook(app);
  coconutWebhook(app);
};
