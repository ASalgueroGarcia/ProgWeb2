// src/app.js
import express from 'express';
import mongoose from 'mongoose';
import { join } from 'node:path';
import movieRoutes from './routes/movie.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
app.use('/api/movies', movieRoutes);

mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log('Conectado a MongoDB');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error conectando a MongoDB:', err.message);
        process.exit(1);
    });

export default app;