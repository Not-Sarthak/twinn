import { FastifyInstance } from 'fastify';
import { momentService } from '../services/moment.service';
import { authenticate } from '../utils/auth';
import { IMomentCreate } from '../types';

export const registerMomentRoutes = (fastify: FastifyInstance, prefix: string = '/api/moments') => {
  // Create a new moment
  fastify.post<{
    Body: IMomentCreate
  }>(`${prefix}`, { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.privyUser?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }
      const momentData = request.body;
      
      const moment = await momentService.createMoment(momentData, userId);
      
      return reply.code(201).send({ moment });
    } catch (error) {
      console.error(error);
      request.log.error(error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return reply.code(404).send({ error: error.message });
        }
        if (error.message.includes('can only create moments')) {
          return reply.code(403).send({ error: error.message });
        }
      }
      
      return reply.code(500).send({ error: 'Error creating moment' });
    }
  });

  // Get all moments with optional filtering
  fastify.get<{
    Querystring: { creatorId?: string, dropId?: string, mintedDropId?: string, page?: number, limit?: number }
  }>(`${prefix}`, async (request, reply) => {
    try {
      const { creatorId, dropId, mintedDropId, page, limit } = request.query;
      
      const result = await momentService.getMoments({ creatorId, dropId, mintedDropId }, page, limit);
      
      return result;
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting moments' });
    }
  });

  // Get a moment by ID
  fastify.get<{
    Params: { id: string }
  }>(`${prefix}/:id`, async (request, reply) => {
    try {
      const { id } = request.params;
      
      const moment = await momentService.getMomentById(id);
      if (!moment) {
        return reply.code(404).send({ error: 'Moment not found' });
      }
      
      return { moment };
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting moment' });
    }
  });

  // Update a moment
  fastify.put<{
    Params: { id: string },
    Body: Partial<IMomentCreate>
  }>(`${prefix}/:id`, { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.privyUser?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }
      const momentData = request.body;
      
      const updatedMoment = await momentService.updateMoment(id, momentData, userId);
      
      return { moment: updatedMoment };
    } catch (error) {
      console.error(error);
      request.log.error(error);
      
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          return reply.code(403).send({ error: error.message });
        }
        if (error.message.includes('not found')) {
          return reply.code(404).send({ error: error.message });
        }
      }
      
      return reply.code(500).send({ error: 'Error updating moment' });
    }
  });

  // Delete a moment
  fastify.delete<{
    Params: { id: string }
  }>(`${prefix}/:id`, { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.privyUser?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }
      
      await momentService.deleteMoment(id, userId);
      
      return { success: true, message: 'Moment deleted successfully' };
    } catch (error) {
      console.error(error);
      request.log.error(error);
      
      if (error instanceof Error && error.message.includes('permission')) {
        return reply.code(403).send({ error: error.message });
      }
      
      return reply.code(500).send({ error: 'Error deleting moment' });
    }
  });
}; 