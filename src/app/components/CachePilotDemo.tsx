// src/app/components/CachePilotDemo.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Table } from 'react-bootstrap';
import { CacheApiService } from '../services/CacheApiService';
import { CacheService, CacheStats as ServiceCacheStats } from '../services/CacheService';
import CategoryModel from '../models/CategoryModel';
import ApiService from '../services/ApiService';

interface LoadingState {
  cached: boolean;
  traditional: boolean;
}

interface PerformanceMetrics {
  cached: {
    loadTime: number;
    source: 'cache' | 'api';
  };
  traditional: {
    loadTime: number;
    source: 'api';
  };
}

const CachePilotDemo: React.FC = () => {
  const [categories, setCategories] = useState<CategoryModel[] | null>(null);
  const [traditionalCategories, setTraditionalCategories] = useState<CategoryModel[] | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ cached: false, traditional: false });
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState<ServiceCacheStats | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);

  // Update cache stats
  const updateCacheStats = () => {
    const stats = CacheService.getInstance().getStats();
    setCacheStats(stats);
  };

  // Load categories using cache-first approach
  const loadCachedCategories = async () => {
    setLoading(prev => ({ ...prev, cached: true }));
    setError(null);
    
    const startTime = window.performance.now();
    
    try {
      const result = await CacheApiService.getCategories();
      const endTime = window.performance.now();
      const loadTime = endTime - startTime;
      
      setCategories(result);
      setPerformance(prev => ({
        cached: {
          loadTime,
          source: 'api' // We'll determine this from cache stats
        },
        traditional: prev?.traditional || { loadTime: 0, source: 'api' }
      }));
      
      updateCacheStats();
    } catch (err) {
      setError('Failed to load cached categories: ' + (err as Error).message);
    } finally {
      setLoading(prev => ({ ...prev, cached: false }));
    }
  };

  // Load categories using traditional approach
  const loadTraditionalCategories = async () => {
    setLoading(prev => ({ ...prev, traditional: true }));
    setError(null);
    
    const startTime = window.performance.now();
    
    try {
      const result = await ApiService.getCategories();
      const endTime = window.performance.now();
      const loadTime = endTime - startTime;
      
      setTraditionalCategories(result);
      setPerformance(prev => ({
        cached: prev?.cached || { loadTime: 0, source: 'api' },
        traditional: {
          loadTime,
          source: 'api'
        }
      }));
    } catch (err) {
      setError('Failed to load traditional categories: ' + (err as Error).message);
    } finally {
      setLoading(prev => ({ ...prev, traditional: false }));
    }
  };

  // Clear cache
  const clearCache = () => {
    CacheService.getInstance().clearAll();
    updateCacheStats();
    setCategories(null);
    setPerformance(null);
  };

  // Load cache stats on mount
  useEffect(() => {
    updateCacheStats();
  }, []);

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">🚀 Cache Performance Pilot Demo</h4>
              <small>Comparing cache-first vs traditional API calls</small>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={3}>
                  <Button
                    variant="success"
                    onClick={loadCachedCategories}
                    disabled={loading.cached}
                    className="w-100"
                  >
                    {loading.cached ? (
                      <><Spinner animation="border" size="sm" /> Loading Cached...</>
                    ) : (
                      '⚡ Load with Cache'
                    )}
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    variant="outline-primary"
                    onClick={loadTraditionalCategories}
                    disabled={loading.traditional}
                    className="w-100"
                  >
                    {loading.traditional ? (
                      <><Spinner animation="border" size="sm" /> Loading Traditional...</>
                    ) : (
                      '🐌 Load Traditional'
                    )}
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    variant="warning"
                    onClick={clearCache}
                    className="w-100"
                  >
                    🗑️ Clear Cache
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    variant="info"
                    onClick={updateCacheStats}
                    className="w-100"
                  >
                    📊 Refresh Stats
                  </Button>
                </Col>
              </Row>

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              {/* Performance Metrics */}
              {performance && (
                <Row className="mb-4">
                  <Col md={6}>
                    <Card className={performance.cached.source === 'cache' ? 'border-success' : 'border-warning'}>
                      <Card.Header className="bg-light">
                        <strong>⚡ Cache-First Performance</strong>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Load Time:</span>
                          <Badge bg={performance.cached.loadTime < 50 ? 'success' : 'warning'}>
                            {performance.cached.loadTime.toFixed(2)}ms
                          </Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <span>Source:</span>
                          <Badge bg={performance.cached.source === 'cache' ? 'success' : 'info'}>
                            {performance.cached.source === 'cache' ? '💾 Cache Hit' : '🌐 API Call'}
                          </Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="border-secondary">
                      <Card.Header className="bg-light">
                        <strong>🐌 Traditional Performance</strong>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Load Time:</span>
                          <Badge bg="secondary">
                            {performance.traditional.loadTime.toFixed(2)}ms
                          </Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <span>Source:</span>
                          <Badge bg="secondary">
                            🌐 Always API
                          </Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* Cache Statistics */}
              {cacheStats && (
                <Row className="mb-4">
                  <Col>
                    <Card>
                      <Card.Header>
                        <strong>📈 Cache Statistics</strong>
                      </Card.Header>
                      <Card.Body>
                        <Table size="sm" striped>
                          <tbody>
                            <tr>
                              <td>Cache Hits</td>
                              <td><Badge bg="success">{cacheStats.hits}</Badge></td>
                            </tr>
                            <tr>
                              <td>Cache Misses</td>
                              <td><Badge bg="warning">{cacheStats.misses}</Badge></td>
                            </tr>
                            <tr>
                              <td>Hit Rate</td>
                              <td>
                                <Badge bg={cacheStats.hitRate > 0.7 ? 'success' : cacheStats.hitRate > 0.4 ? 'warning' : 'danger'}>
                                  {(cacheStats.hitRate * 100).toFixed(1)}%
                                </Badge>
                              </td>
                            </tr>
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* Categories Comparison */}
              <Row>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header className="bg-success text-white">
                      <strong>⚡ Cached Categories ({categories?.length || 0})</strong>
                    </Card.Header>
                    <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {categories ? (
                        categories.slice(0, 10).map((category) => (
                          <div key={category.id} className="border-bottom pb-2 mb-2">
                            <strong>{category.category}</strong>
                            <br />
                            <small className="text-muted">
                              ID: {category.id} | Products: {category.category_text}
                              {category.isShownInBanner() && (
                                <Badge bg="warning" className="ms-1">Banner</Badge>
                              )}
                            </small>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted">
                          Click "Load with Cache" to see categories
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header className="bg-secondary text-white">
                      <strong>🐌 Traditional Categories ({traditionalCategories?.length || 0})</strong>
                    </Card.Header>
                    <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {traditionalCategories ? (
                        traditionalCategories.slice(0, 10).map((category) => (
                          <div key={category.id} className="border-bottom pb-2 mb-2">
                            <strong>{category.category}</strong>
                            <br />
                            <small className="text-muted">
                              ID: {category.id} | Products: {category.category_text}
                              {category.isShownInBanner() && (
                                <Badge bg="warning" className="ms-1">Banner</Badge>
                              )}
                            </small>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted">
                          Click "Load Traditional" to see categories
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Instructions */}
              <Row className="mt-4">
                <Col>
                  <Alert variant="info">
                    <h6>🧪 How to Test Cache Performance:</h6>
                    <ol className="mb-0">
                      <li><strong>First Load:</strong> Click "Load with Cache" - this will be slower as it fetches from API</li>
                      <li><strong>Cached Load:</strong> Click "Load with Cache" again - this should be much faster (cache hit)</li>
                      <li><strong>Compare:</strong> Click "Load Traditional" to see the difference in speed</li>
                      <li><strong>Reset:</strong> Click "Clear Cache" and repeat to test cache miss vs hit scenarios</li>
                    </ol>
                  </Alert>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CachePilotDemo;