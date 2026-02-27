//src/controllers/movie.controllers.js

import Movie from "../models/movies.model.js"
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { handleHttpError } from '../utils/handleError.js';

const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3000';

// GET /api/movies -> Listar películas (filtro: ?genre=comedy)
export const getMovies = async (req, res) => {
    const { page = 1, limit = 10, genre, search } = req.query;

    const filter = {};
    if (genre) filter.genre = genre;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);

    const [movies, total] = await Promise.all([
        Movie.find(filter)
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 }),
        Movie.countDocuments(filter)
    ]);

    res.json({
        data: movies,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
        }
    });
};

// GET /api/movies/:id -> Obtener película por ID
export const getMovie = async (req, res) => {
    const movie = await Movie.findById(req.params.id);
  
    if (!movie) {
        return handleHttpError(res, 'Pelicula no encontrada', 404);
    }

    res.json({ data: movie });
};

// GET /api/movies/:id/cover -> Obtener imagen de carátula
export const getCover = async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if(!movie) {
        return handleHttpError(res, 'Pelicula no encontrada', 404);
    }

    if(!movie.cover) {
        return handleHttpError(res, 'Esta película no tiene carátula', 404);
    }

    const coverPath = join(process.cwd(), 'uploads', movie.cover);
    res.sendFile(coverPath);
};

// GET /api/movies/stats/top -> Top 5 más alquiladas
export const getTopMovies = async (req, res) => {
    const movies = await Movie.find()
        .sort({ timesRented: -1 })
        .limit(5);

    res.json(movies);
};

// POST /api/movies -> Crear nueva película
export const createMovie = async (req, res) => {
    const { title, director, year, genre, copies } = req.body;

    const movie = await Movie.create({
        title,
        director,
        year,
        genre,
        copies
    });

    res.status(201).json({ data: movie });
};

// PUT /api/movies/:id -> Actualizar película
export const updateMovie = async (req, res) => {
    const movie = await Movie.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!movie) {
        return handleHttpError(res, 'Pelicula no encontrada', 404);
    }

    res.json({ data: movie });
};

// DELETE /api/movies/:id -> Eliminar película
export const deleteMovie = async (req, res) => { // typo: delteMovie -> deleteMovie
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
        return handleHttpError(res, 'Pelicula no encontrada', 404);
    }

    if (movie.cover) {
        const oldPath = join(process.cwd(), 'uploads', movie.cover);
        await unlink(oldPath).catch(() => {});
    }

    res.status(204).send();
};

// PATCH /api/movies/:id/rent -> Alquilar película
export const rentMovie = async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if(!movie) {
        return handleHttpError(res, 'Pelicula no encontrada', 404);
    }

    if(movie.availableCopies <= 0) {
        return handleHttpError(res, "No quedan copias para alquilar", 400);
    }

    movie.availableCopies--;
    movie.timesRented++;
    await movie.save();

    res.json(movie);
};

// PATCH /api/movies/:id/return -> Devolver película
export const returnMovie = async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if(!movie) {
        return handleHttpError(res, 'Pelicula no encontrada', 404);
    }

    if(movie.availableCopies >= movie.copies) {
        return handleHttpError(res, 'No hay copias alquiladas para devolver', 400);
    }

    movie.availableCopies++;
    await movie.save();

    res.json(movie);
};

// PATCH /api/movies/:id/cover -> Subir/reemplazar carátula (multipart)
export const updateCover = async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if(!movie) {
        return handleHttpError(res, 'Pelicula no encontrada', 404);
    }

    if(!req.file) {
        return handleHttpError(res, 'No se ha subido ninguna imagen', 400);
    }

    if(movie.cover) {
        const oldPath = join(process.cwd(), 'uploads', movie.cover);
        await unlink(oldPath).catch(() => {});
    }

    movie.cover = req.file.filename;
    await movie.save();

    res.json(movie);
};