// src/routes/movie.routes.js

import { Router } from 'express';
import {
    getMovies,
    getMovie,
    createMovie,
    updateMovie,
    deleteMovie,
    rentMovie,
    returnMovie,
    updateCover,
    getCover,
    getTopMovies
} from '../controllers/movie.controller.js';
import upload from '../middleware/multer.js';

const router = Router();

router.get('/stats/top', getTopMovies);
router.get('/', getMovies);
router.get('/:id', getMovie);
router.post('/', createMovie);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);
router.post('/:id/rent', rentMovie);
router.post('/:id/return', returnMovie);
router.patch('/:id/cover', upload.single('cover'), updateCover);
router.get('/:id/cover', getCover);

export default router;