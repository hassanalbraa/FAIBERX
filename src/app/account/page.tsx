import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ListOrdered, MapPin, User, LogOut } from "lucide-react"

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">حسابي</h1>
            <p className="text-muted-foreground mt-2">أهلاً بعودتك يا محبة الموضة!</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                 <Card>
                    <CardContent className="p-4">
                        <nav className="flex flex-col space-y-1">
                            <Button variant="ghost" className="justify-start" asChild>
                                <Link href="/account"><User className="ml-2 h-4 w-4" />الملف الشخصي</Link>
                            </Button>
                            <Button variant="ghost" className="justify-start bg-secondary" asChild>
                                <Link href="/orders/track"><ListOrdered className="ml-2 h-4 w-4" />سجل الطلبات</Link>
                            </Button>
                            <Button variant="ghost" className="justify-start" asChild>
                                <Link href="#"><MapPin className="ml-2 h-4 w-4" />العناوين المحفوظة</Link>
                            </Button>
                             <Separator className="my-2" />
                             <Button variant="ghost" className="justify-start text-destructive hover:text-destructive" asChild>
                                <Link href="/"><LogOut className="ml-2 h-4 w-4" />تسجيل الخروج</Link>
                            </Button>
                        </nav>
                    </CardContent>
                 </Card>
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>سجل الطلبات</CardTitle>
                        <CardDescription>عرض طلباتك السابقة والحالية.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg">
                            <div className="p-4 flex justify-between items-center hover:bg-secondary/50">
                                <div>
                                    <p className="font-semibold">طلب #TOC12345</p>
                                    <p className="text-sm text-muted-foreground">تاريخ الطلب: 20 مايو 2024</p>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/orders/TOC12345">تتبع الطلب</Link>
                                </Button>
                            </div>
                            <Separator />
                            <div className="p-4 flex justify-between items-center hover:bg-secondary/50">
                                <div>
                                    <p className="font-semibold">طلب #TOC67890</p>
                                    <p className="text-sm text-muted-foreground">تاريخ الطلب: 15 أبريل 2024</p>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/orders/TOC67890">عرض التفاصيل</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
