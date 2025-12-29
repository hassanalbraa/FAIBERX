import { ProductCard } from '@/components/ProductCard';
import { products, type Product } from '@/lib/products';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const metadata = {
  title: 'All Products | Threads of Couture',
  description: 'Browse our full collection of high-end fashion.',
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const category = searchParams['category'] as string | undefined;

  const filteredProducts = category
    ? products.filter(p => p.category === category)
    : products;
    
  const title = category ? `${category} Collection` : 'All Products';

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          {category 
            ? `Explore our curated selection of ${category.toLowerCase()}.`
            : 'Discover the artistry and elegance woven into every piece of our collection.'}
        </p>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
