import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config, isProduction } from './config.js';
import { errorHandler } from './http/errors.js';
import { requireSameOrigin } from './security/sameOrigin.js';
import { attachSession, requireAuth } from './sessions/middleware.js';
import { authRouter } from './auth/routes.js';
import { accountRouter } from './account/routes.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', config.TRUST_PROXY);

  if (isProduction) {
    // HTTPS only: redirect plain HTTP (HSTS from helmet keeps browsers on HTTPS afterwards)
    app.use((req, res, next) => {
      if (req.secure) return next();
      res.redirect(301, `https://${req.get('host')}${req.originalUrl}`);
    });
  }

  app.use(helmet());
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  const api = express.Router();
  api.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store'); // never cache personal data
    next();
  });
  api.use(requireSameOrigin(new URL(config.APP_URL).origin));
  api.use(attachSession);
  api.use('/auth', authRouter);
  api.use('/account', requireAuth, accountRouter);
  api.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
  app.use('/api', api);

  if (isProduction) {
    // Serve the built React app from the same origin
    const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
    app.use(express.static(clientDist));
    app.get('/{*splat}', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}
