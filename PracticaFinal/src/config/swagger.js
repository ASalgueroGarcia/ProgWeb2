const swaggerJsdoc = require("swagger-jsdoc");

module.exports = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "BildyApp API", version: "1.0.0", description: "Gestion de albaranes" },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      },
      schemas: {
        User: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name:     { type: "string", example: "Usuario Test" },
            email:    { type: "string", example: "test@example.com" },
            password: { type: "string", example: "password123" },
            role:     { type: "string", enum: ["user", "admin"], default: "user" }
          }
        },
        Company: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "BildyApp S.L." },
            cif:  { type: "string", example: "B12345678" }
          }
        },
        Client: {
          type: "object",
          required: ["name", "cif"],
          properties: {
            name:  { type: "string", example: "Constructora Garcia" },
            cif:   { type: "string", example: "B12345678" },
            email: { type: "string", example: "contact@garcia.com" },
            phone: { type: "string", example: "+34600000000" },
            address: {
              type: "object",
              properties: {
                street: { type: "string" }, number: { type: "string" },
                postal: { type: "string" }, city: { type: "string" }, province: { type: "string" }
              }
            }
          }
        },
        Project: {
          type: "object",
          required: ["name", "projectCode", "client"],
          properties: {
            name:        { type: "string", example: "Reforma Oficina" },
            projectCode: { type: "string", example: "PRJ-001" },
            client:      { type: "string", example: "60d21b4667d0d8992e610c85" },
            email:       { type: "string" },
            notes:       { type: "string" },
            active:      { type: "boolean", default: true }
          }
        },
        DeliveryNote: {
          type: "object",
          required: ["client", "project", "format", "workDate"],
          properties: {
            client:      { type: "string" },
            project:     { type: "string" },
            format:      { type: "string", enum: ["hours", "material"] },
            description: { type: "string" },
            workDate:    { type: "string", format: "date" },
            hours:       { type: "number" },
            material:    { type: "string" },
            quantity:    { type: "number" },
            unit:        { type: "string" },
            workers: {
              type: "array",
              items: {
                type: "object",
                properties: { name: { type: "string" }, hours: { type: "number" } }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./src/routes/*.js"]
});
