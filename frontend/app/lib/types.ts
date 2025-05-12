export interface Collector {
  wallet: string;
  network: string;
  mintedTime: string;
  power: number;
}

export interface Drop {
  image: string;
  numberOfCollectors: number;
  id: string;
  title: string;
  date: string;
  location?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  description?: string;
  supply?: number;
  power?: number;
  collections?: number;
  moments?: number;
  transfers?: number;
  artistInfo?: string;
  externalLink?: string;
  collectors?: Collector[];
  mints?: number;
  reservations?: number;
  collectionId?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  image: string;
  creator: string;
  dropCount: number;
  collectorsCount: number;
  isVerified: boolean;
  createdAt: string;
  drops?: string[];
  type?: string;
}

export interface IPFSUploadResult {
  hash: string;
  ipfs_url: string;
  gateway_url: string;
  pinata_gateway_url: string;
}