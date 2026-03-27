import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Portal API',
      version: '1.0.0',
      description:
        'REST API for the Job Portal application. Authenticate via the **Authorize** button using a Bearer token obtained from `/api/auth/login`.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local development server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'User registration, login, and identity' },
      { name: 'Jobs', description: 'Job listing management' },
      { name: 'Applications', description: 'Job application submission and employer review' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter the JWT token returned by /api/auth/login',
        },
      },
    },
  },
  apis: [
    join(__dirname, '../app.js'),
    join(__dirname, '../routes/*.js'),
    join(__dirname, '../routes/*.yaml'),
    join(__dirname, '../docs/**/*.yaml'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
