import { FastifyInstance } from 'fastify';
import { createUser, getUserByEmail, getUserByWallet, getUserById, updateUser, getUserCollections, getUserDrops, getUserMintedDrops, mapUserToResponse } from '../services/user.service';
import { authenticate } from '../utils/auth';
import { IUserCreate, IPrivyAuth } from '../types';

export const registerUserRoutes = (fastify: FastifyInstance, prefix: string = '/api/users') => {
  fastify.post<{
    Body: IPrivyAuth
  }>(`${prefix}/auth`, async (request, reply) => {
    try {
      const { privyDID, email, name, walletAddress } = request.body;
      
      let user = await getUserById(privyDID);
      
      if (!user) {
        const existingUserByWallet = await getUserByWallet(walletAddress);
        if (existingUserByWallet) {
          return reply.code(409).send({ error: 'A user with this wallet already exists' });
        }
        
        if (email) {
          const existingUserByEmail = await getUserByEmail(email);
          if (existingUserByEmail) {
            return reply.code(409).send({ error: 'A user with this email already exists' });
          }
        }
        
        const createdUser = await createUser({
          id: privyDID,
          email,
          name: name || 'Unnamed User',
          walletAddress
        });
        
        user = await getUserById(privyDID);
        if (!user) {
          return reply.code(500).send({ error: 'Failed to retrieve created user' });
        }
      }
      
      const userResponse = mapUserToResponse(user);
      
      return reply.code(200).send({ user: userResponse });
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error authenticating user' });
    }
  });

  fastify.get(`${prefix}/me`, { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.privyUser?.id;
      if (!userId) {
        return reply.unauthorized('User not authenticated');
      }
      
      const user = await getUserById(userId);
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      return { user };
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting user' });
    }
  });

  fastify.put<{
    Body: Partial<IUserCreate>
  }>(`${prefix}/me`, { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.privyUser?.id;
      if (!userId) {
        return reply.unauthorized('User not authenticated');
      }
      
      const userData = request.body;
      
      if ('id' in userData) {
        delete userData.id;
      }
      
      if (userData.email) {
        const existingUser = await getUserByEmail(userData.email);
        if (existingUser && existingUser.id !== userId) {
          return reply.code(409).send({ error: 'Email is already in use' });
        }
      }
      
      if (userData.walletAddress) {
        const existingUser = await getUserByWallet(userData.walletAddress);
        if (existingUser && existingUser.id !== userId) {
          return reply.code(409).send({ error: 'Wallet is already linked to another account' });
        }
      }
      
      const updatedUser = await updateUser(userId, userData);
      
      return { user: updatedUser };
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error updating user' });
    }
  });

  fastify.get<{
    Querystring: { page?: number, limit?: number }
  }>(`${prefix}/me/collections`, { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.privyUser?.id;
      if (!userId) {
        return reply.unauthorized('User not authenticated');
      }
      
      const { page, limit } = request.query;
      
      const result = await getUserCollections(userId, page, limit);
      
      return result;
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting user collections' });
    }
  });

  fastify.get<{
    Querystring: { page?: number, limit?: number }
  }>(`${prefix}/me/drops`, { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.privyUser?.id;
      if (!userId) {
        return reply.unauthorized('User not authenticated');
      }
      
      const { page, limit } = request.query;
      
      const result = await getUserDrops(userId, page, limit);
      
      return result;
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting user drops' });
    }
  });

  fastify.get<{
    Querystring: { page?: number, limit?: number }
  }>(`${prefix}/me/minted`, { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const userId = request.privyUser?.id;
      if (!userId) {
        return reply.unauthorized('User not authenticated');
      }
      
      const { page, limit } = request.query;
      
      const result = await getUserMintedDrops(userId, page, limit);
      
      return result;
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting user minted drops' });
    }
  });

  fastify.get<{
    Params: { wallet: string }
  }>(`${prefix}/wallet/:wallet`, async (request, reply) => {
    try {
      const { wallet } = request.params;
      
      const user = await getUserByWallet(wallet);
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      return { user };
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting user' });
    }
  });

  fastify.get<{
    Params: { wallet: string },
    Querystring: { page?: number, limit?: number }
  }>(`${prefix}/wallet/:wallet/collections`, async (request, reply) => {
    try {
      const { wallet } = request.params;
      const { page, limit } = request.query;
      
      const user = await getUserByWallet(wallet);
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      const result = await getUserCollections(user.id, page, limit);
      
      return result;
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting user collections' });
    }
  });

  fastify.get<{
    Params: { wallet: string },
    Querystring: { page?: number, limit?: number }
  }>(`${prefix}/wallet/:wallet/drops`, async (request, reply) => {
    try {
      const { wallet } = request.params;
      const { page, limit } = request.query;
      
      const user = await getUserByWallet(wallet);
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      const result = await getUserDrops(user.id, page, limit);
      
      return result;
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting user drops' });
    }
  });

  // Get public user minted drops by wallet address
  fastify.get<{
    Params: { wallet: string },
    Querystring: { page?: number, limit?: number }
  }>(`${prefix}/wallet/:wallet/minted`, async (request, reply) => {
    try {
      const { wallet } = request.params;
      const { page, limit } = request.query;
      
      const user = await getUserByWallet(wallet);
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      const result = await getUserMintedDrops(user.id, page, limit);
      
      return result;
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.code(500).send({ error: 'Error getting user minted drops' });
    }
  });
}; 