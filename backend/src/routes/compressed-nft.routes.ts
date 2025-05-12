import { FastifyInstance } from 'fastify';
import { createCompressedNFT } from '../services/compressed-nft.service';
import { 
  CreateCompressedNFTRequestSchema,
  CreateCompressedNFTResponseSchema
} from '../schemas/compressed-nft.schema';

export const registerCompressedNFTRoutes = (fastify: FastifyInstance, prefix: string = '/api/compressed-nft') => {
  fastify.post<{
    Body: {
      name: string;
      symbol: string;
      description: string;
      supply: number;
      recipientAddress: string;
      image?: string;
    }
  }>(
    `${prefix}`,
    {
      schema: {
        description: 'Create a compressed NFT token and return all necessary information',
        tags: ['compressed-nft'],
        body: CreateCompressedNFTRequestSchema,
        response: {
          201: CreateCompressedNFTResponseSchema,
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              details: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      console.log('Route accessed: POST /api/compressed-nft');
      console.log('Request body:', request.body);
      
      try {
        const { name, symbol, description, supply, recipientAddress, image } = request.body;
        console.log('Validated request params:', { name, symbol, description, supply, recipientAddress, image });
        
        if (!name || !symbol || !description || !supply || !recipientAddress) {
          console.log('Missing required fields');
          return reply.code(400).send({ 
            error: 'Missing required fields. Please provide name, symbol, description, supply, and recipientAddress.' 
          });
        }
        
        try {
          if (recipientAddress.length !== 44 && recipientAddress.length !== 43) {
            console.log('Invalid public key format');
            throw new Error('Invalid public key format');
          }
        } catch (error) {
          console.log('Public key validation error:', error);
          return reply.code(400).send({ 
            error: 'Invalid recipient address format. Please provide a valid Solana public key.' 
          });
        }
        
        console.log('Starting NFT creation process...');
        const result = await createCompressedNFT({
          name,
          symbol,
          description,
          supply,
          recipientAddress,
          image
        });

        console.log('NFT creation successful, result:', result);
        return reply.code(201).send(result);
      } catch (error) {
        console.error('Error in compressed NFT route:', error);
        request.log.error(error);
        return reply.code(500).send({ 
          error: 'Error creating compressed NFT',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }
  );
}; 