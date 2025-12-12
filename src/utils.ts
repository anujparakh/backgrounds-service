import { Context } from 'hono';
import { ImageResponse, ImageSource } from './types';

// -------------------
// -- Request Utils --
// -------------------

export function determineImageSource(sourceParam: string): ImageSource {
  switch (sourceParam.toLowerCase()) {
    case 'chromecast':
      return ImageSource.CHROMECAST;
    case 'apple':
      return ImageSource.APPLE;
    default:
      return ImageSource.CHROMECAST; // Default to CHROMECAST
  }
}

// ------------------
// -- Image Utils --
// ------------------

export async function downloadImageBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && !contentType.startsWith('image/')) {
    throw new Error(`URL does not point to an image. Content-Type: ${contentType}`);
  }

  return await response.arrayBuffer();
}

export async function returnDownloadedImage(
  image: ImageResponse | null,
  context: Context,
  cache: boolean = true,
): Promise<Response> {
  if (!image) {
    return context.text('No image found', 404);
  }

  try {
    const imageBuffer = await downloadImageBuffer(image.imageUrl);

    // Determine content type from URL extension or default to jpeg
    const extension = image.imageUrl.split('.').pop()?.toLowerCase();
    const contentType = getContentTypeFromExtension(extension);

    const identifier = image.metadata?.identifier ?? 'unknown';
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cache ? 'public, max-age=31536000' : 'no-cache',
        'X-Identifier': identifier,
      },
    });
  } catch (error) {
    console.error('Failed to download image:', error);
    return context.text('Failed to download image', 500);
  }
}

function getContentTypeFromExtension(extension?: string): string {
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
}
