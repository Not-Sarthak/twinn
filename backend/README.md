# POAP Clone Backend

A backend for a POAP (Proof of Attendance Protocol) clone built with Fastify, TypeScript, Prisma, and PostgreSQL.

## Features

- **User Management**: Register, login, and profile management
- **Collections**: Create and manage POAP collections
- **Drops**: Create POAP drops within collections
- **NFT Minting**: Mint POAPs from drops
- **Moments**: Create memorable moments associated with collections, drops, or NFTs
- **Family Feature**: View mutual NFTs between users

## Tech Stack

- **Fastify**: Fast and low overhead web framework for Node.js
- **TypeScript**: Static typing for JavaScript
- **Prisma**: Modern database ORM
- **PostgreSQL**: Relational database
- **Docker**: Containerization for easy deployment
- **Bun**: JavaScript runtime for fast package management

## Prerequisites

- Node.js 18+ or Bun 1.0+
- Docker and Docker Compose
- PostgreSQL (via Docker or locally installed)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd poap-clone-backend
```

### 2. Install dependencies

```bash
bun install
```

### 3. Start the PostgreSQL database

```bash
docker-compose up -d
```

### 4. Set up environment variables

Create a `.env` file in the root directory with the following content:

```
DATABASE_URL="postgresql://twinn:twinnpassword@localhost:5432/twinndb?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
```

### 5. Run database migrations

```bash
bunx prisma migrate dev
```

### 6. Start the development server

```bash
bun start
```

The API will be available at `http://localhost:3000`.

## API Documentation

After starting the server, you can access the Swagger API documentation at:

```
http://localhost:3000/docs
```

## Database Schema

The application uses the following models:

- **User**: User accounts and profiles
- **Collection**: Groups of POAP drops
- **Drop**: Individual POAP drops with limited supply
- **NFT**: Minted POAPs
- **Moment**: Memorable moments captured by users
- **FamilyConnection**: Tracks mutual NFTs between users

## Development

### Generate Prisma Client

After making changes to the Prisma schema, generate the client:

```bash
bunx prisma generate
```

### Run Migrations

After changing your data model, create and apply migrations:

```bash
bunx prisma migrate dev --name <migration-name>
```

### Seeding the Database

To seed the database with initial data:

```bash
bunx prisma db seed
```

## License

[MIT](LICENSE)

## Compressed NFT Endpoint

The API provides an endpoint for creating compressed NFTs:

```
POST /api/compressed-nft
```

### Request Body

```json
{
  "name": "My NFT",
  "symbol": "MNFT",
  "description": "This is my compressed NFT",
  "supply": 10000,
  "recipientAddress": "YOUR_SOLANA_ADDRESS",
  "image": "https://example.com/image.jpg" // Optional
}
```

### Response

```json
{
  "mintAddress": "Solana mint address of the created token",
  "createTxId": "Transaction ID for token creation",
  "poolTxId": "Transaction ID for pool registration",
  "mintTxId": "Transaction ID for minting tokens",
  "compressTxId": "Transaction ID for compressing tokens",
  "metadataUri": "URI for token metadata",
  "uniqueCode": "Unique 6-character alphanumeric code for the token",
  "transferAmount": "Amount of tokens transferred to recipient",
  "transferTxId": "Transaction ID for token transfer (if applicable)"
}
```

### Requirements

1. **Payer Account**: The server uses a payer account defined in the `.env` file. This account must:
   - Have sufficient SOL to pay for transactions (at least 0.1 SOL)
   - Be configured via the `PAYER_KEYPAIR` environment variable (base58 encoded private key)

2. **RPC Endpoint**: The server requires a Solana RPC endpoint that supports Light Protocol methods:
   - Configure via the `RPC_URL` environment variable
   - Recommended providers: Helius, QuickNode, or Alchemy with Light Protocol support

### Frontend Usage

When calling this endpoint from the frontend, use the full URL:

```javascript
const response = await fetch("http://your-server-url/api/compressed-nft", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});
```

Alternatively, configure a proxy in your frontend development server.

### QR Code Generation

The `uniqueCode` in the response can be used to generate a QR code on the frontend, allowing users to claim the token by scanning the code.
