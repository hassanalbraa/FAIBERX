'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, PlusCircle, LogOut, ShoppingCart, Users, CheckCheck } from 'lucide-react';
import AddProductForm from '@/components/admin/AddProductForm';
import { ProductList } from '@/components/admin/ProductList';
import type { Product } from '@/lib/products';
import type { Order } from '@/lib/orders';
import { getAuth, signOut } from 'firebase/auth';
import Link from 'next/link';
import { collection, query, collectionGroup } from 'firebase/firestore';

type UserProfile = {
  id: string;
  email: string;
  createdAt: any;
  accountNumber?: string;
  isBanned?: boolean;
}

// UID الأدمن (متطابق مع Firestore Rules)
const ADMIN_UID = "5Kp5lbgb8fOJSr0OS5p1J4MMg2q1";

function AdminDashboardContent({ user, isAdmin }: { user: NonNullable<ReturnType<typeof useUser>['user']>, isAdmin: boolean }) {
  const firestore = useFirestore();
  const router = useRouter();

  // ===== Products =====
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'));
  }, [firestore]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  // ===== Orders =====
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collectionGroup(firestore, 'orders'));
  }, [firestore, isAdmin]);
  const { data: orders, isLoading: ordersLoading } = useCollection<Order>(ordersQuery);

  // ===== Users =====
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collection(firestore, 'users'));
  }, [firestore, isAdmin]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const completedOrdersCount = useMemo(() => {
    if (!orders) return 0;
    return orders.filter(order => order.status === 'Delivered').length;
  }, [orders]);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      router.push('/admin/login');
    } catch(error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex justify-between items-center mb-8">
        
