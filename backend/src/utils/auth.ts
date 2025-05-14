import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../config/db";
import { PrivyUser } from "../types";

declare module "fastify" {
  interface FastifyRequest {
    privyUser?: PrivyUser;
  }

  interface FastifyReply {
    unauthorized(message?: string): FastifyReply;
  }
}

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.unauthorized("Authentication required");
    }

    const privyDID = authHeader.substring(7);
    if (!privyDID) {
      return reply.unauthorized("Invalid authentication token");
    }

    const userExists = await db.user.findUnique({
      where: { id: privyDID },
    });

    if (!userExists) {
      return reply.unauthorized("User not found");
    }

    request.privyUser = {
      id: privyDID,
      email: userExists.email ?? undefined,
      wallet: userExists.walletAddress,
    };
  } catch (err) {
    reply.unauthorized("Authentication required");
  }
};

export const requireAuth = <T extends FastifyRequest>(
  handler: (request: T, reply: FastifyReply, userId: string) => Promise<any>
) => {
  return async (request: T, reply: FastifyReply) => {
    const userId = request.privyUser?.id;
    if (!userId) {
      return reply.code(401).send({ error: "Authentication required" });
    }

    return handler(request, reply, userId);
  };
};

export const requireOwnership = <T extends FastifyRequest>(
  resourceFinder: (request: T) => Promise<string | null>,
  handler: (request: T, reply: FastifyReply, userId: string) => Promise<any>
) => {
  return requireAuth<T>(async (request, reply, userId) => {
    const resourceOwnerId = await resourceFinder(request);

    if (!resourceOwnerId) {
      return reply.code(404).send({ error: "Resource not found" });
    }

    if (resourceOwnerId !== userId) {
      return reply
        .code(403)
        .send({ error: "You do not have permission to access this resource" });
    }

    return handler(request, reply, userId);
  });
};
