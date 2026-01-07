'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useFirestore, useDocument } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderDetailPage() {
  const { id } = useParams(); // id الطلب
  const firestore = useFirestore();
  const router = useRouter();

  // استعلام الطلب
  const orderDocRef = useMemo(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'orders', id);
  }, [firestore, id]);

  const { data: order, isLoading } = useDocument(orderDocRef);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center mt-20">
        الطلب غير موجود
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 ml-2" />
        العودة
      </Button>

      <h1 className="text-2xl font-bold mb-4">تفاصيل الطلب #{order.id?.slice(0, 8)}</h1>

      <p><strong>الزبون:</strong> {order.shippingAddress?.name || 'غير معروف'}</p>
      <p><strong>الحالة:</strong> {order.status}</p>
      <p><strong>المبلغ:</strong> {(order.total || 0).toLocaleString()} SDG</p>
      <p><strong>العنوان:</strong> {order.shippingAddress?.address || '—'}</p>
    </div>
  );
}
