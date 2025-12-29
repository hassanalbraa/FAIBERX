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
import { Input }s from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Banknote, Upload, FileText } from "lucide-react";
import { useState, useRef } from "react";

const formSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  firstName: z.string().min(1, "الاسم الأول مطلوب"),
  lastName: z.string().min(1, "الاسم الأخير مطلوب"),
  address: z.string().min(1, "العنوان مطلوب"),
  city: z.string().min(1, "المدينة مطلوبة"),
  country: z.string().min(1, "الدولة مطلوبة"),
  whatsappNumber: z.string().min(10, "رقم الواتساب غير صالح ويبدو قصيراً جداً").regex(/^\+?\d{10,}$/, "يجب أن يبدأ الرقم بـ + متبوعًا بمفتاح الدولة أو أن يكون رقمًا محليًا صالحًا."),
});

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      country: "Sudan", // Default country
      whatsappNumber: "+249", // Default country code
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      toast({
        title: "تم اختيار الإشعار",
        description: `تم اختيار الملف: ${file.name}`,
      });
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!receiptFile) {
        toast({
            variant: "destructive",
            title: "لم يتم إرفاق الإشعار",
            description: "يرجى إرفاق إشعار التحويل البنكي للمتابعة.",
        });
        return;
    }
    
    console.log("Mock order placed:", values);
    console.log("Receipt file:", receiptFile.name);
    // In a real app, you would upload the receiptFile here.

    toast({
        title: "تم استلام الطلب!",
        description: "شكرا لك على شرائك. طلبك قيد المراجعة والتحقق من الدفع."
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
                   <CardDescription>أكمل الدفع عبر التحويل البنكي ثم أرفق إشعار التحويل.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="font-semibold">
                                <div className="flex items-center gap-2">
                                    <Banknote className="h-5 w-5"/>
                                    الدفع عن طريق التحويل البنكي
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-2 bg-muted/50 p-4 rounded-md">
                                <p className="text-sm">يرجى تحويل المبلغ الإجمالي إلى الحساب التالي:</p>
                                <div className="font-mono bg-background p-3 rounded-md text-center">
                                    <p><span className="font-semibold">اسم الحساب:</span> يوسف عصام</p>
                                    <p><span className="font-semibold">رقم الحساب:</span> 8312783</p>
                                    <p><span className="font-semibold">البنك:</span> بنكك</p>
                                </div>
                                <p className="text-xs text-muted-foreground pt-2">بعد التحويل، يرجى إرفاق صورة من إشعار الدفع أدناه لإكمال طلبك.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,application/pdf"
                    />
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="ml-2 h-4 w-4" />
                        إرفاق إشعار التحويل
                    </Button>
                    {receiptFile && (
                        <div className="flex items-center justify-center text-sm text-green-600 border border-green-200 bg-green-50 p-3 rounded-md">
                            <FileText className="ml-2 h-4 w-4" />
                            <span>تم اختيار الملف: {receiptFile.name}</span>
                        </div>
                    )}
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
