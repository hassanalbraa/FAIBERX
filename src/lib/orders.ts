import { products, type Product } from "./products";
import { Timestamp } from "firebase/firestore";

export type OrderItem = {
    productId: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
    size: string;
}

export type OrderStatus = 'Order Placed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Suspended';

export interface Order {
    id: string; // Document ID from Firestore
    userId: string;
    createdAt?: Timestamp; // Make optional for mock data
    date?: string; // Add for mock data
    status: OrderStatus;
    items: OrderItem[];
    shippingAddress: {
        name: string;
        address: string;
        city: string;
        country: string;
        email: string;
        whatsappNumber: string;
    };
    payment: {
        method: string;
        transactionId?: string;
    };
    subTotal: number;
    shippingCost: number;
    total: number;
}
