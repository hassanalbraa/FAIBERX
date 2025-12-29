import { notFound } from "next/navigation";
import { mockOrders } from "@/lib/orders";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OrderTracker } from "@/components/OrderTracker";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
    const order = mockOrders.find(o => o.id === params.id);

    if (!order) {
        // In a real app, you might show a generic "Order not found" page
        // For this mock, we'll just show the first order if ID doesn't match
        const fallbackOrder = mockOrders[0];
        if (!fallbackOrder) notFound();
        return <OrderDetails order={fallbackOrder} isFallback={true} requestedId={params.id} />;
    }

    return <OrderDetails order={order} />;
}

function OrderDetails({ order, isFallback = false, requestedId }: { order: any; isFallback?: boolean; requestedId?: string }) {
    const displayId = isFallback ? requestedId : order.id;

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold">تفاصيل الطلب</h1>
                <p className="text-muted-foreground">تتبع الطلب #{displayId}</p>
                {isFallback && <p className="text-sm text-destructive mt-2">تعذر العثور على الطلب #{displayId}. يتم عرض طلب نموذجي بدلاً من ذلك.</p>}
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
