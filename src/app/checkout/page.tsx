'use client';

import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, addDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import { Loader2, Banknote } from "lucide-react";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  whatsappNumber: z.string().min(10),
  transactionId: z.string().min(4),
  savedAddressId: z.string().optional(),
});

type UserProfile = { firstName?: string; lastName?: string };
type Address = { id: string; firstName: string; lastName: string; address: string; city: string; country: string; whatsappNumber: string };

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const userDocRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const addressesCollectionRef = useMemoFirebase(() => (firestore && user ? collection(firestore, 'users', user.uid, 'addresses') : null), [firestore, user]);
  const { data: savedAddresses, isLoading: isAddressesLoading } = useCollection<Address>(addressesCollectionRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: user?.email || "", firstName: "", lastName: "", address: "", city: "الخرطوم", country: "Sudan", whatsappNumber: "+249", transactionId: "" },
  });

  useEffect(() => {
    if (userProfile && !form.getValues('firstName')) {
      form.reset({ ...form.getValues(), firstName: userProfile.firstName || '', lastName: userProfile.lastName || '', email: user?.email || '' });
    }
  }, [userProfile, user, form]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({ title: "يرجى تسجيل الدخول", description: "يجب تسجيل الدخول للمتابعة.", variant: 'destructive' });
      router.push('/login?redirect=/checkout');
    }
  }, [isUserLoading, user, router, toast]);

  useEffect(() => {
    setShowNewAddressForm(!savedAddresses || savedAddresses.length === 0);
  }, [savedAddresses]);

  const handleAddressSelection = (addressId: string) => {
    form.setValue('savedAddressId', addressId);
    if (addressId === 'new') {
      setShowNewAddressForm(true);
      form.reset({ ...form.getValues(), firstName: userProfile?.firstName || "", lastName: userProfile?.lastName || "", address: "", city: "الخرطوم", whatsappNumber: "+249" });
      return;
    }
    setShowNewAddressForm(false);
    const selectedAddress = savedAddresses?.find(addr => addr.id === addressId);
    if (selectedAddress) {
      form.reset({ ...form.getValues(), firstName: selectedAddress.firstName, lastName: selectedAddress.lastName, address: selectedAddress.address, city: selectedAddress.city, country: selectedAddress.country, whatsappNumber: selectedAddress.whatsappNumber });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'خطأ داخلي', description: 'المستخدم أو الخدمة غير جاهزين' });
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      toast({ variant: 'destructive', title: 'السلة فارغة', description: 'لا يمكنك إتمام الدفع بدون منتجات' });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting order...', { user, cartItems, values });

      // حفظ العنوان لو جديد
      if (showNewAddressForm) {
        const addressesRef = collection(firestore, 'users', user.uid, 'addresses');
        await addDoc(addressesRef, {
          firstName: values.firstName,
          lastName: values.lastName,
          address: values.address,
          city: values.city,
          country: values.country,
          whatsappNumber: values.whatsappNumber,
          createdAt: serverTimestamp(),
        });
      }

      const orderData = {
        userId: user.uid,
        createdAt: serverTimestamp(),
        status: 'Order Placed' as const,
        items: cartItems.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image,
          quantity: item.quantity,
          price: item.product.price,
          size: item.size || "افتراضي",
        })),
        shippingAddress: {
          name: `${values.firstName} ${values.lastName}`,
          email: values.email,
          address: values.address,
          city: values.city,
          country: values.country,
          whatsappNumber: values.whatsappNumber,
        },
        payment: { method: 'Bank Transfer', transactionId: values.transactionId },
        subTotal: cartTotal,
        shippingCost: 0,
        total: cartTotal,
      };

      // إضافة الطلب عند المستخدم
      const userOrdersCollection = collection(firestore, 'users', user.uid, 'orders');
      const docRef = await addDoc(userOrdersCollection, orderData);

      // إضافة نسخة في الجذر للأدمن
      const rootOrdersCollection = collection(firestore, 'orders');
      await addDoc(rootOrdersCollection, { ...orderData, userRef: docRef.id });

      toast({ title: "تم استلام الطلب!", description: "شكراً لك. طلبك قيد المراجعة." });
      clearCart();
      router.push(`/order-success?orderId=${docRef.id}`);
    } catch (error) {
      console.error('🔥 ORDER ERROR:', error);
      toast({ variant: "destructive", title: "حدث خطأ", description: "فشل في إرسال الطلب. حاول مرة أخرى." });
    } finally { setIsSubmitting(false); }
  }

  if (isUserLoading || !user || cartItems.length === 0 || (user && isAddressesLoading)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12"><h1 className="font-headline text-4xl md:text-5xl font-bold">الدفع</h1></div>
      <div className="grid lg:grid-cols-2 gap-12">
        {/* ملخص الطلب */}
        <div>
          <Card className="mb-8">
            <CardHeader><CardTitle>ملخص الطلب</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-20 rounded-md overflow-hidden">
                        <Image
                          src={item.product.image || '/placeholder.png'}
                          alt={item.product.name || 'product'}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>الكمية: {item.quantity}</span>
                          {item.size && <Badge variant="secondary">مقاس: {item.size}</Badge>}
                        </div>
                      </div>
                    </div>
                    <p className="font-semibold">{(item.product.price * item.quantity).toFixed(2)} SDG</p>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between"><span>المجموع الفرعي</span><span>{cartTotal.toFixed(2)} SDG</span></div>
                <div className="flex justify-between"><span>الشحن</span><span>حسب المكان</span></div>
                <div className="flex justify-between font-bold text-lg"><span>الإجمالي</span><span>{cartTotal.toFixed(2)} SDG</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* فورم الدفع */}
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* عنوان الشحن */}
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الشحن</CardTitle>
                  <CardDescription>اختر عنوان محفوظ أو أدخل عنوان جديد.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {savedAddresses && savedAddresses.length > 0 && (
                    <FormField control={form.control} name="savedAddressId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>اختر عنوان</FormLabel>
                        <Select onValueChange={handleAddressSelection} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="اختر من عناوينك..." /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {savedAddresses.map(addr => (<SelectItem key={addr.id} value={addr.id}>{addr.address}, {addr.city}</SelectItem>))}
                            <SelectItem value="new">-- إضافة عنوان جديد --</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  )}
                  {showNewAddressForm && (
                    <div className="space-y-4 pt-4 border-t border-dashed">
                      <div className="flex gap-4">
                        <FormField control={form.control} name="firstName" render={({ field }) => <FormItem className="flex-1"><FormLabel>الاسم الأول</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="lastName" render={({ field }) => <FormItem className="flex-1"><FormLabel>الاسم الأخير</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                      </div>
                      <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>البريد الإلكتروني</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                      <FormField control={form.control} name="address" render={({ field }) => <FormItem><FormLabel>العنوان</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                      <div className="flex gap-4">
                        <FormField control={form.control} name="city" render={({ field }) => <FormItem className="flex-1"><FormLabel>المدينة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="country" render={({ field }) => <FormItem className="flex-1"><FormLabel>الدولة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                      </div>
                      <FormField control={form.control} name="whatsappNumber" render={({ field }) => <FormItem><FormLabel>رقم واتساب</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* الدفع */}
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل الدفع</CardTitle>
                  <CardDescription>أكمل التحويل البنكي ثم أدخل رقم العملية.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="font-semibold flex items-center gap-2"><Banknote className="h-5 w-5"/> الدفع عن طريق بنكك</AccordionTrigger>
                      <AccordionContent className="pt-4 space-y-2 bg-muted/50 p-4 rounded-md">
                        <p className="text-sm">يرجى تحويل المبلغ إلى الحساب التالي:</p>
                        <div className="font-mono bg-background p-3 rounded-md text-center">
                          <p><span className="font-semibold">اسم الحساب:</span> يوسف عصام</p>
                          <p><span className="font-semibold">رقم الحساب:</span> 8312783</p>
                        </div>
                        <p className="text-xs text-muted-foreground pt-2">بعد التحويل، أدخل رقم العملية لإتمام الطلب.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <FormField control={form.control} name="transactionId" render={({ field }) => <FormItem><FormLabel>رقم العملية</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "إتمام الطلب"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
