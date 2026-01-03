'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ADMIN_UID = "5Kp5lbgb8fOJSr0OS5p1J4MMg2q1";
const ORDER_STATUSES = ['قيد المعالجة', 'قيد الشحن', 'تم الشحن', 'تم التوصيل', 'ملغي'];

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !orderId) return;

    async function fetchOrder() {
      try {
        const orderRef = doc(firestore, 'orders', orderId);
        const snap = await getDoc(orderRef);
        if (!snap.exists()) {
          toast({ title: "الطلب غير موجود", variant: "destructive" });
          router.push('/admin/orders');
          return;
        }
        setOrder({ id: snap.id, ...snap.data() });
      } catch (e) {
        toast({ title: "فشل جلب الطلب", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [firestore, orderId, router, toast]);

  const handleStatusChange = async (status: string) => {
    if (!firestore || user?.uid !== ADMIN_UID || !order) return;
    const orderRef = doc(firestore, 'orders', order.id);
    try {
      await updateDoc(orderRef, { status });
      setOrder({ ...order, status });
      toast({ title: "تم تحديث الحالة", description: status });
    } catch {
      toast({ title: "فشل التحديث", variant: "destructive" });
    }
  };

  if (isUserLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-center mt-20">الطلب غير موجود</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">تفاصيل الطلب #{order.id.slice(0,7).toUpperCase()}</h1>
        <Badge variant="secondary">{order.status}</Badge>
      </div>

      {/* أزرار تغيير الحالة */}
      <div className="flex gap-2 mb-6 flex-wrap justify-center">
        {ORDER_STATUSES.map(status => (
          <Button key={status} size="sm" onClick={() => handleStatusChange(status)}>
            {status}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* ملخص الطلب */}
        <Card>
          <CardHeader>
            <CardTitle>ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 rounded-md overflow-hidden relative">
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full"/>
                    </div>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>الكمية: {item.quantity}</span>
                        {item.size && <Badge variant="secondary">مقاس: {item.size}</Badge>}
                      </div>
                    </div>
                  </div>
                  <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} SDG</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between"><span>المجموع الفرعي</span><span>{order.subTotal} SDG</span></div>
              <div className="flex justify-between"><span>الشحن</span><span>{order.shippingCost} SDG</span></div>
              <div className="flex justify-between font-bold text-lg"><span>الإجمالي</span><span>{order.total} SDG</span></div>
            </div>
          </CardContent>
        </Card>

        {/* بيانات الزبون */}
        <Card>
          <CardHeader>
            <CardTitle>بيانات الشحن والدفع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>الاسم:</strong> {order.shippingAddress?.name}</p>
            <p><strong>البريد:</strong> {order.shippingAddress?.email}</p>
            <p><strong>العنوان:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
            <p><strong>الدولة:</strong> {order.shippingAddress?.country}</p>
            <p><strong>واتساب:</strong> {order.shippingAddress?.whatsappNumber}</p>
            <p><strong>طريقة الدفع:</strong> {order.payment?.method}</p>
            <p><strong>رقم العملية:</strong> {order.payment?.transactionId}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
