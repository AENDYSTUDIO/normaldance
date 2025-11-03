import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NORMALDANCE API',
      version: '0.3.0',
      description: 'Decentralized Music Platform API',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      { url: 'https://normaldance.app', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/app/api/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);