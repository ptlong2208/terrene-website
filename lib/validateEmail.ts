import { z } from 'zod';

export const emailSchema = z.object({
  email: z.string().min(1, 'emailRequired').pipe(z.email('emailInvalid')),
});

export type EmailInput = z.infer<typeof emailSchema>;
