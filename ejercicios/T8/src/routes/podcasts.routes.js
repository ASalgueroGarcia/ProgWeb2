//src/routes/podcasts.routes.js
import { Router } from 'express';
import authMiddleware from '../middleware/session.middleware.js';
import checkRol from '../middleware/rol.middleware.js';
import {
  getPodcasts,
  getPodcast,
  createPodcast,
  updatePodcast,
  deletePodcast,
  getAllPodcasts,
  publishPodcast
} from '../controllers/podcasts.controller.js';

const router = Router();

/**
 * @openapi
 * /api/podcasts:
 *   get:
 *     tags: [Podcasts]
 *     summary: Listar podcasts publicados
 *     responses:
 *       200: { description: Lista de podcasts }
 *   post:
 *     tags: [Podcasts]
 *     summary: Crear podcast
 *     security:
 *       - BearerToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, duration]
 *             properties:
 *               title: { type: string, example: Mi Podcast }
 *               description: { type: string, example: Descripción larga }
 *               category: { type: string, example: tech }
 *               duration: { type: number, example: 3600 }
 *               episodes: { type: number, example: 1 }
 *     responses:
 *       201: { description: Podcast creado }
 *       401: { description: No autenticado }
 */

/**
 * @openapi
 * /api/podcasts/{id}:
 *   get:
 *     tags: [Podcasts]
 *     summary: Obtener un podcast por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Podcast encontrado }
 *       404: { description: No encontrado }
 *   put:
 *     tags: [Podcasts]
 *     summary: Actualizar propio podcast
 *     security:
 *       - BearerToken: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Podcast actualizado }
 *       401: { description: No autenticado }
 *       404: { description: No encontrado o no eres el autor }
 *   delete:
 *     tags: [Podcasts]
 *     summary: Eliminar podcast (solo admin)
 *     security:
 *       - BearerToken: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Podcast eliminado }
 *       403: { description: No autorizado }
 */

router.get('/', getPodcasts);
router.get('/admin/all', authMiddleware, checkRol('admin'), getAllPodcasts);
router.get('/:id', getPodcast);
router.post('/', authMiddleware, createPodcast);
router.put('/:id', authMiddleware, updatePodcast);
router.delete('/:id', authMiddleware, checkRol('admin'), deletePodcast);
router.patch('/:id/publish', authMiddleware, checkRol('admin'), publishPodcast);

export default router;