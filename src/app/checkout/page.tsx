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

const formSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  firstName: z.string().min(1, "الاسم الأول مطلوب"),
  lastName: z.string().min(1, "الاسم الأخير مطلوب"),
  address: z.string().min(1, "العنوان مطلوب"),
  city: z.string().min(1, "المدينة مطلوبة"),
  zip: z.string().min(1, "الرمز البريدي مطلوب"),
  country: z.string().min(1, "الدولة مطلوبة"),
  cardName: z.string().min(1, "الاسم على البطاقة مطلوب"),
  cardNumber: z.string().regex(/^\d{16}$/, "يجب أن يتكون رقم البطاقة من 16 رقمًا"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "يجب أن يكون تاريخ انتهاء الصلاحية بتنسيق MM/YY"),
  cvc: z.string().regex(/^\d{3,4}$/, "يجب أن يتكون CVC من 3 أو 4 أرقام"),
});

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      zip: "",
      country: "",
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvc: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Mock order placed:", values);
    toast({
        title: "تم استلام الطلب!",
        description: "شكرا لك على شرائك. طلبك قيد المعالجة."
    });
    const mockOrderId = "TOC" + Math.floor(Math.random() * 90000) + 10000;
    clearCart();
    router.push(`/orders/${mockOrderId}`);
  }

  if (cartItems.length === 0 && typeof window !== 'undefined') {
    router.push('/cart');
    return null;
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
                  <div key={item.product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-20 rounded-md overflow-hidden">
                        <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="64px"/>
                      </div>
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">{(item.product.price * item.quantity).toFixed(2)} جنيه</p>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between"><span>المجموع الفرعي</span><span>{cartTotal.toFixed(2)} جنيه</span></div>
                <div className="flex justify-between"><span>الشحن</span><span>مجاني</span></div>
                <div className="flex justify-between font-bold text-lg"><span>الإجمالي</span><span>{cartTotal.toFixed(2)} جنيه</span></div>
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
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <div className="flex gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem className="flex-1"><FormLabel>الاسم الأول</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem className="flex-1"><FormLabel>الاسم الأخير</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  </div>
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>العنوان</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <div className="flex gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem className="flex-1"><FormLabel>المدينة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="zip" render={({ field }) => (
                      <FormItem className="w-1/3"><FormLabel>الرمز البريدي</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  </div>
                   <FormField control={form.control} name="country" render={({ field }) => (
                      <FormItem><FormLabel>الدولة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل الدفع</CardTitle>
                   <CardDescription>هذا دفع وهمي. لا تستخدم تفاصيل بطاقة حقيقية.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="cardName" render={({ field }) => (
                    <FormItem><FormLabel>الاسم على البطاقة</FormLabel><FormControl><Input placeholder="John M. Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="cardNumber" render={({ field }) => (
                    <FormItem><FormLabel>رقم البطاقة</FormLabel><FormControl><Input placeholder="1111222233334444" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                   <div className="flex gap-4">
                    <FormField control={form.control} name="expiryDate" render={({ field }) => (
                      <FormItem className="flex-1"><FormLabel>انتهاء الصلاحية (MM/YY)</FormLabel><FormControl><Input placeholder="12/25" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="cvc" render={({ field }) => (
                      <FormItem className="w-1/3"><FormLabel>CVC</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">إتمام الطلب</Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
