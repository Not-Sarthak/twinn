import { db } from '../config/db';
import { ICollectionCreate, ICollectionResponse } from '../types';
import { getPagination } from '../utils/pagination';

/**
 * Helper function to transform nullable fields to undefined for type safety
 */
function sanitizeCollection(collection: any) {
  return {
    ...collection,
    logo: collection.logo || '',
    coverImage: collection.coverImage || undefined,
    title: collection.title || undefined,
    description: collection.description || undefined,
    link: collection.link || undefined,
    type: collection.type || undefined,
  };
}

/**
 * Create a new collection
 */
export async function createCollection(data: ICollectionCreate, creatorId: string) {
  return db.collection.create({
    data: {
      ...data,
      creatorId,
      isVerified: data.isVerified || false,
      type: data.type,
    },
  });
}

/**
 * Get a collection by ID with associated stats
 */
export async function getCollectionById(id: string): Promise<ICollectionResponse | null> {
  const collection = await db.collection.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!collection) return null;

  const [dropsCount, totalMints, momentsCount] = await Promise.all([
    db.drop.count({ where: { collectionId: id } }),
    db.$queryRaw`
      SELECT COUNT(*) as count
      FROM "NFT"
      WHERE "dropId" IN (
        SELECT id FROM "Drop" WHERE "collectionId" = ${id}
      )
    `,
    db.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Moment"
      WHERE "dropId" IN (
        SELECT id FROM "Drop" WHERE "collectionId" = ${id}
      )
    `,
  ]);

  const sanitizedCollection = sanitizeCollection(collection);

  return {
    ...sanitizedCollection,
    numberOfTotalMintsInCollection: Number(Array.isArray(totalMints) ? totalMints[0].count : 0),
    numberOfDropsInCollection: dropsCount,
    numberOfMomentsInCollection: momentsCount,
  };
}

/**
 * Get collections with pagination and optional filtering by creator
 */
export async function getCollections(creatorId?: string, page = 1, limit = 10) {
  const pagination = getPagination({ page, limit });
  
  const where = creatorId ? { creatorId } : {};
  
  const [collections, total] = await Promise.all([
    db.collection.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        drops: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            drops: true,
          },
        },
      },
    }),
    db.collection.count({ where }),
  ]);

  const collectionsWithMintCounts = await Promise.all(
    collections.map(async (collection) => {
      const totalMints = await db.$queryRaw`
        SELECT COUNT(*) as count
        FROM "NFT"
        WHERE "dropId" IN (
          SELECT id FROM "Drop" WHERE "collectionId" = ${collection.id}
        )
      `;

      const sanitizedCollection = sanitizeCollection(collection);

      return {
        ...sanitizedCollection,
        numberOfTotalMintsInCollection: Number(Array.isArray(totalMints) ? totalMints[0].count : 0),
        numberOfDropsInCollection: collection._count?.drops || 0,
        numberOfMomentsInCollection: 0,
      };
    })
  );

  const formattedCollections = collectionsWithMintCounts.map(({ _count, ...rest }) => rest);

  return {
    collections: formattedCollections,
    pagination: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

/**
 * Update an existing collection
 */
export async function updateCollection(id: string, data: Partial<ICollectionCreate>) {
  return db.collection.update({
    where: { id },
    data,
  });
}

/**
 * Delete a collection
 */
export async function deleteCollection(id: string) {
  return db.collection.delete({
    where: { id },
  });
}

/**
 * Get all drops in a collection with pagination
 */
export async function getCollectionDrops(collectionId: string, page = 1, limit = 10) {
  const pagination = getPagination({ page, limit });
  
  const [drops, total] = await Promise.all([
    db.drop.findMany({
      where: { collectionId },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            mintedDrops: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    db.drop.count({
      where: { collectionId },
    }),
  ]);

  const formattedDrops = drops.map(drop => {
    const { 
      _count,
      ...rest
    } = drop as any;
    
    return {
      ...rest,
      numberOfSupply: drop.maxSupply, 
      numberOfTransfers: 0,
      numberOfCollectors: _count?.mintedDrops || 0,
      numberOfMoments: 0,
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