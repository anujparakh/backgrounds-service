import Fastify from 'fastify';
import { healthRoutes } from './routes/health';

const fastify = Fastify({
  logger: true,
});

const start = async (): Promise<void> => {
  try {
    await fastify.register(healthRoutes);

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const host = process.env.HOST ?? '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`Server is running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

void start();
