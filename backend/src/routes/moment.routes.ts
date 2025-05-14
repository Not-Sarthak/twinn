import { FastifyInstance } from 'fastify';
import { momentService } from '../services/moment.service';
import { authenticate, requireAuth } from '../utils/auth';

export const registerMomentRoutes = (fastify: FastifyInstance, prefix: string = '/api/moments') => {
  // Get All Moments with Optional Filtering
  fastify.get<{
    Querystring: { creatorId?: string, dropId?: string, mintedDropId?: string, page?: number, limit?: number }
  }>(`${prefix}`, async (request, reply) => {
    try {
      const { creatorId, dropId, mintedDropId, page, limit } = request.query;
      
      const result = await momentService.getMoments({ creatorId, dropId, mintedDropId }, page, limit);
      
      return result;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting moments' });
    }
  });

  // Get a Moment by ID
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
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting moment' });
    }
  });

  // Like a Moment
  fastify.post<{
    Params: { id: string }
  }>(
    `${prefix}/:id/like`,
    { preHandler: [authenticate] },
    requireAuth(async (request, reply, userId) => {
      try {
        const { id } = request.params;
        
        // Use the likeMoment service method
        const updatedMoment = await momentService.likeMoment(id);
        
        return { success: true, moment: updatedMoment };
      } catch (error) {
        request.log.error(error);
        
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({ error: error.message });
        }
        
        return reply.code(500).send({ error: 'Error liking moment' });
      }
    })
  );
}; 