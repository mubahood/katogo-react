# Product Posting System - Complete Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Components](#components)
- [API Integration](#api-integration)
- [Data Models](#data-models)
- [User Flows](#user-flows)
- [Validation Rules](#validation-rules)
- [Styling & Design System](#styling--design-system)
- [Testing Guide](#testing-guide)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)

---

## Overview

The Product Posting System is a comprehensive React TypeScript implementation that allows users to create, manage, and list their marketplace products. Built with consistency to the ProfileEdit design system, it provides a seamless multi-step form experience with image upload capabilities.

### Key Features
✅ **3-Step Product Creation Form**
- Step 1: Basic Info & Photos (name, description, multi-image upload)
- Step 2: Pricing & Category (category picker, prices, options)
- Step 3: Review & Submit (summary cards, final confirmation)

✅ **Product Management**
- Grid and List view toggle
- Search by product name/description
- Filter by category
- Edit and Delete operations
- Empty state with quick add CTA

✅ **Image Upload**
- Drag & drop support
- Click to browse files
- Multiple image preview
- Remove individual images
- Feature photo badge (first image)
- Sequential upload to prevent server overload

✅ **Design Consistency**
- Matches ProfileEdit design system exactly
- Gold gradient theme (#FFD700 → #FFA500)
- Dark mode optimized (#0A0A0A background)
- Fully responsive (Desktop → Tablet → Mobile)
- Smooth animations and transitions

---

## System Architecture

### Component Hierarchy
```
NewAccountLayout
└── Account (Protected Route)
    └── MyProducts
        ├── ProductCard (Grid View)
        ├── ProductCard (List View)
        └── DeleteConfirmModal
    └── ProductPost
        ├── ProgressBar
        ├── Step1: BasicInfoAndPhotos
        │   ├── ImageUploadArea
        │   └── ImagePreviewGrid
        ├── Step2: PricingAndCategory
        │   └── CategoryPickerModal
        └── Step3: ReviewAndSubmit
            └── ReviewCards
```

### Data Flow
```
┌─────────────────┐
│   ProductPost   │
│   (Form Input)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ProductService  │
│ (Business Logic)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend API   │
│  (Laravel PHP)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Database     │
│ (Products+Images)│
└─────────────────┘
```

### Image Upload Flow
```
1. User selects images (drag-drop or click)
2. Files validated (type, size)
3. Preview generated (FileReader.readAsDataURL)
4. On submit:
   a. Upload images sequentially (ProductService.uploadProductImages)
   b. Each image uploaded with local_id and parent_id=0
   c. Backend creates Image records
5. Create product (ProductService.createProduct)
   a. Product created with same local_id
   b. Backend associates images via local_id match
6. Redirect to MyProducts list
```

---

## Components

### 1. ProductPost.tsx
**Location**: `/src/app/pages/account/ProductPost.tsx`  
**Lines**: 920  
**Purpose**: Multi-step product creation/edit form

#### Props
- None (uses URL params for edit mode: `/account/products/edit/:id`)

#### State Management
```typescript
interface ProductFormState {
  // Basic Info
  name: string;
  description: string;
  
  // Images
  selectedImages: File[];
  imagePreview: string[];
  
  // Category
  category: string;
  category_text: string;
  
  // Pricing
  price_1: string;
  price_2: string;
  
  // Options
  has_sizes: 'Yes' | 'No';
  has_colors: 'Yes' | 'No';
  sizes: string;
  colors: string;
}

// Additional state
const [currentStep, setCurrentStep] = useState(1);
const [loading, setLoading] = useState(false);
const [uploadingImages, setUploadingImages] = useState(false);
const [errors, setErrors] = useState<Record<string, string>>({});
const [showCategoryModal, setShowCategoryModal] = useState(false);
const [dragActive, setDragActive] = useState(false);
const localIdRef = useRef<string>('');
```

#### Key Methods
- `generateLocalId()`: Creates unique timestamp-based ID
- `handleInputChange()`: Updates form data state
- `handleNextStep()`: Validates current step, proceeds if valid
- `handlePreviousStep()`: Goes back to previous step
- `addImages()`: Validates and adds images to preview
- `removeImage()`: Removes image from preview by index
- `handleDrop()`: Handles drag-drop file input
- `handleDragOver/Enter/Leave()`: Visual feedback for drag state
- `selectCategory()`: Sets category and closes modal
- `handleSubmit()`: Main form submission (upload images → create product)

#### Validation Per Step
**Step 1**:
- Name: Required, 3-100 characters
- Description: Required, 20-5000 characters
- Images: At least 1 image required

**Step 2**:
- Category: Required selection
- Selling Price (price_1): Required, must be positive number
- Original Price (price_2): Optional, if provided must be ≥ selling price

**Step 3**:
- Review only, no additional validation

---

### 2. MyProducts.tsx
**Location**: `/src/app/pages/account/MyProducts.tsx`  
**Lines**: 435  
**Purpose**: Product listing with CRUD operations

#### State Management
```typescript
const [products, setProducts] = useState<Product[]>([]);
const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
const [viewMode, setViewMode] = useState<ViewMode>('grid');
const [searchQuery, setSearchQuery] = useState('');
const [selectedCategory, setSelectedCategory] = useState('');
const [loading, setLoading] = useState(true);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [productToDelete, setProductToDelete] = useState<Product | null>(null);
```

#### Key Methods
- `fetchProducts()`: Loads user's products from API
- `filterProducts()`: Applies search and category filters
- `handleDelete()`: Opens delete confirmation modal
- `confirmDelete()`: Executes product deletion via API
- `toggleViewMode()`: Switches between grid and list views

#### ProductCard Component
Displays individual product with:
- Feature photo (placeholder if none)
- Product name (truncated)
- Description (truncated: 80 chars grid, 100 chars list)
- Prices (price_1, price_2 with strikethrough)
- Discount badge (if price_2 > price_1)
- Status badge (Pending/Approved/Rejected)
- Edit button (navigates to edit route)
- Delete button (opens confirmation modal)

#### View Modes
**Grid View**:
- 3 columns desktop (280px min)
- 2 columns tablet (240px min)
- 1 column mobile
- Vertical card layout
- Image on top (1:1 aspect ratio)

**List View**:
- Horizontal card layout
- Image left (120px desktop, 100px tablet)
- Content center
- Pricing right
- Actions far right

---

### 3. ProductService.ts
**Location**: `/src/app/services/ProductService.ts`  
**Lines**: 365 (after consolidation)  
**Purpose**: Centralized product management service

#### Methods

##### `generateLocalId(): string`
Generates unique local ID for offline tracking
```typescript
const timestamp = Date.now();
const random = Math.random().toString(36).substring(2, 8);
return `${timestamp}_${random}`;
```

##### `createProduct(productData: ProductFormData): Promise<Product>`
Creates new product via API
- Validates required fields
- Ensures local_id exists
- Calls `product-create` endpoint
- Returns created product object

##### `uploadProductImage(file: File, local_id: string, parent_id: number): Promise<any>`
Uploads single image
- Creates FormData with file, parent_local_id, type: 'Product'
- Calls `post-media-upload` endpoint
- Returns uploaded image data

##### `uploadProductImages(files: File[], local_id: string, parent_id: number): Promise<any[]>`
Uploads multiple images sequentially
- Iterates through files array
- Calls uploadProductImage for each
- Collects results
- Returns array of uploaded images

##### `getMyProducts(filters?: ProductFilters): Promise<Product[]>`
Fetches user's products
- Calls `products-1` endpoint (TODO: implement my-products filter)
- Returns products array

##### `deleteProduct(productId: number): Promise<void>`
Deletes product
- Calls `products-delete` endpoint with product ID
- Shows success/error toast
- Returns void

##### `validateProductData(data: Partial<ProductFormData>): Record<string, string>`
Client-side validation
- Returns object with field errors
- Empty object = valid

##### Helper Methods
- `formatPrice(price: string | number): string` - Formats price display
- `calculateDiscount(original: string, selling: string): number` - Calculates discount %

---

## API Integration

### Backend Endpoints

#### 1. POST `product-create`
**Purpose**: Create or update product

**Request Body**:
```json
{
  "name": "Product Name",
  "description": "Product description...",
  "category": "1",
  "category_text": "Electronics",
  "price_1": "50000",
  "price_2": "70000",
  "has_sizes": "No",
  "has_colors": "Yes",
  "colors": "Red, Blue, Green",
  "local_id": "1696348800000_abc123",
  "p_type": "No"
}
```

**Response**:
```json
{
  "code": 1,
  "message": "Product created successfully",
  "data": {
    "id": 123,
    "name": "Product Name",
    "description": "...",
    "feature_photo": "images/products/123_main.jpg",
    "price_1": "50000",
    "price_2": "70000",
    "category": "1",
    "user": 45,
    "local_id": "1696348800000_abc123",
    "status": 0,
    "in_stock": 1,
    "images": [
      {
        "id": 456,
        "src": "images/products/123_1.jpg",
        "thumbnail": "images/products/thumb_123_1.jpg",
        "product_id": 123
      }
    ],
    "created_at": "2025-10-03T10:30:00Z",
    "updated_at": "2025-10-03T10:30:00Z"
  }
}
```

#### 2. POST `post-media-upload`
**Purpose**: Upload product image

**Request**: FormData
```
file: File (JPEG, PNG, GIF, WebP)
parent_local_id: "1696348800000_abc123"
type: "Product"
parent_id: 0 (before product creation)
```

**Response**:
```json
{
  "code": 1,
  "message": "Image uploaded successfully",
  "data": {
    "id": 456,
    "src": "images/products/temp_1696348800000_1.jpg",
    "thumbnail": "images/products/thumb_temp_1696348800000_1.jpg",
    "parent_local_id": "1696348800000_abc123",
    "type": "Product",
    "product_id": null,
    "created_at": "2025-10-03T10:28:00Z"
  }
}
```

#### 3. GET `products-1`
**Purpose**: Fetch products list (latest 1000)

**Query Params**: None (TODO: add user filter)

**Response**:
```json
{
  "code": 1,
  "data": [
    {
      "id": 123,
      "name": "Product Name",
      "description": "...",
      "feature_photo": "images/products/123_main.jpg",
      "price_1": "50000",
      "price_2": "70000",
      "category": "1",
      "user": 45,
      "status": 1,
      "in_stock": 1,
      "images": [...],
      "category_data": {...}
    }
  ]
}
```

#### 4. POST `products-delete`
**Purpose**: Delete product by ID

**Request Body**:
```json
{
  "id": 123
}
```

**Response**:
```json
{
  "code": 1,
  "message": "Product deleted successfully"
}
```

---

## Data Models

### Product Interface
```typescript
interface Product {
  // Core fields
  id: number;
  name: string;
  description: string;
  feature_photo: string;
  
  // Pricing
  price_1: string; // Selling price
  price_2: string; // Original price (for discount)
  p_type: 'Yes' | 'No'; // Tiered pricing (not implemented)
  
  // Classification
  category: string; // Category ID
  user: number; // Owner user ID
  supplier: number;
  
  // Tracking
  local_id: string; // Unique offline ID
  
  // Options
  has_sizes: 'Yes' | 'No';
  has_colors: 'Yes' | 'No';
  sizes?: string; // Comma-separated
  colors?: string; // Comma-separated
  
  // Additional
  keywords?: string; // JSON for tiered prices
  summary?: string; // JSON for category attributes
  
  // Status
  status: number; // 0=Pending, 1=Approved, 2=Rejected
  in_stock: number; // 1=In Stock, 0=Out of Stock
  rates: number; // Product rating
  metric: number;
  currency: number;
  
  // Timestamps
  date_added: string;
  date_updated: string;
  created_at: string;
  updated_at: string;
  
  // Relationships (populated by backend)
  images?: ProductImage[];
  category_data?: ProductCategory;
  user_data?: any;
}
```

### ProductImage Interface
```typescript
interface ProductImage {
  id: number;
  src: string; // Full image URL
  thumbnail?: string; // Thumbnail URL
  parent_id: number;
  product_id?: number; // Set after product creation
  parent_local_id?: string; // Links to product before creation
  type: 'Product';
  size: number; // File size in bytes
  note?: string;
  administrator_id: number;
  created_at: string;
  updated_at: string;
}
```

### ProductFormData Interface
```typescript
interface ProductFormData {
  id?: number; // For edit mode
  name: string;
  description: string;
  category: string;
  category_text?: string;
  price_1: string | number;
  price_2: string | number;
  has_sizes: 'Yes' | 'No';
  has_colors: 'Yes' | 'No';
  sizes?: string;
  colors?: string;
  p_type?: 'Yes' | 'No';
  keywords?: string;
  summary?: string;
  local_id: string;
  url?: string;
  user?: number;
  supplier?: number;
}
```

---

## User Flows

### 1. Create New Product
```
1. User clicks "Add New Product" button
2. Navigate to /account/products/new
3. ProductPost component loads (currentStep = 1)

STEP 1: Basic Info & Photos
4. User enters product name (3-100 chars)
5. User enters description (20-5000 chars)
6. User uploads images:
   a. Drag files onto upload area, OR
   b. Click "Browse Images" to select files
7. Images preview in grid (first image = feature photo)
8. User can remove unwanted images
9. Click "Next" → Validation → Proceed to Step 2

STEP 2: Pricing & Category
10. User clicks "Select Category"
11. CategoryPickerModal opens (slideUp animation)
12. User selects category from list
13. Modal closes, selected category displays
14. User enters Selling Price (price_1) - required
15. User enters Original Price (price_2) - optional
16. If price_2 > price_1, discount calculated and shown
17. User toggles has_sizes/has_colors if needed
18. If Yes, user enters sizes/colors (comma-separated)
19. Click "Next" → Validation → Proceed to Step 3

STEP 3: Review & Submit
20. User reviews all entered data in summary cards
21. Product Details card shows name, description, category
22. Pricing card shows prices and discount
23. Photos card shows image count and preview grid
24. Options card shows sizes/colors if applicable
25. Click "Create Product" button
26. Loading state: "Uploading Images..." (sequential upload)
27. Loading state: "Creating Product..."
28. Success toast: "Product created successfully!"
29. Redirect to /account/products (MyProducts list)
30. New product appears in grid
```

### 2. View My Products
```
1. User clicks "My Products" in account sidebar
2. Navigate to /account/products
3. MyProducts component loads
4. Fetch products via ProductService.getMyProducts()
5. Filter to current user's products
6. Display in grid view (default)
7. User can:
   - Toggle to list view (FiList icon)
   - Search by name/description
   - Filter by category dropdown
   - Click product to view details (TODO: implement detail page)
```

### 3. Delete Product
```
1. User clicks delete button (trash icon) on product card
2. DeleteConfirmModal opens (fadeIn + slideUp)
3. Modal shows:
   - Warning icon (48px, red)
   - Product name in gold
   - "This action cannot be undone" warning
   - Cancel and Delete buttons
4. User clicks "Delete Product"
5. Loading state: "Deleting..."
6. ProductService.deleteProduct(id) called
7. Success toast: "Product deleted successfully"
8. Product removed from local state
9. Products list re-renders without deleted product
10. Modal closes
```

### 4. Edit Product (Placeholder)
```
1. User clicks edit button (pencil icon) on product card
2. Navigate to /account/products/edit/:id
3. ProductPost component loads with id param
4. TODO: Implement data loading logic
   - Fetch product by ID
   - Pre-fill form fields
   - Load existing images
5. User edits fields
6. Submit calls product-create with id (is_edit mode)
7. Backend updates existing product
8. Redirect to MyProducts
```

---

## Validation Rules

### Product Name
- **Required**: Yes
- **Min Length**: 3 characters
- **Max Length**: 100 characters
- **Type**: Text
- **Error Messages**:
  - Empty: "Product name is required"
  - Too short: "Product name must be at least 3 characters"
  - Too long: "Product name cannot exceed 100 characters"

### Description
- **Required**: Yes
- **Min Length**: 20 characters
- **Max Length**: 5000 characters
- **Type**: Multiline text
- **Error Messages**:
  - Empty: "Product description is required"
  - Too short: "Description must be at least 20 characters"
  - Too long: "Description cannot exceed 5000 characters"

### Category
- **Required**: Yes
- **Type**: Selection from predefined list
- **Error Messages**:
  - Not selected: "Please select a category"

### Images
- **Required**: At least 1 image
- **Max Count**: Unlimited (recommended max 10 for UX)
- **File Types**: image/* (JPEG, PNG, GIF, WebP)
- **Max Size**: 5MB per file
- **Validation**:
  ```typescript
  if (!file.type.startsWith('image/')) {
    error = 'Only image files allowed';
  }
  if (file.size > 5 * 1024 * 1024) {
    error = 'File size must be less than 5MB';
  }
  ```
- **Error Messages**:
  - No images: "Please upload at least one product image"
  - Invalid type: "Only image files are allowed"
  - Too large: "Image size must be less than 5MB"

### Selling Price (price_1)
- **Required**: Yes
- **Type**: Positive number
- **Min Value**: 0 (exclusive)
- **Validation**: Must be valid number > 0
- **Error Messages**:
  - Empty: "Selling price is required"
  - Invalid: "Selling price must be a valid positive number"
  - Zero/Negative: "Selling price must be greater than 0"

### Original Price (price_2)
- **Required**: No
- **Type**: Positive number
- **Validation**: If provided, must be ≥ selling price
- **Error Messages**:
  - Less than selling: "Original price must be greater than or equal to selling price"
  - Invalid: "Original price must be a valid number"

### Sizes (if has_sizes = 'Yes')
- **Required**: No
- **Type**: Comma-separated text
- **Example**: "Small, Medium, Large, XL"

### Colors (if has_colors = 'Yes')
- **Required**: No
- **Type**: Comma-separated text
- **Example**: "Red, Blue, Green, Black, White"

---

## Styling & Design System

### CSS Variables
```css
/* Brand Colors */
--brand-gold: #FFD700;
--brand-gold-dark: #FFA500;
--gold-gradient: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);

/* Background Colors */
--background-color: #0A0A0A;
--surface-color: #1A1A1A;
--surface-hover: #252525;

/* Text Colors */
--text-primary: #FFFFFF;
--text-secondary: #B0B0B0;
--text-tertiary: #808080;

/* Border Colors */
--border-color: #2A2A2A;
--border-hover: #FFD700;

/* Status Colors */
--success-color: #10B981;
--error-color: #EF4444;
--warning-color: #F59E0B;
--info-color: #3B82F6;
```

### Typography
```css
/* Headings */
h1, .page-title { font-size: 32px; font-weight: 700; }
h2, .section-title { font-size: 24px; font-weight: 600; }
h3, .step-title { font-size: 20px; font-weight: 600; }

/* Body Text */
.body-text { font-size: 16px; line-height: 1.6; }
.body-small { font-size: 14px; line-height: 1.5; }
.caption { font-size: 12px; color: var(--text-secondary); }
```

### Spacing System
```css
/* Consistent spacing scale */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

### Component Patterns

#### Button Styles
```css
/* Primary Button (Gold Gradient) */
.btn-primary {
  background: var(--gold-gradient);
  color: #000;
  font-weight: 600;
  padding: 12px 32px;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.4);
}

/* Secondary Button */
.btn-secondary {
  background: var(--surface-color);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  padding: 12px 32px;
  border-radius: 8px;
}
.btn-secondary:hover {
  border-color: var(--brand-gold);
}
```

#### Form Input Styles
```css
.form-input {
  background: var(--surface-color);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}
.form-input:focus {
  border-color: var(--brand-gold);
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
}
.form-input.error {
  border-color: var(--error-color);
}
```

#### Card Styles
```css
.card {
  background: var(--surface-color);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: var(--space-lg);
  transition: all 0.3s ease;
}
.card:hover {
  border-color: var(--brand-gold);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.2);
}
```

### Responsive Breakpoints
```css
/* Desktop First Approach */
@media (max-width: 768px) { /* Tablet */ }
@media (max-width: 480px) { /* Mobile */ }

/* Grid Adjustments */
/* Desktop: 3 columns */
.products-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }

/* Tablet: 2 columns */
@media (max-width: 768px) {
  .products-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
}

/* Mobile: 1 column */
@media (max-width: 480px) {
  .products-grid { grid-template-columns: 1fr; }
}
```

### Animation Patterns
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Spin (Loading) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Usage */
.fade-in { animation: fadeIn 0.3s ease; }
.slide-up { animation: slideUp 0.3s ease; }
.loading-icon { animation: spin 1s linear infinite; }
```

---

## Testing Guide

### Manual Testing Checklist

#### Product Creation Flow
- [ ] Navigate to /account/products/new
- [ ] **Step 1 Validation**:
  - [ ] Try next without filling name → See error
  - [ ] Enter 2 char name → See "must be at least 3 characters"
  - [ ] Enter valid name (3-100 chars)
  - [ ] Try next without description → See error
  - [ ] Enter 10 char description → See "must be at least 20 characters"
  - [ ] Enter valid description (20-5000 chars)
  - [ ] Try next without images → See error
  - [ ] Upload image by clicking "Browse Images"
  - [ ] Verify image preview appears
  - [ ] Verify "Feature Photo" badge on first image
  - [ ] Upload 3 more images via drag-drop
  - [ ] Verify all 4 images show in preview grid
  - [ ] Click remove on 2nd image → Verify it disappears
  - [ ] Verify feature badge still on first image
  - [ ] Try uploading non-image file → See error toast
  - [ ] Try uploading 10MB file → See size error
  - [ ] Click "Next" → Proceed to Step 2
- [ ] **Step 2 Validation**:
  - [ ] Try next without category → See error
  - [ ] Click "Select Category" → Modal opens
  - [ ] Verify modal has slideUp animation
  - [ ] Select "Electronics" category
  - [ ] Verify modal closes
  - [ ] Verify selected category displays
  - [ ] Try next without selling price → See error
  - [ ] Enter non-numeric selling price → See error
  - [ ] Enter 0 or negative → See error
  - [ ] Enter valid selling price (e.g., 50000)
  - [ ] Enter original price less than selling → See error
  - [ ] Enter original price (e.g., 70000)
  - [ ] Verify discount badge shows "29% OFF"
  - [ ] Toggle "Has Sizes" to Yes
  - [ ] Enter sizes: "Small, Medium, Large"
  - [ ] Toggle "Has Colors" to Yes
  - [ ] Enter colors: "Red, Blue, Black"
  - [ ] Click "Next" → Proceed to Step 3
- [ ] **Step 3 Review**:
  - [ ] Verify Product Details card shows name, description, category
  - [ ] Verify Pricing card shows both prices and discount
  - [ ] Verify Photos card shows "3 images uploaded"
  - [ ] Verify image preview grid shows all 3 images
  - [ ] Verify Options card shows sizes and colors
  - [ ] Click "Create Product"
  - [ ] Verify "Uploading Images..." message
  - [ ] Verify "Creating Product..." message
  - [ ] Verify success toast appears
  - [ ] Verify redirect to /account/products
  - [ ] Verify new product appears in grid

#### MyProducts List
- [ ] Navigate to /account/products
- [ ] **Grid View**:
  - [ ] Verify products display in 3-column grid (desktop)
  - [ ] Verify each card shows: image, name, description, prices, badges
  - [ ] Verify feature photo displays (or placeholder)
  - [ ] Verify discount badge if price_2 > price_1
  - [ ] Verify status badge (Pending/Approved)
  - [ ] Hover over card → Verify border color changes to gold
  - [ ] Hover over card → Verify translateY(-4px) lift effect
- [ ] **List View**:
  - [ ] Click list view icon (FiList)
  - [ ] Verify view toggles to horizontal cards
  - [ ] Verify image on left, content center, actions right
  - [ ] Verify all product info visible
- [ ] **Search**:
  - [ ] Enter product name in search box
  - [ ] Verify filtered results show only matching products
  - [ ] Clear search → Verify all products return
  - [ ] Search for non-existent text
  - [ ] Verify "No products found" message
  - [ ] Verify "Clear Filters" button appears
- [ ] **Category Filter**:
  - [ ] Select category from dropdown
  - [ ] Verify only products in that category show
  - [ ] Select "All Categories"
  - [ ] Verify all products return
- [ ] **Combined Filters**:
  - [ ] Enter search text AND select category
  - [ ] Verify both filters apply (AND logic)
- [ ] **Empty State**:
  - [ ] Delete all products (or test with new user)
  - [ ] Verify empty state shows
  - [ ] Verify "Add Your First Product" message
  - [ ] Verify "Add New Product" button
  - [ ] Click button → Navigate to /account/products/new

#### Edit Product (TODO: Implement)
- [ ] Click edit button (pencil icon) on product card
- [ ] Navigate to /account/products/edit/:id
- [ ] **TODO**: Verify form loads with existing data
- [ ] **TODO**: Edit fields and save
- [ ] **TODO**: Verify product updated in list

#### Delete Product
- [ ] Click delete button (trash icon) on product card
- [ ] Verify DeleteConfirmModal opens
- [ ] Verify modal has fadeIn + slideUp animation
- [ ] Verify modal shows:
  - [ ] Warning icon (red, 48px)
  - [ ] Product name in gold color
  - [ ] "This action cannot be undone" warning
  - [ ] "Cancel" button (secondary style)
  - [ ] "Delete Product" button (red style)
- [ ] Click "Cancel" → Modal closes, no deletion
- [ ] Click delete again
- [ ] Click "Delete Product"
- [ ] Verify "Deleting..." loading state
- [ ] Verify success toast "Product deleted successfully"
- [ ] Verify product removed from list
- [ ] Verify modal closes

#### Responsive Design
- [ ] **Desktop (1920px)**:
  - [ ] Verify 3-column grid
  - [ ] Verify form shows 2-column layout (form-row)
  - [ ] Verify all spacing correct
- [ ] **Tablet (768px)**:
  - [ ] Verify 2-column grid
  - [ ] Verify form switches to 1-column
  - [ ] Verify navigation buttons stack
  - [ ] Verify modal adjusts width
- [ ] **Mobile (375px)**:
  - [ ] Verify 1-column grid
  - [ ] Verify product cards stack vertically
  - [ ] Verify form inputs full width
  - [ ] Verify image grid switches to 2 columns
  - [ ] Verify toolbar items stack
  - [ ] Verify search box full width
  - [ ] Verify buttons full width
  - [ ] Verify list view cards stack vertically

#### Performance
- [ ] Upload 5 images (5MB each) → Verify sequential upload
- [ ] Verify no UI freeze during upload
- [ ] Verify individual image progress (if implemented)
- [ ] Load MyProducts with 50+ products → Verify smooth rendering
- [ ] Toggle between grid/list view → Verify instant transition

#### Browser Compatibility
- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test in Edge (latest)
- [ ] Verify drag-drop works in all browsers
- [ ] Verify image preview works in all browsers

---

## Troubleshooting

### Common Issues

#### 1. Images Not Uploading
**Symptoms**: Images selected but upload fails, error toast appears

**Possible Causes**:
- File type not supported (only image/* allowed)
- File size exceeds 5MB
- Network error
- Backend API issue

**Solutions**:
1. Check browser console for errors
2. Verify file type: `console.log(file.type)` should start with 'image/'
3. Check file size: `console.log(file.size / 1024 / 1024)` should be < 5
4. Test backend endpoint directly with Postman
5. Check backend logs for validation errors
6. Verify FormData construction:
   ```typescript
   const formData = new FormData();
   formData.append('file', file);
   formData.append('parent_local_id', localId);
   formData.append('type', 'Product');
   ```

#### 2. Product Creation Fails
**Symptoms**: "Creating Product..." state but then error

**Possible Causes**:
- Missing required fields
- Invalid local_id format
- Backend validation failure
- Database error

**Solutions**:
1. Check validation errors:
   ```typescript
   const errors = ProductService.validateProductData(formData);
   console.log('Validation errors:', errors);
   ```
2. Verify local_id exists and has correct format (timestamp_random)
3. Check backend response in Network tab
4. Verify all required fields populated:
   - name (3-100 chars)
   - description (20-5000 chars)
   - category (not empty)
   - price_1 (> 0)
5. Check backend logs for error details

#### 3. Images Not Associating with Product
**Symptoms**: Product created but no images show

**Possible Causes**:
- local_id mismatch between images and product
- Images uploaded with different local_id
- Backend association logic issue

**Solutions**:
1. Verify same local_id used for images and product:
   ```typescript
   console.log('Image local_id:', localId);
   console.log('Product local_id:', formData.local_id);
   // Must match exactly
   ```
2. Check backend Image model for parent_local_id matching logic
3. Verify image upload response contains parent_local_id
4. Check products endpoint returns images array
5. Test backend association:
   ```sql
   SELECT * FROM images WHERE parent_local_id = 'YOUR_LOCAL_ID';
   SELECT * FROM products WHERE local_id = 'YOUR_LOCAL_ID';
   ```

#### 4. Category Not Saving
**Symptoms**: Category selected but not appearing in review or saved product

**Possible Causes**:
- State not updating correctly
- category vs category_text confusion
- Backend not accepting category

**Solutions**:
1. Check state update in selectCategory:
   ```typescript
   setFormData({
     ...formData,
     category: category.id.toString(),
     category_text: category.name
   });
   console.log('Updated formData:', formData);
   ```
2. Verify category sent in request body
3. Check backend expects 'category' field (ID as string)
4. Verify category_text is optional (for display only)

#### 5. Delete Not Working
**Symptoms**: Delete confirmation but product still appears

**Possible Causes**:
- API call failing silently
- Product not removed from local state
- Incorrect product ID

**Solutions**:
1. Check ProductService.deleteProduct implementation
2. Verify API response:
   ```typescript
   const response = await http_post('products-delete', { id: productId });
   console.log('Delete response:', response);
   ```
3. Check local state update:
   ```typescript
   setProducts(products.filter(p => p.id !== productId));
   setFilteredProducts(filteredProducts.filter(p => p.id !== productId));
   ```
4. Verify correct product ID passed (not local_id)

#### 6. Drag-Drop Not Working
**Symptoms**: Dragging files but nothing happens

**Possible Causes**:
- Event handlers not preventing defaults
- File type validation rejecting files
- dragActive state not updating

**Solutions**:
1. Verify event handlers:
   ```typescript
   const handleDragOver = (e: React.DragEvent) => {
     e.preventDefault(); // CRITICAL
     e.stopPropagation();
     setDragActive(true);
   };
   ```
2. Check browser console for errors
3. Test with simple image file (JPEG < 1MB)
4. Verify drag-active class applied to upload area
5. Test click-to-browse as alternative

#### 7. Type Errors After Update
**Symptoms**: TypeScript errors about Product interface

**Possible Causes**:
- Multiple Product interfaces in different files
- Import from wrong location

**Solutions**:
1. Verify single source of truth: ProductModels.ts
2. Check imports in all files:
   ```typescript
   // CORRECT
   import { Product, ProductImage } from '../models/ProductModels';
   
   // WRONG - duplicate interface
   export interface Product { ... }
   ```
3. Remove duplicate interfaces from ProductService.ts
4. Run TypeScript check: `npm run type-check` or `tsc --noEmit`

---

## Future Enhancements

### Priority 1 (High Impact)

#### 1. Edit Mode Implementation
**Status**: Placeholder route exists, logic not implemented

**Requirements**:
- Load product by ID when route is `/account/products/edit/:id`
- Pre-fill form fields with existing data
- Load and display existing images
- Differentiate create vs update in API call
- Handle partial updates (don't require all fields)

**Implementation Plan**:
```typescript
// In ProductPost.tsx useEffect
useEffect(() => {
  const productId = params.id; // from useParams()
  if (productId) {
    setInitialLoading(true);
    ProductService.getProductById(productId).then(product => {
      // Pre-fill form
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        category_text: product.category_data?.name || '',
        price_1: product.price_1,
        price_2: product.price_2,
        has_sizes: product.has_sizes,
        has_colors: product.has_colors,
        sizes: product.sizes || '',
        colors: product.colors || '',
        // Images handled separately
      });
      
      // Load existing images
      if (product.images && product.images.length > 0) {
        const imageUrls = product.images.map(img => 
          Utils.img(img.src)
        );
        setImagePreview(imageUrls);
        setExistingImageIds(product.images.map(img => img.id));
      }
      
      setInitialLoading(false);
    });
  }
}, [params.id]);

// In handleSubmit, check if edit mode
if (productId) {
  formData.id = parseInt(productId);
  formData.is_edit = true; // Backend flag
}
```

#### 2. Backend `my-products` Endpoint
**Status**: Currently using `products-1` which returns all products

**Requirements**:
- Create new endpoint: `my-products`
- Filter products by authenticated user ID
- Support pagination
- Support filters (category, status, search)
- Sort options (newest, oldest, price, name)

**API Design**:
```
GET /api/my-products
Query Params:
  - page: number (default 1)
  - per_page: number (default 20)
  - category: string (optional)
  - status: number (optional: 0,1,2)
  - search: string (optional)
  - sort_by: string (default: created_at)
  - sort_dir: string (asc|desc, default: desc)

Response:
{
  "code": 1,
  "data": Product[],
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 87,
    "from": 1,
    "to": 20
  }
}
```

#### 3. Product Detail Page
**Status**: Not implemented

**Requirements**:
- Route: `/account/products/:id` or `/products/:id`
- Display full product information
- Show all images in gallery/slider
- Display all attributes (sizes, colors, etc.)
- Show status, views, likes
- Edit and Delete buttons (if owner)
- Responsive image gallery

### Priority 2 (Enhanced UX)

#### 4. Image Reordering
**Status**: Feature photo is always first image

**Requirements**:
- Drag-drop to reorder images in preview grid
- Manually set feature photo (not just first)
- Visual indicator for feature photo
- Save order to backend

**Implementation**:
- Use `react-beautiful-dnd` or `@dnd-kit/core`
- Add order field to ProductImage model
- Update backend to save image order

#### 5. Image Cropping/Editing
**Status**: Images uploaded as-is

**Requirements**:
- Crop images before upload
- Adjust brightness, contrast, saturation
- Add filters (optional)
- Maintain aspect ratio options (1:1, 4:3, 16:9)

**Implementation**:
- Use library like `react-image-crop` or `react-easy-crop`
- Add crop modal after image selection
- Process crop client-side before upload

#### 6. Bulk Operations
**Status**: One-by-one edit/delete only

**Requirements**:
- Select multiple products (checkboxes)
- Bulk delete
- Bulk status change (if admin)
- Bulk category change

**UI Changes**:
- Add checkbox to each product card
- "Select All" checkbox in toolbar
- Bulk actions dropdown (when items selected)

#### 7. Advanced Filtering
**Status**: Basic search and category filter

**Requirements**:
- Price range slider (min-max)
- Status filter (Pending/Approved/Rejected)
- Stock status filter (In Stock/Out of Stock)
- Date range filter (created date)
- Sort options (Price: Low-High, High-Low, Newest, Oldest, Name A-Z)

**UI Changes**:
- Expandable filter panel
- Multi-select category filter
- Price range inputs or slider
- Sort dropdown

### Priority 3 (Nice to Have)

#### 8. Tiered Pricing
**Status**: p_type field exists but not implemented

**Requirements**:
- Allow multiple price tiers (e.g., 1-10 units: $50, 11-50 units: $45)
- UI for adding/removing tiers
- Display tiered pricing in product card
- Backend support for tiered price logic

**Data Structure**:
```typescript
interface TieredPrice {
  min_quantity: number;
  max_quantity: number;
  price: number;
}
// Stored in keywords field as JSON
```

#### 9. Product Analytics
**Status**: Basic metrics (views, likes) in model but not displayed

**Requirements**:
- View count tracking
- Like/favorite functionality
- Analytics dashboard (views over time, popular products)
- Click-through rate

**UI Changes**:
- Add analytics tab in account section
- Charts for views, likes, sales
- Top products list

#### 10. Multiple Category Selection
**Status**: Single category per product

**Requirements**:
- Assign product to multiple categories
- Update backend to support category relationships (pivot table)
- Update UI to show multiple category badges
- Filter by any assigned category

**Database Changes**:
```sql
CREATE TABLE product_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT,
  category_id INT,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### 11. Draft Products
**Status**: Only saved products (status 0,1,2)

**Requirements**:
- Save partial form data as draft
- Auto-save every N seconds
- List drafts separately
- Resume editing draft
- Convert draft to product on submit

**Implementation**:
- Add draft flag to product model
- Store drafts in localStorage OR backend
- Add "Save as Draft" button

#### 12. Product Import/Export
**Status**: Manual entry only

**Requirements**:
- Export products to CSV/Excel
- Import products from CSV/Excel
- Template file for import
- Validate import data
- Bulk create from import

**Use Cases**:
- Migrate from another platform
- Backup products
- Bulk add inventory

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `product-create` | POST | Create or update product | ✅ Yes |
| `post-media-upload` | POST | Upload product image | ✅ Yes |
| `products-1` | GET | Fetch products (latest 1000) | ✅ Yes |
| `products-delete` | POST | Delete product by ID | ✅ Yes |
| `my-products` (TODO) | GET | Fetch user's products only | ✅ Yes |
| `product-detail` (TODO) | GET | Fetch single product by ID | ❌ No |

---

## File Structure

```
katogo-react/
├── src/
│   └── app/
│       ├── models/
│       │   └── ProductModels.ts (326 lines)
│       ├── services/
│       │   └── ProductService.ts (365 lines)
│       ├── pages/
│       │   └── account/
│       │       ├── ProductPost.tsx (920 lines)
│       │       ├── ProductPost.css (670 lines)
│       │       ├── MyProducts.tsx (435 lines)
│       │       └── MyProducts.css (580 lines)
│       ├── routing/
│       │   └── AppRoutes.tsx (updated with product routes)
│       └── components/
│           └── Account/
│               └── NewAccountLayout.tsx (menu already includes products)
└── PRODUCT_POSTING_SYSTEM.md (this file)
```

**Total New Code**: ~3,300 lines

---

## Quick Reference

### Adding a New Product (User Perspective)
1. Click "My Products" in sidebar
2. Click "Add New Product" button
3. Fill Step 1: Name, Description, Upload Images → Next
4. Fill Step 2: Category, Prices, Options → Next
5. Review Step 3: Verify all data → Create Product
6. Product appears in My Products list

### Key Imports
```typescript
// Components
import ProductPost from "../pages/account/ProductPost";
import MyProducts from "../pages/account/MyProducts";

// Services
import ProductService from "../../services/ProductService";
import ToastService from "../../services/ToastService";

// Models
import { 
  Product, 
  ProductImage, 
  ProductFormData,
  formatProductPrice,
  calculateDiscount,
  getProductStatusLabel 
} from "../../models/ProductModels";

// Utils
import Utils from "../../services/Utils";
```

### State Management Pattern
```typescript
// In ProductPost or MyProducts
const [data, setData] = useState<Type>(initialValue);
const [loading, setLoading] = useState(false);
const [errors, setErrors] = useState<Record<string, string>>({});

// Update state
setData({ ...data, field: value });

// Loading pattern
setLoading(true);
try {
  const result = await ProductService.method();
  // Handle success
} catch (error) {
  ToastService.error('Error message');
} finally {
  setLoading(false);
}
```

---

## Support & Maintenance

### Questions or Issues?
1. Check this documentation first
2. Review code comments in ProductPost.tsx, MyProducts.tsx, ProductService.ts
3. Check browser console for errors
4. Review Network tab for API issues
5. Check backend logs for server errors

### Updating This System
When making changes:
1. ✅ Update this documentation
2. ✅ Add code comments
3. ✅ Update type definitions
4. ✅ Test all affected flows
5. ✅ Update TODO comments in code
6. ✅ Communicate changes to team

---

**Last Updated**: October 3, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (pending testing)  
**Maintainer**: Development Team

---
