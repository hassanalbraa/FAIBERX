import { placeholderImages, type ImagePlaceholder } from './placeholder-images';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Accessories';
  imageHint: string;
};

const productPlaceholders = placeholderImages.filter(p => p.id.startsWith('product-'));

function getPlaceholder(id: string): ImagePlaceholder {
    return productPlaceholders.find(p => p.id === id) || { id: '', description: '', imageUrl: '', imageHint: '' };
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Ethereal Silk Blouse',
    description: 'A classic silk blouse with a modern twist, featuring a delicate ruffled collar and pearlescent buttons. Perfect for both office and evening wear.',
    price: 180.00,
    image: getPlaceholder('product-1').imageUrl,
    imageHint: getPlaceholder('product-1').imageHint,
    category: 'Tops',
  },
  {
    id: '2',
    name: 'Savile Row Trousers',
    description: 'Expertly tailored high-waisted trousers in a rich navy blue. The wide-leg cut offers a flattering silhouette that elongates the legs.',
    price: 250.00,
    image: getPlaceholder('product-2').imageUrl,
    imageHint: getPlaceholder('product-2').imageHint,
    category: 'Bottoms',
  },
  {
    id: '3',
    name: 'Monet\'s Garden Midi Skirt',
    description: 'An elegant A-line midi skirt adorned with a vibrant floral pattern reminiscent of an impressionist painting. Features a concealed side zipper.',
    price: 220.00,
    image: getPlaceholder('product-3').imageUrl,
    imageHint: getPlaceholder('product-3').imageHint,
    category: 'Bottoms',
  },
  {
    id: '4',
    name: 'London Fog Trench Coat',
    description: 'A timeless double-breasted trench coat in a versatile beige. Crafted from water-resistant cotton gabardine with a detachable belt.',
    price: 450.00,
    image: getPlaceholder('product-4').imageUrl,
    imageHint: getPlaceholder('product-4').imageHint,
    category: 'Outerwear',
  },
  {
    id: '5',
    name: 'Himalayan Cashmere Sweater',
    description: 'Indulge in the unparalleled softness of this luxurious cashmere sweater. The relaxed fit and classic crew neck make it a wardrobe staple.',
    price: 320.00,
    image: getPlaceholder('product-5').imageUrl,
    imageHint: getPlaceholder('product-5').imageHint,
    category: 'Tops',
  },
  {
    id: '6',
    name: 'Midnight Gala Gown',
    description: 'A show-stopping evening gown featuring intricate sequin details on a form-fitting silhouette with a graceful train.',
    price: 750.00,
    image: getPlaceholder('product-6').imageUrl,
    imageHint: getPlaceholder('product-6').imageHint,
    category: 'Dresses',
  },
  {
    id: '7',
    name: 'Milano Leather Tote',
    description: 'A structured and spacious tote bag crafted from premium Italian leather. Features multiple compartments to keep you organized.',
    price: 400.00,
    image: getPlaceholder('product-7').imageUrl,
    imageHint: getPlaceholder('product-7').imageHint,
    category: 'Accessories',
  },
  {
    id: '8',
    name: 'Femme Fatale Stilettos',
    description: 'A pair of sophisticated pointed-toe stiletto heels in classic black patent leather. The perfect finishing touch to any elegant outfit.',
    price: 350.00,
    image: getPlaceholder('product-8').imageUrl,
    imageHint: getPlaceholder('product-8').imageHint,
    category: 'Accessories',
  },
];
