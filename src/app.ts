import { Hono } from 'hono';

const app = new Hono();

app.get('/health', (context) => {
  return context.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
