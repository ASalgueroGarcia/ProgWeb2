// src/routes/index.js
import { Router } from 'express';
import todosRoutes from './todos.routes.js';

const router = Router();

router.use('/todos', todosRoutes);

router.get('/', (req, res) => {
    res.json({
        mensaje: "API de Ejercicio T4.",
        endpoints: {
            todos: "/api/todos"
        }
    });
});

export default router;