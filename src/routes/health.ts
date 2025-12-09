import { FastifyInstance } from 'fastify';

export const healthRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get('/health', () => {
    return 'Healthy!';
  });
};
