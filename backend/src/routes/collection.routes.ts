import { FastifyInstance } from 'fastify';
import { createCollection, getCollections, getCollectionById, updateCollection, deleteCollection, getCollectionDrops } from '../services/collection.service';
import { authenticate } from '../utils/auth';
import { ICollectionCreate } from '../types';

export const registerCollectionRoutes = (fastify: FastifyInstance, prefix: string = '/api/collections') => {
  fastify.post(`${prefix}`, {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      try {
        const userId = request.privyUser?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Authentication required' });
        }
        const collectionData = request.body as ICollectionCreate;
        
        const collection = await createCollection(collectionData, userId);
        
        return reply.code(201).send({ collection });
      } catch (error) {
        console.error(error);
        request.log.error(error);
        return reply.code(500).send({ error: 'Error creating collection' });
      }
    }
  });

  fastify.get(`${prefix}`, {
    handler: async (request, reply) => {
      try {
        const { creatorId, page, limit } = request.query as { creatorId?: string, page?: number, limit?: number };
        
        const result = await getCollections(creatorId, page, limit);
        
        return result;
      } catch (error) {
        console.error(error);
        request.log.error(error);
        return reply.code(500).send({ error: 'Error getting collections' });
      }
    }
  });

  fastify.get(`${prefix}/:id`, {
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        
        const collection = await getCollectionById(id);
        if (!collection) {
          return reply.code(404).send({ error: 'Collection not found' });
        }
        
        return { collection };
      } catch (error) {
        console.error(error);
        request.log.error(error);
        return reply.code(500).send({ error: 'Error getting collection' });
      }
    }
  });

  fastify.put(`${prefix}/:id`, {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const userId = request.privyUser?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Authentication required' });
        }
        const collectionData = request.body as Partial<ICollectionCreate>;
        
        const collection = await getCollectionById(id);
        if (!collection) {
          return reply.code(404).send({ error: 'Collection not found' });
        }
        
        if (collection.creator.id !== userId) {
          return reply.code(403).send({ error: 'You do not have permission to update this collection' });
        }
        
        const updatedCollection = await updateCollection(id, collectionData);
        
        return { collection: updatedCollection };
      } catch (error) {
        console.error(error);
        request.log.error(error);
        return reply.code(500).send({ error: 'Error updating collection' });
      }
    }
  });

  fastify.delete(`${prefix}/:id`, {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const userId = request.privyUser?.id;
        if (!userId) {
          return reply.code(401).send({ error: 'Authentication required' });
        }
        
        const collection = await getCollectionById(id);
        if (!collection) {
          return reply.code(404).send({ error: 'Collection not found' });
        }
        
        if (collection.creator.id !== userId) {
          return reply.code(403).send({ error: 'You do not have permission to delete this collection' });
        }
        
        await deleteCollection(id);
        
        return { success: true, message: 'Collection deleted successfully' };
      } catch (error) {
        console.error(error);
        request.log.error(error);
        return reply.code(500).send({ error: 'Error deleting collection' });
      }
    }
  });

  fastify.get(`${prefix}/:id/drops`, {
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const { page, limit } = request.query as { page?: number, limit?: number };
        
        const collection = await getCollectionById(id);
        if (!collection) {
          return reply.code(404).send({ error: 'Collection not found' });
        }
        
        const result = await getCollectionDrops(id, page, limit);
        
        return result;
      } catch (error) {
        console.error(error);
        request.log.error(error);
        return reply.code(500).send({ error: 'Error getting collection drops' });
      }
    }
  });
}; 