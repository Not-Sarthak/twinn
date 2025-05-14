import { db } from '../config/db';
import { verifySolanaTransaction } from '../utils/transaction';
import { MIN_CREDITS_PURCHASE, USD_TO_CREDITS_RATE, MIN_TRANSACTION_HASH_LENGTH } from '../utils/constants';
import { CreditPurchaseData } from '../types';

export const verifyTransaction = async (
  transactionHash: string, 
  expectedAmount: number
): Promise<boolean> => {
  if (!transactionHash || transactionHash.length < MIN_TRANSACTION_HASH_LENGTH) {
    return false;
  }
  
  return verifySolanaTransaction(transactionHash, expectedAmount);
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