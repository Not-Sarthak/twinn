import { z } from 'zod';
import { paginationQuerySchema } from './user.schema';

export const collectionCreateSchema = z.object({
  logo: z.string().min(1, 'Logo IPFS hash is required'),
  coverImage: z.string().optional(),
  name: z.string().min(1, 'Collection name is required'),
  title: z.string().optional(),
  description: z.string().optional(),
  link: z.string().url('Invalid URL format').optional(),
});

export const collectionUpdateSchema = z.object({
  logo: z.string().min(1, 'Logo IPFS hash is required').optional(),
  coverImage: z.string().optional(),
  name: z.string().min(1, 'Collection name is required').optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  link: z.string().url('Invalid URL format').optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const collectionIdParamSchema = z.object({
  id: z.string().uuid('Invalid collection ID'),
});

export const collectionQuerySchema = paginationQuerySchema.extend({
  creatorId: z.string().uuid('Invalid creator ID').optional(),
});

export type CollectionCreate = z.infer<typeof collectionCreateSchema>;
export type CollectionUpdate = z.infer<typeof collectionUpdateSchema>;
export type CollectionIdParam = z.infer<typeof collectionIdParamSchema>;
export type CollectionQuery = z.infer<typeof collectionQuerySchema>; 