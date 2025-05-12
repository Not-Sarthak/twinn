import { db } from '../config/db';
import { IMomentCreate } from '../types';
import { getPagination } from '../utils/pagination';

export const momentService = {
  async createMoment(data: IMomentCreate, creatorId: string) {
    // Verify the required drop exists
    const drop = await db.drop.findUnique({
      where: { id: data.dropId },
    });
    
    if (!drop) {
      throw new Error('Drop not found');
    }
    
    // Verify the minted drop exists
    const mintedDrop = await db.mintedDrop.findUnique({
      where: { id: data.mintedDropId },
    });
    
    if (!mintedDrop) {
      throw new Error('Minted drop not found');
    }
    
    // Verify that the user actually minted this drop (only minters can create moments)
    if (mintedDrop.minterId !== creatorId) {
      throw new Error('You can only create moments for drops that you have minted');
    }
    
    // Verify the minted drop belongs to the specified drop
    if (mintedDrop.dropId !== data.dropId) {
      throw new Error('The minted drop does not belong to the specified drop');
    }

    return db.moment.create({
      data: {
        image: data.image,
        imageType: data.imageType,
        imageSize: data.imageSize,
        imageFormat: data.imageFormat,
        imageDimensions: data.imageDimensions,
        caption: data.caption,
        locationTaken: data.locationTaken,
        creatorId,
        dropId: data.dropId!,
        mintedDropId: data.mintedDropId!,
      },
      include: {
        creator: {
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
          },
        },
        mintedDrop: {
          select: {
            id: true,
            mintedAtNumber: true,
          },
        },
      },
    });
  },

  async getMomentById(id: string) {
    return db.moment.findUnique({
      where: { id },
      include: {
        creator: {
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
          },
        },
        mintedDrop: {
          select: {
            id: true,
            mintedAtNumber: true,
          },
        },
      },
    });
  },

  async getMoments(params: { creatorId?: string, dropId?: string, mintedDropId?: string } = {}, page = 1, limit = 10) {
    const { creatorId, dropId, mintedDropId } = params;
    const pagination = getPagination({ page, limit });
    
    const where: any = {};
    if (creatorId) where.creatorId = creatorId;
    if (dropId) where.dropId = dropId;
    if (mintedDropId) where.mintedDropId = mintedDropId;
    
    const [moments, total] = await Promise.all([
      db.moment.findMany({
        where,
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
          drop: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          mintedDrop: {
            select: {
              id: true,
              mintedAtNumber: true,
            },
          },
        },
      }),
      db.moment.count({ where }),
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
  },

  async updateMoment(id: string, data: Partial<IMomentCreate>, userId: string) {
    // Check if the moment exists and belongs to the user
    const moment = await db.moment.findFirst({
      where: {
        id,
        creatorId: userId,
      },
    });

    if (!moment) {
      throw new Error('Moment not found or you do not have permission to update it');
    }

    // Only allow updating certain fields, not the relationships
    const updateData = {
      image: data.image,
      caption: data.caption,
      imageType: data.imageType,
      imageSize: data.imageSize,
      imageFormat: data.imageFormat,
      imageDimensions: data.imageDimensions,
      locationTaken: data.locationTaken,
    };

    return db.moment.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
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
          },
        },
        mintedDrop: {
          select: {
            id: true,
            mintedAtNumber: true,
          },
        },
      },
    });
  },

  async deleteMoment(id: string, userId: string) {
    // Check if the moment exists and belongs to the user
    const moment = await db.moment.findFirst({
      where: {
        id,
        creatorId: userId,
      },
    });

    if (!moment) {
      throw new Error('Moment not found or you do not have permission to delete it');
    }

    return db.moment.delete({
      where: { id },
    });
  },
}; 