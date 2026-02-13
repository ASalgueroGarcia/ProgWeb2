const initialTodos = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Configurar entorno de Express",
    description: "Instalar dependencias, configurar Zod y crear la estructura de carpetas modular.",
    priority: "high",
    completed: true,
    dueDate: "2026-03-01T10:00:00.000Z",
    tags: ["backend", "nodejs", "setup"],
    createdAt: "2026-02-10T08:30:00.000Z",
    updatedAt: "2026-02-12T15:20:00.000Z"
  },
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    title: "Comprar suministros de oficina",
    description: "Papel para impresora, bolígrafos negros y cables HDMI de repuesto.",
    priority: "low",
    completed: false,
    dueDate: "2026-05-20T18:00:00.000Z",
    tags: ["oficina", "compras"],
    createdAt: "2026-02-13T09:00:00.000Z",
    updatedAt: "2026-02-13T09:00:00.000Z"
  },
  {
    id: "7d444840-9f51-4603-a26a-ce42211f1234",
    title: "Revisar Pull Requests",
    description: "Hacer code review de las ramas de autenticación y manejo de errores.",
    priority: "medium",
    completed: false,
    dueDate: "2026-02-28T23:59:59.000Z",
    tags: ["github", "equipo", "desarrollo"],
    createdAt: "2026-02-13T10:15:00.000Z",
    updatedAt: "2026-02-13T10:15:00.000Z"
  },
  {
    id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    title: "Llamar al cliente técnico",
    description: null, // Caso opcional
    priority: "high",
    completed: false,
    dueDate: "2026-02-15T12:00:00.000Z",
    tags: ["urgente", "llamada"],
    createdAt: "2026-02-13T11:00:00.000Z",
    updatedAt: "2026-02-13T11:00:00.000Z"
  }
];

export { initialTodos };