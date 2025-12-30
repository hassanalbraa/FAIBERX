
"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ListOrdered, User, LogOut, Loader2, Shield, Copy, MapPin, Edit } from "lucide-react"
import { useUser, useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


const profileSchema = z.object({
  firstName: z.string().min(2, "الاسم الأول قصير جدًا"),
  lastName: z.string().min(2, "الاسم الأخير قصير جدًا"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type UserProfile = {
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: any;
  accountNumber?: string;
}

function EditProfileDialog({ user, userProfile, onProfileUpdate }: { user: NonNullable<ReturnType<typeof useUser>['user']>, userProfile: UserProfile, onProfileUpdate: () => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: userProfile?.firstName || "",
            lastName: userProfile?.lastName || "",
        },
    });

    const onSubmit = async (values: ProfileFormValues) => {
        if (!firestore || !user) return;
        setIsSubmitting(true);
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
            await updateDocumentNonBlocking(userDocRef, values);
            toast({ title: "تم تحديث الملف الشخصي بنجاح" });
            onProfileUpdate();
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast({ title: "فشل تحديث الملف الشخصي", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Edit className="ml-2 h-4 w-4" />
                    تعديل الملف الشخصي
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>تعديل الملف الشخصي</DialogTitle>
                    <DialogDescription>
                        قم بإجراء تغييرات على ملفك الشخصي هنا. انقر على حفظ عند الانتهاء.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>الاسم الأول</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>الاسم الأخير</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                حفظ التغييرات
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}


export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading, refetch } = useDoc<UserProfile>(userDocRef);

  const isAdmin = user?.email === 'admin@example.com';
  const displayName = userProfile?.firstName || user?.displayName || user?.email;

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'تم نسخ رقم الحساب!' });
  };
  
  const onProfileUpdate = () => {
    refetch();
  }

  if (isUserLoading || !user || !userProfile || isProfileLoading) {
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
            <p className="text-muted-foreground mt-2">أهلاً بعودتك، {displayName}!</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                 <Card>
                    <CardContent className="p-4">
                        <nav className="flex flex-col space-y-1">
                            <Button variant="ghost" className="justify-start bg-secondary" asChild>
                                <Link href="/account"><User className="ml-2 h-4 w-4" />الملف الشخصي</Link>
                            </Button>
                            <Button variant="ghost" className="justify-start" asChild>
                                <Link href="/account/orders"><ListOrdered className="ml-2 h-4 w-4" />طلباتي</Link>
                            </Button>
                             {isAdmin && (
                                <Button variant="ghost" className="justify-start" asChild>
                                    <Link href="/admin"><Shield className="ml-2 h-4 w-4" />لوحة التحكم</Link>
                                </Button>
                            )}
                            <Button variant="ghost" className="justify-start" asChild>
                                <Link href="/account/addresses"><MapPin className="ml-2 h-4 w-4" />العناوين المحفوظة</Link>
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
                          {userProfile?.firstName && userProfile?.lastName && (
                            <>
                              <div>
                                <h3 className="font-semibold">الاسم</h3>
                                <p className="text-muted-foreground">{userProfile.firstName} {userProfile.lastName}</p>
                              </div>
                              <Separator />
                            </>
                          )}
                          <div>
                            <h3 className="font-semibold">البريد الإلكتروني</h3>
                            <p className="text-muted-foreground">{userProfile?.email}</p>
                          </div>
                          <Separator />
                           {userProfile?.accountNumber && (
                             <>
                              <div>
                                <h3 className="font-semibold">رقم الحساب</h3>
                                <div className="flex items-center gap-2">
                                  <p className="text-muted-foreground font-mono">{userProfile.accountNumber}</p>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(userProfile.accountNumber!)}>
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <Separator />
                             </>
                           )}
                           <div>
                            <h3 className="font-semibold">تاريخ الإنشاء</h3>
                            <p className="text-muted-foreground">{userProfile?.createdAt?.toDate().toLocaleDateString('ar-EG') || 'غير متوفر'}</p>
                          </div>
                          <Separator />
                           <EditProfileDialog user={user} userProfile={userProfile} onProfileUpdate={onProfileUpdate} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}

    