import { buildServer } from './config/server';
import { db } from './config/db';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  const server = buildServer();

  try {
    await db.$connect();
    console.log('Connected to Database');

    await server.listen({ port: PORT, host: HOST });
    console.log(`Server is Running on http://${HOST}:${PORT}`);

    const shutdown = async () => {
      console.log('Shutting Down Server');
      await server.close();
      await db.$disconnect();
      console.log('Server Shutdown Complete');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Error Starting Server:', error);
    await db.$disconnect();
    process.exit(1);
  }
};

startServer();