// src/app/pages/account/AccountProducts.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spinner, Alert, Badge, Modal, Form } from 'react-bootstrap';
import AccountApiService, { UserProduct } from '../../services/AccountApiService';

const AccountProducts: React.FC = () => {
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<UserProduct | null>(null);

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await AccountApiService.getUserProducts(currentPage);
      setProducts(response.data);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load your products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await AccountApiService.deleteProduct(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
        setTotalItems(prev => prev - 1);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'sold': return 'primary';
      case 'inactive': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading your products...</span>
      </div>
    );
  }

  return (
    <div className="account-products">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-title mb-2">My Products</h2>
          <p className="text-muted">Manage the products you're selling</p>
        </div>
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add Product
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {products.length > 0 ? (
        <>
          <Row>
            {products.map((product) => (
              <Col md={6} lg={4} key={product.id} className="mb-4">
                <Card className="h-100 border-0 shadow-sm product-card">
                  <div className="position-relative">
                    {product.image ? (
                      <Card.Img 
                        variant="top" 
                        src={product.image} 
                        alt={product.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="bg-light d-flex align-items-center justify-content-center"
                        style={{ height: '200px' }}
                      >
                        <i className="bi bi-image display-4 text-muted"></i>
                      </div>
                    )}
                    
                    {/* Status badge */}
                    <div className="position-absolute top-0 start-0 p-2">
                      <Badge bg={getStatusColor(product.status)}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  <Card.Body>
                    <h6 className="card-title mb-2">{product.name}</h6>
                    
                    <p className="card-text text-muted small mb-3" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.description}
                    </p>

                    <div className="product-stats mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-primary fw-bold fs-5">
                          ${product.price.toFixed(2)}
                        </span>
                        <div className="d-flex align-items-center text-muted small">
                          <i className="bi bi-eye me-1"></i>
                          {product.views_count} views
                        </div>
                      </div>
                      
                      <div className="small text-muted">
                        Listed on {formatDate(product.created_at)}
                      </div>
                    </div>
                  </Card.Body>

                  <Card.Footer className="bg-transparent border-0 pt-0">
                    <div className="d-grid gap-2">
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          className="flex-grow-1"
                          onClick={() => setEditingProduct(product)}
                        >
                          <i className="bi bi-pencil me-2"></i>
                          Edit
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          title="View product page"
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Delete product"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {totalItems > 12 && (
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant="outline-primary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="me-2"
              >
                <i className="bi bi-chevron-left"></i> Previous
              </Button>
              <span className="align-self-center mx-3 small text-muted">
                Page {currentPage} of {Math.ceil(totalItems / 12)}
              </span>
              <Button
                variant="outline-primary"
                size="sm"
                disabled={currentPage >= Math.ceil(totalItems / 12)}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="ms-2"
              >
                Next <i className="bi bi-chevron-right"></i>
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-bag display-1 text-muted"></i>
          </div>
          <h4 className="mb-3">No Products Listed</h4>
          <p className="text-muted mb-4">
            Start selling by adding your first product to the marketplace.
          </p>
          <Button 
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add Your First Product
          </Button>
        </div>
      )}

      {/* Create/Edit Product Modal */}
      <Modal 
        show={showCreateModal || editingProduct !== null} 
        onHide={() => {
          setShowCreateModal(false);
          setEditingProduct(null);
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-4">
            This is a placeholder for the product creation/editing form. 
            In a real implementation, this would include:
          </p>
          <ul className="text-muted">
            <li>Product name and description fields</li>
            <li>Price input</li>
            <li>Category selection</li>
            <li>Image upload</li>
            <li>Status selection (active/inactive)</li>
            <li>Form validation and submission</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowCreateModal(false);
              setEditingProduct(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="primary">
            {editingProduct ? 'Update Product' : 'Create Product'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AccountProducts;