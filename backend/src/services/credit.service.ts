import { db } from '../config/db';

const USD_TO_CREDITS_RATE = 4;
const MIN_CREDITS_PURCHASE = 100;

export interface CreditPurchaseData {
  amount: number;
  transactionHash: string;
}

export const verifyTransaction = async (
  transactionHash: string, 
  expectedAmount: number
): Promise<boolean> => {
  if (!transactionHash || transactionHash.length < 10) {
    return false;
  }
  
  // Simulate blockchain verification with a delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return true;
};

export const purchaseCredits = async (
  userId: string, 
  data: CreditPurchaseData
) => {
  if (!data.amount || data.amount <= 0) {
    throw new Error('Invalid purchase amount');
  }
  
  if (!data.transactionHash) {
    throw new Error('Transaction hash is required');
  }
  
  const existingTransaction = await db.creditTransaction.findFirst({
    where: {
      transactionHash: data.transactionHash,
    },
  });
  
  if (existingTransaction) {
    throw new Error('This transaction has already been processed');
  }
  
  const creditsToAdd = Math.floor(data.amount * USD_TO_CREDITS_RATE);
  
  if (creditsToAdd < MIN_CREDITS_PURCHASE) {
    throw new Error(`Minimum purchase is ${MIN_CREDITS_PURCHASE} credits (${MIN_CREDITS_PURCHASE / USD_TO_CREDITS_RATE} USD)`);
  }
  
  const isValidTransaction = await verifyTransaction(data.transactionHash, data.amount);
  if (!isValidTransaction) {
    throw new Error('Invalid transaction hash or amount does not match');
  }
  
  return db.$transaction(async (tx) => {
    const transaction = await tx.creditTransaction.create({
      data: {
        amount: creditsToAdd,
        transactionHash: data.transactionHash,
        cost: data.amount,
        description: `Purchased ${creditsToAdd} credits for $${data.amount}`,
        userId,
      },
    });
    
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        creditBalance: {
          increment: creditsToAdd,
        },
      },
      select: {
        id: true,
        name: true,
        creditBalance: true,
      },
    });
    
    return {
      transaction,
      user,
    };
  });
};

/**
 * Allocate credits to a drop
 */
export const allocateCreditsForDrop = async (
  dropId: string, 
  userId: string, 
  creditsToAllocate: number
) => {
  if (!creditsToAllocate || creditsToAllocate <= 0) {
    throw new Error('Invalid credits amount');
  }
  
  const drop = await db.drop.findFirst({
    where: {
      id: dropId,
      creatorId: userId,
    },
    select: {
      id: true,
      name: true,
      maxSupply: true,
      creditsAllocated: true,
    },
  });
  
  if (!drop) {
    throw new Error('Drop not found or you do not have permission to allocate credits to it');
  }
  
  if (creditsToAllocate < drop.maxSupply) {
    throw new Error(`You must allocate at least ${drop.maxSupply} credits (one per maximum supply)`);
  }
  
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      creditBalance: true,
    },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.creditBalance < creditsToAllocate) {
    throw new Error(`Not enough credits. You have ${user.creditBalance} credits, but need ${creditsToAllocate}`);
  }
  
  return db.$transaction(async (tx) => {
    const transaction = await tx.creditTransaction.create({
      data: {
        amount: -creditsToAllocate,
        description: `Allocated ${creditsToAllocate} credits to drop "${drop.name}"`,
        userId,
        dropId,
      },
    });
    
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        creditBalance: {
          decrement: creditsToAllocate,
        },
      },
      select: {
        id: true,
        creditBalance: true,
      },
    });
    
    const updatedDrop = await tx.drop.update({
      where: { id: dropId },
      data: {
        creditsAllocated: {
          increment: creditsToAllocate,
        },
      },
      select: {
        id: true,
        name: true,
        creditsAllocated: true,
      },
    });
    
    return {
      transaction,
      user: updatedUser,
      drop: updatedDrop,
    };
  });
};

export const getUserCreditTransactions = async (
  userId: string, 
  page = 1, 
  limit = 10
) => {
  const skip = (page - 1) * limit;
  
  const [transactions, total] = await Promise.all([
    db.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        drop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    db.creditTransaction.count({
      where: { userId },
    }),
  ]);
  
  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get user's credit balance
 */
export const getUserCreditBalance = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      creditBalance: true,
    },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return {
    creditBalance: user.creditBalance,
  };
}; 