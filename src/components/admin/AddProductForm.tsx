'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, 'يجب أن يكون الاسم 3 أحرف على الأقل'),
  description: z.string().min(10, 'يجب أن يكون الوصف 10 أحرف على الأقل'),
  price: z.coerce.number().positive('يجب أن يكون السعر رقمًا موجبًا'),
  category: z.enum(['T-shirts', 'Hoodies']),
  image: z.string().url('يجب أن يكون عنوان URL صالحًا للصورة'),
  stock: z.coerce.number().int().nonnegative('يجب أن يكون المخزون رقمًا صحيحًا غير سالب'),
});

export default function AddProductForm() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: 'T-shirts',
      image: '',
      stock: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    setIsSubmitting(true);
    
    try {
      const productsCollection = collection(firestore, 'products');
      await addDocumentNonBlocking(productsCollection, values);
      
      toast({
        title: 'تمت إضافة المنتج بنجاح!',
        description: `تمت إضافة "${values.name}" إلى المتجر.`,
      });
      form.reset();
    } catch (error) {
      console.error('Error adding product: ', error);
      toast({
        title: 'حدث خطأ',
        description: 'فشل في إضافة المنتج. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المنتج</FormLabel>
              <FormControl>
                <Input placeholder="مثال: تيشيرت قطني" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الوصف</FormLabel>
              <FormControl>
                <Textarea placeholder="وصف تفصيلي للمنتج..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
            <FormItem>
            <FormLabel>سعر البيع</FormLabel>
            <FormControl>
                <Input type="number" placeholder="150" {...field} />
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
        />
         <div className="flex gap-4">
            <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
                <FormItem className='flex-1'>
                <FormLabel>المخزون</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem className='flex-1'>
                <FormLabel>الفئة</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="اختر فئة" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="T-shirts">تشيرتات</SelectItem>
                    <SelectItem value="Hoodies">هودي</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رابط الصورة</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            إضافة المنتج
        </Button>
      </form>
    </Form>
  );
}
