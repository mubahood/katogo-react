// src/app/components/seo/CategorySchema.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface CategorySchemaProps {
  category: {
    name: string;
    description?: string;
    productCount?: number;
    url?: string;
  };
  businessInfo?: {
    name: string;
    url: string;
  };
}

/**
 * Category Schema component for category pages structured data
 * Implements CollectionPage and ItemList schema.org markup for enhanced search visibility
 */
const CategorySchema: React.FC<CategorySchemaProps> = ({ 
  category, 
  businessInfo = {
    name: "UgFlix",
    url: "https://ugflix.com"
  }
}) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  // Generate CollectionPage structured data
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} Products`,
    description: category.description || `Shop ${category.name} products online in Uganda`,
    url: currentUrl,
    mainEntity: {
      "@type": "ItemList",
      name: `${category.name} Products`,
      description: category.description || `Browse our ${category.name} collection`,
      numberOfItems: category.productCount || 0,
      itemListOrder: "https://schema.org/ItemListOrderDescending"
    },
    breadcrumb: {
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
          name: category.name
        }
      ]
    },
    publisher: {
      "@type": "Organization",
      name: businessInfo.name,
      url: businessInfo.url
    }
  };

  // Generate WebSite search action for category pages
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: businessInfo.name,
    url: businessInfo.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${businessInfo.url}/products?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      {/* CollectionPage structured data */}
      <script type="application/ld+json">
        {JSON.stringify(collectionPageSchema)}
      </script>
      
      {/* Website search structured data */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      
      {/* Additional meta tags for category pages */}
      <meta name="robots" content="index, follow" />
      <meta name="category" content={category.name} />
      {category.productCount && (
        <meta name="product-count" content={category.productCount.toString()} />
      )}
      
      {/* Enhanced social meta tags */}
      <meta property="og:type" content="website" />
      <meta property="product:category" content={category.name} />
      
      {/* Twitter Card additional data */}
      <meta name="twitter:label1" content="Category" />
      <meta name="twitter:data1" content={category.name} />
      {category.productCount && (
        <>
          <meta name="twitter:label2" content="Products" />
          <meta name="twitter:data2" content={`${category.productCount} items`} />
        </>
      )}
    </Helmet>
  );
};

export default CategorySchema;