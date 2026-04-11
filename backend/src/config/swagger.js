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
      { name: 'Auth',                     description: 'Register, login, and identity' },
      { name: 'Jobs – Public',            description: 'Browse and search job listings (no auth required)' },
      { name: 'Jobs – Employer',          description: 'Create, update, and delete your own job listings' },
      { name: 'Applications – Jobseeker', description: 'Submit applications and track your own' },
      { name: 'Applications – Employer',  description: 'Review applications received on your job listings' },
      { name: 'Admin',                    description: 'Platform-wide management (admin role only)' },
      { name: 'Profile',                  description: 'View and update your own profile information' },
      { name: 'Settings',                 description: 'Sensitive account operations: change email and delete account' },
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
    join(__dirname, '../docs/**/*.yaml'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
