// src/app/utils/seo/metaTags.ts
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  siteName?: string;
  locale?: string;
  price?: string;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
}

export interface MetaTagsConfig {
  basic: {
    title: string;
    description: string;
    keywords?: string;
  };
  openGraph: {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type: string;
    siteName: string;
    locale: string;
  };
  twitter: {
    card: 'summary' | 'summary_large_image' | 'app' | 'player';
    title: string;
    description: string;
    image?: string;
    site?: string;
    creator?: string;
  };
  additional?: {
    [key: string]: string;
  };
}

/**
 * Generate comprehensive meta tags for SEO optimization
 * @param config SEO configuration object
 * @returns Complete meta tags configuration
 */
export const generateMetaTags = (config: SEOConfig): MetaTagsConfig => {
  const baseUrl = 'https://blitxpress.com'; // Update with your actual domain
  const defaultImage = '/images/blitxpress-og-image.jpg'; // Update with your default OG image
  
  return {
    basic: {
      title: config.title,
      description: config.description,
      keywords: config.keywords || 'blitxpress, uganda, electronics, gadgets, online shopping'
    },
    openGraph: {
      title: config.title,
      description: config.description,
      image: config.image || defaultImage,
      url: config.url || baseUrl,
      type: config.type || 'website',
      siteName: config.siteName || 'BlitXpress',
      locale: config.locale || 'en_UG'
    },
    twitter: {
      card: config.image ? 'summary_large_image' : 'summary',
      title: config.title,
      description: config.description,
      image: config.image || defaultImage,
      site: '@blitxpress', // Update with your Twitter handle
      creator: '@blitxpress'
    },
    additional: {
      'application-name': 'BlitXpress',
      'apple-mobile-web-app-title': 'BlitXpress',
      'theme-color': '#007bff',
      'msapplication-TileColor': '#007bff'
    }
  };
};

/**
 * Generate product-specific meta tags
 * @param product Product information
 * @returns Product meta tags configuration
 */
export const generateProductMetaTags = (product: {
  id: number;
  name: string;
  description?: string;
  price_1: number;
  image?: string;
  category?: string;
  availability?: string;
}): MetaTagsConfig => {
  const productTitle = `${product.name} | BlitXpress Uganda`;
  const productDescription = product.description 
    ? `${product.description.substring(0, 155)}...`
    : `Buy ${product.name} online in Uganda. Best prices on electronics and gadgets at BlitXpress.`;
  
  const productKeywords = [
    product.name.toLowerCase(),
    product.category?.toLowerCase(),
    'uganda',
    'online shopping',
    'electronics',
    'blitxpress'
  ].filter(Boolean).join(', ');

  return generateMetaTags({
    title: productTitle,
    description: productDescription,
    keywords: productKeywords,
    image: product.image,
    url: `https://blitxpress.com/products/${product.id}`,
    type: 'product',
    price: product.price_1.toString(),
    currency: 'UGX',
    availability: product.availability === 'available' ? 'InStock' : 'OutOfStock'
  });
};

/**
 * Generate category-specific meta tags
 * @param category Category information
 * @returns Category meta tags configuration
 */
export const generateCategoryMetaTags = (category: {
  name: string;
  description?: string;
  productCount?: number;
}): MetaTagsConfig => {
  const categoryTitle = `${category.name} | Buy Online in Uganda | BlitXpress`;
  const categoryDescription = category.description 
    ? `${category.description.substring(0, 155)}...`
    : `Shop ${category.name} online in Uganda. ${category.productCount ? `${category.productCount}+ products` : 'Great selection'} with fast delivery. Best prices at BlitXpress.`;
  
  const categoryKeywords = [
    category.name.toLowerCase(),
    'uganda',
    'online shopping',
    'electronics',
    'best prices',
    'blitxpress'
  ].join(', ');

  return generateMetaTags({
    title: categoryTitle,
    description: categoryDescription,
    keywords: categoryKeywords,
    url: `https://blitxpress.com/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`,
    type: 'website'
  });
};

/**
 * Generate homepage meta tags
 * @returns Homepage meta tags configuration
 */
export const generateHomePageMetaTags = (): MetaTagsConfig => {
  return generateMetaTags({
    title: 'BlitXpress - Your One-Stop Electronics Shop in Uganda | Best Prices Online',
    description: 'Shop the best electronics, gadgets, and accessories in Uganda. Fast delivery, competitive prices, and quality products. Mobile phones, computers, audio equipment, and more.',
    keywords: 'electronics uganda, online shopping uganda, mobile phones, computers, gadgets, audio equipment, blitxpress, best prices uganda',
    url: 'https://blitxpress.com',
    type: 'website'
  });
};

/**
 * Generate search results meta tags
 * @param query Search query
 * @param resultCount Number of results
 * @returns Search meta tags configuration
 */
export const generateSearchMetaTags = (query: string, resultCount: number): MetaTagsConfig => {
  const searchTitle = `"${query}" Search Results | BlitXpress Uganda`;
  const searchDescription = `Found ${resultCount} products for "${query}" in Uganda. Shop electronics and gadgets with fast delivery at BlitXpress.`;
  
  return generateMetaTags({
    title: searchTitle,
    description: searchDescription,
    keywords: `${query}, search results, electronics uganda, blitxpress`,
    url: `https://blitxpress.com/search?q=${encodeURIComponent(query)}`,
    type: 'website'
  });
};