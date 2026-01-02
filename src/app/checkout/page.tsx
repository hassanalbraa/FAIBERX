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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Banknote, Loader2 } from "lucide-react";
import {
  useUser,
  useFirestore,
  useDoc,
  useCollection,
  useMemoFirebase,
} from "@/firebase";
import {
  collection,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

/* ---------------- schema ---------------- */

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

type UserProfile = {
  firstName?: string;
  lastName?: string;
};

type Address = {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
  whatsappNumber: string;
};

/* ---------------- page ---------------- */

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(true);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const addressesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users", user.uid, "addresses");
  }, [firestore, user]);

  const { data: savedAddresses } =
    useCollection<Address>(addressesRef);

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
      form.setValue("firstName", userProfile.firstName || "");
      form.setValue("lastName", userProfile.lastName || "");
    }
  }, [userProfile, form]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [isUserLoading, user, router]);

  /* ---------------- submit ---------------- */

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) return;

    setIsSubmitting(true);

    const orderId = crypto.randomUUID();

    const orderData = {
      orderId,
      userId: user.uid,
      createdAt: serverTimestamp(),
      status: "Order Placed",
      items: cartItems.map((item) => ({
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
      payment: {
        method: "Bank Transfer",
        transactionId: values.transactionId,
      },
      subTotal: cartTotal,
      shippingCost: 0,
      total: cartTotal,
    };

    try {
      // 🔥 orders في الجذر
      await setDoc(
        doc(firestore, "orders", orderId),
        orderData
      );

      // 🔥 orders داخل المستخدم
      await setDoc(
        doc(firestore, "users", user.uid, "orders", orderId),
        orderData
      );

      toast({
        title: "تم استلام الطلب",
        description: "طلبك قيد المراجعة",
      });

      clearCart();
      router.push(`/order-success?orderId=${orderId}`);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل إرسال الطلب",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ---------------- loading ---------------- */

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-10">
        إتمام الدفع
      </h1>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* -------- summary -------- */}
        <Card>
          <CardHeader>
            <CardTitle>ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center"
              >
                <div className="flex gap-4">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    width={60}
                    height={80}
                  />
                  <div>
                    <p className="font-semibold">
                      {item.product.name}
                    </p>
                    <Badge>الكمية: {item.quantity}</Badge>
                  </div>
                </div>
                <p>{item.product.price * item.quantity} SDG</p>
              </div>
            ))}

            <div className="border-t pt-4 font-bold">
              الإجمالي: {cartTotal} SDG
            </div>
          </CardContent>
        </Card>

        {/* -------- form -------- */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>معلومات الشحن</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الأول</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الأخير</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العنوان</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="bank">
                    <AccordionTrigger>
                      <Banknote className="mr-2" />
                      التحويل البنكي
                    </AccordionTrigger>
                    <AccordionContent>
                      رقم الحساب: 8312783
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <FormField
                  control={form.control}
                  name="transactionId"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>رقم العملية</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جارٍ الإرسال..." : "إتمام الطلب"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
