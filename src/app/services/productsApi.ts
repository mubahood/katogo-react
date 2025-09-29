// src/app/services/productsApi.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ProductModel } from '../models/ProductModel';
import { getNextAlibabaImageUrl } from '../data/alibabaImageUrls';

// --- 1) Raw JSON definitions for dummy products ---
interface RawProduct {
  id: number;
  name: string;
  price_1: string;
  price_2: string;
  feature_photo: string;
  stock: { items_sold: number; total_items: number };
  rating: number;
  reviewsCount: number;
  description: string;
  specifications: { label: string; value: string }[];
  images: string[];
  variants: Record<string, string[]>;
}

const rawProducts: RawProduct[] = [
  {
    id: 1,
    name: 'AeroSound X Wireless Headphones',
    price_1: '160000',
    price_2: '280000',
    feature_photo: getNextAlibabaImageUrl(),
    stock: { items_sold: 450, total_items: 500 },
    rating: 4.8,
    reviewsCount: 1800,
    description:
      'Deep bass, foldable design, quick charging. Perfect for music lovers and professionals alike.',
    specifications: [
      { label: 'Connectivity', value: 'Bluetooth 5.0' },
      { label: 'Battery Life', value: '30 hours' },
    ],
    images: [
      getNextAlibabaImageUrl(),
      getNextAlibabaImageUrl(),
      getNextAlibabaImageUrl(),
    ],
    variants: { Color: ['Black', 'White'], Size: ['Standard'] },
  },
  {
    id: 2,
    name: 'Automated Coffee Machine – Barista Grade',
    price_1: '850000',
    price_2: '1200000',
    feature_photo: getNextAlibabaImageUrl(),
    stock: { items_sold: 80, total_items: 100 },
    rating: 4.9,
    reviewsCount: 300,
    description:
      'Integrated grinder & milk frother, customizable settings, one-touch espresso, cappuccino, latte.',
    specifications: [
      { label: 'Water Tank', value: '2.5 L' },
      { label: 'Bean Hopper', value: '300 g' },
    ],
    images: [
      getNextAlibabaImageUrl(),
      getNextAlibabaImageUrl(),
      getNextAlibabaImageUrl(),
    ],
    variants: { Color: ['Silver', 'Black'] },
  },
  {
    id: 3,
    name: 'UltraBook Pro – 15″ 4K Laptop',
    price_1: '2500000',
    price_2: '3500000',
    feature_photo: getNextAlibabaImageUrl(),
    stock: { items_sold: 60, total_items: 70 },
    rating: 4.7,
    reviewsCount: 150,
    description:
      'Professional-grade laptop with 4K display, latest-gen CPU, long battery, sleek aluminum chassis.',
    specifications: [
      { label: 'Processor', value: 'Intel Core i7' },
      { label: 'RAM', value: '16 GB' },
    ],
    images: [
      getNextAlibabaImageUrl(),
      getNextAlibabaImageUrl(),
      getNextAlibabaImageUrl(),
    ],
    variants: { Color: ['Space Gray', 'Silver'], Storage: ['512GB', '1TB'] },
  },
  {
    id: 4,
    name: 'VigoFit Fitness Tracker – ECG & GPS',
    price_1: '90000',
    price_2: '150000',
    feature_photo: getNextAlibabaImageUrl(),
    stock: { items_sold: 300, total_items: 350 },
    rating: 4.5,
    reviewsCount: 2500,
    description:
      'Built-in GPS, ECG monitoring, sleep & heart-rate tracking, water-resistant up to 50m.',
    specifications: [
      { label: 'Display', value: 'AMOLED touchscreen' },
      { label: 'Water Resistance', value: '50 m (IP68)' },
    ],
    images: [
      getNextAlibabaImageUrl(),
      getNextAlibabaImageUrl(),
      getNextAlibabaImageUrl(),
    ],
    variants: { Strap: ['Black', 'Rose Gold'] },
  },
  {
    id: 5,
    name: 'Smart LED Light Bulb – Dimmable & Color-Changing',
    price_1: '25000',
    price_2: '40000',
    feature_photo: getNextAlibabaImageUrl(),
    stock: { items_sold: 700, total_items: 800 },
    rating: 4.6,
    reviewsCount: 3000,
    description:
      'Wi-Fi enabled, voice assistant compatible, app-controlled color modes, energy-efficient.',
    specifications: [
      { label: 'Brightness', value: '800 lumens' },
      { label: 'Compatibility', value: 'Alexa, Google Home, SmartThings' },
    ],
    images: [
      getNextAlibabaImageUrl(),
      getNextAlibabaImageUrl(),
      getNextAlibabaImageUrl(),
    ],
    variants: { Base: ['E26', 'E27'] },
  },
];

