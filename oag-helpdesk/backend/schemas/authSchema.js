import { z } from 'zod';

export const registerSchema = z.object({
  email: z.any().refine(Boolean),
  password: z.any().refine(Boolean),
  full_name: z.any().refine(Boolean)
}).passthrough();

export function validateRegisterBody(body) {
  return registerSchema.safeParse(body).success;
}
