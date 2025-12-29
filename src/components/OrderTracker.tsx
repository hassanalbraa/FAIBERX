import type { OrderStatus } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { Check, Package, ShoppingCart, Truck, Home } from 'lucide-react';

const statuses: { name: OrderStatus, icon: React.ElementType }[] = [
    { name: 'Order Placed', icon: ShoppingCart },
    { name: 'Processing', icon: Package },
    { name: 'Shipped', icon: Truck },
    { name: 'Out for Delivery', icon: Truck },
    { name: 'Delivered', icon: Home },
];

interface OrderTrackerProps {
    currentStatus: OrderStatus;
}

export function OrderTracker({ currentStatus }: OrderTrackerProps) {
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
                                "absolute top-4 -left-1/2 h-0.5 w-full",
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
                            {status.name}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
