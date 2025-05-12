import { createRpc } from "@lightprotocol/stateless.js";
import { compress, createTokenPool, transfer } from "@lightprotocol/compressed-token";
import {
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  ExtensionType,
  getMintLen,
  LENGTH_SIZE,
  TYPE_SIZE
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl
} from "@solana/web3.js";
import {
  createInitializeInstruction,
  pack,
  TokenMetadata
} from "@solana/spl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import dotenv from "dotenv";
import bs58 from "bs58";
import crypto from 'crypto';

dotenv.config();

// Use RPC_URL environment variable, but make sure we're on devnet
const RPC_ENDPOINT = process.env.RPC_URL || clusterApiUrl("devnet");
console.log('Using RPC endpoint:', RPC_ENDPOINT);

const connection = createRpc(RPC_ENDPOINT);

// Get payer from environment or generate a new one
const getPayer = () => {
  const keypair = process.env.PAYER_KEYPAIR 
    ? Keypair.fromSecretKey(bs58.decode(process.env.PAYER_KEYPAIR))
    : Keypair.generate();
  
  console.log('Using payer:', keypair.publicKey.toString());
  return keypair;
};

// Generate a unique 6-character alphanumeric code
export const generateUniqueCode = (): string => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

export interface CreateCompressedNFTParams {
  name: string;
  symbol: string;
  description: string;
  supply: number;
  recipientAddress: string;
  image?: string;
}

export interface CompressedNFTResult {
  mintAddress: string;
  createTxId: string;
  poolTxId: string;
  mintTxId: string;
  compressTxId: string;
  metadataUri: string;
  uniqueCode: string;
  transferAmount: number;
  transferTxId?: string;
}

