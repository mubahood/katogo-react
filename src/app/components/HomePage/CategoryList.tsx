// src/app/components/HomePage/CategoryList.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";
import { useManifestCategories, useManifest } from "../../hooks/useManifest";

// Inline styles for CategoryList following the unified design system
const categoryListStyles = `
  .category-list-wrapper {
    background-color: var(--white);
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius);
    padding: 0;
    height: 100%;
    overflow: hidden;
  }

  .category-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .category-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.25rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-color-dark);
    text-decoration: none;
    border-bottom: 1px solid var(--border-color-light);
    transition: all 0.2s ease;
    position: relative;
  }

  .category-item:last-child {
    border-bottom: none;
  }

  .category-item:hover {
    background-color: var(--background-light);
    color: var(--primary-color);
    text-decoration: none;
  }

  .category-item:hover::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background-color: var(--primary-color);
  }

  .category-item i {
    font-size: 1rem;
    width: 18px;
    text-align: center;
    color: var(--text-color-medium);
    transition: color 0.2s ease;
  }

  .category-item:hover i {
    color: var(--primary-color);
  }

  .category-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    height: 100%;
  }

  .category-error {
    padding: 1rem;
  }

  @media (max-width: 1199.98px) {
    .category-item {
      padding: 0.75rem 1rem;
      font-size: 0.85rem;
    }
    
    .category-item i {
      font-size: 0.9rem;
      width: 16px;
    }
  }

  @media (max-width: 991.98px) {
    .category-list-wrapper {
      display: none;
    }
  }
`;

const CategoryList: React.FC = () => {
  const categories = useManifestCategories();
  const { isLoading: categoriesLoading, error: categoriesError } = useManifest();

  // Icon mapping for categories
  const categoryIcons: { [key: string]: string } = {
    electronics: "bi-phone",
    fashion: "bi-bag",
    home: "bi-house",
    sports: "bi-bicycle",
    toys: "bi-joystick",
    beauty: "bi-heart-pulse",
    automotive: "bi-car-front",
    books: "bi-book",
    default: "bi-grid",
  };

  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (name.includes(key)) {
        return icon;
      }
    }
    return categoryIcons.default;
  };

  if (categoriesLoading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: categoryListStyles }} />
        <div className="category-list-wrapper">
          <div className="category-loading">
            <Spinner animation="border" size="sm" />
          </div>
        </div>
      </>
    );
  }

  if (categoriesError) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: categoryListStyles }} />
        <div className="category-list-wrapper">
          <div className="category-error">
            <Alert variant="warning" className="small mb-0">
              Error loading categories
            </Alert>
          </div>
        </div>
      </>
    );
  }

  //limit categories to 9 only
  const displayCategories =
    categories && categories.length > 9 ? categories.slice(0, 9) : categories;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: categoryListStyles }} />
      <div className="category-list-wrapper">
        <ul className="category-list">
          {displayCategories &&
            displayCategories.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/products?category=${category.id}`}
                  className="category-item"
                >
                  <i
                    className={`bi ${getIconForCategory(category.category)}`}
                  ></i>
                  <span>{category.category}</span>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </>
  );
};

export default CategoryList;
