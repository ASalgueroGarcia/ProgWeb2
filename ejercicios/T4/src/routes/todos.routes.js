// src/routes/todos.routes.js
import { Router } from "express";
import * as controller from '../controllers/todos.controller.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.patch('/:id/toggle', controller.toggleCompleted);

export default router;