// Example usage of DynamicBreadcrumb across different pages

import React from 'react';
import DynamicBreadcrumb from './DynamicBreadcrumb';

// ===================================================================
// 1. PRODUCTS PAGE (current implementation)
// ===================================================================
// Auto-generates: Home > Products
// With category: Home > Products > Electronics
// With search: Home > Products > Search: "iPhone"

const ExampleComponent = () => (
  <>
    <DynamicBreadcrumb
      context={{
        categories,
        selectedCategory,
        searchTerm: searchParams.get("search") || undefined,
      }}
  showBackground={true}
  showIcons={true}
/>

// ===================================================================
// 2. PRODUCT DETAIL PAGE
// ===================================================================
// Auto-generates: Home > Products > [Product Name]

<DynamicBreadcrumb
  context={{
    categories,
    productName: product.name,
  }}
/>

// ===================================================================
// 3. CART PAGE
// ===================================================================
// Auto-generates: Home > Shopping Cart

<DynamicBreadcrumb />

// ===================================================================
// 4. CHECKOUT FLOW
// ===================================================================
// Auto-generates: Home > Cart > Checkout

<DynamicBreadcrumb />

// For delivery address step:
<DynamicBreadcrumb
  items={[
    { label: "Home", href: "/", icon: "bi-house-door" },
    { label: "Cart", href: "/cart", icon: "bi-bag" },
    { label: "Checkout", href: "/checkout", icon: "bi-credit-card" },
    { label: "Delivery Address", isActive: true, icon: "bi-geo-alt" }
  ]}
/>

// ===================================================================
// 5. ACCOUNT PAGES
// ===================================================================
// Orders page: Home > Account > Orders
<DynamicBreadcrumb />

// Order details: Home > Account > Orders > Order #12345
<DynamicBreadcrumb
  context={{
    orderNumber: order.id
  }}
/>

// ===================================================================
// 6. CATEGORY PAGES
// ===================================================================
// Auto-generates: Home > Categories > Electronics

<DynamicBreadcrumb
  context={{
    categories
  }}
/>

// ===================================================================
// 7. SEARCH RESULTS
// ===================================================================
// Auto-generates: Home > Search: "keyword"

<DynamicBreadcrumb
  context={{
    searchTerm: searchQuery
  }}
/>

// ===================================================================
// 8. CUSTOM BREADCRUMBS FOR SPECIAL PAGES
// ===================================================================
// Help center
<DynamicBreadcrumb
  items={[
    { label: "Home", href: "/", icon: "bi-house-door" },
    { label: "Help Center", href: "/help", icon: "bi-question-circle" },
    { label: "FAQs", isActive: true, icon: "bi-chat-question" }
  ]}
/>

// Promotion pages
<DynamicBreadcrumb
  items={[
    { label: "Home", href: "/", icon: "bi-house-door" },
    { label: "Promotions", href: "/promotions", icon: "bi-lightning" },
    { label: "Black Friday Sale", isActive: true, icon: "bi-tag" }
  ]}
/>

// ===================================================================
// 9. MINIMAL BREADCRUMB (for mobile or compact layouts)
// ===================================================================
<DynamicBreadcrumb
  showBackground={false}
  showIcons={false}
  className="compact"
/>

// ===================================================================
// 10. INTEGRATION WITH LAYOUT COMPONENTS
// ===================================================================
// In your main layout component:
const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      <DynamicBreadcrumb />  {/* This will auto-adapt to any page */}
      <main>{children}</main>
      <Footer />
    </div>
  );
};
