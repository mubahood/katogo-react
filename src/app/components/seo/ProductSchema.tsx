// src/app/components/seo/ProductSchema.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Product, WithContext } from 'schema-dts';

interface ProductSchemaProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    currency: string;
    imageUrl?: string;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder';
    brand?: string;
    sku?: string;
    category?: string;
    rating?: {
      average: number;
      count: number;
    };
    reviews?: Array<{
      author: string;
      rating: number;
      comment: string;
      date: string;
    }>;
  };
  businessInfo?: {
    name: string;
    url: string;
    logo?: string;
  };
}

/**
 * Product Schema component for rich snippets and structured data
 * Implements Product schema.org markup for enhanced search engine visibility
 */
const ProductSchema: React.FC<ProductSchemaProps> = ({ 
  product, 
  businessInfo = {
    name: "UgFlix",
    url: "https://ugflix.com",
    logo: "https://ugflix.com/logo.png"
  }
}) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  // Generate Product structured data
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku || `PRODUCT-${product.id}`,
    brand: {
      "@type": "Brand",
      name: product.brand || businessInfo.name
    },
    offers: {
      "@type": "Offer",
      price: product.price.toString(),
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      url: currentUrl,
      seller: {
        "@type": "Organization",
        name: businessInfo.name,
        url: businessInfo.url
      }
    },
    ...(product.imageUrl && {
      image: [product.imageUrl]
    }),
    ...(product.category && {
      category: product.category
    }),
    ...(product.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating.average,
        reviewCount: product.rating.count,
        bestRating: 5,
        worstRating: 1
      }
    }),
    ...(product.reviews && product.reviews.length > 0 && {
      review: product.reviews.map(review => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: review.author
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1
        },
        reviewBody: review.comment,
        datePublished: review.date
      }))
    })
  };

  // Generate Breadcrumb structured data if category is available
  const breadcrumbSchema = product.category ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: businessInfo.url
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category,
        item: `${businessInfo.url}/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name
      }
    ]
  } : null;

  return (
    <Helmet>
      {/* Product structured data */}
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
      
      {/* Breadcrumb structured data */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      
      {/* Enhanced meta tags for products */}
      <meta property="product:price:amount" content={product.price.toString()} />
      <meta property="product:price:currency" content={product.currency} />
      <meta property="product:availability" content={product.availability} />
      {product.brand && <meta property="product:brand" content={product.brand} />}
      {product.category && <meta property="product:category" content={product.category} />}
      
      {/* Rich snippets meta tags */}
      <meta name="twitter:label1" content="Price" />
      <meta name="twitter:data1" content={`${product.currency} ${product.price}`} />
      <meta name="twitter:label2" content="Availability" />
      <meta name="twitter:data2" content={product.availability} />
    </Helmet>
  );
};

export default ProductSchema;