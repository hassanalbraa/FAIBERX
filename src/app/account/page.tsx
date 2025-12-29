"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ListOrdered, MapPin, User, LogOut, Loader2, Shield } from "lucide-react"
import { useUser } from "@/firebase";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const isAdmin = user?.email === 'admin@example.com';

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);


  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/');
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">حسابي</h1>
            <p className="text-muted-foreground mt-2">أهلاً بعودتك، {user.email}!</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                 <Card>
                    <CardContent className="p-4">
                        <nav className="flex flex-col space-y-1">
                            <Button variant="ghost" className="justify-start bg-secondary" asChild>
                                <Link href="/account"><User className="ml-2 h-4 w-4" />الملف الشخصي</Link>
                            </Button>
                             {isAdmin && (
                                <Button variant="ghost" className="justify-start" asChild>
                                    <Link href="/admin"><Shield className="ml-2 h-4 w-4" />لوحة التحكم</Link>
                                </Button>
                            )}
                            <Button variant="ghost" className="justify-start" asChild>
                                <Link href="#"><ListOrdered className="ml-2 h-4 w-4" />سجل الطلبات</Link>
                            </Button>
                            <Button variant="ghost" className="justify-start" asChild>
                                <Link href="#"><MapPin className="ml-2 h-4 w-4" />العناوين المحفوظة</Link>
                            </Button>
                             <Separator className="my-2" />
                             <Button variant="ghost" className="justify-start text-destructive hover:text-destructive" onClick={handleLogout}>
                                <LogOut className="ml-2 h-4 w-4" />تسجيل الخروج
                            </Button>
                        </nav>
                    </CardContent>
                 </Card>
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>معلومات الملف الشخصي</CardTitle>
                        <CardDescription>عرض وتعديل معلومات حسابك.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold">البريد الإلكتروني</h3>
                            <p className="text-muted-foreground">{user.email}</p>
                          </div>
                          <Separator />
                           <div>
                            <h3 className="font-semibold">تاريخ الإنشاء</h3>
                            <p className="text-muted-foreground">{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('ar-EG') : 'غير متوفر'}</p>
                          </div>
                          <Separator />
                           <Button>تعديل الملف الشخصي</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
