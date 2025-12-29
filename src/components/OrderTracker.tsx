import type { OrderStatus } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { Check, Package, ShoppingCart, Truck, Home, X, Pause } from 'lucide-react';

const statuses: { name: OrderStatus, icon: React.ElementType, label: string }[] = [
    { name: 'Order Placed', icon: ShoppingCart, label: 'تم الطلب' },
    { name: 'Processing', icon: Package, label: 'قيد المعالجة' },
    { name: 'Shipped', icon: Truck, label: 'تم الشحن' },
    { name: 'Out for Delivery', icon: Truck, label: 'قيد التوصيل' },
    { name: 'Delivered', icon: Home, label: 'تم التوصيل' },
];

const terminalStatuses: { name: OrderStatus, icon: React.ElementType, label: string, className: string }[] = [
    { name: 'Cancelled', icon: X, label: 'ملغي', className: 'bg-destructive border-destructive text-destructive-foreground' },
    { name: 'Suspended', icon: Pause, label: 'معلق', className: 'bg-amber-500 border-amber-500 text-white' }
]


interface OrderTrackerProps {
    currentStatus: OrderStatus;
}

export function OrderTracker({ currentStatus }: OrderTrackerProps) {
    const terminalStatus = terminalStatuses.find(s => s.name === currentStatus);
    if(terminalStatus) {
        return (
            <div className="flex flex-col items-center justify-center py-4">
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center border-2 z-10", terminalStatus.className)}>
                    <terminalStatus.icon className="w-8 h-8" />
                </div>
                <p className="text-xl mt-4 font-bold">{terminalStatus.label}</p>
            </div>
        )
    }

    const currentIndex = statuses.findIndex(s => s.name === currentStatus);

    return (
        <div className="flex items-center justify-between w-full">
            {statuses.map((status, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isFuture = index > currentIndex;

                return (
                    <div key={status.name} className="flex-1 flex flex-col items-center relative">
                        {index > 0 && (
                            <div className={cn(
                                "absolute top-4 -right-1/2 h-0.5 w-full",
                                isCompleted || isCurrent ? "bg-primary" : "bg-border"
                            )}></div>
                        )}
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border-2 z-10",
                            isCompleted ? "bg-primary border-primary text-primary-foreground" : "",
                            isCurrent ? "bg-primary border-primary text-primary-foreground" : "",
                            isFuture ? "bg-background border-border text-muted-foreground" : ""
                        )}>
                            {isCompleted ? <Check className="w-5 h-5" /> : <status.icon className="w-5 h-5" />}
                        </div>
                        <p className={cn(
                            "text-xs md:text-sm mt-2 text-center",
                            isCurrent ? "font-bold text-primary" : "text-muted-foreground"
                        )}>
                            {status.label}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
