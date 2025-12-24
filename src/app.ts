import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { routes } from './routes';
import { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors());

app.route('/', routes);

export default app;
