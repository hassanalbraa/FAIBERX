'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Order } from '@/lib/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { OrderTracker } from '@/components/OrderTracker';
import { CheckCircle, Loader2, SearchX, ShoppingBag, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const orderRef = useMemoFirebase(() => {
        if (!firestore || !orderId) return null;
        return doc(firestore, 'orders', orderId);
    }, [firestore, orderId]);

    const { data: order, isLoading: isOrderLoading } = useDoc<Order>(orderRef);

    const isLoading = isUserLoading || isOrderLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">جاري تحميل تفاصيل طلبك...</p>
            </div>
        );
    }
    
    if (!order) {
        return (
            <div className="text-center">
                <SearchX className="mx-auto h-16 w-16 text-destructive mb-4" />
                <h2 className="text-2xl font-bold">لم يتم العثور على الطلب</h2>
                <p className="text-muted-foreground mt-2">عذرًا، لم نتمكن من العثور على تفاصيل الطلب الذي تبحث عنه.</p>
                 <Button asChild className="mt-6">
                    <Link href="/">العودة إلى الصفحة الرئيسية</Link>
                </Button>
            </div>
        )
    }

    // Security check: ensure the logged-in user is the owner of the order
    if (user?.uid !== order.userId) {
        return (
            <div className="text-center">
                <ShieldAlert className="mx-auto h-16 w-16 text-destructive mb-4" />
                <h2 className="text-2xl font-bold">غير مصرح به</h2>
                <p className="text-muted-foreground mt-2">ليس لديك الصلاحية لعرض تفاصيل هذا الطلب.</p>
                <Button asChild className="mt-6">
                    <Link href="/account">الذهاب إلى حسابي</Link>
                </Button>
            </div>
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="text-center items-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <CardTitle className="text-3xl font-bold">شكرًا لك على طلبك!</CardTitle>
                    <CardDescription className="max-w-md">
                        لقد استلمنا طلبك بنجاح. سيتم مراجعة دفعتك قريبًا. يمكنك تتبع حالة طلبك أدناه.
                    </CardDescription>
                    <p className="font-mono text-sm bg-muted p-2 rounded-md mt-2">رقم الطلب: <span className="font-bold">#{order.id.slice(0, 7).toUpperCase()}</span></p>
                </CardHeader>
                <CardContent>
                    <Separator className="my-6" />
                    <h3 className="text-lg font-semibold mb-4 text-center">حالة الطلب</h3>
                    <OrderTracker currentStatus={order.status} />
                     <Separator className="my-6" />
                     <h3 className="text-lg font-semibold mb-4">ملخص المنتجات</h3>
                     <div className="space-y-4">
                        {order.items.map((item, index) => (
                            <div key={`${item.productId}-${index}`} className="flex items-center gap-4">
                                <div className="relative w-16 h-20 rounded-md overflow-hidden bg-muted">
                                     <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px"/>
                                </div>
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <div className="text-sm text-muted-foreground">
                                        <span>الكمية: {item.quantity}</span>
                                        {item.size && <Badge variant="secondary" className="mr-2">مقاس: {item.size}</Badge>}
                                    </div>
                                </div>
                                <p className="mr-auto font-semibold">{(item.price * item.quantity).toFixed(2)} SDG</p>
                            </div>
                        ))}
                    </div>
                    <div className="border-t mt-4 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span>المجموع الفرعي:</span> <span className="font-semibold">{order.subTotal.toFixed(2)} SDG</span></div>
                        <div className="flex justify-between font-bold text-base"><span>الإجمالي:</span> <span className="font-semibold">{order.total.toFixed(2)} SDG</span></div>
                    </div>
                     <Separator className="my-6" />
                      <div className="text-center">
                        <Button asChild>
                            <Link href="/products">
                                <ShoppingBag className="ml-2 h-4 w-4"/>
                                مواصلة التسوق
                            </Link>
                        </Button>
                      </div>
                </CardContent>
            </Card>
        </>
    );
}


export default function OrderSuccessPage() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-16 max-w-3xl">
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            }>
                <OrderSuccessContent />
            </Suspense>
        </div>
    )
}
