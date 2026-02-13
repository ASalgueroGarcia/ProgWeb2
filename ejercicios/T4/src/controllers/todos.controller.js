// src/controllers/todos.controller.js
import { initialTodos } from '../data/todos.js'; // Importamos los datos

const todos = initialTodos; 

// GET /api/todos -> Obtener todos los todos
export const getAll = (req, res) => {
    let respuesta = [...todos]; 
    const { completed, priority, tag, sortBy, order } = req.query;

    // Filtrar
    if (completed){
        respuesta = respuesta.filter(todo => todo.completed === (completed === 'true'));
        return res.json(respuesta);
    }

    if (priority){
        respuesta = respuesta.filter(todo => todo.priority === priority);
        return res.json(respuesta);
    }

    if (tag){
        respuesta = respuesta.filter(todo => todo.tags.includes(tag));
        return res.json(respuesta);
    }

    // Ordenar
    if(sortBy === 'dueDate' && order === 'asc') {
        respuesta = respuesta.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        return res.json(respuesta);
    }

    return res.json(respuesta);
}

// GET /api/todos/:id -> Obtener un todo por su ID
export const getById = (req, res) => {
    const id = req.params.id;
    const todo = todos.find(todo => todo.id === id);

    return res.json(todo);
}

// POST /api/todos -> Crear un nuevo todo
export const create = (req, res) => {
    const { id, title, description, priority, completed, dueDate, tags, createdAt } = req.body;

    const nuevoTodo = {
        id: todos.id++,
        title,
        description,
        priority,
        completed,
        dueDate,
        tags,
        createdAt
    }

    todos.push(nuevoTodo);
    res.status(201).json(nuevoTodo);
}

// PUT /api/todos/:id -> Actualizar un todo existente
export const update = (req, res) => {
    const id = req.params.id;
    const index = todos.findIndex(todo => todo.id === id);

    if(index < 0) {
        console.error("ERROR: Index not found!");
        return;
    }

    const { title, description, priority, completed, dueDate, tags, createdAt, updatedAt } = req.body;

    todos[index] = {
        id,
        title,
        description: description || null,
        priority,
        completed,
        dueDate,
        tags,
        createdAt,
        updatedAt
    }

    res.json(todos[index]);
}

// DELETE /api/todos/:id -> Eliminar un todo por su ID
export const remove = (req, res) => {
    const id = req.params.id;
    const index = todos.findIndex(todo => todo.id === id);

    if(index < 0) {
        console.error("ERROR: Index not found!");
        return;
    }

    todos.splice(index,1);
    res.status(204).end();
}

// PATCH /api/todos/:id/toggle -> Marcar un todo como completado
export const toggleCompleted = (req, res) => {
    const id = req.params.id;
    const index = todos.findIndex(todo => todo.id === id);

    if(index < 0){
        console.error("ERROR: Index not found!");
        return;
    }

    todos[index].completed = !todos[index].completed;
    res.json(todos[index]);
}