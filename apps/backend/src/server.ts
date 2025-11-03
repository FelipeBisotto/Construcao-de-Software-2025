import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { router as apiRouter } from './routes/index';
import { errorHandler } from './middlewares/error';
import { setupSwagger } from './swagger';

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiRouter);

setupSwagger(app);

app.use(errorHandler);

export default app;

