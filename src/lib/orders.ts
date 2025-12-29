import { products, type Product } from "./products";
import { Timestamp } from "firebase/firestore";

export type OrderItem = {
    productId: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
    size?: string;
}

export type OrderStatus = 'Order Placed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Suspended';

export interface Order {
    id: string; // Document ID from Firestore
    userId: string;
    createdAt: Timestamp;
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

// This mock data is now for reference and can be removed later.
// The app will fetch real orders from Firestore.
export const mockOrders: any[] = [
    {
        id: "TOC12345",
        date: "2024-05-20T14:30:00Z",
        subTotal: 430.00,
        shippingCost: 20.00,
        total: 450.00,
        status: "Out for Delivery",
        items: [
            { product: products[0], quantity: 1, price: 180.00 },
            { product: products[1], quantity: 1, price: 250.00 },
        ],
        shippingAddress: {
            name: "Jane Doe",
            address: "123 Couture Lane",
            city: "Styleville",
            country: "USA",
            email: "jane.doe@example.com",
            whatsappNumber: "+15551234567"
        },
        payment: {
            method: 'Bank Transfer',
            transactionId: 'BT-88234B'
        }
    },
    {
        id: "TOC67890",
        date: "2024-04-15T10:00:00Z",
        subTotal: 450.00,
        shippingCost: 0.00,
        total: 450.00,
        status: "Delivered",
        items: [
            { product: products[3], quantity: 1, price: 450.00 },
        ],
        shippingAddress: {
            name: "John Smith",
            address: "456 Fashion Ave",
            city: "Chicburg",
            country: "USA",
            email: "john.smith@example.com",
            whatsappNumber: "+15559876543"
        },
        payment: {
            method: 'Bank Transfer',
            transactionId: 'BT-AD94C1'
        }
    }
];
