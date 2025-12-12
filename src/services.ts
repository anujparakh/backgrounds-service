import { ImageResponse, ImageSource, ChromecastImage, Env } from './types';
import imageData from './image-data.json';

// -------------------
// -- IMAGE GETTERS --
// -------------------

export async function getRandomBackgroundImage(
  source: ImageSource,
  env: Env,
): Promise<ImageResponse | null> {
  switch (source) {
    case ImageSource.CHROMECAST: {
      let result: ImageResponse | null = null;
      let attempts = 0;
      const maxAttempts = 10; // Prevent infinite loop

      while (result === null && attempts < maxAttempts) {
        const toReturn = getRandomChromecastImage();
        result = await hydrateImageResponse(toReturn, env);
        attempts++;
      }

      return result;
    }
    default:
      return null;
  }
}

export async function getBackgroundImage(
  source: ImageSource,
  identifier: string,
  env: Env,
): Promise<ImageResponse | null> {
  switch (source) {
    case ImageSource.CHROMECAST: {
      const toReturn = getChromecastImageByIdentifier(identifier);
      return await hydrateImageResponse(toReturn, env);
    }
    default:
      return null;
  }
}

function getBackgroundImageUrl(
  source: ImageSource,
  identifier: string,
  format?: string,
): string | null {
  switch (source) {
    case ImageSource.CHROMECAST:
      return `${HOST_PLACEHOLDER}/chromecast/background-${identifier}.${format || 'jpg'}`;
    default:
      return null;
  }
}

// -----------------------
// -- Chromecast Images --
// -----------------------

function getRandomChromecastImage(): ImageResponse | null {
  const images: ChromecastImage[] = imageData as ChromecastImage[];

  const randomIndex = Math.floor(Math.random() * (images.length - 1));
  const chromecastImage = images[randomIndex]!;

  return getChromecastImage(chromecastImage);
}

function getChromecastImageByIdentifier(identifier: string): ImageResponse | null {
  // Find the image with the matching identifier
  const images: ChromecastImage[] = imageData as ChromecastImage[];
  const chromecastImage = images.find((img) => img.identifier === identifier);

  if (!chromecastImage) {
    return null;
  }

  return getChromecastImage(chromecastImage);
}

function getChromecastImage(chromecastImage: ChromecastImage): ImageResponse | null {
  const imageUrl = getBackgroundImageUrl(
    ImageSource.CHROMECAST,
    chromecastImage.identifier,
    getImageFormat(chromecastImage),
  );

  if (!imageUrl) {
    return null;
  }

  return {
    imageUrl,
    source: ImageSource.CHROMECAST,
    metadata: {
      photographer: chromecastImage.photographer,
      location: chromecastImage.location,
      attribution: 'Chromecast Backgrounds',
      identifier: chromecastImage.identifier,
    },
  };
}

function getImageFormat(chromecastImage: ChromecastImage): string {
  const parts = chromecastImage.filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1]! : 'jpg';
}

// ------------------
// -- Util Methods --
// ------------------

async function hydrateImageResponse(
  imageResponse: ImageResponse | null,
  env: Env,
): Promise<ImageResponse | null> {
  if (imageResponse === null) {
    return null;
  }
  imageResponse.imageUrl = imageResponse.imageUrl.replace(
    HOST_PLACEHOLDER,
    env.BACKGROUND_IMAGES_URL || '',
  );

  // Validate that the URL is reachable and does not 404
  try {
    const response = await fetch(imageResponse.imageUrl, { method: 'HEAD' });
    if (!response.ok) {
      console.error(
        `Image URL validation failed: ${imageResponse.imageUrl} returned status ${response.status}`,
      );
      return null;
    }
  } catch (error) {
    console.error(`Image URL validation failed: ${imageResponse.imageUrl}`, error);
    return null;
  }

  return imageResponse;
}

const HOST_PLACEHOLDER = '{{host}}';
