import { db } from '../config/db';
import { IUserCreate, IUserResponse, IUserWithLinkedWallet } from '../types';
import { getPagination } from '../utils/pagination';

async function getUserStats(userId: string) {
  const [
    collectionsCount,
    dropsCount,
    momentsCount,
    mintedDropsCount,
  ] = await Promise.all([
    db.collection.count({ where: { creatorId: userId } }),
    db.drop.count({ where: { creatorId: userId } }),
    db.moment.count({ where: { creatorId: userId } }),
    db.mintedDrop.count({ where: { minterId: userId } }),
  ]);

  return {
    numberOfCollectionsCreated: collectionsCount,
    numberOfDropsCreated: dropsCount,
    numberOfMomentsCreated: momentsCount,
    numberOfMintedDrops: mintedDropsCount,
  };
}

export async function createUser(data: IUserCreate) {
  return db.user.create({
    data: {
      id: data.id,
      email: data.email || null,
      name: data.name,
      walletAddress: data.walletAddress,
    },
  });
}

export async function getUserById(id: string): Promise<IUserResponse | null> {
  const user = await db.user.findUnique({
    where: { id },
  });

  if (!user) return null;

  const stats = await getUserStats(id);
  
  return {
    ...user,
    email: user.email ?? undefined,
    ...stats,
  };
}

export async function getUserByWallet(walletAddress: string): Promise<IUserResponse | null> {
  const user = await db.user.findUnique({
    where: { walletAddress },
  });

  if (!user) return null;

  const stats = await getUserStats(user.id);

  return {
    ...user,
    email: user.email ?? undefined,
    ...stats,
  };
}

export async function getUserByEmail(email: string): Promise<IUserResponse | null> {
  if (!email) return null;
  
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) return null;

  const stats = await getUserStats(user.id);

  return {
    ...user,
    email: user.email ?? undefined,
    ...stats,
  };
}

export function mapUserToResponse(user: any): IUserWithLinkedWallet {
  return {
    id: user.id,
    name: user.name,
    email: user.email ?? undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    linkedWallet: user.walletAddress,
    ...(user.numberOfCollectionsCreated !== undefined && {
      numberOfCollectionsCreated: user.numberOfCollectionsCreated,
      numberOfDropsCreated: user.numberOfDropsCreated,
      numberOfMomentsCreated: user.numberOfMomentsCreated,
      numberOfMintedDrops: user.numberOfMintedDrops,
    }),
  } as IUserWithLinkedWallet;
}

export async function updateUser(id: string, data: Partial<IUserCreate>) {
  if ('id' in data) {
    delete data.id;
  }
  
  return db.user.update({
    where: { id },
    data,
  });
}

export async function getUserCollections(userId: string, page = 1, limit = 10) {
  const pagination = getPagination({ page, limit });
  
  const [collections, total] = await Promise.all([
    db.collection.findMany({
      where: { creatorId: userId },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    }),
    db.collection.count({
      where: { creatorId: userId },
    }),
  ]);

  return {
    collections,
    pagination: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

/**
 * Get drops created by a user
 */
export async function getUserDrops(userId: string, page = 1, limit = 10) {
  const pagination = getPagination({ page, limit });
  
  const [drops, total] = await Promise.all([
    db.drop.findMany({
      where: { creatorId: userId },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    db.drop.count({
      where: { creatorId: userId },
    }),
  ]);

  return {
    drops,
    pagination: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

/**
 * Get drops minted by a user
 */
export async function getUserMintedDrops(userId: string, page = 1, limit = 10) {
  const pagination = getPagination({ page, limit });
  
  const [mintedDrops, total] = await Promise.all([
    db.mintedDrop.findMany({
      where: { minterId: userId },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { mintedAt: 'desc' },
      include: {
        drop: {
          select: {
            id: true,
            name: true,
            image: true,
            collection: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    db.mintedDrop.count({
      where: { minterId: userId },
    }),
  ]);

  const formattedDrops = mintedDrops.map(mintedDrop => ({
    ...mintedDrop,
    collection: mintedDrop.drop.collection,
  }));

  return {
    mintedDrops: formattedDrops,
    pagination: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
} 