const rawDeals: RawProduct[] = [
  {
    id: 101,
    name: 'Pro-Grade Smartwatch v5',
    price_1: '85000',
    price_2: '150000',
    feature_photo: getNextAlibabaImageUrl(),
    stock: { items_sold: 82, total_items: 100 },
    rating: 4.7,
    reviewsCount: 1532,
    description:
      'Retina AMOLED, NFC payments, GPS, heart rate & SpO2 sensors, up to 18h battery, water-resistant.',
    specifications: [
      { label: 'Display', value: '1.39″ AMOLED Always-On' },
      { label: 'Connectivity', value: 'Bluetooth 5.0, Wi-Fi, NFC' },
      { label: 'Battery Life', value: 'Up to 18 hours' },
    ],
    images: [
      getNextAlibabaImageUrl(),
      getNextAlibabaImageUrl(),
      getNextAlibabaImageUrl(),
    ],
    variants: { Color: ['Black', 'Silver', 'Rose Gold'], Size: ['40mm', '44mm'] },
  },
  {
    id: 102,
    name: 'AcousticPro Wireless Earbuds with ANC',
    price_1: '120000',
    price_2: '210000',
    feature_photo: getNextAlibabaImageUrl(),
    stock: { items_sold: 54, total_items: 80 },
    rating: 4.2,
    reviewsCount: 890,
    description:
      'Active Noise Cancellation, Bluetooth 5.2, ergonomic fit, 8h playback + 30h case, IPX4 sweat-proof.',
    specifications: [
      { label: 'ANC', value: 'Active Noise Cancellation' },
      { label: 'Battery Life', value: '8h (earbuds) / 30h (case)' },
      { label: 'Waterproof', value: 'IPX4' },
    ],
    images: [
      getNextAlibabaImageUrl(),
      getNextAlibabaImageUrl(),
      getNextAlibabaImageUrl(),
    ],
    variants: { Color: ['Black', 'White', 'Navy Blue'] },
  },
];

// Map raw JSON → ProductModel instances
const productsData = rawProducts.map((p) => ProductModel.fromJson(p));
const dealsData = rawDeals.map((p) => ProductModel.fromJson(p));

// --- 2) RTK Query definitions ---
export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }), // dummy
  endpoints: (builder) => ({
    getProducts: builder.query<ProductModel[], { type?: 'all' | 'top' | 'deals'; limit?: number }>({
      async queryFn({ type = 'all', limit }) {
        await new Promise((r) => setTimeout(r, 300));
        let data = type === 'deals' ? dealsData : productsData;
        if (type === 'top') {
          // e.g. first 3 products
          data = productsData.slice(0, 3);
        }
        if (limit != null) data = data.slice(0, limit);
        return { data };
      },
    }),
    getProductById: builder.query<ProductModel, number>({
      async queryFn(id: number) {
        await new Promise((r) => setTimeout(r, 200));
        const prod = productsData.concat(dealsData).find((p) => p.id === id);
        return prod ? { data: prod } : { error: { status: 404, data: 'Not found' } };
      },
    }),
  }),
});

export const { useGetProductsQuery, useGetProductByIdQuery } = productsApi;