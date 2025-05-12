import { z } from 'zod';
import { paginationQuerySchema } from './user.schema';
import { MAX_POAP_SUPPLY, MIN_POAP_SUPPLY } from '../utils/constants';

export const dropCreateSchema = z.object({
  image: z.string().min(1, 'Image IPFS hash is required'),
  name: z.string().min(1, 'Drop name is required'),
  description: z.string().optional(),
  website: z.string().url('Invalid URL format').optional(),
  location: z.string().optional(),
  startDate: z.string().or(z.date()).transform((val) => new Date(val)),
  endDate: z.string().or(z.date()).transform((val) => new Date(val)),
  maxSupply: z.number().int().min(MIN_POAP_SUPPLY).max(MAX_POAP_SUPPLY),
  collectionId: z.string().uuid('Invalid collection ID'),
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const dropUpdateSchema = z.object({
  image: z.string().min(1, 'Image IPFS hash is required').optional(),
  name: z.string().min(1, 'Drop name is required').optional(),
  description: z.string().optional(),
  website: z.string().url('Invalid URL format').optional(),
  location: z.string().optional(),
  startDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  endDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  maxSupply: z.number().int().min(MIN_POAP_SUPPLY).max(MAX_POAP_SUPPLY).optional(),
  collectionId: z.string().uuid('Invalid collection ID').optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const dropIdParamSchema = z.object({
  id: z.string().uuid('Invalid drop ID'),
});

export const dropQuerySchema = paginationQuerySchema.extend({
  collectionId: z.string().uuid('Invalid collection ID').optional(),
  creatorId: z.string().uuid('Invalid creator ID').optional(),
});

export type DropCreate = z.infer<typeof dropCreateSchema>;
export type DropUpdate = z.infer<typeof dropUpdateSchema>;
export type DropIdParam = z.infer<typeof dropIdParamSchema>;
export type DropQuery = z.infer<typeof dropQuerySchema>; 