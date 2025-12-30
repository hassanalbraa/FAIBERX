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

// This data is now considered fallback data or for reference,
// as the main source of truth will be Firestore.
export const products: Product[] = [
    {
    id: 'p1',
    name: 'تيشيرت فايبركس الأساسي',
    description: 'تيشيرت قطني 100% عالي الجودة بتصميم كلاسيكي. مثالي للطباعة المخصصة أو للارتداء اليومي.',
    price: 180,
    image: 'https://i.top4top.io/p_3070y1x311.png',
    category: 'T-shirts',
  },
  {
    id: 'p2',
    name: 'تيشيرت فايبركس بريميوم',
    description: 'تيشيرت مصنوع من مزيج قطن وبوليستر فائق النعومة. يوفر راحة لا مثيل لها ومناسب لجميع الأوقات.',
    price: 250,
    image: 'https://i.top4top.io/p_30706e2fh1.png',
    category: 'T-shirts',
  },
  {
    id: 'p3',
    name: 'هودي فايبركس دافئ',
    description: 'هودي مبطن بالصوف الناعم ليوفر لك الدفء في الأيام الباردة. تصميم عصري بجودة عالية.',
    price: 350,
    image: 'https://j.top4top.io/p_3070bdl4x1.png',
    category: 'Hoodies',
  },
  {
    id: 'p4',
    name: 'تيشيرت فايبركس الرياضي',
    description: 'تيشيرت مصمم خصيصًا للأنشطة الرياضية، مصنوع من قماش يسمح بمرور الهواء ويمتص الرطوبة.',
    price: 220,
    image: 'https://i.top4top.io/p_3070y1x311.png',
    category: 'T-shirts',
  },
];
