import { z } from 'zod';

// Shared field rules — reused by any form collecting a person's name/email
// (checkout, reviews, ...) so the constraints can't drift out of sync between forms.
export const personNameSchema = z.string().min(2).max(100);
export const personEmailSchema = z.email().max(254);
