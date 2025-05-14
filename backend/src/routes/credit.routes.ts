import { FastifyInstance } from 'fastify';
import { 
  purchaseCredits, 
  getUserCreditBalance, 
  getUserCreditTransactions
} from '../services/credit.service';
import { authenticate, requireAuth } from '../utils/auth';
import { MIN_TRANSACTION_HASH_LENGTH } from '../utils/constants';

export const registerCreditRoutes = (fastify: FastifyInstance, prefix: string = '/api/credits') => {
  // Purchase credits with a transaction hash
  fastify.post<{
    Body: { amount: number, transactionHash: string }
  }>(
    `${prefix}/purchase`,
    { preHandler: [authenticate] },
    requireAuth(async (request, reply, userId) => {
      try {
        const { amount, transactionHash } = request.body;
        if (!amount || amount <= 0) {
          return reply.code(400).send({ error: 'Valid Amount is Required' });
        }
        
        if (!transactionHash || transactionHash.length < MIN_TRANSACTION_HASH_LENGTH) {
          return reply.code(400).send({ error: 'Valid Transaction Hash is Required' });
        }
        
        const result = await purchaseCredits(userId, { amount, transactionHash });
        return {
          success: true,
          credits: result.user.creditBalance,
          transaction: result.transaction
        };
      } catch (error) {
        request.log.error(error);
        
        if (error instanceof Error) {
          if (error.message.includes('Already Been Processed')) {
            return reply.code(409).send({ error: error.message });
          }
          if (error.message.includes('Invalid Transaction')) {
            return reply.code(400).send({ error: error.message });
          }
          if (error.message.includes('Minimum Purchase')) {
            return reply.code(400).send({ error: error.message });
          }
        }
        
        return reply.code(500).send({ error: 'Error Processing Credit Purchase' });
      }
    })
  );
  
  // Get user's credit balance
  fastify.get(
    `${prefix}/balance`,
    { preHandler: [authenticate] },
    requireAuth(async (request, reply, userId) => {
      try {
        const balance = await getUserCreditBalance(userId);
        return balance;
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Error Getting Credit Balance' });
      }
    })
  );
  
  // Get user's credit transaction history
  fastify.get<{
    Querystring: { page?: number, limit?: number }
  }>(
    `${prefix}/transactions`,
    { preHandler: [authenticate] },
    requireAuth(async (request, reply, userId) => {
      try {
        const { page, limit } = request.query;
        const transactions = await getUserCreditTransactions(userId, page, limit);
        return transactions;
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Error Getting Credit Transactions' });
      }
    })
  );
}; 