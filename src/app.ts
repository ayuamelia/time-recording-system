import 'express-async-errors';
import express from 'express';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { createSwaggerRouter } from './config/swagger';
import { apiLimiter } from './middleware/rateLimiter';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1', apiLimiter); 

// API docs
app.use('/api/v1', createSwaggerRouter());

// All API routes
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Disable rate limiter in tests
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/v1', apiLimiter);
}

// Global error handler
app.use(errorHandler);

export default app;