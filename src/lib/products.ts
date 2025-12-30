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
    {
    id: '1',
    name: 'ت명을 حر',
    description: 'تيشيرت عالي الجودة بتصميم فريد',
    price: 180,
    image: 'https://i.top4top.io/p_3070y1x311.png',
    category: 'T-shirts',
  },
  {
    id: '2',
    name: 'ت명을 حر',
    description: 'تيشيرت مريح وأنيق لكل يوم',
    price: 250,
    image: 'https://i.top4top.io/p_30706e2fh1.png',
    category: 'T-shirts',
  },
  {
    id: '3',
    name: 'هودي الأناقة',
    description: 'هودي دافئ بتصميم عصري',
    price: 350,
    image: 'https://i.top4top.io/p_30706e2fh1.png',
    category: 'Hoodies',
  },
  {
    id: '4',
    name: 'تيشيرت النخبة',
    description: 'تيشيرت فاخر للمناسبات الخاصة',
    price: 450,
    image: 'https://i.top4top.io/p_3070y1x311.png',
    category: 'T-shirts',
  },
];
