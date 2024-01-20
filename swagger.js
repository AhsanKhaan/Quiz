const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const express = require('express');
const YAML = require('yamljs');
const fs = require('fs');

const app = express();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Quiz Application',
    version: '1.0.0',
    description: 'API documentation for your Node.js application',
  },
  components: {
    securitySchemes: {
      Auth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
      },
    },
  },
  security: [
    {
      Auth: [],
    },
  ],
  basePath: '/',
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'], // Path to  route files
};

const swaggerSpec = swaggerJSDoc(options);

// Save the Swagger definition to a YAML file
//const swaggerYamlFile = 'swagger.yaml';
//fs.writeFileSync(swaggerYamlFile, YAML.stringify(swaggerSpec));

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};