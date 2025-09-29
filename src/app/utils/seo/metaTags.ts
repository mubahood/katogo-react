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
  const baseUrl = 'https://ugflix.com'; // Update with your actual domain
  const defaultImage = '/images/ugflix-og-image.jpg'; // Update with your default OG image
  
  return {
    basic: {
      title: config.title,
      description: config.description,
      keywords: config.keywords || 'ugflix, uganda, electronics, gadgets, online shopping'
    },
    openGraph: {
      title: config.title,
      description: config.description,
      image: config.image || defaultImage,
      url: config.url || baseUrl,
      type: config.type || 'website',
      siteName: config.siteName || 'UgFlix',
      locale: config.locale || 'en_UG'
    },
    twitter: {
      card: config.image ? 'summary_large_image' : 'summary',
      title: config.title,
      description: config.description,
      image: config.image || defaultImage,
      site: '@ugflix', // Update with your Twitter handle
      creator: '@ugflix'
    },
    additional: {
      'application-name': 'UgFlix',
      'apple-mobile-web-app-title': 'UgFlix',
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
  const productTitle = `${product.name} | UgFlix Uganda`;
  const productDescription = product.description 
    ? `${product.description.substring(0, 155)}...`
    : `Buy ${product.name} online in Uganda. Best prices on electronics and gadgets at UgFlix.`;
  
  const productKeywords = [
    product.name.toLowerCase(),
    product.category?.toLowerCase(),
    'uganda',
    'online shopping',
    'electronics',
    'ugflix'
  ].filter(Boolean).join(', ');

  return generateMetaTags({
    title: productTitle,
    description: productDescription,
    keywords: productKeywords,
    image: product.image,
    url: `https://ugflix.com/products/${product.id}`,
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
  const categoryTitle = `${category.name} | Buy Online in Uganda | UgFlix`;
  const categoryDescription = category.description 
    ? `${category.description.substring(0, 155)}...`
    : `Shop ${category.name} online in Uganda. ${category.productCount ? `${category.productCount}+ products` : 'Great selection'} with fast delivery. Best prices at UgFlix.`;
  
  const categoryKeywords = [
    category.name.toLowerCase(),
    'uganda',
    'online shopping',
    'electronics',
    'best prices',
    'ugflix'
  ].join(', ');

  return generateMetaTags({
    title: categoryTitle,
    description: categoryDescription,
    keywords: categoryKeywords,
    url: `https://ugflix.com/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`,
    type: 'website'
  });
};

/**
 * Generate homepage meta tags
 * @returns Homepage meta tags configuration
 */
export const generateHomePageMetaTags = (): MetaTagsConfig => {
  return generateMetaTags({
    title: 'UgFlix - Your One-Stop Electronics Shop in Uganda | Best Prices Online',
    description: 'Shop the best electronics, gadgets, and accessories in Uganda. Fast delivery, competitive prices, and quality products. Mobile phones, computers, audio equipment, and more.',
    keywords: 'electronics uganda, online shopping uganda, mobile phones, computers, gadgets, audio equipment, ugflix, best prices uganda',
    url: 'https://ugflix.com',
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
  const searchTitle = `"${query}" Search Results | UgFlix Uganda`;
  const searchDescription = `Found ${resultCount} products for "${query}" in Uganda. Shop electronics and gadgets with fast delivery at UgFlix.`;
  
  return generateMetaTags({
    title: searchTitle,
    description: searchDescription,
    keywords: `${query}, search results, electronics uganda, ugflix`,
    url: `https://ugflix.com/search?q=${encodeURIComponent(query)}`,
    type: 'website'
  });
};