import { FastifyInstance } from 'fastify';
import { createDrop, getDrops, getDropById, updateDrop, deleteDrop, getDropMints, getDropMoments, mintDrop, getDropMomentsByMintedId } from '../services/drop.service';
import { authenticate } from '../utils/auth';
import { IDropCreate, IMintedDropCreate } from '../types';

export const registerDropRoutes = (fastify: FastifyInstance, prefix: string = '/api/drops') => {
  fastify.post<{
    Body: IDropCreate
  }>(`${prefix}`, { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.privyUser?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }
      const dropData = request.body;
      
      const drop = await createDrop(dropData, userId);
      
      return reply.code(201).send({ drop });
    } catch (error) {
      console.error(error);
      request.log.error(error);
      
      if (error instanceof Error && error.message.includes('permission')) {
        return reply.code(403).send({ error: error.message });
      }
      
      return reply.code(500).send({ error: 'Error creating drop' });
    }
  });

  fastify.post<{
    Body: IMintedDropCreate
  }>(`${prefix}/mint`, { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.privyUser?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }
      const mintData = request.body;
      
      // Need to implement this function in drop.service.ts
      const mintedDrop = await mintDrop(mintData, userId);
      
      return reply.code(201).send({ mintedDrop });
    } catch (error) {
      console.error(error);
      request.log.error(error);
      
      if (error instanceof Error) {
        if (error.message.includes('drop has ended')) {
          return reply.code(400).send({ error: error.message });
        }
        if (error.message.includes('maximum supply')) {
          return reply.code(400).send({ error: error.message });
        }
        if (error.message.includes('not found')) {
          return reply.code(404).send({ error: error.message });
        }
        if (error.message.includes('permission')) {
          return reply.code(403).send({ error: error.message });
        }
      }
      
      return reply.code(500).send({ error: 'Error minting drop' });
    }
  });

  // Get all drops with optional filtering
  fastify.get<{
    Querystring: { collectionId?: string, creatorId?: string, page?: number, limit?: number }
  }>(`${prefix}`, async (request, reply) => {
    try {
      const { collectionId, creatorId, page, limit } = request.query;
      
      const result = await getDrops({ collectionId, creatorId }, page, limit);
      
      return result;
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting drops' });
    }
  });

  // Get a drop by ID
  fastify.get<{
    Params: { id: string }
  }>(`${prefix}/:id`, async (request, reply) => {
    try {
      const { id } = request.params;
      
      const drop = await getDropById(id);
      if (!drop) {
        return reply.code(404).send({ error: 'Drop not found' });
      }
      
      return { drop };
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting drop' });
    }
  });

  // Update a drop
  fastify.put<{
    Params: { id: string },
    Body: Partial<IDropCreate>
  }>(`${prefix}/:id`, { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.privyUser?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }
      const dropData = request.body;
      
      const updatedDrop = await updateDrop(id, dropData, userId);
      
      return { drop: updatedDrop };
    } catch (error) {
      console.error(error);
      request.log.error(error);
      
      if (error instanceof Error && error.message.includes('permission')) {
        return reply.code(403).send({ error: error.message });
      }
      
      return reply.code(500).send({ error: 'Error updating drop' });
    }
  });

  // Delete a drop
  fastify.delete<{
    Params: { id: string }
  }>(`${prefix}/:id`, { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.privyUser?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }
      
      await deleteDrop(id, userId);
      
      return { success: true, message: 'Drop deleted successfully' };
    } catch (error) {
      console.error(error);
      request.log.error(error);
      
      if (error instanceof Error && error.message.includes('permission')) {
        return reply.code(403).send({ error: error.message });
      }
      
      return reply.code(500).send({ error: 'Error deleting drop' });
    }
  });

  // Get minted instances for a drop
  fastify.get<{
    Params: { id: string },
    Querystring: { page?: number, limit?: number }
  }>(`${prefix}/:id/minted`, async (request, reply) => {
    try {
      const { id } = request.params;
      const { page, limit } = request.query;
      
      // Check if the drop exists
      const drop = await getDropById(id);
      if (!drop) {
        return reply.code(404).send({ error: 'Drop not found' });
      }
      
      const result = await getDropMints(id, page, limit);
      
      return result;
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting minted drops' });
    }
  });

  // Get moments for a drop
  fastify.get<{
    Params: { id: string },
    Querystring: { page?: number, limit?: number }
  }>(`${prefix}/:id/moments`, async (request, reply) => {
    try {
      const { id } = request.params;
      const { page, limit } = request.query;
      
      // Check if the drop exists
      const drop = await getDropById(id);
      if (!drop) {
        return reply.code(404).send({ error: 'Drop not found' });
      }
      
      const result = await getDropMoments(id, page, limit);
      
      return result;
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting drop moments' });
    }
  });
}; 