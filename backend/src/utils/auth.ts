import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../config/db';

interface PrivyUser {
  id: string;       
  email?: string;   
  wallet: string;   
}

declare module 'fastify' {
  interface FastifyRequest {
    privyUser?: PrivyUser;
  }
  
  interface FastifyReply {
    unauthorized(message?: string): FastifyReply;
  }
}

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.unauthorized('Authentication required');
    }
    
    const privyDID = authHeader.substring(7);
    if (!privyDID) {
      return reply.unauthorized('Invalid authentication token');
    }

    const userExists = await db.user.findUnique({
      where: { id: privyDID },
    });

    if (!userExists) {
      return reply.unauthorized('User not found');
    }
    
    request.privyUser = {
      id: privyDID,
      email: userExists.email ?? undefined,
      wallet: userExists.walletAddress
    };
    
  } catch (err) {
    reply.unauthorized('Authentication required');
  }
};