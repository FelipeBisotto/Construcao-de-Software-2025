import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export function setupSwagger(app: Express) {
  const options = {
    definition: {
      openapi: '3.0.3',
      info: { title: 'CS2025 API', version: '0.1.0' },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    },
    apis: ['src/**/*.ts']
  };

  const specs = swaggerJsdoc(options as any);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
}