export const createCompressedNFT = async (params: CreateCompressedNFTParams): Promise<CompressedNFTResult> => {
  console.log('Starting createCompressedNFT with params:', params);
  try {
    const { name, symbol, description, supply, recipientAddress, image } = params;
    
    console.log('Getting payer...');
    const payer = getPayer();
    console.log('Payer public key:', payer.publicKey.toString());
    
    // Verify that we're on the right network
    console.log('Verifying network...');
    try {
      const genesisHash = await connection.getGenesisHash();
      console.log('Current network genesis hash:', genesisHash);
      // Devnet genesis hash
      const DEVNET_GENESIS = "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG";
      
      if (process.env.RPC_URL && !process.env.RPC_URL.includes("devnet") && genesisHash !== DEVNET_GENESIS) {
        console.warn('Warning: You may not be on Solana devnet. Please verify your RPC endpoint.');
      }
    } catch (error) {
      console.error('Error checking network:', error);
      // Continue execution even if this check fails
    }
    
    // Check payer balance
    console.log('Checking payer balance...');
    const balance = await connection.getBalance(payer.publicKey);
    console.log(`Payer balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    
    if (balance < 0.05 * LAMPORTS_PER_SOL) {
      throw new Error(`Insufficient funds: Payer account needs at least 0.05 SOL to pay for transactions. Current balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    }
    
    console.log('Setting up UMI...');
    const umi = createUmi(RPC_ENDPOINT);
    const umiKeypair = umi.eddsa.createKeypairFromSecretKey(payer.secretKey);
    const umiSigner = createSignerFromKeypair(umi, umiKeypair);
    umi.use(irysUploader());
    umi.use(signerIdentity(umiSigner));
    
    // Create mint account
    console.log('Generating mint account...');
    const mint = Keypair.generate();
    console.log('Mint address:', mint.publicKey.toString());
    const decimals = 0;
    const defaultImage = "https://ipfs.io/ipfs/Qmf4LYeip7viPZtvbXsuBZio9NDGJs5SbHwcdQ331K6L5Q";
    
    // Create metadata
    console.log('Creating metadata...');
    const metaplexMetadata = {
      name: name,
      symbol: symbol,
      description: description,
      image: image || defaultImage,
      attributes: [
        { trait_type: 'category', value: 'Legend' },
        { trait_type: 'type', value: 'Compressed Token' }
      ],
      properties: {
        files: [
          {
            type: "image/jpg",
            uri: image || defaultImage
          }
        ],
        creators: [
          {
            address: payer.publicKey.toString(),
            share: 100
          }
        ]
      }
    };
    
    // Upload metadata
    console.log('Uploading metadata...');
    const metadataUri = await umi.uploader.uploadJson(metaplexMetadata);
    console.log('Metadata URI:', metadataUri);
    
    const metadata: TokenMetadata = {
      mint: mint.publicKey,
      name: metaplexMetadata.name,
      symbol: metaplexMetadata.symbol,
      uri: metadataUri,
      additionalMetadata: [
        ["creator", payer.publicKey.toString()],
        ["website", "https://solana.com/breakpoint"],
        ["description", metaplexMetadata.description]
      ],
    };
    
    // Calculate space and rent
    console.log('Calculating space and rent...');
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
    
    const mintLamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataLen
    );
    
    // Create and send transaction to initialize mint
    console.log('Creating mint transaction...');
    const mintTransaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint.publicKey,
        space: mintLen,
        lamports: mintLamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(
        mint.publicKey,
        payer.publicKey,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeMintInstruction(
        mint.publicKey,
        decimals,
        payer.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mint.publicKey,
        metadata: mint.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: payer.publicKey,
        updateAuthority: payer.publicKey,
      })
    );
    
    console.log('Sending mint transaction...');
    try {
      const txId = await sendAndConfirmTransaction(connection, mintTransaction, [
        payer,
        mint,
      ], {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      });
      console.log('Mint transaction complete:', txId);
      
      // Register with Compressed-Token Program
      console.log('Registering with Compressed-Token Program...');
      const txId2 = await createTokenPool(
        connection,
        payer,
        mint.publicKey,
        undefined,
        TOKEN_2022_PROGRAM_ID
      );
      console.log('Pool registration complete:', txId2);
      
      // Create Associated Token Account for payer
      console.log('Creating Associated Token Account for payer...');
      const ata = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint.publicKey,
        payer.publicKey,
        undefined,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID
      );
      console.log('ATA created for payer:', ata.address.toString());
      
      // Create Associated Token Account for recipient if it's different from payer
      let recipientAta;
      const recipientPubkey = new PublicKey(recipientAddress);
      if (!payer.publicKey.equals(recipientPubkey)) {
        console.log('Creating Associated Token Account for recipient...');
        recipientAta = await getOrCreateAssociatedTokenAccount(
          connection,
          payer,
          mint.publicKey,
          recipientPubkey,
          undefined,
          undefined,
          undefined,
          TOKEN_2022_PROGRAM_ID
        );
        console.log('ATA created for recipient:', recipientAta.address.toString());
      }
      
      // Mint Tokens
      console.log(`Minting ${supply} tokens...`);
      const totalMintAmount = supply;
      
      const mintTxId = await mintTo(
        connection,
        payer,
        mint.publicKey,
        ata.address,
        payer.publicKey,
        totalMintAmount,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID
      );
      console.log('Minting complete:', mintTxId);
      
      // Compress Tokens
      console.log('Compressing tokens...');
      const compressedTokenTxId = await compress(
        connection,
        payer,
        mint.publicKey,
        totalMintAmount,
        payer,
        ata.address,
        payer.publicKey
      );
      console.log('Compression complete:', compressedTokenTxId);
      
      // Generate unique code
      console.log('Generating unique code...');
      const uniqueCode = generateUniqueCode();
      console.log('Unique code generated:', uniqueCode);
      
      // Transfer to recipient if different from payer
      let transferTxId;
      const transferAmount = Math.floor(totalMintAmount / 2); // Transfer half of supply as example
      
      if (!payer.publicKey.equals(recipientPubkey)) {
        console.log(`Transferring ${transferAmount} tokens to recipient...`);
        transferTxId = await transfer(
          connection,
          payer,
          mint.publicKey,
          transferAmount,
          payer,
          recipientPubkey
        );
        console.log('Transfer complete:', transferTxId);
      }
      
      const result = {
        mintAddress: mint.publicKey.toString(),
        createTxId: txId,
        poolTxId: txId2,
        mintTxId: mintTxId,
        compressTxId: compressedTokenTxId,
        metadataUri: metadataUri,
        uniqueCode: uniqueCode,
        transferAmount: transferAmount,
        transferTxId: transferTxId
      };
      
      console.log('NFT creation complete, returning result:', result);
      return result;
    } catch (error: any) {
      console.error('Transaction error:', error);
      
      // Better error handling for common Solana errors
      if (error.message && error.message.includes("Attempt to debit an account but found no record of a prior credit")) {
        throw new Error("Insufficient funds: The payer account needs SOL to pay for this transaction. Please fund the wallet first.");
      } else if (error.message && error.message.includes("Transaction simulation failed")) {
        // Extract the error logs for more detail
        let errorDetail = "Transaction simulation failed";
        if (error.logs && Array.isArray(error.logs)) {
          const relevantLog = error.logs.find((log: string) => log.includes("Error:"));
          if (relevantLog) {
            errorDetail += ": " + relevantLog;
          }
        }
        throw new Error(errorDetail);
      } else if (error.message && error.message.includes("Method not found")) {
        throw new Error("Method not found: The RPC endpoint doesn't support some required methods. Make sure you're using a Light Protocol compatible endpoint on devnet.");
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error in createCompressedNFT:', error);
    throw error;
  }
};

export const transferCompressedToken = async (
  mintAddress: string,
  amount: number,
  recipientAddress: string
): Promise<{ transferTxId: string }> => {
  const payer = getPayer();
  
  const mintPubkey = new PublicKey(mintAddress);
  const recipientPubkey = new PublicKey(recipientAddress);
  
  const transferTxId = await transfer(
    connection,
    payer,
    mintPubkey,
    amount,
    payer,
    recipientPubkey
  );
  
  return { transferTxId };
}; 