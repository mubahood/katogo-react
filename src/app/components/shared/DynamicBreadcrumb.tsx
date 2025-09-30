/**
 * DynamicBreadcrumb Component - CSS and TypeScript in one file
 * 
 * A smart, responsive breadcrumb component that can:
 * 1. Auto-generate breadcrumbs from the current URL
 * 2. Accept custom breadcrumb items for specific pages
 * 3. Use context data for dynamic content (categories, products, etc.)
 */

import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Container } from "react-bootstrap";

// CSS Styles (included in component)
const breadcrumbStyles = `
  .dynamic-breadcrumb {

    padding: 12px 0;
    margin-bottom: 0;
    position: relative;
    z-index: 10;
  }

  .dynamic-breadcrumb.no-background {
    background: transparent;
    border-bottom: none;
    padding: 8px 0;
  }

  .dynamic-breadcrumb .breadcrumb-nav {
    margin: 0;
  }

  .dynamic-breadcrumb .breadcrumb-list {
    display: flex !important;
    flex-wrap: wrap;
    align-items: center;
    margin: 0 !important;
    padding: 0 !important;
    list-style: none !important;
    font-size: 14px;
    background: none !important;
  }

  .dynamic-breadcrumb .breadcrumb-item {
    display: flex !important;
    align-items: center;
    position: relative;
  }

  /* Override Bootstrap's breadcrumb separators completely */
  .dynamic-breadcrumb .breadcrumb-item::before,
  .dynamic-breadcrumb .breadcrumb-item::after {
    display: none !important;
    content: none !important;
  }

  .dynamic-breadcrumb .breadcrumb-item + .breadcrumb-item::before {
    display: none !important;
    content: none !important;
  }

  /* Add our own custom separator */
  .dynamic-breadcrumb .breadcrumb-item:not(:last-child)::after {
    content: "/" !important;
    margin: 0 8px !important;
    color: #6c757d !important;
    font-weight: normal !important;
    display: inline !important;
  }

  .dynamic-breadcrumb .breadcrumb-link {
    color: #6c757d !important;
    text-decoration: none !important;
    transition: color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .dynamic-breadcrumb .breadcrumb-link:hover {
    color: #495057 !important;
    text-decoration: none !important;
  }

  .dynamic-breadcrumb .breadcrumb-active {
    color: #495057 !important;
    font-weight: 500 !important;
  }

  .dynamic-breadcrumb .breadcrumb-icon {
    font-size: 14px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .dynamic-breadcrumb {
      padding: 8px 0;
      margin-bottom: 0;
      margin-top: 2rem;
      height: 3rem;
      
    }
    
    .dynamic-breadcrumb .breadcrumb-list {
      font-size: 13px;
    }
    
    .dynamic-breadcrumb .breadcrumb-item:not(:last-child)::after {
      margin: 0 6px !important;
    }

    /* Remove default Bootstrap container padding on mobile for tighter spacing */
    .dynamic-breadcrumb .container {
      padding-left: 15px;
      padding-right: 15px;
    }
  }

  @media (max-width: 576px) {
    .dynamic-breadcrumb {
      padding: 4px 0;
      margin-bottom: 0;
    }

    .dynamic-breadcrumb .breadcrumb-list {
      font-size: 12px;
    }
    
    .dynamic-breadcrumb .breadcrumb-item:not(:last-child)::after {
      margin: 0 4px !important;
    }

    /* Further reduce container padding on very small screens */
    .dynamic-breadcrumb .container {
      padding-left: 12px;
      padding-right: 12px;
    }
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleId = 'dynamic-breadcrumb-styles';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = breadcrumbStyles;
    document.head.appendChild(styleElement);
  }
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
  isActive?: boolean;
}

interface DynamicBreadcrumbProps {
  /** Custom breadcrumb items - if provided, these will be used instead of auto-generation */
  items?: BreadcrumbItem[];
  /** Additional context data for auto-generation (categories, search terms, etc.) */
  context?: {
    categories?: Array<{ id: number; category: string }>;
    selectedCategory?: number;
    searchTerm?: string;
    productName?: string;
    orderNumber?: string;
    [key: string]: any;
  };
  /** Whether to show background styling */
  showBackground?: boolean;
  /** Whether to show icons */
  showIcons?: boolean;
  /** Custom CSS classes */
  className?: string;
}

const DynamicBreadcrumb: React.FC<DynamicBreadcrumbProps> = ({
  items,
  context = {},
  className = "",
  showBackground = true,
  showIcons = true,
}) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Auto-generate breadcrumbs from URL if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Home (only one home icon)
    breadcrumbs.push({
      label: "Home",
      href: "/",
      icon: showIcons ? "bi bi-house-door" : undefined,
    });

    // Handle different route patterns
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const isLast = i === pathSegments.length - 1;
      
      switch (segment) {
        case "products":
          if (context.searchTerm) {
            breadcrumbs.push({
              label: "Products",
              href: "/products",
            });
            breadcrumbs.push({
              label: `Search: "${context.searchTerm}"`,
              isActive: true,
            });
          } else if (context.selectedCategory && context.categories) {
            const category = context.categories.find(c => c.id === context.selectedCategory);
            if (category) {
              breadcrumbs.push({
                label: "Products",
                href: "/products",
              });
              breadcrumbs.push({
                label: category.category,
                isActive: isLast,
              });
            } else {
              breadcrumbs.push({
                label: "Products",
                isActive: true,
              });
            }
          } else {
            breadcrumbs.push({
              label: "Products",
              isActive: true,
            });
          }
          break;
          
        case "product":
          breadcrumbs.push({
            label: "Products",
            href: "/products",
          });
          if (context.productName) {
            breadcrumbs.push({
              label: context.productName,
              isActive: true,
            });
          } else {
            breadcrumbs.push({
              label: "Product Details",
              isActive: true,
            });
          }
          break;
          
        case "cart":
          breadcrumbs.push({
            label: "Shopping Cart",
            isActive: true,
          });
          break;
          
        case "checkout":
          breadcrumbs.push({
            label: "Cart",
            href: "/cart",
          });
          breadcrumbs.push({
            label: "Checkout",
            isActive: true,
          });
          break;
          
        case "account":
          breadcrumbs.push({
            label: "My Account",
            href: isLast ? undefined : "/account",
            isActive: isLast,
          });
          break;
          
        case "orders":
          if (pathSegments.includes("account")) {
            breadcrumbs.push({
              label: "My Account",
              href: "/account",
            });
            breadcrumbs.push({
              label: "Orders",
              isActive: true,
            });
          }
          break;
          
        case "auth":
          // Skip auth in breadcrumbs for cleaner look
          break;
          
        case "search":
          breadcrumbs.push({
            label: "Search Results",
            isActive: true,
          });
          break;
          
        default:
          // Capitalize first letter and replace hyphens/underscores
          const label = segment
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, l => l.toUpperCase());
          breadcrumbs.push({
            label,
            isActive: isLast,
          });
      }
    }

    // Handle search terms from URL params
    if (searchParams.get("search") && !context.searchTerm) {
      const searchTerm = searchParams.get("search");
      breadcrumbs.push({
        label: `Search: "${searchTerm}"`,
        isActive: true,
      });
    }

    return breadcrumbs.filter(item => item.label && item.label.trim() !== '');
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  return (
    <div className={`dynamic-breadcrumb  ${!showBackground ? 'no-background' : ''} ${className}`}>
      <Container className="mx-2">
        <nav className="breadcrumb-nav" aria-label="breadcrumb">
          <div className="breadcrumb-list">
            {breadcrumbItems.map((item, index) => (
              <div key={index} className="breadcrumb-item">
                {item.href && !item.isActive ? (
                  <Link 
                    to={item.href} 
                    className="breadcrumb-link"
                    aria-current={item.isActive ? "page" : undefined}
                  >
                    {item.icon && (
                      <i className={`${item.icon} breadcrumb-icon`} aria-hidden="true"></i>
                    )}
                    {item.label}
                  </Link>
                ) : (
                  <span 
                    className={item.isActive ? "breadcrumb-active" : "breadcrumb-link"}
                    aria-current={item.isActive ? "page" : undefined}
                  >
                    {item.icon && (
                      <i className={`${item.icon} breadcrumb-icon`} aria-hidden="true"></i>
                    )}
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </nav>
      </Container>
    </div>
  );
};

export default DynamicBreadcrumb;