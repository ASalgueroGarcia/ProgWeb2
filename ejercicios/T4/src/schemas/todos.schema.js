import { z } from 'zod';

export const createTodoSchema = z.object({
    body: z.object({
        id: z.string().uuid(),
        title: z.string()
            .min(3, "El título debe tener al menos 3 caracteres.")
            .max(100, "El título tiene un máximo de 100 caracteres."),
        description: z.string()
            .max(500, "La descripción tiene un máximo de 500 caracteres.")
            .nullable().optional(),
        priority: z.enum(['low', 'medium', 'high']),
        completed: z.boolean(),
        dueDate: z.date()
            .refine(date => date > new Date(), {
                message: "La fecha debe ser en el futuro"
            }).optional(),
        tags: z.array(z.string().min(1).max(20)).max(5, { 
            message: "Máximo 5 tags permitidos" 
        }).optional(),
        createdAt: z.date(),
        updatedAt: z.date()
    })
});

export const updateTodoSchema = z.object({
    body: z.object({
        title: z.string()
            .min(3, "El título debe tener al menos 3 caracteres.")
            .max(100, "El título tiene un máximo de 100 caracteres.")
            .optional(),
        description: z.string()
            .max(500, "La descripción tiene un máximo de 500 caracteres.")
            .nullable().optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        completed: z.boolean().optional(),
        dueDate: z.date()
            .refine(date => date > new Date(), {
                message: "La fecha debe ser en el futuro"
            }).optional(),
        tags: z.array(z.string().min(1).max(20)).max(5, { 
            message: "Máximo 5 tags permitidos" 
        }).optional()
    })
});