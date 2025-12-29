import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  url?: string;
};

export const placeholderImages: ImagePlaceholder[] = (data as any).placeholderImages || [];
