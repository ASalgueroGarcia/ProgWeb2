const { z } = require("zod");

const registerSchema = z.object({
  name:     z.string().min(1, "Name is required"),
  email:    z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required")
});

const updatePersonalSchema = z.object({
  name:  z.string().min(1).optional(),
  email: z.string().email().optional()
});

const updateCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  cif:  z.string().min(1).optional()
});

module.exports = { registerSchema, loginSchema, updatePersonalSchema, updateCompanySchema };