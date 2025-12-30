"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Banknote, Loader2 } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc, addDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  firstName: z.string().min(1, "الاسم الأول مطلوب"),
  lastName: z.string().min(1, "الاسم الأخير مطلوب"),
  address: z.string().min(1, "العنوان مطلوب"),
  city: z.string().min(1, "المدينة مطلوبة"),
  country: z.string().min(1, "الدولة مطلوبة"),
  whatsappNumber: z.string().min(10, "رقم الواتساب غير صالح ويبدو قصيراً جداً").regex(/^\+?\d{10,}$/, "يجب أن يبدأ الرقم بـ + متبوعًا بمفتاح الدولة أو أن يكون رقمًا محليًا صالحًا."),
  transactionId: z.string().min(4, "رقم العملية مطلوب ويبدو قصيراً جداً"),
});

type UserProfile = {
  firstName?: string;
  lastName?: string;
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || "",
      firstName: "",
      lastName: "",
      address: "",
      city: "الخرطوم",
      country: "Sudan",
      whatsappNumber: "+249",
      transactionId: "",
    },
  });

  useEffect(() => {
    if (userProfile) {
        form.reset({
            ...form.getValues(),
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            email: user?.email || '',
        });
    }
  }, [userProfile, user, form]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        title: "يرجى تسجيل الدخول",
        description: "يجب عليك تسجيل الدخول للمتابعة إلى الدفع.",
        variant: 'destructive'
      });
      router.push('/login?redirect=/checkout');
    }
  }, [isUserLoading, user, router, toast]);

  useEffect(() => {
    if (!isUserLoading && cartItems.length === 0) {
      router.push('/cart');
    }
  }, [isUserLoading, cartItems.length, router]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "خطأ في المصادقة",
            description: "يجب أن تكون مسجلاً للدخول لإتمام الطلب.",
        });
        return;
    }

    setIsSubmitting(true);

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
            size: item.size || "",
        })),
        shippingAddress: {
            name: `${values.firstName} ${values.lastName}`,
            email: values.email,
            address: values.address,
            city: values.city,
            country: values.country,
            whatsappNumber: values.whatsappNumber,
        },
        payment: {
            method: 'Bank Transfer',
            transactionId: values.transactionId,
        },
        subTotal: cartTotal,
        shippingCost: 0, // To be calculated later
        total: cartTotal, // For now, total is same as subtotal
    };

    try {
        const ordersCollection = collection(firestore, 'orders');
        const docRef = await addDoc(ordersCollection, orderData);

        toast({
            title: "تم استلام الطلب!",
            description: "شكرا لك على شرائك. طلبك قيد المراجعة والتحقق من الدفع."
        });

        clearCart();
        router.push(`/account/orders/${docRef.id}`);

    } catch (error) {
        console.error("Error placing order:", error);
        toast({
            variant: "destructive",
            title: "حدث خطأ",
            description: "فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.",
        });
        setIsSubmitting(false);
    }
  }

  if (isUserLoading || !user || cartItems.length === 0) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">الدفع</h1>
      </div>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-20 rounded-md overflow-hidden">
                        <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="64px"/>
                      </div>
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>الكمية: {item.quantity}</span>
                            <Badge variant="secondary">مقاس: {item.size}</Badge>
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
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الشحن</CardTitle>
                  <CardDescription>أدخل عنوان الشحن الخاص بك.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem className="flex-1"><FormLabel>الاسم الأول</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem className="flex-1"><FormLabel>الاسم الأخير</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  </div>
                   <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>العنوان</FormLabel><FormControl><Input placeholder="مثال: الخرطوم، شارع أفريقيا، مبنى رقم 5" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <div className="flex gap-4">
                     <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem className="flex-1"><FormLabel>المدينة</FormLabel><FormControl><Input placeholder="الخرطوم" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="country" render={({ field }) => (
                      <FormItem className="flex-1"><FormLabel>الدولة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  </div>
                   <FormField control={form.control} name="whatsappNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم واتساب (مع مفتاح الدولة)</FormLabel>
                        <FormControl><Input placeholder="+249912345678" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل الدفع</CardTitle>
                   <CardDescription>أكمل الدفع عبر التحويل البنكي ثم أدخل رقم العملية.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="font-semibold">
                                <div className="flex items-center gap-2">
                                    <Banknote className="h-5 w-5"/>
                                    الدفع عن طريق بنكك
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-2 bg-muted/50 p-4 rounded-md">
                                <p className="text-sm">يرجى تحويل المبلغ الإجمالي إلى الحساب التالي:</p>
                                <div className="font-mono bg-background p-3 rounded-md text-center">
                                    <p><span className="font-semibold">اسم الحساب:</span> يوسف عصام</p>
                                    <p><span className="font-semibold">رقم الحساب:</span> 8312783</p>
                                </div>
                                <p className="text-xs text-muted-foreground pt-2">بعد التحويل، يرجى إدخال رقم العملية في الحقل أدناه لإكمال طلبك.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    
                    <FormField control={form.control} name="transactionId" render={({ field }) => (
                        <FormItem>
                            <FormLabel>رقم العملية</FormLabel>
                            <FormControl>
                                <Input placeholder="أدخل رقم العملية هنا..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>

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
