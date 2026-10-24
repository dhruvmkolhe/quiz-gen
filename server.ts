import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleGenerateQuiz } from './src/utils/quiz-service.ts';

// Load server-side environment variables securely from .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

// ==========================================
// SECURITY PROTOCOL: In-Memory IP Rate Limiter
// ==========================================
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic garbage collection for expired rate limit keys (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Express middleware to enforce IP-based rate limiting on sensitive AI proxy routes.
 * Window: 1 minute, Max: 15 requests per minute per IP.
 */
function createRateLimiter(options: { windowMs: number; maxRequests: number }) {
  const { windowMs, maxRequests } = options;

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Robust IP extraction taking into account reverse proxies/load balancers
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.socket.remoteAddress || '127.0.0.1';

    const now = Date.now();
    const record = rateLimitStore.get(clientIp);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      });

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));

      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

      return res.status(429).json({
        error: `Rate limit exceeded. Maximum ${maxRequests} requests per minute allowed. Please try again in ${retryAfterSeconds} seconds.`,
        retryAfter: retryAfterSeconds,
      });
    }

    record.count += 1;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - record.count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));
    next();
  };
}

async function createServer() {
  const app = express();

  // Basic security response headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Support large document text payloads with 100MB body limit
  app.use(express.json({ limit: '100mb' }));

  // Initialize rate limiter: 15 requests per 60 seconds per IP
  const quizRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 15,
  });

  // ========================================================
  // SECURITY PROTOCOL: Secure Server-Side Proxy Endpoint
  // Client NEVER receives or touches the GEMINI_API_KEY
  // ========================================================
  app.post('/api/generate-quiz', quizRateLimiter, async (req, res) => {
    try {
      const { text, numQuestions = 5, difficulty = 'Medium' } = req.body;
      const result = await handleGenerateQuiz({
        text,
        numQuestions,
        difficulty,
        apiKey: process.env.GEMINI_API_KEY,
      });

      return res.status(result.status).json(result.data);
    } catch (err: any) {
      console.error('Quiz generation proxy error:', err?.message || err);
      return res.status(500).json({
        error: err?.message || 'An unexpected error occurred while generating the quiz.',
      });
    }
  });

  // Vite dev server or production static assets
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Secure Proxy Server] listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
