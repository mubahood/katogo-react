// src/app/pages/account/MyProducts.tsx
/**
 * MY PRODUCTS PAGE
 * 
 * User's product listing page with CRUD operations
 * Consistent with ProfileEdit design system
 * 
 * Features:
 * ✅ Product grid/list view
 * ✅ Search by name
 * ✅ Filter by category
 * ✅ Edit/Delete actions
 * ✅ Empty state with CTA
 * ✅ Loading states
 * ✅ Mobile-first responsive
 * ✅ Product status badges
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  FiPackage,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiLoader,
  FiShoppingBag,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import ProductService from '../../services/ProductService';
import { Product, ProductCategory, formatProductPrice, calculateDiscount, getProductStatusLabel, getProductStatusColor } from '../../models/ProductModels';
import ToastService from '../../services/ToastService';
import Utils from '../../services/Utils';
import './MyProducts.css';

type ViewMode = 'grid' | 'list';

const MyProducts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products when search/category changes
  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  /**
   * Fetch user's products
   */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await ProductService.getMyProducts();
      
      // Filter to show only current user's products
      const myProducts = fetchedProducts.filter(p => p.user === user?.id);
      
      setProducts(myProducts);
      console.log(`✅ Loaded ${myProducts.length} products`);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Error already shown by ProductService
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter products based on search and category
   */
  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  /**
   * Handle delete product
   */
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      await ProductService.deleteProduct(productToDelete.id);
      
      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
      // Error already shown by ProductService
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Handle edit product
   */
  const handleEdit = (productId: number) => {
    navigate(`/account/products/edit/${productId}`);
  };

  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  return (
    <div className="my-products-page">
      <div className="my-products-container">
        {/* Header */}
        <div className="my-products-header">
          <div className="header-left">
            <h1 className="page-title">
              <FiShoppingBag /> My Products
            </h1>
            <p className="page-subtitle">
              {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/account/products/new" className="btn btn-primary">
            <FiPlus /> Add Product
          </Link>
        </div>

        {/* Toolbar */}
        <div className="products-toolbar">
          {/* Search */}
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="filter-box">
              <FiFilter />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    Category {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* View Toggle */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FiGrid />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <FiList />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <FiLoader className="spinner-icon" />
            <p>Loading products...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="empty-state">
            <FiPackage size={64} />
            <h2>No Products Yet</h2>
            <p>Start selling by adding your first product</p>
            <Link to="/account/products/new" className="btn btn-primary">
              <FiPlus /> Add Your First Product
            </Link>
          </div>
        )}

        {/* No Results State */}
        {!loading && products.length > 0 && filteredProducts.length === 0 && (
          <div className="empty-state">
            <FiSearch size={64} />
            <h2>No Products Found</h2>
            <p>Try adjusting your search or filters</p>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Products Grid/List */}
        {!loading && filteredProducts.length > 0 && (
          <div className={`products-${viewMode}`}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && productToDelete && (
        <div className="modal-overlay" onClick={() => !deleting && setShowDeleteConfirm(false)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Product</h3>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <FiAlertCircle size={48} />
                <p>Are you sure you want to delete <strong>{productToDelete.name}</strong>?</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <FiLoader className="spinner-icon" /> Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 /> Delete Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Product Card Component
 */
interface ProductCardProps {
  product: Product;
  viewMode: ViewMode;
  onEdit: (productId: number) => void;
  onDelete: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode, onEdit, onDelete }) => {
  const discount = calculateDiscount(product.price_2, product.price_1);
  const statusColor = getProductStatusColor(product.status);
  const statusLabel = getProductStatusLabel(product.status);

  if (viewMode === 'list') {
    return (
      <div className="product-card list-view">
        <div className="product-image">
          <img src={Utils.img(product.feature_photo)} alt={product.name} />
          {discount > 0 && (
            <span className="discount-badge">{discount}% OFF</span>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description.substring(0, 100)}...</p>
          
          <div className="product-meta">
            <span className="product-status" style={{ color: statusColor }}>
              {statusLabel}
            </span>
            <span className="product-stock">
              {product.in_stock === 1 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        <div className="product-pricing">
          <div className="price-display">
            <span className="selling-price">{formatProductPrice(product.price_1)}</span>
            {discount > 0 && (
              <span className="original-price">{formatProductPrice(product.price_2)}</span>
            )}
          </div>
        </div>

        <div className="product-actions">
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit(product.id)}
            title="Edit"
          >
            <FiEdit3 /> Edit
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => onDelete(product)}
            title="Delete"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="product-card grid-view">
      <div className="product-image">
        <img src={Utils.img(product.feature_photo)} alt={product.name} />
        {discount > 0 && (
          <span className="discount-badge">{discount}% OFF</span>
        )}
        <span className="status-badge" style={{ backgroundColor: statusColor }}>
          {statusLabel}
        </span>
      </div>

      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description.substring(0, 80)}...</p>

        <div className="product-footer">
          <div className="price-display">
            <span className="selling-price">{formatProductPrice(product.price_1)}</span>
            {discount > 0 && (
              <span className="original-price">{formatProductPrice(product.price_2)}</span>
            )}
          </div>

          <div className="product-actions">
            <button
              className="action-btn edit-btn"
              onClick={() => onEdit(product.id)}
              title="Edit"
            >
              <FiEdit3 />
            </button>
            <button
              className="action-btn delete-btn"
              onClick={() => onDelete(product)}
              title="Delete"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProducts;
