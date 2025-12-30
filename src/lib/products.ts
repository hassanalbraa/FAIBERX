import { placeholderImages, type ImagePlaceholder } from './placeholder-images';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'T-shirts' | 'Hoodies';
  sizes?: ('L' | 'XL' | '2XL' | '3XL' | '4XL' | '5XL' | '6XL' | '7XL' | '8XL')[];
  stock?: number;
};

const productPlaceholders = placeholderImages.filter(p => p.id.startsWith('product-'));

function getPlaceholder(id: string): ImagePlaceholder {
    return productPlaceholders.find(p => p.id === id) || { id: '', description: '', imageUrl: '' };
}

// This data is now considered fallback data or for reference,
// as the main source of truth will be Firestore.
export const products: Product[] = [
  
];
