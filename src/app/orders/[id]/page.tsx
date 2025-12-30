
'use client';

import { useRouter } from "next/navigation";
import { OrderStatus, type Order } from "@/lib/orders";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OrderTracker } from "@/components/OrderTracker";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useUser, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useDoc } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, Truck, XCircle, PauseCircle, MoreVertical, SearchX, Hash, Loader2, MessageSquare, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { doc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";


function AdminOrderDetailsPageContent({ params }: { params: { id: string } }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    // The query will only run because we've already confirmed the user is an admin in the parent.
    const orderRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'orders', params.id);
    }, [firestore, params.id]);

    const { data: order, isLoading: isOrderLoading } = useDoc<Order>(orderRef);

    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        if (!firestore) {
            toast({ 
                title: "خطأ في قاعدة البيانات",
                description: "لا يمكن تحديث الطلب حاليًا.",
                variant: "destructive"
            });
            return;
        };
        const orderDocRef = doc(firestore, 'orders', orderId);
        updateDocumentNonBlocking(orderDocRef, { status: newStatus });
        toast({
            title: "تم تحديث حالة الطلب",
            description: `تم تغيير حالة الطلب #${orderId.slice(0, 7).toUpperCase()} إلى "${newStatus}".`,
        });
    }
    
    if (isOrderLoading) {
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
                        <Link href="/admin/orders">العودة إلى قائمة الطلبات</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return <OrderDetails order={order} isAdmin={true} onStatusChange={handleStatusChange} />;
}


export default function OrderTrackingPage({ params }: { params: { id: string } }) {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const isAdmin = user?.email === 'admin@example.com';

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading) {
        return (
             <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
        )
    }

    // This is the critical authorization check.
    // We will not render the content (which fetches data) unless the user is an admin.
    if (!isAdmin) {
         return (
            <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
                 <ShieldAlert className="h-24 w-24 text-destructive mb-4" />
                <h1 className="font-headline text-4xl font-bold">غير مصرح به</h1>
                <p className="text-muted-foreground mt-2">هذه الصفحة مخصصة للمشرفين فقط.</p>
                 <div className="flex gap-4 mt-6">
                    <Button asChild>
                        <Link href="/account">العودة إلى الحساب</Link>
                    </Button>
                </div>
            </div>
        );
    }
    
    // Only if the user is an admin, we render the component that actually fetches data.
    return <AdminOrderDetailsPageContent params={params} />;
}

function OrderDetails({ order, isAdmin, onStatusChange }: { order: Order; isAdmin: boolean; onStatusChange: (id: string, status: OrderStatus) => void }) {

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="font-headline text-4xl font-bold">تفاصيل الطلب</h1>
                    <p className="text-muted-foreground">تتبع الطلب #{order.id.slice(0, 7).toUpperCase()}</p>
                </div>
                 {isAdmin && (
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">إجراءات الأدمن</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>إجراءات الأدمن</DropdownMenuLabel>
                             <DropdownMenuItem asChild>
                                <a href={`mailto:${order.shippingAddress.email}`}>
                                    <Mail className="ml-2 h-4 w-4" />
                                    تواصل عبر البريد
                                </a>
                            </DropdownMenuItem>
                             <DropdownMenuItem asChild>
                                <a href={`https://wa.me/${order.shippingAddress.whatsappNumber.replace(/\s/g, '').replace('+', '')}`} target="_blank" rel="noopener noreferrer">
                                    <MessageSquare className="ml-2 h-4 w-4" />
                                    تواصل عبر واتساب
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <DropdownMenuSub>
                                <DropdownMenuSubTrigger>تغيير الحالة</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => onStatusChange(order.id, 'Processing')}>
                                        <CheckCircle className="ml-2 h-4 w-4" />
                                        قيد المعالجة
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onStatusChange(order.id, 'Shipped')}>
                                        <Truck className="ml-2 h-4 w-4" />
                                        تم الشحن
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onStatusChange(order.id, 'Out for Delivery')}>
                                        <Truck className="ml-2 h-4 w-4" />
                                        قيد التوصيل
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onStatusChange(order.id, 'Delivered')}>
                                        <CheckCircle className="ml-2 h-4 w-4" />
                                        تم التوصيل
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-amber-600 focus:text-amber-700" onClick={() => onStatusChange(order.id, 'Suspended')}>
                                <PauseCircle className="ml-2 h-4 w-4" />
                                تعليق الطلب
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onStatusChange(order.id, 'Cancelled')}>
                                <XCircle className="ml-2 h-4 w-4" />
                                رفض الطلب
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 )}
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
                                     <a href={`mailto:${order.shippingAddress.email}`} className="flex items-center gap-2 text-primary hover:underline">
                                        <Mail className="h-4 w-4" />
                                        {order.shippingAddress.email}
                                     </a>
                                     <a href={`https://wa.me/${order.shippingAddress.whatsappNumber.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                        <MessageSquare className="h-4 w-4" />
                                        {order.shippingAddress.whatsappNumber}
                                    </a>
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


    