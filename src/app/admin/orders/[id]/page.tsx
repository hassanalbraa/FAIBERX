'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDocument } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export default function OrderDetailPage() {
  const { id } = useParams(); // ID الطلب من الرابط
  const firestore = useFirestore();
  const router = useRouter();

  // المرجع للمستند في Firestore
  const orderDocRef = useMemo(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'orders', id);
  }, [firestore, id]);

  const { data: order, isLoading } = useDocument(orderDocRef);

  // Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not found
  if (!order) {
    return (
      <div className="text-center mt-20">
        <p>الطلب غير موجود أو تم حذفه.</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          العودة
        </Button>
      </div>
    );
  }

  // Helper: Items array
  const items = order.items ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 ml-2" />
        العودة
      </Button>

      <h1 className="text-2xl font-bold mb-4">
        تفاصيل الطلب #{order.id?.slice(0, 8) ?? '—'}
      </h1>

      {/* Order Info */}
      <div className="mb-6 space-y-2">
        <p><strong>الزبون:</strong> {order.shippingAddress?.name ?? 'غير معروف'}</p>
        <p><strong>العنوان:</strong> {order.shippingAddress?.address ?? '—'}</p>
        <p><strong>الحالة:</strong> {order.status ?? 'معلق'}</p>
        <p><strong>المبلغ الإجمالي:</strong> {(order.total ?? 0).toLocaleString()} SDG</p>
        <p><strong>تاريخ الإنشاء:</strong> {order.createdAt?.toDate?.().toLocaleDateString('ar') ?? '—'}</p>
      </div>

      {/* Items Table */}
      {items.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الصورة</TableHead>
              <TableHead>المنتج</TableHead>
              <TableHead>الكمية</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>الإجمالي</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-12 w-12 object-cover rounded" />
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>{item.name ?? '—'}</TableCell>
                <TableCell>{item.quantity ?? 0}</TableCell>
                <TableCell>{(item.price ?? 0).toLocaleString()} SDG</TableCell>
                <TableCell>{((item.price ?? 0) * (item.quantity ?? 0)).toLocaleString()} SDG</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="mt-4 text-muted-foreground">لا توجد منتجات في هذا الطلب.</p>
      )}
    </div>
  );
        }
