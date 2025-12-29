import { placeholderImages, type ImagePlaceholder } from './placeholder-images';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Accessories';
  imageHint: string;
  stock?: number;
};

const productPlaceholders = placeholderImages.filter(p => p.id.startsWith('product-'));

function getPlaceholder(id: string): ImagePlaceholder {
    return productPlaceholders.find(p => p.id === id) || { id: '', description: '', imageUrl: '', imageHint: '' };
}

// This data is now considered fallback data or for reference,
// as the main source of truth will be Firestore.
export const products: Product[] = [
  {
    id: '1',
    name: 'بلوزة حرير أثيرية',
    description: 'بلوزة حريرية كلاسيكية بلمسة عصرية، تتميز بياقة مكشكشة رقيقة وأزرار لؤلؤية. مثالية للعمل والسهرات.',
    price: 180.00,
    image: getPlaceholder('product-1').imageUrl,
    imageHint: getPlaceholder('product-1').imageHint,
    category: 'Tops',
  },
  {
    id: '2',
    name: 'بنطلون سافيل رو',
    description: 'بنطلون مصمم بخبرة بخصر عالٍ بلون كحلي غني. يوفر القص الواسع صورة ظلية جذابة تطيل الساقين.',
    price: 250.00,
    image: getPlaceholder('product-2').imageUrl,
    imageHint: getPlaceholder('product-2').imageHint,
    category: 'Bottoms',
  },
  {
    id: '3',
    name: 'تنورة ميدي حديقة مونيه',
    description: 'تنورة ميدي أنيقة على شكل حرف A مزينة بنقشة زهور نابضة بالحياة تذكرنا بلوحة انطباعية. تتميز بسحاب جانبي مخفي.',
    price: 220.00,
    image: getPlaceholder('product-3').imageUrl,
    imageHint: getPlaceholder('product-3').imageHint,
    category: 'Bottoms',
  },
  {
    id: '4',
    name: 'معطف ترنش ضباب لندن',
    description: 'معطف ترنش مزدوج الصدر لا يتأثر بمرور الزمن بلون بيج متعدد الاستخدامات. مصنوع من قطن الجبردين المقاوم للماء مع حزام قابل للفصل.',
    price: 450.00,
    image: getPlaceholder('product-4').imageUrl,
    imageHint: getPlaceholder('product-4').imageHint,
    category: 'Outerwear',
  },
  {
    id: '5',
    name: 'سترة كشمير هيمالايا',
    description: 'انغمس في نعومة لا مثيل لها مع سترة الكشمير الفاخرة هذه. المقاس المريح والرقبة الدائرية الكلاسيكية تجعلها قطعة أساسية في خزانة الملابس.',
    price: 320.00,
    image: getPlaceholder('product-5').imageUrl,
    imageHint: getPlaceholder('product-5').imageHint,
    category: 'Tops',
  },
  {
    id: '6',
    name: 'فستان حفل منتصف الليل',
    description: 'فستان سهرة يخطف الأنظار يتميز بتفاصيل ترتر معقدة على صورة ظلية ملائمة للجسم مع ذيل رشيق.',
    price: 750.00,
    image: getPlaceholder('product-6').imageUrl,
    imageHint: getPlaceholder('product-6').imageHint,
    category: 'Dresses',
  },
  {
    id: '7',
    name: 'حقيبة يد جلدية ميلانو',
    description: 'حقيبة يد واسعة ومنظمة مصنوعة من جلد إيطالي فاخر. تتميز بأقسام متعددة للحفاظ على تنظيمك.',
    price: 400.00,
    image: getPlaceholder('product-7').imageUrl,
    imageHint: getPlaceholder('product-7').imageHint,
    category: 'Accessories',
  },
  {
    id: '8',
    name: 'حذاء بكعب عالٍ فام فاتال',
    description: 'زوج من الأحذية ذات الكعب العالي المدبب المتطور من الجلد الأسود اللامع الكلاسيكي. اللمسة النهائية المثالية لأي زي أنيق.',
    price: 350.00,
    image: getPlaceholder('product-8').imageUrl,
    imageHint: getPlaceholder('product-8').imageHint,
    category: 'Accessories',
  },
];
