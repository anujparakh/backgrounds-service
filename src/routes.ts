import { Hono } from 'hono';
import { ImageSource, Env, ImageResponse } from './types';
import { getBackgroundImage, getRandomBackgroundImage } from './services';
import { determineImageSource, returnDownloadedImage } from './utils';

export const routes = new Hono<{ Bindings: Env }>();

// ------------------
// -- Image Routes --
// ------------------

// Base route, return a random image from every source
routes.get('/', async (context) => {
  const image = await getRandomBackgroundImage(ImageSource.CHROMECAST, context.env);
  return returnDownloadedImage(image, context, false); // do not cache random images
});

// Get random image by source
// Or specify code and response type
routes.get('/:source', async (context) => {
  const sourceParam = context.req.param('source');
  const typeParam = context.req.query('type') || 'image';
  const codeParam = context.req.query('code');

  const source = determineImageSource(sourceParam);

  // Validate type parameter
  if (typeParam !== 'json' && typeParam !== 'image') {
    return context.text('Invalid type parameter. Must be "json" or "image"', 400);
  }

  // Determine image to return
  let image: ImageResponse | null = null;
  if (codeParam) {
    image = await getBackgroundImage(source, codeParam, context.env);
  } else {
    image = await getRandomBackgroundImage(source, context.env);
  }
  if (image === null) {
    return context.notFound();
  }

  // Return based on type parameter
  if (typeParam === 'image') {
    const shouldCache = codeParam ? true : false;
    return returnDownloadedImage(image, context, shouldCache);
  }
  return context.json(image);
});

// --------------------
// -- General Routes --
// --------------------

routes.get('/health', (context) => {
  return context.text('Healthy!');
});
