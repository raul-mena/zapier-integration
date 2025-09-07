import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { z } from 'zod';
import pino from 'pino';

// Environment validation
const envSchema = z.object({
  PORT: z.string().default('4000').transform(Number),
  WISTIA_API_TOKEN: z.string().min(1, 'WISTIA_API_TOKEN is required'),
  WISTIA_API_BASE_URL: z.string().default('https://api.wistia.com/v1'),
});

const env = envSchema.parse(process.env);

// Logger setup
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// Request schemas
const mediasQuerySchema = z.object({
  per_page: z.string().optional().default('50').transform(Number),
  page: z.string().optional().default('1').transform(Number),
});

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
});

// Express app setup
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});
app.use(limiter);

// Request logging
app.use(pinoHttp.default({ logger }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// GET /api/medias - Fetch media from Wistia
app.get('/api/medias', async (req, res) => {
  try {
    // Validate query parameters
    const query = mediasQuerySchema.parse(req.query);
    
    // Build URL with query parameters
    const url = new URL(`${env.WISTIA_API_BASE_URL}/medias.json`);
    url.searchParams.set('per_page', query.per_page.toString());
    url.searchParams.set('page', query.page.toString());
    
    // Make request to Wistia API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.WISTIA_API_TOKEN}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logger.error({
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      }, 'Wistia API error');
      
      return res.status(response.status).json({
        error: `Wistia API error: ${response.status} ${response.statusText}`,
        details: errorText,
      });
    }
    
    const data = await response.json();
    logger.info({ count: data.length }, 'Successfully fetched medias');
    
    res.json(data);
  } catch (error) {
    logger.error(error, 'Error fetching medias');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: error.issues,
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/projects - Create project in Wistia
app.post('/api/projects', async (req, res) => {
  try {
    // Validate request body
    const body = createProjectSchema.parse(req.body);
    
    // Prepare form data for Wistia API
    const formData = new URLSearchParams();
    formData.append('name', body.name);
    
    // Make request to Wistia API
    const response = await fetch(`${env.WISTIA_API_BASE_URL}/projects.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.WISTIA_API_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formData.toString(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logger.error({
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      }, 'Wistia API error');
      
      return res.status(response.status).json({
        error: `Wistia API error: ${response.status} ${response.statusText}`,
        details: errorText,
      });
    }
    
    const data = await response.json();
    logger.info({ projectName: body.name, projectId: data.id }, 'Successfully created project');
    
    res.status(201).json(data);
  } catch (error) {
    logger.error(error, 'Error creating project');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: error.issues,
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(error, 'Unhandled error');
  
  if (res.headersSent) {
    return next(error);
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Start server
const server = app.listen(env.PORT, () => {
  logger.info({
    port: env.PORT,
    env: process.env.NODE_ENV || 'development',
  }, 'Server started successfully');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
