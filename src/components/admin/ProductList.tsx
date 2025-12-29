'use client';

import type { Product } from '@/lib/products';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleDelete = (productId: string, productName: string) => {
        if (!firestore) return;
        if (confirm(`هل أنت متأكد أنك تريد حذف المنتج "${productName}"؟`)) {
            const productRef = doc(firestore, 'products', productId);
            // This function is non-blocking and will update the UI through the real-time listener.
            deleteDocumentNonBlocking(productRef); 
            toast({
                title: "تم حذف المنتج",
                description: `تم حذف "${productName}" بنجاح.`
            });
        }
    }

    const handleEdit = () => {
      toast({
        title: "قيد التطوير",
        description: "ميزة تعديل المنتج ستكون متاحة قريباً.",
      })
    }

  if (products.length === 0) {
    return <p className="text-muted-foreground text-center">لا توجد منتجات حتى الآن. أضف منتجك الأول!</p>;
  }

  const getCategoryArabicName = (category: string | undefined) => {
    switch (category) {
      case 'T-shirts': return 'تشيرتات';
      case 'Hoodies': return 'هودي';
      default: return '';
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden w-[100px] sm:table-cell">
            <span className="sr-only">الصورة</span>
          </TableHead>
          <TableHead>الاسم</TableHead>
          <TableHead>الفئة</TableHead>
          <TableHead className="hidden md:table-cell">السعر</TableHead>
          <TableHead className="hidden md:table-cell">المخزون</TableHead>
          <TableHead>
            <span className="sr-only">الإجراءات</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="hidden sm:table-cell">
              <Image
                alt={product.name}
                className="aspect-square rounded-md object-cover"
                height="64"
                src={product.image}
                width="64"
              />
            </TableCell>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{getCategoryArabicName(product.category)}</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">{product.price.toFixed(2)} SDG</TableCell>
            <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
            <TableCell>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">قائمة الإجراءات</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleEdit}>
                        <Pencil className="h-4 w-4 ml-2" />
                        تعديل
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(product.id, product.name)}>
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
