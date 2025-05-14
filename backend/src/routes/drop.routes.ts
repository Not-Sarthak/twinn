import { FastifyInstance } from 'fastify';
import { createDrop, getDrops, getDropById, updateDrop, getDropMints, getDropMoments } from '../services/drop.service';
import { authenticate, requireAuth, requireOwnership } from '../utils/auth';
import { IDropCreate, IMomentCreate } from '../types';
import { momentService } from '../services/moment.service';
import { db } from '../config/db';
import { CREDITS_PER_MINT } from '../utils/constants';

export const registerDropRoutes = (fastify: FastifyInstance, prefix: string = '/api/drops') => {
  // Create a New Drop
  fastify.post<{
    Body: IDropCreate
  }>(
    `${prefix}`, 
    { preHandler: [authenticate] }, 
    requireAuth(async (request, reply, userId) => {
      try {
        const dropData = request.body as IDropCreate;
        const drop = await createDrop(dropData, userId);
        
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { creditBalance: true }
        });
        
        const creditsNeeded = drop.maxSupply * CREDITS_PER_MINT;
        const userCredits = user?.creditBalance || 0;
        const hasEnoughCredits = userCredits >= creditsNeeded;
        
        return reply.code(201).send({ 
          drop,
          credits: {
            balance: userCredits,
            needed: creditsNeeded,
            hasEnoughCredits,
            info: `This drop requires ${creditsNeeded} credits for full allocation (${CREDITS_PER_MINT} credit per mint).${
              !hasEnoughCredits ? ` You need ${creditsNeeded - userCredits} more credits.` : ''
            }`
          }
        });
      } catch (error) {
        request.log.error(error);
        
        if (error instanceof Error && error.message.includes('permission')) {
          return reply.code(403).send({ error: error.message });
        }
        
        return reply.code(500).send({ error: 'Error creating drop' });
      }
    })
  );

  // Get All Drops with Optional Filtering
  fastify.get<{
    Querystring: { collectionId?: string, creatorId?: string, page?: number, limit?: number }
  }>(`${prefix}`, async (request, reply) => {
    try {
      const { collectionId, creatorId, page, limit } = request.query;
      const result = await getDrops({ collectionId, creatorId }, page, limit);
      return result;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting drops' });
    }
  });

  // Get a Drop by ID with its Minted Instances and Moments
  fastify.get<{
    Params: { id: string }
  }>(`${prefix}/:id`, async (request, reply) => {
    try {
      const { id } = request.params;
      
      const drop = await getDropById(id);
      if (!drop) {
        return reply.code(404).send({ error: 'Drop not found' });
      }
      
      const [mintedDrops, moments] = await Promise.all([
        getDropMints(id),
        getDropMoments(id)
      ]);
      
      return { 
        drop,
        minted: mintedDrops.mintedDrops,
        moments: moments.moments
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting drop details' });
    }
  });

  // Update a Drop
  fastify.put<{
    Params: { id: string },
    Body: Partial<IDropCreate>
  }>(
    `${prefix}/:id`, 
    { preHandler: [authenticate] },
    requireOwnership(
      async (request) => {
        const { id } = request.params as { id: string };
        const drop = await getDropById(id);
        return drop ? drop.creator.id : null;
      },
      async (request, reply, userId) => {
        try {
          const { id } = request.params as { id: string };
          const dropData = request.body as Partial<IDropCreate>;
          const updatedDrop = await updateDrop(id, dropData, userId);
          return { drop: updatedDrop };
        } catch (error) {
          request.log.error(error);
          return reply.code(500).send({ error: 'Error updating drop' });
        }
      }
    )
  );

  // Create a Moment for a Drop
  fastify.post<{
    Params: { id: string },
    Body: Omit<IMomentCreate, 'dropId'>
  }>(
    `${prefix}/:id/moments`, 
    { preHandler: [authenticate] },
    requireAuth(async (request, reply, userId) => {
      try {
        const { id: dropId } = request.params;
        const momentData = request.body as Omit<IMomentCreate, 'dropId'>;
        
        // Check if drop exists
        const drop = await getDropById(dropId);
        if (!drop) {
          return reply.code(404).send({ error: 'Drop not found' });
        }
        
        // Create the moment with the drop ID
        const moment = await momentService.createMoment(
          { ...momentData, dropId },
          userId
        );
        
        return reply.code(201).send({ moment });
      } catch (error) {
        request.log.error(error);
        
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            return reply.code(404).send({ error: error.message });
          }
          if (error.message.includes('can only create moments') || error.message.includes('permission')) {
            return reply.code(403).send({ error: error.message });
          }
        }
        
        return reply.code(500).send({ error: 'Error creating moment' });
      }
    })
  );

  // Get All Moments for a Drop
  fastify.get<{
    Params: { id: string },
    Querystring: { page?: number, limit?: number }
  }>(`${prefix}/:id/moments`, async (request, reply) => {
    try {
      const { id: dropId } = request.params;
      const { page, limit } = request.query;
      
      // Check if drop exists
      const drop = await getDropById(dropId);
      if (!drop) {
        return reply.code(404).send({ error: 'Drop not found' });
      }
      
      const result = await momentService.getMoments({ dropId }, page, limit);
      
      return result;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting moments for drop' });
    }
  });

  // Delete a Moment
  fastify.delete<{
    Params: { dropId: string, momentId: string }
  }>(
    `${prefix}/:dropId/moments/:momentId`, 
    { preHandler: [authenticate] },
    requireAuth(async (request, reply, userId) => {
      try {
        const { momentId } = request.params;
        
        await momentService.deleteMoment(momentId, userId);
        
        return { success: true, message: 'Moment deleted successfully' };
      } catch (error) {
        request.log.error(error);
        
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            return reply.code(404).send({ error: error.message });
          }
          if (error.message.includes('permission')) {
            return reply.code(403).send({ error: error.message });
          }
        }
        
        return reply.code(500).send({ error: 'Error deleting moment' });
      }
    })
  );
}; 