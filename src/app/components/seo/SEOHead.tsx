// src/app/components/seo/SEOHead.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { MetaTagsConfig } from '../../utils/seo/metaTags';

interface SEOHeadProps {
  config: MetaTagsConfig;
  children?: React.ReactNode;
}

/**
 * SEO Head component using React Helmet Async
 * Manages all meta tags, Open Graph, Twitter Cards, and additional SEO elements
 */
const SEOHead: React.FC<SEOHeadProps> = ({ config, children }) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{config.basic.title}</title>
      <meta name="description" content={config.basic.description} />
      {config.basic.keywords && (
        <meta name="keywords" content={config.basic.keywords} />
      )}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={config.openGraph.title} />
      <meta property="og:description" content={config.openGraph.description} />
      <meta property="og:type" content={config.openGraph.type} />
      <meta property="og:site_name" content={config.openGraph.siteName} />
      <meta property="og:locale" content={config.openGraph.locale} />
      {config.openGraph.image && (
        <>
          <meta property="og:image" content={config.openGraph.image} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:type" content="image/jpeg" />
        </>
      )}
      {config.openGraph.url && (
        <meta property="og:url" content={config.openGraph.url} />
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={config.twitter.card} />
      <meta name="twitter:title" content={config.twitter.title} />
      <meta name="twitter:description" content={config.twitter.description} />
      {config.twitter.image && (
        <meta name="twitter:image" content={config.twitter.image} />
      )}
      {config.twitter.site && (
        <meta name="twitter:site" content={config.twitter.site} />
      )}
      {config.twitter.creator && (
        <meta name="twitter:creator" content={config.twitter.creator} />
      )}
      
      {/* Additional Meta Tags */}
      {config.additional && Object.entries(config.additional).map(([key, value]) => (
        <meta key={key} name={key} content={value} />
      ))}
      
      {/* Canonical URL */}
      {config.openGraph.url && (
        <link rel="canonical" href={config.openGraph.url} />
      )}
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Robots Meta Tag */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      {/* Additional head elements */}
      {children}
    </Helmet>
  );
};

export default SEOHead;