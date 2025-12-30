
'use client';

import { useRouter } from "next/navigation";
import { type Order, OrderStatus } from "@/lib/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderTracker } from "@/components/OrderTracker";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Mail, SearchX, Hash, Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { doc } from "firebase/firestore";

export default function UserOrderTrackingPage({ params }: { params: { id: string } }) {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    const orderRef = useMemoFirebase(() => {
        if (!firestore || !params.id) return null;
        return doc(firestore, 'orders', params.id);
    }, [firestore, params.id]);

    const { data: order, isLoading } = useDoc<Order>(orderRef);
    
    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    if (isLoading || isUserLoading) {
        return (
             <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
        )
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
                 <SearchX className="h-24 w-24 text-muted-foreground mb-4" />
                <h1 className="font-headline text-4xl font-bold">لم يتم العثور على الطلب</h1>
                <p className="text-muted-foreground mt-2">عذرًا، لم نتمكن من العثور على الطلب رقم #{params.id}.</p>
                <div className="flex gap-4 mt-6">
                    <Button asChild>
                        <Link href="/account/orders">العودة إلى سجل الطلبات</Link>
                    </Button>
                </div>
            </div>
        );
    }
    
    if (user?.uid !== order.userId) {
         return (
            <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
                 <SearchX className="h-24 w-24 text-muted-foreground mb-4" />
                <h1 className="font-headline text-4xl font-bold">غير مصرح به</h1>
                <p className="text-muted-foreground mt-2">أنت غير مصرح لك بعرض هذا الطلب.</p>
                 <div className="flex gap-4 mt-6">
                    <Button asChild>
                        <Link href="/account/orders">العودة إلى سجل الطلبات</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return <OrderDetails order={order} />;
}

function OrderDetails({ order }: { order: Order }) {
    const { toast } = useToast();
    const prevStatusRef = useRef<OrderStatus | undefined>();

    useEffect(() => {
        if (order && prevStatusRef.current && order.status !== prevStatusRef.current) {
            toast({
                title: "تحديث حالة الطلب",
                description: `تم تحديث حالة طلبك #${order.id.slice(0, 7).toUpperCase()} إلى: ${order.status}`
            });
        }
        prevStatusRef.current = order?.status;
    }, [order, toast]);

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="font-headline text-4xl font-bold">تفاصيل الطلب</h1>
                    <p className="text-muted-foreground">تتبع الطلب #{order.id.slice(0, 7).toUpperCase()}</p>
                </div>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>حالة الطلب</CardTitle>
                </CardHeader>
                <CardContent>
                    <OrderTracker currentStatus={order.status} />
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>المنتجات في هذا الطلب</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item: any, index: number) => (
                                    <div key={`${item.productId || index}-${item.size || ''}`} className="flex items-center gap-4">
                                        <div className="relative w-20 h-24 rounded-md overflow-hidden">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px"/>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{item.name}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <span>الكمية: {item.quantity}</span>
                                                {item.size && <Badge variant="secondary">مقاس: {item.size}</Badge>}
                                            </div>
                                            <p className="text-sm text-muted-foreground">السعر: {item.price.toFixed(2)} SDG</p>
                                        </div>
                                        <p className="mr-auto font-semibold">{(item.price * item.quantity).toFixed(2)} SDG</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                         <CardHeader>
                            <CardTitle>الشحن والدفع</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <h3 className="font-semibold mb-1">عنوان الشحن</h3>
                                <div className="text-sm text-muted-foreground">
                                    <p>{order.shippingAddress.name}</p>
                                    <p>{order.shippingAddress.address}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                                </div>
                            </div>
                            <Separator />
                             <div>
                                <h3 className="font-semibold mb-1">معلومات التواصل</h3>
                                <div className="text-sm text-muted-foreground space-y-2">
                                     <p className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        {order.shippingAddress.email}
                                     </p>
                                     <p className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        {order.shippingAddress.whatsappNumber}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h3 className="font-semibold mb-1">ملخص الطلب</h3>
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between"><span>المجموع الفرعي:</span> <span>{order.subTotal.toFixed(2)} SDG</span></div>
                                    <div className="flex justify-between"><span>الشحن:</span> <span>{order.shippingCost > 0 ? `${order.shippingCost.toFixed(2)} SDG` : 'حسب المكان'}</span></div>
                                    <div className="flex justify-between font-bold text-lg"><span>الإجمالي:</span> <span>{order.total.toFixed(2)} SDG</span></div>
                                </div>
                            </div>
                             <Separator />
                            <div>
                                <h3 className="font-semibold mb-1">معلومات الدفع</h3>
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between"><span>طريقة الدفع:</span> <span>{order.payment.method}</span></div>
                                    {order.payment.transactionId && (
                                    <div className="flex justify-between items-center">
                                        <span className='flex items-center gap-1'><Hash className="h-3 w-3"/>رقم العملية:</span> 
                                        <span className="font-mono text-xs bg-muted p-1 rounded-md">{order.payment.transactionId}</span>
                                    </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

  