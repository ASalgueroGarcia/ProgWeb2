// src/app.js
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './docs/swagger.js';
import authRoutes from './routes/auth.routes.js';
import tracksRoutes from './routes/tracks.routes.js';

const app = express();

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use('/api/auth', authRoutes);
app.use('/api/tracks', tracksRoutes);

export default app;