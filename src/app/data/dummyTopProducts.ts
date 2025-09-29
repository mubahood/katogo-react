// src/app/data/dummyTopProducts.ts
import { ProductModel } from "../models/ProductModel";

const imgUrls = [
    "//s.alicdn.com/@sc04/kf/H80aaebfa50664c518a1f4f34a2f06f11s.jpg_250x250xz.jpg",
    "//s.alicdn.com/@img/imgextra/i1/O1CN01autDAT1cki3b6hRez_!!6000000003639-2-tps-144-144.png",
    "//s.alicdn.com/@sc04/kf/H17133d4492e14e6b809521b7ec062cd4K.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/Ha8e8c06c321f44da86cd274994aa7fa33.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/He7f0e15385984a8ca361682607efbd0dn.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/Hdbff98f4be63420eafdf24bf8e0d63259.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/Ha820aa9acccc41569d199e47f924ee77h.png_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/Ha8b95a9ca64f4cdb89176d212f8eed944.png_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/H3cfd587775b3454faf328d83e669a09cN.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/Hdc3b49d401fb4ed08dc9b40d0142f062s.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/H47a65c830e6c48e6ac0eefbe8845c841f.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/H769b2420c7794bdf9e8fa24fbf07a3a9h.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/Hb0596db304f940c38b157c85f169bef3X.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/H4b21aee1a07444fb82509d8f90a72b8eF.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/H7dcb304412704b2ea60bb6bfc544af29r.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/H50c84661e5a94cfe882f6f6d8c8160bdz.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/H6110310e7b2841308f1c3c04bed4cd44h.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/HTB1eoJrNVXXXXaUapXXq6xXFXXXp.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/H5e157ef74ea94d2fb522cc1fe82a4879h.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/H67849228f75f422b82ac7bd9a298ff46E.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/HTB16td8SFXXXXccapXXq6xXFXXXy.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/H5f71e3b513a343ffa7cdde0137e05c5az.jpg_250x250xz.jpg",
    "//s.alicdn.com/@sc04/kf/H038c3d3a148d4b90b2805d63257cf30ew.jpg_250x250xz.jpg",
];

function getImg(idx: number) {
    const url = imgUrls[idx % imgUrls.length];
    // Ensure https protocol
    return url.startsWith("http") ? url : "https:" + url;
}

