'use client';

import { notFound, useRouter } from "next/navigation";
import { mockOrders as initialOrders, OrderStatus } from "@/lib/orders";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OrderTracker } from "@/components/OrderTracker";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, Truck, XCircle, PauseCircle, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
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


export default function OrderTrackingPage({ params }: { params: { id: string } }) {
    // We use state to make status changes reflect in the UI
    const [orders, setOrders] = useState(initialOrders);
    const { toast } = useToast();
    const { user } = useUser();
    const isAdmin = user?.email === 'admin@example.com';

    const order = orders.find(o => o.id === params.id);
    
    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? {...o, status: newStatus} : o));
        toast({
            title: "تم تحديث حالة الطلب",
            description: `تم تغيير حالة الطلب #${orderId} إلى "${newStatus}".`,
        });
    }

    if (!order) {
        // In a real app, you might show a generic "Order not found" page
        // For this mock, we'll just show the first order if ID doesn't match
        const fallbackOrder = orders[0];
        if (!fallbackOrder) notFound();
        return <OrderDetails order={fallbackOrder} isFallback={true} requestedId={params.id} isAdmin={isAdmin} onStatusChange={handleStatusChange} />;
    }

    return <OrderDetails order={order} isAdmin={isAdmin} onStatusChange={handleStatusChange} />;
}

function OrderDetails({ order, isFallback = false, requestedId, isAdmin, onStatusChange }: { order: any; isFallback?: boolean; requestedId?: string; isAdmin: boolean; onStatusChange: (id: string, status: OrderStatus) => void }) {
    const displayId = isFallback ? requestedId : order.id;

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="font-headline text-4xl font-bold">تفاصيل الطلب</h1>
                    <p className="text-muted-foreground">تتبع الطلب #{displayId}</p>
                    {isFallback && <p className="text-sm text-destructive mt-2">تعذر العثور على الطلب #{displayId}. يتم عرض طلب نموذجي بدلاً من ذلك.</p>}
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
                                    تواصل مع الزبون
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
                                {order.items.map((item: any) => (
                                    <div key={item.product.id} className="flex items-center gap-4">
                                        <div className="relative w-20 h-24 rounded-md overflow-hidden">
                                            <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="80px"/>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{item.product.name}</p>
                                            <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                                            <p className="text-sm text-muted-foreground">السعر: {item.price.toFixed(2)} جنيه</p>
                                        </div>
                                        <p className="mr-auto font-semibold">{(item.price * item.quantity).toFixed(2)} جنيه</p>
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
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                                    <p>{order.shippingAddress.country}</p>
                                    <a href={`mailto:${order.shippingAddress.email}`} className="text-primary hover:underline block mt-1">{order.shippingAddress.email}</a>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h3 className="font-semibold mb-1">ملخص الطلب</h3>
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between"><span>المجموع الفرعي:</span> <span>{order.total.toFixed(2)} جنيه</span></div>
                                    <div className="flex justify-between"><span>الشحن:</span> <span>0.00 جنيه</span></div>
                                    <div className="flex justify-between font-bold"><span>الإجمالي:</span> <span>{order.total.toFixed(2)} جنيه</span></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
