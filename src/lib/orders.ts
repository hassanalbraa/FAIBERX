import { products, type Product } from "./products";

export type OrderItem = {
    product: Product;
    quantity: number;
    price: number;
}

export type OrderStatus = 'Order Placed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Suspended';

export interface Order {
    id: string;
    date: string;
    subTotal: number;
    shippingCost: number;
    total: number;
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
}

export const mockOrders: Order[] = [
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
