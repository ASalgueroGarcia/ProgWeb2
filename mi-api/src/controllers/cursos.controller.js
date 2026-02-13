// src/controllers/cursos.controller.js
import { cursos } from '../data/cursos.js'; // Importamos los datos 
// import { ApiError } from '../middleware/errorHandler.js'; // Centralizamos los errores en un middleware específico

const programacion = cursos.programacion;

// GET /api/cursos/programacion
export const getAll = (req, res) => {
    let resultado = [...programacion]; // Hacemos una copia del array original para no modificarlo directamente
    const { nivel, lenguaje, orden, limit, offset } = req.query; // Obtenemos los parámetros de consulta (query params)

    // Filtrar por nivel (nos quedamos con el que nos pida)
    if(nivel) {
        resultado = resultado.filter(curso => curso.nivel === nivel);
    }

    // Ordenar por vistas (ascendente o descendente)
    if (orden === 'vistas') {
        resultado.sort((a, b) => b.vistas - a.vistas);
    } else if (orden === 'titulo') {
        resultado.sort((a, b) => a.titulo.localeCompare(b.titulo));
    }

    res.json(resultado);
}

// GET /api/cursos/programacion/:id
export const getById = (req, res) => {
    const id = parseInt(req.params.id); // Obtenemos el ID de los parámetros de ruta (route params)
    const curso = programacion.find(curso => curso.id === id); // Buscamos el curso con el ID especificado

    /*
    if (!curso) {
        throw ApiError.notFound('Curso no encontrado'); // Si no encontramos el curso, lanzamos un error 404
    }
    */

    res.json(curso);
}

// POST /api/cursos/programacion
export const create = (req, res) => {
    const { titulo, lenguaje, nivel, descripcion } = req.body; // Capturamos del body los datos

    const nuevoCurso = {
        id: programacion.length + 1,
        titulo,
        lenguaje,
        nivel,
        descripcion,
        vistas: 0 // Inicializamos las vistas a 0
    }

    programacion.push(nuevoCurso); // Añadimos el nuevo curso al array de programación
    res.status(201).json(nuevoCurso); // Devolvemos el nuevo curso con un status 201 (creado)
}

// PUT /api/cursos/programacion/:id -> Actualizar un curso existente
export const update = (req, res) => {
  const id = parseInt(req.params.id);
  const index = programacion.findIndex(c => c.id === id);
  
  /*
  if (index === -1) {
    throw ApiError.notFound(`Curso con ID ${id} no encontrado`);
  }
  */

  const { titulo, lenguaje, nivel, descripcion } = req.body;
  
  programacion[index] = {
    id,
    titulo,
    lenguaje,
    nivel,
    descripcion: descripcion || null,
    vistas: programacion[index].vistas
  };
  
  res.json(programacion[index]);
};

// PATCH /api/cursos/programacion/:id -> Actualizar parcialmente un curso existente
export const partialUpdate = (req, res) => {
  const id = parseInt(req.params.id);
  const index = programacion.findIndex(c => c.id === id);
  
  if (index === -1) {
    throw ApiError.notFound(`Curso con ID ${id} no encontrado`);
  }
  
  programacion[index] = {
    ...programacion[index],
    ...req.body
  };
  
  res.json(programacion[index]);
};

// DELETE /api/cursos/programacion/:id -> Eliminar un curso existente
export const remove = (req, res) => {
  const id = parseInt(req.params.id);
  const index = programacion.findIndex(c => c.id === id);
  
  if (index === -1) {
    throw ApiError.notFound(`Curso con ID ${id} no encontrado`);
  }
  
  programacion.splice(index, 1);
  
  res.status(204).end();
};