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

// This mock data is now for reference and can be removed later.
// The app will fetch real orders from Firestore.
export const mockOrders: Order[] = [
    {
        id: "TOC12345",
        userId: "rL8IAtCoyMQ4ThgSe9m8LGsyksy1", // Example user ID
        date: "2024-05-20T14:30:00Z",
        subTotal: 430.00,
        shippingCost: 20.00,
        total: 450.00,
        status: "Out for Delivery",
        items: [
            { productId: products[0].id, name: products[0].name, image: products[0].image, quantity: 1, price: 180.00, size: 'L' },
            { productId: products[1].id, name: products[1].name, image: products[1].image, quantity: 1, price: 250.00, size: 'XL' },
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
        userId: "ANOTHER_USER_ID", // Example user ID
        date: "2024-04-15T10:00:00Z",
        subTotal: 450.00,
        shippingCost: 0.00,
        total: 450.00,
        status: "Delivered",
        items: [
            { productId: products[3].id, name: products[3].name, image: products[3].image, quantity: 1, price: 450.00, size: 'M' },
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
