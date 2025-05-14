import { FastifyInstance } from "fastify";
import {
  createUser,
  getUserByEmail,
  getUserByWallet,
  getUserById,
  updateUser,
  getUserCollections,
  getUserDrops,
  getUserMintedDrops,
  mapUserToResponse,
} from "../services/user.service";
import { authenticate, requireAuth } from "../utils/auth";
import { IUserCreate, IPrivyAuth, IUserResponse } from "../types";

export const registerUserRoutes = (
  fastify: FastifyInstance,
  prefix: string = "/api/users"
) => {
  // Register user
  fastify.post<{
    Body: IPrivyAuth;
  }>(`${prefix}/register`, async (request, reply) => {
    try {
      const { privyDID, email, name, walletAddress } = request.body;
      
      let user = await getUserById(privyDID);
      if (user) {
        return reply.code(409).send({ error: "User already exists" });
      }
      
      const existingUserByWallet = await getUserByWallet(walletAddress);
      if (existingUserByWallet) {
        return reply
          .code(409)
          .send({ error: "Wallet already linked to another account" });
      }
      
      if (email) {
        const existingUserByEmail = await getUserByEmail(email);
        if (existingUserByEmail) {
          return reply.code(409).send({ error: "Email already in use" });
        }
      }
      
      const newUser = await createUser({
        id: privyDID,
        email,
        name: name || "Anonymous User",
        walletAddress,
      });
      
      const userResponse = await mapUserToResponse(newUser);
      return reply.code(201).send({ user: userResponse });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to register user" });
    }
  });
  
  // Get User's Collections, Drops and Minted Drops
  fastify.get(
    `${prefix}/me`,
    { preHandler: [authenticate] },
    requireAuth(async (request, reply, userId) => {
      try {
        const user = await getUserById(userId);
        if (!user) {
          return reply.code(404).send({ error: "User not found" });
        }
        
        const [collections, drops, mintedDrops, userResponse] =
          await Promise.all([
            getUserCollections(userId),
            getUserDrops(userId),
            getUserMintedDrops(userId),
            mapUserToResponse(user),
          ]);
        
        return { 
          user: userResponse,
          collections: collections.collections,
          drops: drops.drops,
          mintedDrops: mintedDrops.mintedDrops,
        };
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: "Failed to retrieve user data" });
      }
    })
  );
  
  // Update User Profile
  fastify.put<{
    Body: Partial<IUserCreate>;
  }>(
    `${prefix}/me`,
    { preHandler: [authenticate] },
    requireAuth(async (request, reply, userId) => {
      try {
        const userData = request.body as Partial<IUserCreate>;
        
        if ("id" in userData) {
          delete userData.id;
        }
        
        if (userData.email) {
          const existingUser = await getUserByEmail(userData.email);
          if (existingUser && existingUser.id !== userId) {
            return reply.code(409).send({ error: "Email already in use" });
          }
        }
        
        if (userData.walletAddress) {
          const existingUser = await getUserByWallet(userData.walletAddress);
          if (existingUser && existingUser.id !== userId) {
            return reply
              .code(409)
              .send({ error: "Wallet already linked to another account" });
          }
        }
        
        const updatedUser = await updateUser(userId, userData);
        const userResponse = await mapUserToResponse(updatedUser);
        return { user: userResponse };
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: "Failed to update user profile" });
      }
    })
  );
  
  // Get Public User Details by Wallet Address
  fastify.get<{
    Params: { wallet: string };
  }>(`${prefix}/wallet/:wallet`, async (request, reply) => {
    try {
      const { wallet } = request.params;
      
      const user = await getUserByWallet(wallet);
      if (!user) {
        return reply.code(404).send({ error: "User not found" });
      }
      
      const [collections, drops] = await Promise.all([
        getUserCollections(user.id),
        getUserDrops(user.id),
      ]);
      
      const publicUserInfo = {
        id: user.id,
        name: user.name,
        profileImage: user.profileImage,
        linkedWallet: user.walletAddress,
        numberOfCollectionsCreated: user.numberOfCollectionsCreated,
        numberOfDropsCreated: user.numberOfDropsCreated,
        numberOfMomentsCreated: user.numberOfMomentsCreated,
        numberOfMintedDrops: user.numberOfMintedDrops,
      };
      
      return { 
        user: publicUserInfo,
        collections: collections.collections,
        drops: drops.drops,
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to retrieve user data" });
    }
  });
};
