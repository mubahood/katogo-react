// src/app/data/dummySuperBuyerData.ts

interface MiniProduct {
  id: number;
  image: string;
  price_new: string;
  price_old?: string; // Optional old price
  badge?: string; // e.g., "Verified", "CE", "Ships in 2 days"
}

export interface SuperBuyerCardData {
  id: number;
  title: string;
  products: MiniProduct[];
}

export const dummySuperBuyerCards: SuperBuyerCardData[] = [
  {
    id: 1,
    title: "Bulk Saver Hub",
    products: [
      {
        id: 101,
        image:
          "https://ug.jumia.is/unsafe/fit-in/680x680/filters:fill(white)/product/45/9630732/1.jpg?3950", // LED Strip
        price_new: "3,081",
        price_old: "4,000",
        badge: "2.3 pcs", // Example from image
      },
      {
        id: 102,
        image:
          "https://ug.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/47/6741002/1.jpg?5790", // Face Masks
        price_new: "3,494",
        price_old: "5,000",
        badge: "2.3 pcs", // Example from image
      },
    ],
  },
  {
    id: 2,
    title: "Fast delivery",
    products: [
      {
        id: 201,
        image:
          "https://ug.jumia.is/unsafe/fit-in/680x680/filters:fill(white)/product/92/9568452/1.jpg?5839", // Phone charging
        price_new: "21,885",
        price_old: "40,741",
        badge: "Ships in 2 days",
      },
      {
        id: 202,
        image:
          "https://ug.jumia.is/unsafe/fit-in/680x680/filters:fill(white)/product/93/4157152/1.jpg?8569", // T-shirt with multiple colors
        price_new: "29,699",
        price_old: "63,195",
        badge: "Ships in 2 days",
      },
    ],
  },
  {
    id: 3,
    title: "Buy again",
    products: [
      {
        id: 301,
        image:
          "https://ug.jumia.is/unsafe/fit-in/680x680/filters:fill(white)/product/09/1087352/1.jpg?0128", // Manicure set (part of an image)
        price_new: "53,958",
        price_old: "115,829",
        badge: "Popular picks",
      },
      {
        id: 302,
        image:
          "https://ug.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/78/075392/1.jpg?8638", // Hair Clippers
        price_new: "42,683",
        price_old: "97,010",
        badge: "Popular picks",
      },
    ],
  },
];