const topProductsData = [
    {
        id: 1001,
        name: "AeroSound X Wireless Headphones - Deep Bass",
        price_1: "160000",
        price_2: "280000",
        feature_photo: getImg(0),
        items_sold: 450,
        total_items: 500,
        rating: 4.8,
        reviewsCount: 1800,
        description: "Experience unparalleled audio clarity and deep bass with AeroSound X Wireless Headphones. Designed for comfort and long listening sessions, featuring a foldable design and quick charging. Perfect for music lovers and professionals alike.",
        specifications: [{ label: "Connectivity", value: "Bluetooth 5.0" }, { label: "Battery Life", value: "30 hours" }],
        images: [getImg(0), getImg(1)],
    },
    {
        id: 1002,
        name: "Automated Coffee Machine - Barista Grade",
        price_1: "850000",
        price_2: "1200000",
        feature_photo: getImg(2),
        items_sold: 80,
        total_items: 100,
        rating: 4.9,
        reviewsCount: 300,
        description: "Brew perfect espresso, cappuccino, and latte with a touch of a button. This fully automated coffee machine features an integrated grinder, milk frother, and customizable settings for your perfect cup.",
        specifications: [{ label: "Water Tank", value: "2.5L" }, { label: "Bean Hopper", value: "300g" }],
        images: [getImg(2), getImg(3)],
    },
    {
        id: 1003,
        name: "UltraBook Pro - 15-inch 4K Display",
        price_1: "2500000",
        price_2: "3500000",
        feature_photo: getImg(4),
        items_sold: 60,
        total_items: 70,
        rating: 4.7,
        reviewsCount: 150,
        description: "Powerful and sleek, the UltraBook Pro is designed for professionals and creatives. Featuring a stunning 4K display, latest-gen processor, and extended battery life, it's built to handle any task.",
        specifications: [{ label: "Processor", value: "Intel Core i7" }, { label: "RAM", value: "16GB" }],
        images: [getImg(4), getImg(5)],
    },
    {
        id: 1004,
        name: "VigoFit Fitness Tracker - ECG & GPS",
        price_1: "90000",
        price_2: "150000",
        feature_photo: getImg(6),
        items_sold: 300,
        total_items: 350,
        rating: 4.5,
        reviewsCount: 2500,
        description: "Track your workouts, heart rate, sleep, and more with the VigoFit Fitness Tracker. Features built-in GPS for outdoor activities and ECG monitoring for advanced health insights.",
        specifications: [{ label: "Display", value: "AMOLED" }, { label: "Water Resistance", value: "50m" }],
        images: [getImg(6), getImg(7)],
    },
    {
        id: 1005, name: "Smart LED Light Bulb - Dimmable", price_1: "25000", price_2: "40000", feature_photo: getImg(8), items_sold: 700, total_items: 800, rating: 4.6, reviewsCount: 3000,
        images: [getImg(8), getImg(9)],
    },
    {
        id: 1006, name: "Portable Bluetooth Speaker - Waterproof", price_1: "110000", price_2: "180000", feature_photo: getImg(10), items_sold: 220, total_items: 250, rating: 4.7, reviewsCount: 1200,
        images: [getImg(10), getImg(11)],
    },
    {
        id: 1007, name: "Robot Vacuum Cleaner - Smart Navigation", price_1: "450000", price_2: "700000", feature_photo: getImg(12), items_sold: 90, total_items: 100, rating: 4.8, reviewsCount: 400,
        images: [getImg(12), getImg(13)],
    },
    {
        id: 1008, name: "Compact Projector - Full HD", price_1: "300000", price_2: "500000", feature_photo: getImg(14), items_sold: 50, total_items: 60, rating: 4.5, reviewsCount: 100,
        images: [getImg(14), getImg(15)],
    },
    {
        id: 1009, name: "Wireless Charging Pad - Fast Charge", price_1: "40000", price_2: "70000", feature_photo: getImg(16), items_sold: 600, total_items: 750, rating: 4.4, reviewsCount: 2000,
        images: [getImg(16), getImg(17)],
    },
    {
        id: 1010, name: "Gaming Headset with Mic - RGB", price_1: "130000", price_2: "220000", feature_photo: getImg(18), items_sold: 180, total_items: 200, rating: 4.7, reviewsCount: 900,
        images: [getImg(18), getImg(19)],
    },
    {
        id: 1011, name: "Electric Kettle - Smart Temp Control", price_1: "95000", price_2: "160000", feature_photo: getImg(20), items_sold: 110, total_items: 120, rating: 4.6, reviewsCount: 300,
        images: [getImg(20), getImg(21)],
    },
    {
        id: 1012, name: "Air Fryer - 5L Digital", price_1: "320000", price_2: "550000", feature_photo: getImg(22), items_sold: 70, total_items: 80, rating: 4.8, reviewsCount: 250,
        images: [getImg(22), getImg(23)],
    },
    {
        id: 1013, name: "Portable Handheld Vacuum - Cordless", price_1: "180000", price_2: "300000", feature_photo: getImg(0), items_sold: 150, total_items: 180, rating: 4.3, reviewsCount: 600,
        images: [getImg(0), getImg(1)],
    },
    {
        id: 1014, name: "Blender - High Speed 1200W", price_1: "210000", price_2: "350000", feature_photo: getImg(2), items_sold: 95, total_items: 100, rating: 4.7, reviewsCount: 350,
        images: [getImg(2), getImg(3)],
    },
    {
        id: 1015, name: "Smart Door Lock - Fingerprint", price_1: "280000", price_2: "450000", feature_photo: getImg(4), items_sold: 40, total_items: 50, rating: 4.9, reviewsCount: 120,
        images: [getImg(4), getImg(5)],
    },
    {
        id: 1016, name: "Security Camera - Outdoor 4K", price_1: "200000", price_2: "330000", feature_photo: getImg(6), items_sold: 85, total_items: 90, rating: 4.6, reviewsCount: 280,
        images: [getImg(6), getImg(7)],
    },
    {
        id: 1017, name: "Gaming Monitor - 27-inch 144Hz", price_1: "900000", price_2: "1400000", feature_photo: getImg(8), items_sold: 30, total_items: 40, rating: 4.8, reviewsCount: 90,
        images: [getImg(8), getImg(9)],
    },
    {
        id: 1018, name: "Smart Light Strip - 5M RGB", price_1: "60000", price_2: "100000", feature_photo: getImg(10), items_sold: 500, total_items: 600, rating: 4.5, reviewsCount: 1500,
        images: [getImg(10), getImg(11)],
    },
    {
        id: 1019, name: "Electric Toothbrush - Sonic", price_1: "110000", price_2: "190000", feature_photo: getImg(12), items_sold: 200, total_items: 220, rating: 4.7, reviewsCount: 700,
        images: [getImg(12), getImg(13)],
    },
    {
        id: 1020, name: "Hair Dryer - Professional Salon", price_1: "150000", price_2: "250000", feature_photo: getImg(14), items_sold: 100, total_items: 110, rating: 4.4, reviewsCount: 450,
        images: [getImg(14), getImg(15)],
    },
    {
        id: 1021, name: "Digital Kitchen Scale - Precision", price_1: "35000", price_2: "60000", feature_photo: getImg(16), items_sold: 400, total_items: 450, rating: 4.6, reviewsCount: 1000,
        images: [getImg(16), getImg(17)],
    },
    {
        id: 1022, name: "Smart Doorbell with Camera", price_1: "190000", price_2: "300000", feature_photo: getImg(18), items_sold: 70, total_items: 80, rating: 4.8, reviewsCount: 200,
        images: [getImg(18), getImg(19)],
    },
    {
        id: 1023, name: "Portable Monitor - 15.6-inch USB-C", price_1: "400000", price_2: "650000", feature_photo: getImg(20), items_sold: 20, total_items: 30, rating: 4.7, reviewsCount: 60,
        images: [getImg(20), getImg(21)],
    },
    {
        id: 1024, name: "Ergonomic Keyboard and Mouse Combo", price_1: "120000", price_2: "200000", feature_photo: getImg(22), items_sold: 150, total_items: 180, rating: 4.5, reviewsCount: 500,
        images: [getImg(22), getImg(23)],
    },
    {
        id: 1025, name: "Smart Thermostat - WiFi Enabled", price_1: "250000", price_2: "400000", feature_photo: getImg(0), items_sold: 60, total_items: 70, rating: 4.9, reviewsCount: 80,
        images: [getImg(0), getImg(1)],
    },
];

export const dummyTopProducts: ProductModel[] = topProductsData.map((d) =>
    ProductModel.fromJson({
        ...d,
        stock: { items_sold: d.items_sold, total_items: d.total_items },
    })
);