// src/app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes/index.js';
// import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Seguridad
app.use(helmet());
app.use(cors());

// Parseo de body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
    res.json({
        mensaje: "API de Ejercicio T4",
        endpoints: {
            api: "/api",
            todos: "/api/todos"
        }
    });
});

// Rutas de la API
app.use('/api', routes);

export default app;