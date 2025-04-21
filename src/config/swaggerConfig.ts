import swaggerJsdoc, { Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Gym App API",
      version: "1.0.0",
      description: "API documentation for gym application",
    },
    servers: [
      {
        url: process.env.API_URL, // TODO: Change when deploying
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // If running in development
  // OR
  //apis: ["./dist/routes/*.js"], // If running in production (compiled version)
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
