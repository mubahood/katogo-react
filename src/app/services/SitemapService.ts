// src/app/services/SitemapService.ts
import { http_get } from "./Api";

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapData {
  urls: SitemapUrl[];
  totalUrls: number;
  lastGenerated: string;
}

/**
 * Service for generating XML sitemaps
 * Handles products, categories, and static pages
 */
export class SitemapService {
  private static readonly BASE_URL = 'https://blitxpress.com';
  private static readonly MAX_URLS_PER_SITEMAP = 50000; // Google's limit

  /**
   * Generate complete sitemap data
   */
  static async generateSitemap(): Promise<SitemapData> {
    const urls: SitemapUrl[] = [];
    const now = new Date().toISOString();

    try {
      // Add static pages
      urls.push(...this.getStaticPageUrls());

      // Add product pages
      const productUrls = await this.getProductUrls();
      urls.push(...productUrls);

      // Add category pages
      const categoryUrls = await this.getCategoryUrls();
      urls.push(...categoryUrls);

      return {
        urls: urls.slice(0, this.MAX_URLS_PER_SITEMAP),
        totalUrls: urls.length,
        lastGenerated: now
      };
    } catch (error) {
      console.error('Error generating sitemap:', error);
      // Return at least static pages if API fails
      return {
        urls: this.getStaticPageUrls(),
        totalUrls: this.getStaticPageUrls().length,
        lastGenerated: now
      };
    }
  }

  /**
   * Get static page URLs
   */
  private static getStaticPageUrls(): SitemapUrl[] {
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' as const },
      { path: '/products', priority: 0.9, changefreq: 'daily' as const },
      { path: '/about', priority: 0.7, changefreq: 'monthly' as const },
      { path: '/contact', priority: 0.7, changefreq: 'monthly' as const },
      { path: '/help', priority: 0.6, changefreq: 'monthly' as const },
      { path: '/faq', priority: 0.6, changefreq: 'monthly' as const },
      { path: '/terms', priority: 0.5, changefreq: 'yearly' as const },
      { path: '/privacy', priority: 0.5, changefreq: 'yearly' as const },
      { path: '/buyer-protection', priority: 0.6, changefreq: 'monthly' as const },
      { path: '/mobile-apps', priority: 0.7, changefreq: 'monthly' as const },
      { path: '/sell-on-blitxpress', priority: 0.8, changefreq: 'monthly' as const }
    ];

    return staticPages.map(page => ({
      loc: `${this.BASE_URL}${page.path}`,
      lastmod: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      changefreq: page.changefreq,
      priority: page.priority
    }));
  }

  /**
   * Get product page URLs from API
   */
  private static async getProductUrls(): Promise<SitemapUrl[]> {
    try {
      const productUrls: SitemapUrl[] = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages && productUrls.length < this.MAX_URLS_PER_SITEMAP) {
        const response = await http_get(`products?page=${page}&limit=100`);
        
        if (response.code === 1 && response.data?.data) {
          const products = response.data.data;
          
          products.forEach((product: any) => {
            productUrls.push({
              loc: `${this.BASE_URL}/products/${product.id}`,
              lastmod: product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              changefreq: 'weekly',
              priority: 0.8
            });
          });

          hasMorePages = response.data.current_page < response.data.last_page;
          page++;
        } else {
          hasMorePages = false;
        }
      }

      return productUrls;
    } catch (error) {
      console.error('Error fetching product URLs:', error);
      return [];
    }
  }

  /**
   * Get category page URLs from manifest
   */
  private static async getCategoryUrls(): Promise<SitemapUrl[] > {
    try {
      const response = await http_get('manifest');
      
      if (response.code === 1 && response.data?.categories) {
        return response.data.categories.map((category: any) => ({
          loc: `${this.BASE_URL}/products?category=${category.id}`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'daily' as const,
          priority: 0.9
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching category URLs:', error);
      return [];
    }
  }

  /**
   * Generate XML sitemap string
   */
  static generateXML(sitemapData: SitemapData): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const urlsetClose = '</urlset>';

    const urls = sitemapData.urls.map(url => {
      return `  <url>
    <loc>${this.escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`;
    }).join('\n');

    return `${xmlHeader}
${urlsetOpen}
${urls}
${urlsetClose}`;
  }

  /**
   * Generate robots.txt content
   */
  static generateRobotsTxt(): string {
    return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /account/
Disallow: /cart
Disallow: /checkout
Disallow: /payment/
Disallow: /*?*search=*
Disallow: /*?*sort_by=*
Disallow: /*?*page=*

# Sitemap
Sitemap: ${this.BASE_URL}/sitemap.xml

# Crawl-delay for better server performance
Crawl-delay: 1

# Special rules for specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /`;
  }

  /**
   * Escape XML special characters
   */
  private static escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  /**
   * Download sitemap as file (for testing)
   */
  static downloadSitemap(xmlContent: string, filename: string = 'sitemap.xml'): void {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default SitemapService;