// User types
export interface IUser {
  id: string;
  profileImage?: string | null;
  email?: string;
  name: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  id: string;
  profileImage?: string;
  email?: string;
  name: string;
  walletAddress: string;
}

export interface IPrivyAuth {
  privyDID: string;
  email?: string;
  name?: string;
  walletAddress: string;
}

export interface IUserResponse extends IUser {
  numberOfCollectionsCreated: number;
  numberOfDropsCreated: number;
  numberOfMomentsCreated: number;
  numberOfMintedDrops: number;
}

export interface IUserWithLinkedWallet extends Omit<IUser, 'walletAddress'> {
  linkedWallet: string;
}

// Collection types
export interface ICollection {
  id: string;
  logo: string;
  coverImage?: string;
  name: string;
  title?: string;
  description?: string;
  link?: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  type?: string;
}

export interface ICollectionCreate {
  logo: string;
  coverImage?: string;
  name: string;
  title?: string;
  description?: string;
  link?: string;
  isVerified?: boolean;
  type?: string;
}

export interface ICollectionResponse extends ICollection {
  creator: {
    id: string;
    name: string;
  };
  numberOfTotalMintsInCollection: number;
  numberOfDropsInCollection: number;
  numberOfMomentsInCollection: number;
}

// Drop types
export interface IDrop {
  id: string;
  image: string;
  name: string;
  description?: string;
  website?: string;
  locationType?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  maxSupply: number;
  creatorId: string;
  collectionId: string;
  createdAt: Date;
  updatedAt: Date;
  isFeatured: boolean;
  artistInfo?: string;
  externalLink?: string;
  power?: number;
  creditsAllocated: number;
  mintAddress?: string;
  metadataUri?: string;
  uniqueCode?: string;
}

export interface IDropCreate {
  image: string;
  name: string;
  description?: string;
  website?: string;
  locationType?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  maxSupply: number;
  collectionId: string;
  isFeatured?: boolean;
  artistInfo?: string;
  externalLink?: string;
  power?: number;
}

export interface IDropResponse extends IDrop {
  collection: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    name: string;
  };
  numberOfSupply: number;
  numberOfTransfers: number;
  numberOfCollectors: number;
  numberOfMoments: number;
  nftData?: any;
}

export interface IMintedDrop {
  id: string;
  mintedAtNumber: number;
  transactionHash?: string;
  mintedAt: Date;
  minterId: string;
  dropId: string;
}

export interface IMintedDropCreate {
  transactionHash?: string;
  dropId: string;
}

export interface IMintedDropResponse extends IMintedDrop {
  drop: {
    id: string;
    name: string;
    image: string;
  };
  collection: {
    id: string;
    name: string;
  };
  minter: {
    id: string;
    name: string;
    linkedWallet: string;
  };
}

// Moment types
export interface IMoment {
  id: string;
  image: string;
  caption?: string;
  imageType?: string;
  imageSize?: number;
  imageFormat?: string;
  imageDimensions?: string;
  locationTaken?: string;
  likeCount: number;
  createdAt: Date;
  creatorId: string;
  mintedDropId: string;
  dropId: string;
}

export interface IMomentCreate {
  image: string;
  caption?: string;
  imageType?: string;
  imageSize?: number;
  imageFormat?: string;
  imageDimensions?: string;
  locationTaken?: string;
  likeCount?: number;
  dropId: string;
  mintedDropId: string;
}

export interface IMomentResponse extends IMoment {
  creator: {
    id: string;
    name: string;
    linkedWallet: string;
  };
}

export interface IFamilyConnection {
  id: string;
  user1: string;
  user2: string;
  dropId: string;
}

// Query parameter types
export interface IPaginationQuery {
  page?: number;
  limit?: number;
}

export interface ICollectionQuery extends IPaginationQuery {
  creatorId?: string;
}

export interface IDropQuery extends IPaginationQuery {
  collectionId?: string;
  creatorId?: string;
}

export interface IMintedDropQuery extends IPaginationQuery {
  dropId?: string;
  minterId?: string;
}

export interface IMomentQuery extends IPaginationQuery {
  creatorId?: string;
  collectionId?: string;
  dropId?: string;
  mintedDropId?: string;
}

export type INFT = IMintedDrop;
export type INFTCreate = IMintedDropCreate;
export type INFTResponse = IMintedDropResponse;
export type INFTQuery = IMintedDropQuery;

export interface IFamilyQuery {
  userAddress: string;
  otherUserAddress?: string;
} 

export interface PrivyUser {
  id: string;       
  email?: string;   
  wallet: string;   
}

export interface CreditPurchaseData {
  amount: number;
  transactionHash: string;
}