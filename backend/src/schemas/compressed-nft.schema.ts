import { Type } from '@sinclair/typebox';

export const CreateCompressedNFTRequestSchema = Type.Object({
  name: Type.String({ minLength: 1, description: 'Name of the NFT' }),
  symbol: Type.String({ minLength: 1, description: 'Symbol for the NFT' }),
  description: Type.String({ description: 'Description of the NFT' }),
  supply: Type.Number({ minimum: 1, description: 'Total supply of tokens to mint' }),
  recipientAddress: Type.String({ minLength: 43, maxLength: 44, description: 'Solana wallet address to receive tokens' }),
  image: Type.Optional(Type.String({ format: 'uri', description: 'URL to the image for the NFT (optional)' }))
});

export const CreateCompressedNFTResponseSchema = Type.Object({
  mintAddress: Type.String({ description: 'Solana address of the minted token' }),
  createTxId: Type.String({ description: 'Transaction ID for token creation' }),
  poolTxId: Type.String({ description: 'Transaction ID for pool registration' }),
  mintTxId: Type.String({ description: 'Transaction ID for minting tokens' }),
  compressTxId: Type.String({ description: 'Transaction ID for compressing tokens' }),
  metadataUri: Type.String({ format: 'uri', description: 'URI for token metadata' }),
  uniqueCode: Type.String({ minLength: 6, maxLength: 6, description: 'Unique 6-character alphanumeric code for the token' }),
  transferAmount: Type.Number({ description: 'Amount of tokens transferred to recipient' }),
  transferTxId: Type.Optional(Type.String({ description: 'Transaction ID for token transfer (if applicable)' }))
});

export const TransferCompressedTokenRequestSchema = Type.Object({
  mintAddress: Type.String({ description: 'Solana address of the token to transfer' }),
  amount: Type.Number({ minimum: 1, description: 'Amount of tokens to transfer' }),
  recipientAddress: Type.String({ minLength: 43, maxLength: 44, description: 'Solana wallet address to receive tokens' })
});

export const TransferCompressedTokenResponseSchema = Type.Object({
  transferTxId: Type.String({ description: 'Transaction ID for token transfer' })
}); 