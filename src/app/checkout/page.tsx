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

const formSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  whatsappNumber: z
    .string()
    .regex(/^\+?\d{10,}$/),
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

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const addressesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users", user.uid, "addresses");
  }, [firestore, user]);

  const { data: savedAddresses, isLoading: isAddressesLoading } =
    useCollection<Address>(addressesCollectionRef);

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
    if (savedAddresses && savedAddresses.length > 0) {
      setShowNewAddressForm(false);
    } else {
      setShowNewAddressForm(true);
    }
  }, [savedAddresses]);

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
      // ✅ الجذر
      await setDoc(
        doc(firestore, "orders", orderId),
        orderData
      );

      // ✅ داخل المستخدم
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
    } catch (err) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل إرسال الطلب",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isUserLoading || isAddressesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "جارٍ الإرسال..." : "إتمام الطلب"}
        </Button>
      </form>
    </Form>
  );
}
