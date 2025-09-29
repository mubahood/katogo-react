// src/app/components/seo/SitemapGenerator.tsx
import React, { useState } from 'react';
import { Button, Card, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import SitemapService, { SitemapData } from '../../services/SitemapService';

interface SitemapGeneratorProps {
  showAdvanced?: boolean;
}

/**
 * Sitemap Generator Component
 * Provides UI for generating and downloading XML sitemaps
 */
const SitemapGenerator: React.FC<SitemapGeneratorProps> = ({ 
  showAdvanced = false 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sitemapData, setSitemapData] = useState<SitemapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [includeProducts, setIncludeProducts] = useState(true);
  const [includeCategories, setIncludeCategories] = useState(true);
  const [includeStatic, setIncludeStatic] = useState(true);

  const handleGenerateSitemap = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const data = await SitemapService.generateSitemap();
      setSitemapData(data);
    } catch (err) {
      setError('Failed to generate sitemap. Please try again.');
      console.error('Sitemap generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadXML = () => {
    if (!sitemapData) return;

    const xmlContent = SitemapService.generateXML(sitemapData);
    SitemapService.downloadSitemap(xmlContent, 'sitemap.xml');
  };

  const handleDownloadRobots = () => {
    const robotsContent = SitemapService.generateRobotsTxt();
    const blob = new Blob([robotsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'robots.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (urls: number): string => {
    const avgBytesPerUrl = 100; // Approximate bytes per URL entry
    const totalBytes = urls * avgBytesPerUrl;
    if (totalBytes < 1024) return `${totalBytes} B`;
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="h-100">
      <Card.Header>
        <h5 className="mb-0 d-flex align-items-center">
          <i className="bi bi-diagram-3 me-2"></i>
          XML Sitemap Generator
        </h5>
      </Card.Header>
      <Card.Body>
        {showAdvanced && (
          <div className="mb-3">
            <Form.Label className="fw-bold">Include in Sitemap:</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check
                type="checkbox"
                id="include-static"
                label="Static Pages"
                checked={includeStatic}
                onChange={(e) => setIncludeStatic(e.target.checked)}
              />
              <Form.Check
                type="checkbox"
                id="include-products"
                label="Products"
                checked={includeProducts}
                onChange={(e) => setIncludeProducts(e.target.checked)}
              />
              <Form.Check
                type="checkbox"
                id="include-categories"
                label="Categories"
                checked={includeCategories}
                onChange={(e) => setIncludeCategories(e.target.checked)}
              />
            </div>
          </div>
        )}

        <div className="d-grid gap-2">
          <Button
            variant="primary"
            onClick={handleGenerateSitemap}
            disabled={isGenerating}
            size="lg"
          >
            {isGenerating ? (
              <>
                <Spinner size="sm" className="me-2" />
                Generating Sitemap...
              </>
            ) : (
              <>
                <i className="bi bi-gear me-2"></i>
                Generate Sitemap
              </>
            )}
          </Button>

          {sitemapData && (
            <>
              <Button
                variant="success"
                onClick={handleDownloadXML}
                className="d-flex align-items-center justify-content-center"
              >
                <i className="bi bi-download me-2"></i>
                Download XML Sitemap
              </Button>

              <Button
                variant="outline-secondary"
                onClick={handleDownloadRobots}
                className="d-flex align-items-center justify-content-center"
              >
                <i className="bi bi-file-text me-2"></i>
                Download robots.txt
              </Button>
            </>
          )}
        </div>

        {error && (
          <Alert variant="danger" className="mt-3 mb-0">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {sitemapData && (
          <Alert variant="success" className="mt-3 mb-0">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6 className="alert-heading mb-2">
                  <i className="bi bi-check-circle me-2"></i>
                  Sitemap Generated Successfully
                </h6>
                <div className="d-flex gap-3 flex-wrap">
                  <Badge bg="primary">
                    {sitemapData.totalUrls.toLocaleString()} URLs
                  </Badge>
                  <Badge bg="info">
                    {formatFileSize(sitemapData.totalUrls)}
                  </Badge>
                  <Badge bg="secondary">
                    Generated {new Date(sitemapData.lastGenerated).toLocaleString()}
                  </Badge>
                </div>
              </div>
            </div>
          </Alert>
        )}

        <div className="mt-3 pt-3 border-top">
          <h6 className="text-muted mb-2">
            <i className="bi bi-info-circle me-2"></i>
            SEO Information
          </h6>
          <ul className="list-unstyled small text-muted mb-0">
            <li>• XML sitemaps help search engines discover and index your pages</li>
            <li>• robots.txt guides search engine crawlers</li>
            <li>• Sitemaps should be submitted to Google Search Console</li>
            <li>• Maximum 50,000 URLs per sitemap (Google limit)</li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SitemapGenerator;