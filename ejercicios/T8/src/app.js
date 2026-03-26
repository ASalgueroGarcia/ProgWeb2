// src/app.js
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './docs/swagger.js';
import routes from './routes/index.js';

const app = express();

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use('/api', routes);

export default app;