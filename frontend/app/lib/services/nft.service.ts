import axios from 'axios';

export interface CompressedNFTResponse {
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

export async function createNFTToken(data: {
  name: string;
  symbol: string;
  description: string;
  supply: number;
  recipientAddress: string;
  image?: string;
}): Promise<CompressedNFTResponse> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    console.log('Making NFT creation request to:', `${API_URL}/api/compressed-nft`);
    console.log('Request data:', data);
    
    const response = await axios.post<CompressedNFTResponse>(
      `${API_URL}/api/compressed-nft`, 
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log("API Response:", response.data);
    return response.data;
    
  } catch (error) {
    console.error("Error creating NFT:", error);
    
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data;
      const errorMessage = 
        (errorData && errorData.error) || 
        (errorData && errorData.details) || 
        "Failed to create NFT";
      
      throw new Error(errorMessage);
    } else {
      throw error;
    }
  }
}

export async function claimNFTToken(data: {
  mintAddress: string;
  uniqueCode: string;
  recipientAddress: string;
  amount?: number;
}): Promise<{ transferTxId: string }> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const response = await axios.post<{ transferTxId: string }>(
      `${API_URL}/api/compressed-nft/claim`, 
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
    
  } catch (error) {
    console.error("Error claiming NFT:", error);
    
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data;
      const errorMessage = 
        (errorData && errorData.error) || 
        (errorData && errorData.details) || 
        "Failed to claim NFT";
      
      throw new Error(errorMessage);
    } else {
      throw error;
    }
  }
}