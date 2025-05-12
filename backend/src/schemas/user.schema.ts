import { z } from 'zod';

export const userCreateSchema = z.object({
  profileImage: z.string().optional(),
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required'),
  linkedWallet: z.string().min(1, 'Wallet address is required'),
});

export const userLoginSchema = z.object({
  linkedWallet: z.string().min(1, 'Wallet address is required'),
});

export const userUpdateSchema = z.object({
  profileImage: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(1, 'Name is required').optional(),
  linkedWallet: z.string().min(1, 'Wallet address is required').optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

export const userWalletParamSchema = z.object({
  wallet: z.string().min(1, 'Wallet address is required'),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
});

export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type UserWalletParam = z.infer<typeof userWalletParamSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>; 