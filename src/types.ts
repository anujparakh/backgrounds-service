export enum ImageSource {
  CHROMECAST = 'chromecast',
  APPLE = 'apple',
}

export type ImageResponse = {
  imageUrl: string;
  source: ImageSource;
  metadata?: Record<string, string>;
};

export type Env = {
  BACKGROUND_IMAGES_URL?: string;
  BACKGROUND_VIDEOS_URL?: string;
};

export interface ChromecastImage {
  filename: string;
  photographer: string;
  location: string;
  identifier: string;
  // Uncomment to use additional fields from the original dataset
  // original_url: string;
  // download_url: string;
  // gplus: string;
}

export interface VideoData {
  filename: string;
}
