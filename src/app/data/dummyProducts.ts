// src/app/data/dummyProducts.ts
import { ProductModel } from "../models/ProductModel";

const dealsData = [
  {
    id: 1,
    name: "Pro-Grade Smartwatch v5",
    price_1: "85000",
    price_2: "150000",
    feature_photo:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500",
    items_sold: 82,
    total_items: 100,
  },
  {
    id: 2,
    name: "AcousticPro Wireless Earbuds",
    price_1: "120000",
    price_2: "210000",
    feature_photo:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    items_sold: 54,
    total_items: 80,
  },
  {
    id: 3,
    name: "UrbanRunner Athletic Shoes",
    price_1: "95000",
    price_2: "180000",
    feature_photo:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80", // changed image
    items_sold: 120,
    total_items: 150,
  },
  {
    id: 4,
    name: "CyberGlow RGB Gaming Mouse",
    price_1: "65000",
    price_2: "110000",
    feature_photo:
      "https://ug.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/29/4750402/1.jpg?3066",
    items_sold: 30,
    total_items: 50,
  },
  {
    id: 5,
    name: "Leather Messenger Bag",
    price_1: "150000",
    price_2: "250000",
    feature_photo:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500",
    items_sold: 75,
    total_items: 100,
  },
  {
    id: 6,
    name: "Portable Espresso Maker",
    price_1: "75000",
    price_2: "130000",
    feature_photo:
      "https://ug.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/92/9411442/1.jpg?5723",
    items_sold: 91,
    total_items: 120,
  },
];

// We add a 'stock' property to the plain object before creating the model instance
export const dummyDeals: ProductModel[] = dealsData.map((d) =>
  ProductModel.fromJson({
    ...d,
    stock: { items_sold: d.items_sold, total_items: d.total_items },
  })
);
