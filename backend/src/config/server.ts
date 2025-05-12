import fastify, { FastifyInstance, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { registerUserRoutes } from '../routes/user.routes';
import { registerCollectionRoutes } from '../routes/collection.routes';
import { registerDropRoutes } from '../routes/drop.routes';
import { registerMomentRoutes } from '../routes/moment.routes';
import { registerCompressedNFTRoutes } from '../routes/compressed-nft.routes';

export const buildServer = (): FastifyInstance => {
  const server = fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname,reqId,req,res,responseTime',
        },
      },
    },
  });

  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:3003'];

  server.register(cors, {
    // During development, allow all origins
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  });

  server.register(sensible);

  server.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB Limit
    },
  });

  server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  server.register(swagger, {
    swagger: {
      info: {
        title: 'Twinn API',
        description: 'Twinn API',
        version: '1.0.0',
      },
      host: process.env.API_HOST || 'localhost:3000',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
  });

  server.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  registerUserRoutes(server, '/api/users');
  registerCollectionRoutes(server, '/api/collections');
  registerDropRoutes(server, '/api/drops');
  registerMomentRoutes(server, '/api/moments');
  registerCompressedNFTRoutes(server, '/api/compressed-nft');

  server.get('/health', async () => {
    return { status: 'OK' };
  });

  return server;
}; 