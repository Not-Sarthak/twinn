import { db } from '../config/db';
import { IDropCreate, IDropResponse, IMintedDropCreate } from '../types';
import { getPagination } from '../utils/pagination';
import { createCompressedNFT, CompressedNFTResult } from './compressed-nft.service';
import { CREDITS_PER_MINT } from '../utils/constants';

/**
 * Helper function to transform nullable fields to undefined for type safety
 */
function sanitizeDrop(drop: any) {
  return {
    ...drop,
    description: drop.description || undefined,
    website: drop.website || undefined,
    location: drop.location || undefined,
    artistInfo: drop.artistInfo || undefined,
    externalLink: drop.externalLink || undefined,
    power: drop.power || undefined,
    mintAddress: drop.mintAddress || undefined,
    metadataUri: drop.metadataUri || undefined,
    uniqueCode: drop.uniqueCode || undefined,
  };
}

// Convert the service object to exported functions
/**
 * Create a new drop
 */
export async function createDrop(data: IDropCreate, creatorId: string) {
  let collectionToUse = null;
  
  // Try to find the specified collection first
  if (data.collectionId) {
    collectionToUse = await db.collection.findFirst({
      where: {
        id: data.collectionId,
        creatorId,
      },
    });
  }
  
  // If no collection found or specified, try to find or create a default collection for the user
  if (!collectionToUse) {
    // Look for a default collection
    collectionToUse = await db.collection.findFirst({
      where: {
        creatorId,
        name: "Default Collection",
      },
    });
    
    // If no default collection exists, create one
    if (!collectionToUse) {
      collectionToUse = await db.collection.create({
        data: {
          name: "Default Collection",
          description: "Default collection for drops",
          creatorId,
          type: "STANDARD",
        },
      });
    }
    
    // Update the drop data with the default collection ID
    data.collectionId = collectionToUse.id;
  }

  // Get user wallet address for NFT recipient
  const user = await db.user.findUnique({
    where: { id: creatorId },
    select: { walletAddress: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Create the drop in the database
  const drop = await db.drop.create({
    data: {
      ...data,
      creatorId,
      isFeatured: data.isFeatured || false,
      artistInfo: data.artistInfo,
      externalLink: data.externalLink,
      power: data.power,
    },
  });

  // Create compressed NFT
  let nftData: CompressedNFTResult | null = null;
  try {
    nftData = await createCompressedNFT({
      name: data.name,
      symbol: collectionToUse.name.substring(0, 5).toUpperCase(), // Generate symbol from collection name
      description: data.description || `Drop from ${collectionToUse.name}`,
      supply: data.maxSupply,
      recipientAddress: user.walletAddress,
      image: data.image
    });

    // Update the drop with NFT information
    await db.drop.update({
      where: { id: drop.id },
      data: {
        mintAddress: nftData.mintAddress,
        metadataUri: nftData.metadataUri,
        uniqueCode: nftData.uniqueCode
      }
    });

    // Return updated drop with NFT data
    return {
      ...drop,
      mintAddress: nftData.mintAddress,
      metadataUri: nftData.metadataUri,
      uniqueCode: nftData.uniqueCode,
      nftData
    };
  } catch (error) {
    console.error('Error creating compressed NFT:', error);
    // Still return the drop even if NFT creation failed
    return drop;
  }
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

  // Check if user has enough credits (1 credit per mint)
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, creditBalance: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.creditBalance < CREDITS_PER_MINT) {
    throw new Error(`You need at least ${CREDITS_PER_MINT} credit to mint this drop. Please purchase more credits.`);
  }

  // Get the next mint number
  const mintedAtNumber = mintCount + 1;

  // Create transaction in a database transaction to ensure atomicity
  return db.$transaction(async (tx) => {
    // Deduct credits from user
    await tx.user.update({
      where: { id: userId },
      data: {
        creditBalance: {
          decrement: CREDITS_PER_MINT
        }
      }
    });

    // Record credit transaction
    await tx.creditTransaction.create({
      data: {
        amount: -CREDITS_PER_MINT,
        description: `Used ${CREDITS_PER_MINT} credit to mint drop "${drop.name}"`,
        userId,
        dropId: drop.id
      }
    });

    // Create the minted drop instance
    const mintedDrop = await tx.mintedDrop.create({
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
  });
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