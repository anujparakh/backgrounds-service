import { Hono } from 'hono';
import { routes } from './routes';
import { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

app.route('/', routes);

export default app;
