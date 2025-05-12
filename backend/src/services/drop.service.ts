import { db } from '../config/db';
import { IDropCreate, IDropResponse, IMintedDropCreate } from '../types';
import { getPagination } from '../utils/pagination';

/**
 * Helper function to transform nullable fields to undefined for type safety
 */
function sanitizeDrop(drop: any) {
  return {
    ...drop,
    description: drop.description || undefined,
    website: drop.website || undefined,
    location: drop.location || undefined,
  };
}

// Convert the service object to exported functions
/**
 * Create a new drop
 */
export async function createDrop(data: IDropCreate, creatorId: string) {
  const collection = await db.collection.findFirst({
    where: {
      id: data.collectionId,
      creatorId,
    },
  });

  if (!collection) {
    throw new Error('Collection not found or you do not have permission to add drops to it');
  }

  return db.drop.create({
    data: {
      ...data,
      creatorId,
    },
  });
}

/**
 * Get a drop by ID
 */
export async function getDropById(id: string): Promise<IDropResponse | null> {
  const drop = await db.drop.findUnique({
    where: { id },
    include: {
      collection: {
        select: {
          id: true,
          name: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          mintedDrops: true,
          moments: true,
        },
      },
    },
  });

  if (!drop) return null;
  
  // Cast to any to avoid TypeScript errors with _count
  const dropWithCount = drop as any;
  const { _count, ...rest } = dropWithCount;
  const sanitizedDrop = sanitizeDrop(rest);

  return {
    ...sanitizedDrop,
    numberOfSupply: drop.maxSupply,
    numberOfTransfers: 0,
    numberOfCollectors: _count.mintedDrops,
    numberOfMoments: _count.moments,
  };
}

/**
 * Get drops with pagination and optional filtering
 */
export async function getDrops(params: { collectionId?: string, creatorId?: string } = {}, page = 1, limit = 10) {
  const { collectionId, creatorId } = params;
  const pagination = getPagination({ page, limit });
  
  const where: any = {};
  if (collectionId) where.collectionId = collectionId;
  if (creatorId) where.creatorId = creatorId;
  
  const [drops, total] = await Promise.all([
    db.drop.findMany({
      where,
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
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            mintedDrops: true,
            moments: true,
          },
        },
      },
    }),
    db.drop.count({ where }),
  ]);

  const formattedDrops = drops.map(drop => {
    // Cast to any to avoid TypeScript errors with _count
    const dropWithCount = drop as any;
    const { _count, ...rest } = dropWithCount;
    const sanitizedDrop = sanitizeDrop(rest);
    return {
      ...sanitizedDrop,
      numberOfSupply: drop.maxSupply,
      numberOfTransfers: 0,
      numberOfCollectors: _count.mintedDrops,
      numberOfMoments: _count.moments,
    };
  });

  return {
    drops: formattedDrops,
    pagination: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

/**
 * Update a drop
 */
export async function updateDrop(id: string, data: Partial<IDropCreate>, userId: string) {
  // Ensure the user owns the drop
  const drop = await db.drop.findFirst({
    where: {
      id,
      creatorId: userId,
    },
  });

  if (!drop) {
    throw new Error('Drop not found or you do not have permission to modify it');
  }

  // If changing the collection, verify the user has access to the target collection
  if (data.collectionId) {
    const collection = await db.collection.findFirst({
      where: {
        id: data.collectionId,
        creatorId: userId,
      },
    });

    if (!collection) {
      throw new Error('Target collection not found or you do not have permission to use it');
    }
  }

  return db.drop.update({
    where: { id },
    data,
  });
}

/**
 * Delete a drop
 */
export async function deleteDrop(id: string, userId: string) {
  // Ensure the user owns the drop
  const drop = await db.drop.findFirst({
    where: {
      id,
      creatorId: userId,
    },
  });

  if (!drop) {
    throw new Error('Drop not found or you do not have permission to delete it');
  }

  return db.drop.delete({
    where: { id },
  });
}

/**
 * Mint a drop instance
 */
export async function mintDrop(data: IMintedDropCreate, userId: string) {
  // Check if drop exists
  const drop = await db.drop.findUnique({
    where: { id: data.dropId },
  });

  if (!drop) {
    throw new Error('Drop not found');
  }

  // Check if the drop has not ended yet
  if (new Date() > drop.endDate) {
    throw new Error('This drop has ended and is no longer available for minting');
  }

  // Check if the drop still has supply available
  const mintCount = await db.mintedDrop.count({
    where: { dropId: data.dropId },
  });

  if (mintCount >= drop.maxSupply) {
    throw new Error('This drop has reached its maximum supply');
  }

  // Get the next mint number
  const mintedAtNumber = mintCount + 1;

  // Create the minted drop instance
  const mintedDrop = await db.mintedDrop.create({
    data: {
      mintedAtNumber,
      transactionHash: data.transactionHash,
      dropId: data.dropId,
      minterId: userId,
    },
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
      minter: {
        select: {
          id: true,
          name: true,
          walletAddress: true,
        },
      },
    },
  });

  return {
    ...(mintedDrop as any),
    collection: (mintedDrop as any).drop.collection,
  };
}

/**
 * Get minted instances for a drop
 */
export async function getDropMints(dropId: string, page = 1, limit = 10) {
  const pagination = getPagination({ page, limit });
  
  const [mintedDrops, total] = await Promise.all([
    db.mintedDrop.findMany({
      where: { dropId },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { mintedAt: 'desc' },
      include: {
        minter: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
          },
        },
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
      where: { dropId },
    }),
  ]);

  const formattedDrops = mintedDrops.map((mintedDrop: any) => ({
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

/**
 * Get moments for a minted drop instance
 */
export async function getDropMomentsByMintedId(mintedDropId: string, page = 1, limit = 10) {
  const pagination = getPagination({ page, limit });
  
  const [moments, total] = await Promise.all([
    db.moment.findMany({
      where: { mintedDropId },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
          },
        },
      },
    }),
    db.moment.count({
      where: { mintedDropId },
    }),
  ]);

  return {
    moments,
    pagination: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

/**
 * Get moments associated with a drop
 */
export async function getDropMoments(dropId: string, page = 1, limit = 10) {
  const pagination = getPagination({ page, limit });
  
  const [moments, total] = await Promise.all([
    db.moment.findMany({
      where: { dropId },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
          },
        },
      },
    }),
    db.moment.count({
      where: { dropId },
    }),
  ]);

  return {
    moments,
    pagination: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
} 