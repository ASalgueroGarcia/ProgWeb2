// src/routes/index.js
import { Router } from 'express';
import cursosRoutes from './cursos.routes.js'; // Importamos las rutas para las funciones 

const router = Router();

// Indica todo lo que viene ANTES de lo que necesita cada funcion en cursos.routes.js
router.use('/cursos/programacion', cursosRoutes); 

router.get('/', (req, res) => {
  res.json({
    mensaje: 'API de Cursos v1.0',
    endpoints: {
      cursos: '/api/cursos/programacion',
      health: '/health'
    }
  });
});

export default router;