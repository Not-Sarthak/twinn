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
  title?: string;
  name?: string;
  date?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  createdAt?: string | Date;
  location?: string;
  locationType?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  description?: string;
  supply?: number;
  maxSupply?: number;
  power?: number;
  collections?: number;
  moments?: number;
  transfers?: number;
  artistInfo?: string;
  externalLink?: string;
  website?: string;
  collectors?: Collector[];
  mints?: number;
  reservations?: number;
  collectionId?: string;
  collection?: Collection;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  image?: string;
  logo?: string;
  creator?: {
    id: string;
    name: string;
  };
  creatorId?: string;
  dropCount?: number;
  collectorsCount?: number;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  drops?: any[];
  type?: string;
  title?: string;
  link?: string;
  numberOfTotalMintsInCollection?: number;
  numberOfDropsInCollection?: number;
  numberOfMomentsInCollection?: number;
}

export interface IPFSUploadResult {
  hash: string;
  ipfs_url: string;
  gateway_url: string;
  pinata_gateway_url: string;
}

export interface EnhancedDrop extends Omit<Drop, 'moments'> {
  collectionInfo?: {
    id: string;
    name: string;
    image: string;
    type?: string;
    coverImage: string;
  };
  minted?: any[];
  moments?: any[];
}
