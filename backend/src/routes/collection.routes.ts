import { FastifyInstance } from 'fastify';
import { createCollection, getCollections, getCollectionById, updateCollection, deleteCollection, getCollectionDrops } from '../services/collection.service';
import { authenticate, requireAuth, requireOwnership } from '../utils/auth';
import { ICollectionCreate } from '../types';

export const registerCollectionRoutes = (fastify: FastifyInstance, prefix: string = '/api/collections') => {
  // Create Collection
  fastify.post(`${prefix}`, {
    preHandler: [authenticate],
    handler: requireAuth(async (request, reply, userId) => {
      try {
        const collectionData = request.body as ICollectionCreate;
        const collection = await createCollection(collectionData, userId);
        return reply.code(201).send({ collection });
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Error Creating Collection' });
      }
    })
  });

  // Get all Collections
  fastify.get(`${prefix}`, async (request, reply) => {
    try {
      const { creatorId, page, limit } = request.query as { creatorId?: string, page?: number, limit?: number };
      const result = await getCollections(creatorId, page, limit);
      return result;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Error Getting Collections' });
    }
  });

  // Get Collection by ID with its Drops
  fastify.get(`${prefix}/:id`, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const collection = await getCollectionById(id);
      if (!collection) {
        return reply.code(404).send({ error: 'Collection Not Found' });
      }
      
      const dropsResult = await getCollectionDrops(id);
      
      return { 
        collection,
        drops: dropsResult.drops
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Error Getting Collection' });
    }
  });

  // Update Collection
  fastify.put(`${prefix}/:id`, {
    preHandler: [authenticate],
    handler: requireOwnership(
      async (request) => {
        const { id } = request.params as { id: string };
        const collection = await getCollectionById(id);
        return collection ? collection.creator.id : null;
      },

      async (request, reply, userId) => {
        try {
          const { id } = request.params as { id: string };
          const collectionData = request.body as Partial<ICollectionCreate>;
          const updatedCollection = await updateCollection(id, collectionData);
          return { collection: updatedCollection };
        } catch (error) {
          request.log.error(error);
          return reply.code(500).send({ error: 'Error Updating Collection' });
        }
      }
    )
  });

  // Delete Collection
  fastify.delete(`${prefix}/:id`, {
    preHandler: [authenticate],
    handler: requireOwnership(
      async (request) => {
        const { id } = request.params as { id: string };
        const collection = await getCollectionById(id);
        return collection ? collection.creator.id : null;
      },
      async (request, reply, userId) => {
        try {
          const { id } = request.params as { id: string };
          await deleteCollection(id);
          return { success: true, message: 'Collection Deleted Successfully' };
        } catch (error) {
          request.log.error(error);
          return reply.code(500).send({ error: 'Error Deleting Collection' });
        }
      }
    )
  });
}; 