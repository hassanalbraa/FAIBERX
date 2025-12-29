"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function AdminLoginPage() {
    const router = useRouter();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('password');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if a non-admin user is already logged in and tries to access this page.
    useEffect(() => {
        if (!isUserLoading && user && user.email !== 'admin@example.com') {
            router.push('/account');
        } else if (!isUserLoading && user && user.email === 'admin@example.com') {
            router.push('/admin');
        }
    }, [user, isUserLoading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (!auth) throw new Error("Auth service not available");
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: "تم تسجيل الدخول بنجاح",
                description: "جاري توجيهك إلى لوحة التحكم.",
            });
            router.push('/admin');
        } catch (error: any) {
            console.error("Admin login failed:", error);
            let description = "فشل تسجيل الدخول. يرجى التحقق من بياناتك.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                description = "البريد الإلكتروني أو كلمة المرور غير صحيحة. هل قمت بإنشاء حساب الأدمن من خلال صفحة إنشاء حساب أولاً؟";
            }
            toast({
                variant: "destructive",
                title: "فشل تسجيل الدخول",
                description: description,
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isUserLoading || (!isUserLoading && user)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">جاري التحقق والمتابعة...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 md:py-24 flex items-center justify-center min-h-[70vh]">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">دخول المشرف</CardTitle>
                    <CardDescription>
                        استخدم بيانات اعتماد المشرف للوصول إلى لوحة التحكم.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                             />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            تسجيل الدخول
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <p className="text-muted-foreground">
                            يجب إنشاء حساب المشرف أولاً عبر <Link href="/signup" className="underline">صفحة إنشاء الحساب</Link>.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
