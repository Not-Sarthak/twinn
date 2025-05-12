import { z } from 'zod';
import { paginationQuerySchema } from './user.schema';

export const momentCreateSchema = z.object({
  image: z.string().min(1, 'Image IPFS hash is required'),
  imageType: z.string().optional(),
  imageSize: z.number().int().positive().optional(),
  imageFormat: z.string().optional(),
  imageDimensions: z.string().optional(),
  collectionId: z.string().uuid('Invalid collection ID').optional(),
  dropId: z.string().uuid('Invalid drop ID').optional(),
  nftId: z.string().uuid('Invalid NFT ID').optional(),
}).refine(data => {
  // At least one of collectionId, dropId, or nftId must be provided
  return Boolean(data.collectionId || data.dropId || data.nftId);
}, {
  message: 'At least one of collectionId, dropId, or nftId must be provided',
  path: ['collectionId'],
});

export const momentUpdateSchema = z.object({
  image: z.string().min(1, 'Image IPFS hash is required').optional(),
  imageType: z.string().optional(),
  imageSize: z.number().int().positive().optional(),
  imageFormat: z.string().optional(),
  imageDimensions: z.string().optional(),
  collectionId: z.string().uuid('Invalid collection ID').nullable().optional(),
  dropId: z.string().uuid('Invalid drop ID').nullable().optional(),
  nftId: z.string().uuid('Invalid NFT ID').nullable().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const momentIdParamSchema = z.object({
  id: z.string().uuid('Invalid moment ID'),
});

export const momentQuerySchema = paginationQuerySchema.extend({
  creatorId: z.string().uuid('Invalid creator ID').optional(),
  collectionId: z.string().uuid('Invalid collection ID').optional(),
  dropId: z.string().uuid('Invalid drop ID').optional(),
  nftId: z.string().uuid('Invalid NFT ID').optional(),
});

export type MomentCreate = z.infer<typeof momentCreateSchema>;
export type MomentUpdate = z.infer<typeof momentUpdateSchema>;
export type MomentIdParam = z.infer<typeof momentIdParamSchema>;
export type MomentQuery = z.infer<typeof momentQuerySchema>; 