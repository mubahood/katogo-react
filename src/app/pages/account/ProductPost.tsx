// src/app/pages/account/ProductPost.tsx
/**
 * PRODUCT POST PAGE
 * 
 * Multi-step form for creating/editing products
 * Follows ProfileEdit design system for consistency
 * 
 * Features:
 * ✅ 3-step wizard with progress indicator
 * ✅ Multiple image upload with drag & drop
 * ✅ Category selection modal
 * ✅ Simple pricing (selling & original price)
 * ✅ Comprehensive validation
 * ✅ Loading states
 * ✅ Mobile-first responsive
 * ✅ API integration with local_id tracking
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  FiPackage,
  FiDollarSign,
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
  FiCamera,
  FiX,
  FiUpload,
  FiLoader,
  FiImage,
  FiTag,
} from 'react-icons/fi';
import ProductService, { ProductFormData } from '../../services/ProductService';
import { ProductCategory } from '../../models/ProductModels';
import ToastService from '../../services/ToastService';
import Utils from '../../services/Utils';
import './ProductPost.css';

interface ProductFormState {
  // Basic Info (Step 1)
  name: string;
  description: string;
  selectedImages: File[];
  imagePreview: string[];
  
  // Pricing & Category (Step 2)
  category: string;
  category_text: string;
  price_1: string;
  price_2: string;
  
  // Options (Step 2)
  has_sizes: 'Yes' | 'No';
  has_colors: 'Yes' | 'No';
  sizes: string;
  colors: string;
}

const ProductPost: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!id;

  // Loading states
  const [initialLoading, setInitialLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form state
  const [formData, setFormData] = useState<ProductFormState>({
    name: '',
    description: '',
    selectedImages: [],
    imagePreview: [],
    category: '',
    category_text: '',
    price_1: '',
    price_2: '',
    has_sizes: 'No',
    has_colors: 'No',
    sizes: '',
    colors: '',
  });

  // Categories state
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

  // Local ID for tracking (generated once)
  const [localId] = useState(() => ProductService.generateLocalId());

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  /**
   * Fetch product categories from backend
   */
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      // TODO: Implement proper category fetching endpoint
      // For now, using mock data
      const mockCategories: ProductCategory[] = [
        { id: 1, name: 'Electronics', description: 'Electronic devices', status: 1, created_at: '', updated_at: '' },
        { id: 2, name: 'Fashion', description: 'Clothing and accessories', status: 1, created_at: '', updated_at: '' },
        { id: 3, name: 'Home & Garden', description: 'Home improvement', status: 1, created_at: '', updated_at: '' },
        { id: 4, name: 'Sports & Outdoors', description: 'Sporting goods', status: 1, created_at: '', updated_at: '' },
        { id: 5, name: 'Books', description: 'Books and media', status: 1, created_at: '', updated_at: '' },
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      ToastService.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Handle image selection from file input
   */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      addImages(Array.from(files));
    }
  };

  /**
   * Handle drag events
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  /**
   * Handle drop event
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files) {
      addImages(Array.from(files));
    }
  }, []);

  /**
   * Add images to form
   */
  const addImages = (files: File[]) => {
    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      ToastService.error('Please select image files only');
      return;
    }

    // Validate file sizes
    const oversizedFiles = imageFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      ToastService.error('Some images are larger than 5MB and were skipped');
    }

    // Filter valid files
    const validFiles = imageFiles.filter(file => file.size <= 5 * 1024 * 1024);
    
    if (validFiles.length === 0) {
      return;
    }

    // Create preview URLs
    const newPreviews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          setFormData(prev => ({
            ...prev,
            selectedImages: [...prev.selectedImages, ...validFiles],
            imagePreview: [...prev.imagePreview, ...newPreviews],
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    ToastService.success(`Added ${validFiles.length} image(s)`);
  };

  /**
   * Remove image
   */
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      selectedImages: prev.selectedImages.filter((_, i) => i !== index),
      imagePreview: prev.imagePreview.filter((_, i) => i !== index),
    }));
  };

  /**
   * Trigger file input click
   */
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle category selection
   */
  const handleCategorySelect = (category: ProductCategory) => {
    setFormData(prev => ({
      ...prev,
      category: category.id.toString(),
      category_text: category.name,
    }));
    setShowCategoryPicker(false);
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  /**
   * Validate current step
   */
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Basic Info validation
      if (!formData.name.trim()) {
        newErrors.name = 'Product name is required';
      } else if (formData.name.trim().length < 3) {
        newErrors.name = 'Product name must be at least 3 characters';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      } else if (formData.description.trim().length < 20) {
        newErrors.description = 'Description must be at least 20 characters';
      }

      if (formData.selectedImages.length === 0) {
        newErrors.images = 'At least one product image is required';
      }
    }

    if (step === 2) {
      // Pricing & Category validation
      if (!formData.category) {
        newErrors.category = 'Category is required';
      }

      if (!formData.price_1 || parseFloat(formData.price_1) <= 0) {
        newErrors.price_1 = 'Selling price is required';
      }

      if (!formData.price_2 || parseFloat(formData.price_2) <= 0) {
        newErrors.price_2 = 'Original price is required';
      }

      if (formData.price_1 && formData.price_2) {
        const price1 = parseFloat(formData.price_1);
        const price2 = parseFloat(formData.price_2);
        if (price1 > price2) {
          newErrors.price_1 = 'Selling price should not exceed original price';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Navigate steps
   */
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      ToastService.error('Please fix the errors before proceeding');
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Submit form
   */
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      ToastService.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      console.log('📦 Starting product creation process...');

      // Step 1: Upload images first
      console.log('📸 Uploading product images...');
      setUploadingImages(true);
      
      const uploadedImages = await ProductService.uploadProductImages(
        formData.selectedImages,
        localId,
        0
      );
      
      setUploadingImages(false);
      console.log(`✅ Uploaded ${uploadedImages.length} images`);

      // Step 2: Create product
      console.log('📤 Creating product...');
      
      const productData: ProductFormData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price_1: formData.price_1,
        price_2: formData.price_2,
        p_type: 'No', // Simple pricing (not tiered)
        has_sizes: formData.has_sizes,
        has_colors: formData.has_colors,
        sizes: formData.sizes,
        colors: formData.colors,
        local_id: localId,
        is_edit: isEdit ? 'Yes' : 'No',
        url: user?.url || '',
      };

      if (isEdit && id) {
        productData.id = parseInt(id);
      }

      const createdProduct = await ProductService.createProduct(productData);

      console.log('✅ Product created successfully:', createdProduct);

      ToastService.success('Product created successfully!');

      // Navigate to products list
      setTimeout(() => {
        navigate('/account/products');
      }, 1000);

    } catch (error: any) {
      console.error('❌ Failed to create product:', error);
      setUploadingImages(false);
      // Error already shown by ProductService
    } finally {
      setLoading(false);
    }
  };

  // Step titles and icons
  const steps = [
    { number: 1, title: 'Basic Info & Photos', icon: <FiPackage /> },
    { number: 2, title: 'Pricing & Category', icon: <FiDollarSign /> },
    { number: 3, title: 'Review & Submit', icon: <FiCheck /> },
  ];

  // Calculate progress percentage
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="product-post-page">
      <div className="product-post-container">
        {/* Header */}
        <div className="product-post-header">
          <h1 className="product-post-title">
            {isEdit ? 'Edit Product' : 'Post New Product'}
          </h1>
          <p className="product-post-subtitle">
            Fill in the details to list your product
          </p>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-steps">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`progress-step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
              >
                <div className="step-icon">
                  {currentStep > step.number ? <FiCheck /> : step.icon}
                </div>
                <span className="step-title">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="product-post-form">
          {/* Step 1: Basic Info & Photos */}
          {currentStep === 1 && (
            <div className="form-step active">
              <h2 className="step-heading">
                <FiPackage /> Basic Information & Photos
              </h2>

              {/* Product Name */}
              <div className="form-group">
                <label htmlFor="name">
                  Product Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter product name (e.g., iPhone 13 Pro)"
                  maxLength={100}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
                <small className="field-hint">{formData.name.length}/100 characters</small>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={errors.description ? 'error' : ''}
                  rows={6}
                  placeholder="Describe your product in detail... (minimum 20 characters)"
                  maxLength={5000}
                ></textarea>
                <div className="char-count">{formData.description.length}/5000</div>
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label>
                  Product Photos <span className="required">*</span>
                </label>
                
                {/* Drag & Drop Area */}
                <div
                  className={`image-upload-area ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  <FiUpload size={48} />
                  <h3>Drag & Drop Images Here</h3>
                  <p>or click to browse</p>
                  <small>Supports: JPG, PNG, GIF (Max 5MB each)</small>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />

                {errors.images && <span className="error-message">{errors.images}</span>}

                {/* Image Preview Grid */}
                {formData.imagePreview.length > 0 && (
                  <div className="image-preview-grid">
                    {formData.imagePreview.map((preview, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={preview} alt={`Product ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                        >
                          <FiX />
                        </button>
                        {index === 0 && (
                          <span className="feature-badge">Feature Photo</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <small className="field-hint">
                  {formData.selectedImages.length} image(s) selected. First image will be the feature photo.
                </small>
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Category */}
          {currentStep === 2 && (
            <div className="form-step active">
              <h2 className="step-heading">
                <FiDollarSign /> Pricing & Category
              </h2>

              {/* Category Selection */}
              <div className="form-group">
                <label htmlFor="category">
                  Category <span className="required">*</span>
                </label>
                <div
                  className={`category-selector ${errors.category ? 'error' : ''}`}
                  onClick={() => setShowCategoryPicker(true)}
                >
                  {formData.category_text ? (
                    <div className="selected-category">
                      <FiTag />
                      <span>{formData.category_text}</span>
                    </div>
                  ) : (
                    <div className="category-placeholder">
                      <FiTag />
                      <span>Select a category</span>
                    </div>
                  )}
                </div>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>

              {/* Pricing */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price_1">
                    Selling Price (UGX) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="price_1"
                    name="price_1"
                    value={formData.price_1}
                    onChange={handleChange}
                    className={errors.price_1 ? 'error' : ''}
                    placeholder="10000"
                    min="0"
                    step="1000"
                  />
                  {errors.price_1 && <span className="error-message">{errors.price_1}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="price_2">
                    Original Price (UGX) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="price_2"
                    name="price_2"
                    value={formData.price_2}
                    onChange={handleChange}
                    className={errors.price_2 ? 'error' : ''}
                    placeholder="15000"
                    min="0"
                    step="1000"
                  />
                  {errors.price_2 && <span className="error-message">{errors.price_2}</span>}
                  <small className="field-hint">For discount calculations</small>
                </div>
              </div>

              {/* Options */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="has_sizes">Has Size Options?</label>
                  <select
                    id="has_sizes"
                    name="has_sizes"
                    value={formData.has_sizes}
                    onChange={(e) => setFormData(prev => ({ ...prev, has_sizes: e.target.value as 'Yes' | 'No' }))}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="has_colors">Has Color Options?</label>
                  <select
                    id="has_colors"
                    name="has_colors"
                    value={formData.has_colors}
                    onChange={(e) => setFormData(prev => ({ ...prev, has_colors: e.target.value as 'Yes' | 'No' }))}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              {/* Sizes (if enabled) */}
              {formData.has_sizes === 'Yes' && (
                <div className="form-group">
                  <label htmlFor="sizes">Available Sizes</label>
                  <input
                    type="text"
                    id="sizes"
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleChange}
                    placeholder="e.g., S, M, L, XL"
                  />
                  <small className="field-hint">Separate with commas</small>
                </div>
              )}

              {/* Colors (if enabled) */}
              {formData.has_colors === 'Yes' && (
                <div className="form-group">
                  <label htmlFor="colors">Available Colors</label>
                  <input
                    type="text"
                    id="colors"
                    name="colors"
                    value={formData.colors}
                    onChange={handleChange}
                    placeholder="e.g., Red, Blue, Black"
                  />
                  <small className="field-hint">Separate with commas</small>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="form-step active">
              <h2 className="step-heading">
                <FiCheck /> Review Your Product
              </h2>

              <div className="review-section">
                {/* Product Summary */}
                <div className="review-card">
                  <h3>Product Details</h3>
                  <div className="review-item">
                    <strong>Name:</strong>
                    <span>{formData.name}</span>
                  </div>
                  <div className="review-item">
                    <strong>Description:</strong>
                    <span>{formData.description}</span>
                  </div>
                  <div className="review-item">
                    <strong>Category:</strong>
                    <span>{formData.category_text}</span>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="review-card">
                  <h3>Pricing</h3>
                  <div className="review-item">
                    <strong>Selling Price:</strong>
                    <span>UGX {parseFloat(formData.price_1).toLocaleString()}</span>
                  </div>
                  <div className="review-item">
                    <strong>Original Price:</strong>
                    <span>UGX {parseFloat(formData.price_2).toLocaleString()}</span>
                  </div>
                  {parseFloat(formData.price_2) > parseFloat(formData.price_1) && (
                    <div className="review-item">
                      <strong>Discount:</strong>
                      <span className="discount-badge">
                        {ProductService.calculateDiscount(formData.price_2, formData.price_1)}% OFF
                      </span>
                    </div>
                  )}
                </div>

                {/* Images Preview */}
                <div className="review-card">
                  <h3>Product Photos ({formData.selectedImages.length})</h3>
                  <div className="review-images">
                    {formData.imagePreview.map((preview, index) => (
                      <img key={index} src={preview} alt={`Product ${index + 1}`} />
                    ))}
                  </div>
                </div>

                {/* Options Summary */}
                {(formData.has_sizes === 'Yes' || formData.has_colors === 'Yes') && (
                  <div className="review-card">
                    <h3>Options</h3>
                    {formData.has_sizes === 'Yes' && (
                      <div className="review-item">
                        <strong>Sizes:</strong>
                        <span>{formData.sizes || 'Not specified'}</span>
                      </div>
                    )}
                    {formData.has_colors === 'Yes' && (
                      <div className="review-item">
                        <strong>Colors:</strong>
                        <span>{formData.colors || 'Not specified'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handlePrev}
                disabled={loading}
              >
                <FiArrowLeft /> Previous
              </button>
            )}

            {currentStep < totalSteps && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
              >
                Next <FiArrowRight />
              </button>
            )}

            {currentStep === totalSteps && (
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={loading || uploadingImages}
              >
                {loading ? (
                  <>
                    <FiLoader className="spinner-icon" /> 
                    {uploadingImages ? 'Uploading Images...' : 'Creating Product...'}
                  </>
                ) : (
                  <>
                    {isEdit ? 'Update Product' : 'Create Product'} <FiCheck />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <div className="modal-overlay" onClick={() => setShowCategoryPicker(false)}>
          <div className="modal-content category-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Category</h3>
              <button onClick={() => setShowCategoryPicker(false)} className="modal-close-btn">
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              {loadingCategories ? (
                <div className="loading-categories">
                  <FiLoader className="spinner-icon" />
                  <p>Loading categories...</p>
                </div>
              ) : (
                <div className="category-list">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`category-item ${formData.category === category.id.toString() ? 'selected' : ''}`}
                      onClick={() => handleCategorySelect(category)}
                    >
                      <FiTag />
                      <div className="category-info">
                        <strong>{category.name}</strong>
                        {category.description && <small>{category.description}</small>}
                      </div>
                      {formData.category === category.id.toString() && (
                        <FiCheck className="check-icon" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPost;
