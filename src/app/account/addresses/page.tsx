'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, PlusCircle, Trash2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const addressSchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب"),
  lastName: z.string().min(1, "الاسم الأخير مطلوب"),
  address: z.string().min(1, "العنوان مطلوب"),
  city: z.string().min(1, "المدينة مطلوبة"),
  country: z.string().min(1, "الدولة مطلوبة"),
  whatsappNumber: z.string().min(10, "رقم الواتساب غير صالح").regex(/^\+?\d{10,}$/, "يجب أن يبدأ الرقم بـ + متبوعًا بمفتاح الدولة"),
});

type Address = z.infer<typeof addressSchema> & { id: string };

function AddressForm({ onFormSubmit, isSubmitting }: { onFormSubmit: (values: z.infer<typeof addressSchema>) => void, isSubmitting: boolean }) {
  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      city: "الخرطوم",
      country: "Sudan",
      whatsappNumber: "+249",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
        <div className="flex gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem className="flex-1"><FormLabel>الاسم الأول</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem className="flex-1"><FormLabel>الاسم الأخير</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem><FormLabel>العنوان</FormLabel><FormControl><Input placeholder="الحي، الشارع، رقم المنزل" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex gap-4">
          <FormField control={form.control} name="city" render={({ field }) => (
            <FormItem className="flex-1"><FormLabel>المدينة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="country" render={({ field }) => (
            <FormItem className="flex-1"><FormLabel>الدولة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="whatsappNumber" render={({ field }) => (
          <FormItem><FormLabel>رقم واتساب</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
          حفظ العنوان
        </Button>
      </form>
    </Form>
  );
}


export default function AddressesPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/account/addresses');
    }
  }, [user, isUserLoading, router]);

  const addressesQuery = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return query(collection(firestore, 'users', user.uid, 'addresses'));
  }, [firestore, user]);

  const { data: addresses, isLoading: isAddressesLoading, error } = useCollection<Address>(addressesQuery);

  const handleAddAddress = (values: z.infer<typeof addressSchema>) => {
    if (!firestore || !user) return;
    const addressesCollectionRef = collection(firestore, 'users', user.uid, 'addresses');
    setIsSubmitting(true);

    addDocumentNonBlocking(addressesCollectionRef, values)
      .then(() => {
        toast({ title: "تم إضافة العنوان بنجاح" });
      })
      .catch((error) => {
        // This catch is for other potential network errors, etc.
        // The permission error is already handled globally.
        console.error("Failed to add address:", error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDeleteAddress = (addressId: string) => {
    if (!firestore || !user) return;
    const addressRef = doc(firestore, 'users', user.uid, 'addresses', addressId);
    
    deleteDocumentNonBlocking(addressRef);
    toast({ title: "تم حذف العنوان بنجاح", variant: "destructive" });
  };
  
  const isLoading = isUserLoading || (user && isAddressesLoading);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold flex items-center gap-4">
          <MapPin className="h-10 w-10" />
          العناوين المحفوظة
        </h1>
        <p className="text-muted-foreground mt-2">إدارة عناوين الشحن الخاصة بك لتسهيل عملية الدفع.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>إضافة عنوان جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressForm onFormSubmit={handleAddAddress} isSubmitting={isSubmitting} />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>قائمة العناوين</CardTitle>
                    <CardDescription>
                        {isLoading ? "جاري تحميل العناوين..." : `لديك ${addresses?.length || 0} عناوين محفوظة.`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="flex justify-center items-center h-40">
                             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                         </div>
                    ) : error ? (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg text-destructive">
                            <p>خطا في تحميل العناوين</p>
                        </div>
                    ) : addresses && addresses.length > 0 ? (
                        <div className="space-y-4">
                            {addresses.map(address => (
                                <div key={address.id} className="border rounded-lg p-4 flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{address.firstName} {address.lastName}</p>
                                        <p className="text-sm text-muted-foreground">{address.address}</p>
                                        <p className="text-sm text-muted-foreground">{address.city}, {address.country}</p>
                                        <p className="text-sm text-muted-foreground mt-1">واتساب: {address.whatsappNumber}</p>
                                    </div>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف هذا العنوان بشكل دائم.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteAddress(address.id)}>
                                            حذف
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>

                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">لا توجد عناوين محفوظة حتى الآن.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
