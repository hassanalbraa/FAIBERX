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
import { MoreHorizontal, Trash2, Pencil, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFirestore, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(3, 'يجب أن يكون الاسم 3 أحرف على الأقل'),
  description: z.string().min(10, 'يجب أن يكون الوصف 10 أحرف على الأقل'),
  price: z.coerce.number().positive('يجب أن يكون السعر رقمًا موجبًا'),
  category: z.enum(['T-shirts', 'Hoodies']),
  image: z.string().url('يجب أن يكون عنوان URL صالحًا للصورة'),
  stock: z.coerce.number().int().nonnegative('يجب أن يكون المخزون رقمًا صحيحًا غير سالب'),
});

function EditProductDialog({ product, children }: { product: Product, children: React.ReactNode }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            image: product.image,
            stock: product.stock || 0,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore) return;
        setIsSubmitting(true);

        try {
            const productRef = doc(firestore, 'products', product.id);
            await updateDocumentNonBlocking(productRef, values);

            toast({
                title: 'تم تحديث المنتج بنجاح!',
                description: `تم تحديث "${values.name}".`,
            });
            setIsOpen(false); // Close dialog on success
        } catch (error) {
            console.error('Error updating product: ', error);
            toast({
                title: 'حدث خطأ',
                description: 'فشل في تحديث المنتج. يرجى المحاولة مرة أخرى.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>تعديل المنتج</DialogTitle>
                    <DialogDescription>
                        قم بتحديث تفاصيل المنتج أدناه.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>اسم المنتج</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>الوصف</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem><FormLabel>سعر البيع</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="flex gap-4">
                            <FormField control={form.control} name="stock" render={({ field }) => (
                                <FormItem className='flex-1'><FormLabel>المخزون</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem className='flex-1'><FormLabel>الفئة</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="T-shirts">تشيرتات</SelectItem>
                                            <SelectItem value="Hoodies">هودي</SelectItem>
                                        </SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="image" render={({ field }) => (
                            <FormItem><FormLabel>رابط الصورة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                حفظ التغييرات
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

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
            deleteDocumentNonBlocking(productRef); 
            toast({
                title: "تم حذف المنتج",
                description: `تم حذف "${productName}" بنجاح.`
            });
        }
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
          <TableHead className="hidden md:table-cell">البيع</TableHead>
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
                     <EditProductDialog product={product}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="h-4 w-4 ml-2" />
                            تعديل
                        </DropdownMenuItem>
                    </EditProductDialog>
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
