// src/app/pages/ProductDetailPage/ProductDetailPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  ProgressBar,
  Spinner,
  Modal,
} from "react-bootstrap";
import {
  useGetProductByIdQuery,
  useGetProductsQuery,
} from "../../services/realProductsApi";
import { ProductModel } from "../../models/ProductModel";
import { useDispatch } from "react-redux";
import { useCart } from "../../hooks/useCart";
import { showNotification } from "../../store/slices/notificationSlice";
import ProductCard from "../../components/shared/ProductCard";
import WishlistButton from "../../components/shared/WishlistButton";
import DynamicBreadcrumb from "../../components/shared/DynamicBreadcrumb";
import ShimmerImage from "../../components/ShimmerImage";
import ReviewList from "../../components/reviews/ReviewList";
import ReviewForm from "../../components/reviews/ReviewForm";
import Utils from "../../services/Utils";
import { SEOHead, ProductSchema } from "../../components/seo";
import { generateProductMetaTags } from "../../utils/seo";

// All CSS inline - no external dependencies
const inlineStyles = `
  /* ===================================================================
     Product Detail Page - Modern Square Design
     Extends parent theme variables for consistency
     =================================================================== */

  /* Loading, Error, Not Found States */
  .pdp-loading-container,
  .pdp-error-container,
  .pdp-not-found-container {
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: var(--ugflix-bg-primary);
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
    box-shadow: var(--ugflix-shadow-sm);
    padding: var(--ugflix-spacing-3xl);
  }

  .pdp-loading-container .spinner-border {
    width: 3rem;
    height: 3rem;
    color: var(--ugflix-primary);
    margin-bottom: var(--ugflix-spacing-lg);
  }

  .pdp-loading-container h4,
  .pdp-error-container h4,
  .pdp-not-found-container h4 {
    color: var(--ugflix-text-primary);
    font-weight: 600;
    margin-bottom: var(--ugflix-spacing-md);
  }

  /* Main Product Container */
  .product-detail-page-container {
    background: var(--ugflix-bg-primary);
  }

  /* Product Image Gallery */
  .product-image-gallery {
    position: relative;
  }

  .main-image-wrapper {
    width: 100%;
    aspect-ratio: 1;
    background: var(--ugflix-bg-secondary);
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--ugflix-transition-speed) var(--ugflix-transition-timing);
    position: relative;
  }

  .main-image-wrapper:hover {
    border-color: var(--ugflix-primary);
    box-shadow: var(--ugflix-shadow-hover);
  }

  .main-image-wrapper img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform var(--transition-speed) var(--transition-timing);
  }

  .main-image-wrapper:hover img {
    transform: scale(1.02);
  }

  .discount-badge {
    position: absolute;
    top: var(--spacing-md);
    right: var(--spacing-md);
    background: var(--accent-color);
    color: var(--white);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius);
    font-weight: 600;
    font-size: 12px;
    box-shadow: var(--shadow-sm);
    z-index: 2;
  }

  /* Thumbnail Gallery */
  .thumbnail-row {
    display: flex;
    gap: var(--spacing-sm);
    overflow-x: auto;
    padding: var(--spacing-sm) 0;
    scrollbar-width: thin;
    scrollbar-color: var(--primary-color) var(--background-light);
    scroll-behavior: smooth;
  }

  .thumbnail-row::-webkit-scrollbar {
    height: 6px;
  }

  .thumbnail-row::-webkit-scrollbar-track {
    background: var(--background-light);
    border-radius: 3px;
  }

  .thumbnail-row::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 3px;
  }

  .thumbnail-row::-webkit-scrollbar-thumb:hover {
    background: var(--primary-color);
    opacity: 0.8;
  }

  .thumb-wrapper {
    flex: 0 0 auto;
    width: 70px;
    height: 70px;
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
    overflow: hidden;
    cursor: pointer;
    transition: all var(--ugflix-transition-speed) var(--ugflix-transition-timing);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ugflix-bg-secondary);
    position: relative;
  }

  .thumb-wrapper:hover {
    border-color: var(--ugflix-primary);
    box-shadow: 0 0 0 2px rgba(183, 28, 28, 0.2);
  }

  .thumb-wrapper.selected-thumb {
    border-color: var(--ugflix-primary);
    box-shadow: 0 0 0 2px rgba(183, 28, 28, 0.3);
  }

  .thumb-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 576px) {
    .thumb-wrapper {
      width: 60px;
      height: 60px;
    }
  }

  /* Product Info */
  .product-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--ugflix-text-primary);
    line-height: 1.3;
    margin-bottom: var(--ugflix-spacing-lg);
  }

  .category-badge {
    background: var(--ugflix-primary);
    color: var(--ugflix-text-primary);
    padding: var(--ugflix-spacing-xs) var(--ugflix-spacing-md);
    border-radius: 0px;
    font-weight: 500;
    font-size: 13px;
    border: none;
  }

  .rating-container {
    background: var(--ugflix-bg-secondary);
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
    padding: var(--ugflix-spacing-md);
    display: flex;
    align-items: center;
    gap: var(--ugflix-spacing-md);
  }

  .rating-stars {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .rating-stars i {
    color: var(--ugflix-accent);
    font-size: 1rem;
  }

  .rating-value {
    font-weight: 600;
    color: var(--ugflix-text-primary);
  }

  .rating-count {
    color: var(--ugflix-text-secondary);
    font-size: 14px;
  }

  /* Share Buttons */
  .share-buttons {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-lg);
  }

  .share-buttons .btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0px;
    border: 1px solid var(--ugflix-border);
    background: var(--ugflix-bg-secondary);
    color: var(--ugflix-text-secondary);
    transition: all var(--ugflix-transition-speed) var(--ugflix-transition-timing);
    font-size: 14px;
  }

  .share-buttons .btn:hover {
    box-shadow: var(--ugflix-shadow-hover);
  }

  .share-buttons .btn-facebook:hover {
    background: #1877f2;
    color: var(--ugflix-text-primary);
    border-color: #1877f2;
  }

  .share-buttons .btn-twitter:hover {
    background: #1da1f2;
    color: var(--ugflix-text-primary);
    border-color: #1da1f2;
  }

  .share-buttons .btn-whatsapp:hover {
    background: #25d366;
    color: var(--ugflix-text-primary);
    border-color: #25d366;
  }

  /* Sidebar Card */
  .description-container {
    background-color: var(--ugflix-bg-secondary);
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
    padding: 16px;
  }

  .sidebar-container {
    background-color: var(--ugflix-bg-secondary);
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
  }

  .sidebar-content {
    padding: 16px;
  }

  .sidebar-card .card-body {
    padding: var(--ugflix-spacing-2xl);
  }

  /* Pricing Section */
  .pricing-section {
    margin-bottom: var(--ugflix-spacing-2xl);
    padding-bottom: var(--ugflix-spacing-lg);
    border-bottom: 1px solid var(--ugflix-border);
  }

  .current-price {
    font-size: 2rem;
    font-weight: 700;
    color: var(--ugflix-primary);
    line-height: 1.2;
    margin-bottom: var(--ugflix-spacing-xs);
  }

  .old-price {
    font-size: 1rem;
    color: var(--ugflix-text-muted);
    text-decoration: line-through;
    margin-left: var(--ugflix-spacing-sm);
  }

  .savings-badge {
    background: var(--ugflix-accent);
    color: var(--ugflix-text-primary);
    padding: var(--ugflix-spacing-xs) var(--ugflix-spacing-sm);
    border-radius: 0px;
    font-weight: 500;
    font-size: 12px;
    margin-top: var(--ugflix-spacing-xs);
    display: inline-block;
  }

  /* Stock Status */
  .stock-container {
    background: var(--ugflix-bg-card);
    border: 1px solid var(--ugflix-border);
    border-radius: 0px;
    padding: var(--ugflix-spacing-lg);
    margin-bottom: var(--ugflix-spacing-lg);
    transition: all var(--ugflix-transition-speed) var(--ugflix-transition-timing);
  }

  .stock-container.in-stock {
    background: rgba(34, 139, 34, 0.05);
    border-color: rgba(34, 139, 34, 0.2);
  }

  .stock-container.out-of-stock {
    background: rgba(183, 28, 28, 0.05);
    border-color: rgba(183, 28, 28, 0.2);
  }

  .stock-status {
    display: flex;
    align-items: center;
    gap: var(--ugflix-spacing-sm);
    font-weight: 600;
    margin-bottom: var(--ugflix-spacing-sm);
  }

  .stock-status.in-stock {
    color: var(--ugflix-success);
  }

  .stock-status.out-of-stock {
    color: var(--ugflix-primary);
  }

  .stock-count {
    color: var(--ugflix-text-secondary);
    font-size: 14px;
    margin-bottom: var(--ugflix-spacing-sm);
  }

  /* Progress Bar */
  .stock-progress {
    height: 6px;
    background: var(--ugflix-bg-disabled);
    border-radius: 0px;
    overflow: hidden;
  }

  .stock-progress .progress-bar {
    border-radius: 0px;
    transition: width 0.6s ease;
  }

  /* Variants */
  .variants-section {
    margin-bottom: var(--ugflix-spacing-lg);
  }

  .variant-label {
    font-weight: 600;
    color: var(--ugflix-text-primary);
    margin-bottom: var(--ugflix-spacing-sm);
    display: block;
    font-size: 14px;
  }

  .variant-options {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ugflix-spacing-sm);
  }

  .variant-btn {
    padding: var(--ugflix-spacing-sm) var(--ugflix-spacing-md);
    border: 1px solid var(--ugflix-border);
    background: var(--ugflix-bg-secondary);
    color: var(--ugflix-text-secondary);
    border-radius: 0px;
    cursor: pointer;
    transition: all var(--ugflix-transition-speed) var(--ugflix-transition-timing);
    font-weight: 500;
    font-size: 13px;
  }

  .variant-btn:hover {
    border-color: var(--ugflix-primary);
    color: var(--ugflix-primary);
    background: var(--ugflix-bg-card);
  }

  .variant-btn.active {
    background: var(--ugflix-primary);
    border-color: var(--ugflix-primary);
    color: var(--ugflix-text-primary);
    box-shadow: var(--ugflix-shadow-sm);
  }

  /* Quantity */
  .quantity-section {
    margin-bottom: var(--ugflix-spacing-lg);
  }

  .quantity-label {
    font-weight: 600;
    color: var(--ugflix-text-primary);
    margin-bottom: var(--ugflix-spacing-sm);
    display: block;
    font-size: 14px;
  }

  .quantity-input {
    width: 90px;
    padding: var(--spacing-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    font-weight: 500;
    text-align: center;
    transition: all var(--transition-speed) var(--transition-timing);
    font-size: 14px;
  }

  .quantity-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
    outline: none;
  }

  /* Action Buttons */
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .btn-add-to-cart,
  .btn-buy-now {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--border-radius);
    border: 1px solid transparent;
    transition: all var(--transition-speed) var(--transition-timing);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .btn-add-to-cart {
    background: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
  }

  .btn-add-to-cart:hover:not(:disabled) {
    background: var(--primary-color-dark);
    border-color: var(--primary-color-dark);
    color: var(--white);
    box-shadow: var(--shadow-md);
  }

  .btn-buy-now {
    background: var(--white);
    color: var(--primary-color);
    border-color: var(--primary-color);
  }

  .btn-buy-now:hover:not(:disabled) {
    background: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
  }

  .btn-add-to-cart:disabled,
  .btn-buy-now:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Checkout Button */
  .btn-checkout {
    width: 100%;
    padding: 0.75rem;
    margin-top: 0.75rem;
    font-weight: 600;
    font-size: 0.95rem;
    border-radius: var(--border-radius);
    border: none;
    background: #28a745 !important;
    color: white !important;
    transition: all var(--transition-speed) var(--transition-timing);
    box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
  }

  .btn-checkout:hover {
    background: #218838 !important;
    color: white !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
  }

  .btn-checkout:active {
    transform: translateY(0);
  }

  .btn-checkout:focus {
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.25);
  }

  /* Product Tabs */
  .product-tabs {
    background: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    margin-bottom: var(--spacing-2xl);
  }

  .product-tabs .nav-pills {
    background: var(--background-light);
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 0;
  }

  .product-tabs .nav-pills .nav-link {
    background: transparent;
    color: var(--text-color-medium);
    font-weight: 500;
    border-radius: var(--border-radius);
    padding: var(--spacing-sm) var(--spacing-lg);
    margin-right: var(--spacing-sm);
    border: 1px solid transparent;
    transition: all var(--transition-speed) var(--transition-timing);
    font-size: 14px;
  }

  .product-tabs .nav-pills .nav-link:hover {
    background: var(--white);
    color: var(--text-color-dark);
    border-color: var(--border-color);
  }

  .product-tabs .nav-pills .nav-link.active {
    background: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
  }

  .product-tabs .tab-content {
    padding: var(--spacing-2xl);
    background: var(--white);
  }

  .product-tabs .tab-pane {
    color: var(--text-color-medium);
    line-height: 1.6;
  }

  /* Specifications Table */
  .specs-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
  }

  .specs-table th,
  .specs-table td {
    padding: var(--spacing-md);
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  .specs-table th {
    background: var(--background-light);
    font-weight: 600;
    color: var(--text-color-dark);
    width: 30%;
    font-size: 14px;
  }

  .specs-table td {
    color: var(--text-color-medium);
    font-size: 14px;
  }

  .specs-table tr:last-child th,
  .specs-table tr:last-child td {
    border-bottom: none;
  }

  .specs-table tr:nth-child(even) {
    background: var(--background-muted);
  }

  /* Product Tags */
  .product-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-sm);
  }

  .product-tag {
    background: var(--primary-color);
    color: var(--white);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all var(--transition-speed) var(--transition-timing);
    cursor: pointer;
    border: 1px solid transparent;
    user-select: none;
    outline: none;
  }

  .product-tag:hover,
  .product-tag:focus {
    background: var(--white);
    color: var(--primary-color);
    border-color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .product-tag:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .product-tag.secondary {
    background: var(--text-color-light);
    color: var(--white);
  }

  .product-tag.secondary:hover,
  .product-tag.secondary:focus {
    background: var(--white);
    color: var(--text-color-dark);
    border-color: var(--text-color-light);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .product-tag.secondary:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  /* Product Attributes Section */
  .product-attributes {
    margin-top: var(--spacing-lg);
    padding: 0;
    border: none;
  }

  .product-attributes h5 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--primary-color);
    letter-spacing: 0.5px;
    text-transform: capitalize;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--primary-color);
    position: relative;
  }

  .attributes-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    padding: 0;
    border: none;
    background: transparent;
  }

  .attribute-row {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 0.75rem;
    padding: 0.4rem 0.5rem;
    align-items: start;
    border-bottom: none;
  }

  .attribute-row:nth-child(even) {
    background: var(--bs-light);
  }

  .attribute-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--bs-secondary);
    line-height: 1.3;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .attribute-value {
    font-size: 0.8rem;
    color: var(--bs-dark);
    line-height: 1.3;
    font-weight: 400;
  }

  @media (max-width: 768px) {
    .attribute-row {
      grid-template-columns: 1fr;
      gap: 0.1rem;
    }
  }

  /* Related Products */
  .related-products {
    background: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    padding: 1.5rem;
    margin-top: 2rem;
  }

  .related-products h3 {
    color: var(--text-color-dark);
    font-weight: 600;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .related-products h3::before {
    content: "";
    width: 3px;
    height: 20px;
    background: var(--primary-color);
    border-radius: 2px;
  }

  .related-products-slider {
    position: relative;
    overflow: hidden;
  }

  .related-products-container {
    display: flex;
    gap: 1rem;
    transition: transform 0.3s ease;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: 0.5rem;
  }

  .related-products-container::-webkit-scrollbar {
    display: none;
  }

  .related-product-item {
    flex: 0 0 200px;
    min-width: 200px;
  }

  .related-product-card {
    background: var(--white);
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius);
    overflow: hidden;
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .related-product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border-color: var(--primary-color);
  }

  .related-product-image {
    position: relative;
    width: 100%;
    height: 150px;
    overflow: hidden;
    background: var(--bg-light);
  }

  .related-product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .related-product-card:hover .related-product-image img {
    transform: scale(1.05);
  }

  .related-product-content {
    padding: 0.75rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .related-product-title {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-color-dark);
    margin-bottom: 0.5rem;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-decoration: none;
    flex: 1;
  }

  .related-product-title:hover {
    color: var(--primary-color);
  }

  .related-product-price {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .related-product-price-current {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--primary-color);
  }

  .related-product-price-original {
    font-size: 0.8rem;
    color: var(--text-color-muted);
    text-decoration: line-through;
  }

  .related-product-discount {
    background: var(--accent-color);
    color: white;
    font-size: 0.7rem;
    font-weight: 500;
    padding: 0.15rem 0.4rem;
    border-radius: 8px;
  }

  .related-product-actions {
    display: flex;
    gap: 0.5rem;
  }

  .related-product-btn {
    flex: 1;
    padding: 0.4rem 0.5rem;
    border: none;
    border-radius: var(--border-radius);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
  }

  .related-product-btn-primary {
    background: var(--primary-color);
    color: white;
  }

  .related-product-btn-primary:hover {
    background: var(--primary-color-dark);
    transform: translateY(-1px);
  }

  .related-product-btn-outline {
    background: transparent;
    color: var(--text-color-dark);
    border: 1px solid var(--border-color);
  }

  .related-product-btn-outline:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--primary-color-light);
  }

  .slider-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: var(--white);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    color: var(--text-color-dark);
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .slider-button:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-50%) scale(1.1);
  }

  .slider-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: translateY(-50%);
  }

  .slider-button.prev {
    left: -16px;
  }

  .slider-button.next {
    right: -16px;
  }

  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    .related-products {
      padding: 1rem;
      margin-top: 1rem;
    }

    .related-product-item {
      flex: 0 0 180px;
      min-width: 180px;
    }

    .related-product-image {
      height: 120px;
    }

    .related-product-content {
      padding: 0.5rem;
    }

    .related-product-title {
      font-size: 0.8rem;
    }

    .related-product-price-current {
      font-size: 0.85rem;
    }

    .related-product-btn {
      padding: 0.3rem 0.4rem;
      font-size: 0.75rem;
    }

    .slider-button {
      width: 28px;
      height: 28px;
      font-size: 14px;
    }

    .slider-button.prev {
      left: -14px;
    }

    .slider-button.next {
      right: -14px;
    }
  }

  @media (max-width: 480px) {
    .related-product-item {
      flex: 0 0 160px;
      min-width: 160px;
    }

    .related-product-image {
      height: 100px;
    }

    .related-product-actions {
      flex-direction: column;
      gap: 0.3rem;
    }

    .related-product-btn {
      padding: 0.35rem;
      font-size: 0.7rem;
    }
  }
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    background: var(--white);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    color: var(--text-color-dark);
    transition: all var(--transition-speed) var(--transition-timing);
    z-index: 2;
    box-shadow: var(--shadow-sm);
  }

  .slider-button:hover {
    background: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
    box-shadow: var(--shadow-md);
  }

  .slider-button.prev {
    left: -18px;
  }

  .slider-button.next {
    right: -18px;
  }

  .slider-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    background: var(--background-light);
    color: var(--text-color-light);
  }

  .slider-button:disabled:hover {
    background: var(--background-light);
    color: var(--text-color-light);
    border-color: var(--border-color);
  }

  /* Fullscreen Modal Styles */
  .fullscreen-modal {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.95) !important;
    z-index: 9999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    backdrop-filter: blur(3px);
  }

  .fullscreen-modal .modal-dialog {
    max-width: none !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
  }

  .fullscreen-modal .modal-content {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
  }

  .fullscreen-modal .modal-header,
  .fullscreen-modal .modal-footer {
    display: none !important;
  }

  .fullscreen-modal .modal-body {
    padding: 0 !important;
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
    background: transparent !important;
  }

  .modal-image-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    overflow: hidden;
    padding: 0;
  }

  .modal-image-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(100vw - 140px); /* Account for nav buttons */
    height: calc(100vh - 100px); /* Account for close button and counter */
    max-width: calc(100vw - 140px);
    max-height: calc(100vh - 100px);
    background: transparent;
    border-radius: 8px;
    overflow: hidden;
  }

  .modal-close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10001;
    transition: all 0.2s ease;
    color: var(--text-color-dark);
    font-size: 18px;
    font-weight: 600;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .modal-close-btn:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .modal-nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.9);
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10001;
    transition: all 0.2s ease;
    color: var(--text-color-dark);
    font-size: 24px;
    font-weight: 600;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .modal-nav-btn:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .modal-nav-btn.prev {
    left: 20px;
  }

  .modal-nav-btn.next {
    right: 20px;
  }

  .modal-nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .modal-nav-btn:disabled:hover {
    transform: translateY(-50%) scale(1);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .modal-image-counter {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.9);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color-dark);
    z-index: 10001;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    .modal-close-btn {
      top: 10px;
      right: 10px;
      width: 40px;
      height: 40px;
      font-size: 16px;
    }

    .modal-nav-btn {
      width: 44px;
      height: 44px;
      font-size: 20px;
    }

    .modal-nav-btn.prev {
      left: 10px;
    }

    .modal-nav-btn.next {
      right: 10px;
    }

    .modal-image-counter {
      bottom: 10px;
      padding: 6px 12px;
      font-size: 12px;
    }

    .modal-image-wrapper {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: calc(100vw - 88px); /* Account for smaller nav buttons on mobile */
      height: calc(100vh - 80px); /* Account for smaller controls on mobile */
      max-width: calc(100vw - 88px);
      max-height: calc(100vh - 80px);
    }
  }

  /* Responsive Design */
  @media (max-width: 991.98px) {
    .sidebar-card {
      position: relative;
      top: auto;
      margin-top: var(--spacing-2xl);
    }

    .product-title {
      font-size: 1.5rem;
    }

    .current-price {
      font-size: 1.75rem;
    }

    .product-detail-page-container,
    .product-detail-container {
      padding: var(--spacing-lg);
    }
  }

  @media (max-width: 767.98px) {
    .product-detail-page-container,
    .product-detail-container {
      padding: var(--spacing-md);
    }

    .product-title {
      font-size: 1.25rem;
    }

    .current-price {
      font-size: 1.5rem;
    }

    .action-buttons {
      gap: var(--spacing-sm);
    }

    .btn-add-to-cart,
    .btn-buy-now {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: 13px;
    }

    .related-product-item {
      flex: 0 0 220px;
      min-width: 220px;
    }

    .slider-button {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }

    .slider-button.prev {
      left: -16px;
    }

    .slider-button.next {
      right: -16px;
    }

    .sidebar-card .card-body {
      padding: var(--spacing-lg);
    }

    .product-tabs .nav-pills {
      padding: var(--spacing-md);
    }

    .product-tabs .tab-content {
      padding: var(--spacing-lg);
    }
  }

  @media (max-width: 575.98px) {
    .action-buttons {
      flex-direction: column;
    }

    .share-buttons {
      justify-content: center;
    }

    .related-products {
      padding: var(--spacing-lg);
    }

    .related-product-item {
      flex: 0 0 200px;
      min-width: 200px;
    }
  }

  /* ===================================================================
     Product Description Content Styling
     =================================================================== */
  .product-description-content {
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--text-color);
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .product-description-content * {
    max-width: 100%;
    box-sizing: border-box;
  }

  /* Typography */
  .product-description-content p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .product-description-content h1,
  .product-description-content h2,
  .product-description-content h3,
  .product-description-content h4,
  .product-description-content h5,
  .product-description-content h6 {
    color: var(--primary-color);
    font-weight: 600;
    margin: 1.5rem 0 0.75rem 0;
    line-height: 1.3;
  }

  .product-description-content h1 { font-size: 1.5rem; }
  .product-description-content h2 { font-size: 1.375rem; }
  .product-description-content h3 { font-size: 1.25rem; }
  .product-description-content h4 { font-size: 1.125rem; }
  .product-description-content h5 { font-size: 1rem; }
  .product-description-content h6 { font-size: 0.875rem; }

  /* Lists */
  .product-description-content ul,
  .product-description-content ol {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  .product-description-content li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }

  /* Images */
  .product-description-content img {
    max-width: 250px !important;
    width: auto !important;
    height: auto !important;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    margin: 1rem auto;
    display: block;
  }

  .product-description-content figure {
    margin: 1rem 0;
    text-align: center;
  }

  .product-description-content figcaption {
    font-size: 0.75rem;
    color: var(--text-color-light);
    margin-top: 0.5rem;
    font-style: italic;
  }

  /* Tables */
  .product-description-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    font-size: 0.875rem;
    background: var(--white);
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

  .product-description-content table th,
  .product-description-content table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
    vertical-align: top;
  }

  .product-description-content table th {
    background: var(--background-light);
    color: var(--text-color-dark);
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .product-description-content table tr:last-child td {
    border-bottom: none;
  }

  .product-description-content table tr:hover {
    background: var(--background-light);
  }

  /* Links */
  .product-description-content a {
    color: var(--primary-color);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all var(--transition-speed) var(--transition-timing);
  }

  .product-description-content a:hover {
    color: var(--primary-color-dark);
    border-bottom-color: var(--primary-color);
  }

  /* Blockquotes */
  .product-description-content blockquote {
    margin: 1.5rem 0;
    padding: 1rem 1.5rem;
    border-left: 4px solid var(--primary-color);
    background: var(--background-light);
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
    font-style: italic;
  }

  /* Code */
  .product-description-content code {
    background: var(--background-light);
    color: var(--primary-color);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
  }

  .product-description-content pre {
    background: var(--background-light);
    color: var(--text-color-dark);
    padding: 1rem;
    border-radius: var(--border-radius);
    overflow-x: auto;
    margin: 1rem 0;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    line-height: 1.4;
  }

  .product-description-content pre code {
    background: none;
    color: inherit;
    padding: 0;
  }

  /* Dividers */
  .product-description-content hr {
    border: none;
    height: 1px;
    background: var(--border-color);
    margin: 2rem 0;
  }

  /* Strong and emphasis */
  .product-description-content strong,
  .product-description-content b {
    color: var(--text-color-dark);
    font-weight: 600;
  }

  .product-description-content em,
  .product-description-content i {
    font-style: italic;
    color: var(--text-color);
  }

  /* Video and iframe responsiveness */
  .product-description-content iframe,
  .product-description-content video,
  .product-description-content embed,
  .product-description-content object {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    border-radius: var(--border-radius);
  }

  /* Responsive iframe wrapper */
  .product-description-content .video-wrapper {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    height: 0;
    overflow: hidden;
    margin: 1rem 0;
    border-radius: var(--border-radius);
  }

  .product-description-content .video-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 0;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .product-description-content {
      font-size: 0.8rem;
    }

    .product-description-content h1 { font-size: 1.25rem; }
    .product-description-content h2 { font-size: 1.125rem; }
    .product-description-content h3 { font-size: 1rem; }
    .product-description-content h4 { font-size: 0.95rem; }
    .product-description-content h5 { font-size: 0.9rem; }
    .product-description-content h6 { font-size: 0.85rem; }

    .product-description-content table {
      font-size: 0.75rem;
    }

    .product-description-content table th,
    .product-description-content table td {
      padding: 0.5rem;
    }
  }

  /* ===================================================================
     Page Navigator Styling
     =================================================================== */
  .page-navigator {
    border-top: 1px solid var(--border-color);
    padding-top: 1rem;
  }

  .navigator-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-color-dark);
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .navigator-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-link-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    color: var(--text-color);
    text-decoration: none;
    transition: all var(--transition-speed) var(--transition-timing);
    cursor: pointer;
    font-size: 0.875rem;
    width: 100%;
    text-align: left;
  }

  .nav-link-btn:hover {
    background: var(--background-light);
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateX(2px);
  }

  .nav-link-btn:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-color-light);
  }

  .nav-link-btn i {
    font-size: 1rem;
    width: 16px;
    text-align: center;
    color: var(--primary-color);
  }

  .nav-link-btn span {
    font-weight: 500;
  }

  /* Mobile responsiveness for navigator */
  @media (max-width: 992px) {
    .page-navigator {
      display: none;
    }

    /* Hide desktop action buttons on mobile */
    .action-buttons {
      display: none;
    }
  }

  /* ===================================================================
     Mobile Sticky Bottom Bar
     =================================================================== */
  .mobile-sticky-bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--white);
    border-top: 1px solid var(--border-color);
    padding: 1rem;
    z-index: 1000;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    display: none;
  }

  .mobile-action-buttons {
    display: flex;
    gap: 0.75rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .mobile-btn-add-to-cart,
  .mobile-btn-buy-now {
    flex: 1;
    padding: 0.875rem 1rem;
    font-weight: 600;
    font-size: 0.95rem;
    border-radius: var(--border-radius);
    border: 2px solid var(--primary-color);
    transition: all var(--transition-speed) var(--transition-timing);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .mobile-btn-add-to-cart {
    background: var(--white);
    color: var(--primary-color);
  }

  .mobile-btn-add-to-cart:hover:not(:disabled) {
    background: var(--primary-color-light);
    color: var(--primary-color);
    border-color: var(--primary-color);
  }

  .mobile-btn-buy-now {
    background: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
  }

  .mobile-btn-buy-now:hover:not(:disabled) {
    background: var(--primary-color-dark);
    color: var(--white);
    border-color: var(--primary-color-dark);
  }

  .mobile-btn-add-to-cart:disabled,
  .mobile-btn-buy-now:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Show mobile bar only on mobile devices */
  @media (max-width: 992px) {
    .mobile-sticky-bottom {
      display: block;
    }

    /* Add bottom padding to container to prevent content overlap */
    .container {
      padding-bottom: 100px;
    }
  }

  /* Hide mobile bar on desktop */
  @media (min-width: 993px) {
    .mobile-sticky-bottom {
      display: none;
    }
  }

  /* ===================================================================
     Section Titles Styling
     =================================================================== */
  .section-title {
    color: var(--primary-color);
    font-weight: 600;
    font-size: 1.25rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--primary-color);
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .section-title i {
    color: var(--primary-color);
    font-size: 1.1rem;
  }

  .section-title::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 50px;
    height: 2px;
    background: var(--primary-color-light);
    border-radius: 1px;
  }

  /* Apply to existing section titles */
  .card-body h5:first-child,
  .product-attributes h5,
  .navigator-title {
    color: var(--primary-color);
    font-weight: 600;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--primary-color);
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .card-body h5:first-child::after,
  .product-attributes h5::after,
  .navigator-title::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 50px;
    height: 2px;
    background: var(--primary-color-light);
    border-radius: 1px;
  }

  .card-body h5:first-child i,
  .product-attributes h5 i,
  .navigator-title i {
    color: var(--primary-color);
    font-size: 1.1rem;
  }

  /* Related products title */
  .related-products h3 {
    color: var(--primary-color);
    font-weight: 600;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--primary-color);
    position: relative;
  }

  .related-products h3::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: var(--primary-color-light);
    border-radius: 1px;
  }

  /* Mobile responsiveness for section titles */
  @media (max-width: 768px) {
    .section-title,
    .card-body h5:first-child,
    .product-attributes h5,
    .navigator-title {
      font-size: 1.1rem;
    }

    .related-products h3 {
      font-size: 1.3rem;
    }

    .section-title::after,
    .card-body h5:first-child::after,
    .product-attributes h5::after,
    .navigator-title::after,
    .related-products h3::after {
      width: 40px;
    }

    /* Reduce gap between breadcrumb and main content on mobile */
    .dynamic-breadcrumb + .container {
      margin-top: -8px;
    }
  }

  /* Extra small screens - further reduce spacing */
  @media (max-width: 576px) {
    .dynamic-breadcrumb + .container {
      margin-top: -12px;
    }
  }
`;

interface RouteParams {
  id?: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addToCart: addToCartHook, isInCart } = useCart();

  const productId = useMemo(() => parseInt(id || "0", 10), [id]);

  const {
    data: product,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetProductByIdQuery(productId, {
    skip: !productId,
    // Force refetch when productId changes
    refetchOnMountOrArgChange: true,
    // Disable caching for product details to ensure fresh data
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // Force refetch when productId changes
  useEffect(() => {
    if (productId && refetch) {
      refetch();
    }
  }, [productId, refetch]);

  // Update product-related state when product data changes
  useEffect(() => {
    // Product data changed, component will re-render with new data
  }, [product, isLoading, isFetching, isError, id]);

  // Fetch related products
  const { data: relatedProductsData } = useGetProductsQuery(
    {
      page: 1,
      limit: 4,
      category: product?.category || undefined,
    },
    {
      skip: !product?.category,
    }
  );

  const relatedProducts = relatedProductsData?.data || [];

  // Local UI state
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [imageErrored, setImageErrored] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [variantsSelection, setVariantsSelection] = useState<
    Record<string, string>
  >({});
  const [showModal, setShowModal] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Handle tag click navigation
  const handleTagClick = (tag: string) => {
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  };

  // Reset component state when productId changes (before new product loads)
  useEffect(() => {
    // Reset all local state to prevent showing old product data
    setSelectedImage("");
    setImageErrored(false);
    setQuantity(1);
    setVariantsSelection({});
    setShowModal(false);
    setSliderPosition(0);
    setModalImageIndex(0);
    setShowReviewModal(false);
    
    // Scroll to top when product changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  // Initialize image & variants when product loads
  useEffect(() => {
    if (!product) return;

    try {
      setSelectedImage(product.getMainImage());
      setImageErrored(false);

      const initial: Record<string, string> = {};
      if (product.variants && typeof product.variants === "object") {
        Object.entries(product.variants).forEach(([type, opts]) => {
          if (Array.isArray(opts) && opts.length) {
            initial[type] = opts[0];
          }
        });
      }
      setVariantsSelection(initial);
    } catch (error) {
      console.error("Error initializing product data:", error);
      setSelectedImage("/media/svg/files/blank-image.svg");
      setImageErrored(true);
    }
  }, [product]);

  // Handle modal state and back button
  useEffect(() => {
    const handlePopState = () => {
      if (showModal) {
        setShowModal(false);
      }
    };

    if (showModal) {
      window.history.pushState({ modalOpen: true }, "");
      window.addEventListener("popstate", handlePopState);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scrolling when modal is closed
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.body.style.overflow = "";
    };
  }, [showModal]);

  // Handle escape key for modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showModal) {
        setShowModal(false);
      }
    };

    const handleArrowKeys = (e: KeyboardEvent) => {
      if (showModal && gallery.length > 1) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          handleModalPrev();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleModalNext();
        }
      }
    };

    document.addEventListener("keydown", handleEscKey);
    document.addEventListener("keydown", handleArrowKeys);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.removeEventListener("keydown", handleArrowKeys);
    };
  }, [showModal, modalImageIndex]);

  // Derived stock/pricing data - calculate outside of any conditions
  const price1 = useMemo(
    () => (product ? Number(product.price_1) || 0 : 0),
    [product]
  );
  const price2 = useMemo(
    () => (product ? Number(product.price_2) || 0 : 0),
    [product]
  );
  const discount = useMemo(
    () =>
      product && price2 > price1
        ? Math.round(((price2 - price1) / price2) * 100)
        : 0,
    [product, price1, price2]
  );

  const sold = useMemo(() => product?.stock?.items_sold ?? 0, [product]);
  const total = useMemo(() => product?.stock?.total_items ?? 0, [product]);
  const remaining = useMemo(() => Math.floor(Math.random() * 901) + 100, []);
  const soldPct = useMemo(
    () => (total ? Math.min(100, (sold / total) * 100) : 0),
    [total, sold]
  );
  const outOfStock = useMemo(
    () => total > 0 && remaining <= 0,
    [total, remaining]
  );

  // Handlers
  const onQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return setQuantity(1);
    if (val < 1) return setQuantity(1);
    if (val > remaining) {
      dispatch(
        showNotification({
          message: `Only ${remaining} available`,
          type: "warning",
        })
      );
      return setQuantity(remaining);
    }
    setQuantity(val);
  };

  const onVariantSelect = (type: string, option: string) =>
    setVariantsSelection((prev) => ({ ...prev, [type]: option }));

  const onAddToCart = async () => {
    try {
      if (outOfStock || quantity < 1) {
        dispatch(
          showNotification({
            message: "Cannot add to cart – out of stock or invalid quantity.",
            type: "error",
          })
        );
        return;
      }

      const variant = {
        color: variantsSelection.Color || variantsSelection.color || "",
        size: variantsSelection.Size || variantsSelection.size || "",
        ...variantsSelection,
      };

      if (product) {
        const success = await addToCartHook(product, quantity, variant);

        if (success) {
          setQuantity(1);
        }
      }
    } catch (error) {
      console.error("Error in onAddToCart:", error);
      dispatch(
        showNotification({
          message: "Failed to add item to cart",
          type: "error",
        })
      );
    }
  };

  const onBuyNow = async () => {
    if (outOfStock || quantity < 1) {
      dispatch(
        showNotification({
          message: "Cannot proceed – out of stock or invalid quantity.",
          type: "error",
        })
      );
      return;
    }

    const variant = {
      color: variantsSelection.Color || variantsSelection.color || "",
      size: variantsSelection.Size || variantsSelection.size || "",
      ...variantsSelection,
    };

    if (product) {
      // If not in cart, add it first
      if (!productInCart) {
        const success = await addToCartHook(product, quantity, variant);
        if (!success) {
          dispatch(
            showNotification({
              message: "Failed to add item to cart",
              type: "error",
            })
          );
          return;
        }
      }

      // Navigate to checkout
      dispatch(
        showNotification({
          message: `Proceeding to checkout...`,
          type: "info",
        })
      );
      
      // Redirect to checkout page
      navigate("/checkout");
    }
  };

  const renderStars = (rate: number) => {
    const full = Math.floor(rate);
    const half = rate % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <>
        {Array(full)
          .fill(0)
          .map((_, i) => (
            <i key={`f${i}`} className="bi bi-star-fill" />
          ))}
        {half && <i className="bi bi-star-half" />}
        {Array(empty)
          .fill(0)
          .map((_, i) => (
            <i key={`e${i}`} className="bi bi-star" />
          ))}
      </>
    );
  };

  // Slider handlers
  const handleSliderPrev = () => {
    const container = document.querySelector(
      ".related-products-container"
    ) as HTMLElement;
    if (container) {
      container.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const handleSliderNext = () => {
    const container = document.querySelector(
      ".related-products-container"
    ) as HTMLElement;
    if (container) {
      container.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Modal navigation handlers
  const gallery = useMemo(() => {
    if (!product) return [];

    try {
      const mainImage =
        product.getMainImage && typeof product.getMainImage === "function"
          ? product.getMainImage()
          : product.feature_photo || "/media/svg/files/blank-image.svg";

      const allImages =
        product.getAllImages && typeof product.getAllImages === "function"
          ? product.getAllImages() || []
          : [];

      // Combine main image with all images and remove duplicates
      const imageSet = new Set([mainImage, ...allImages].filter(Boolean));
      const uniqueImages = Array.from(imageSet);

      return uniqueImages;
    } catch (error) {
      console.error("Error generating gallery:", error);
      return ["/media/svg/files/blank-image.svg"];
    }
  }, [product]);

  const handleModalOpen = (clickedImage: string) => {
    const imageIndex = gallery.findIndex((img) => img === clickedImage);
    const finalIndex = imageIndex >= 0 ? imageIndex : 0;
    setModalImageIndex(finalIndex);
    setShowModal(true);
  };

  const handleModalPrev = () => {
    if (modalImageIndex > 0) {
      setModalImageIndex(modalImageIndex - 1);
    }
  };

  const handleModalNext = () => {
    if (modalImageIndex < gallery.length - 1) {
      setModalImageIndex(modalImageIndex + 1);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  // Get current modal image with fallback
  const currentModalImage = useMemo(() => {
    if (!gallery.length) {
      return selectedImage || "/media/svg/files/blank-image.svg";
    }
    const image = gallery[modalImageIndex] || gallery[0] || selectedImage;
    return image || "/media/svg/files/blank-image.svg";
  }, [gallery, modalImageIndex, selectedImage]);

  // Touch/swipe support for mobile modal navigation
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Check if current product with selected variants is in cart
  const productInCart = useMemo(() => {
    if (!product) return false;
    const currentVariant = {
      color: variantsSelection.Color || variantsSelection.color || "",
      size: variantsSelection.Size || variantsSelection.size || "",
      ...variantsSelection,
    };
    return isInCart(product.id, currentVariant);
  }, [product, variantsSelection, isInCart]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && gallery.length > 1) {
      handleModalNext();
    }
    if (isRightSwipe && gallery.length > 1) {
      handleModalPrev();
    }
  };

  // Loading state
  if (isLoading || isFetching) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
        <Container className="pdp-loading-container text-center my-5">
          <Spinner animation="border" role="status" />
          <h4>Loading product details…</h4>
        </Container>
      </>
    );
  }

  // Error state
  if (isError) {
    let errorMessage = "Unexpected error occurred.";

    if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object") {
      const errorObj = error as any;
      if (errorObj.data) {
        if (typeof errorObj.data === "string") {
          errorMessage = errorObj.data;
        } else if (errorObj.data.message) {
          errorMessage = errorObj.data.message;
        } else if (errorObj.data.error) {
          errorMessage = errorObj.data.error;
        }
      } else if (errorObj.message) {
        errorMessage = errorObj.message;
      } else if (errorObj.status) {
        errorMessage = `Error ${errorObj.status}: Failed to load product`;
      }
    }

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
        <Container className="pdp-error-container text-center my-5">
          <h4 className="mb-3" style={{ color: "var(--primary-color)" }}>
            Could not load product.
          </h4>
          <p>{errorMessage}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Container>
      </>
    );
  }

  // Not found state
  if (!product) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
        <Container className="pdp-not-found-container text-center my-5">
          <h4>Product not found.</h4>
          <Button variant="outline-primary" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <SEOHead config={generateProductMetaTags({
        id: product.id,
        name: product.name,
        description: product.description || "",
        price_1: parseFloat(product.price_1),
        image: product.feature_photo,
        category: product.category_text || undefined,
        availability: product.in_stock > 0 ? "available" : "unavailable"
      })} />
      <ProductSchema 
        product={{
          id: product.id,
          name: product.name,
          description: product.description || "",
          price: parseFloat(product.price_1),
          currency: "KES",
          imageUrl: product.feature_photo,
          availability: product.in_stock > 0 ? "InStock" : "OutOfStock",
          brand: "UgFlix",
          sku: `PRODUCT-${product.id}`,
          category: product.category_text || undefined,
          rating: product.average_rating > 0 ? {
            average: product.average_rating,
            count: product.review_count || 0
          } : undefined
        }}
      />
      <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
      <DynamicBreadcrumb />
      <Container fluid className="my-0">
        <Row>
          {/* Main Content Area - Left Side */}
          <Col lg={8} md={7}>
            {/* Product Images and Basic Info */}
            <div className="product-detail-container">
                <Row>
                  {/* Product Images */}
                  <Col md={6} className="mb-2">
                    <div className="product-image-gallery">
                      <div
                        className="main-image-wrapper"
                        onClick={() => handleModalOpen(selectedImage)}
                      >
                        <ShimmerImage
                          src={
                            imageErrored
                              ? "/media/svg/files/blank-image.svg"
                              : selectedImage
                          }
                          alt={product.name}
                          className="img-fluid"
                          onError={() => setImageErrored(true)}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            cursor: "pointer",
                            transition:
                              "transform var(--transition-speed) var(--transition-timing)",
                          }}
                          objectFit="contain"
                          loaderBackgroundColor="var(--background-light)"
                          loaderForegroundColor="var(--border-color)"
                        />
                        {discount > 0 && (
                          <span className="discount-badge">-{discount}%</span>
                        )}
                      </div>

                      {/* Thumbnails */}
                      <div className="thumbnail-row mt-3">
                        {gallery.map((url, idx) => (
                          <div
                            key={idx}
                            className={`thumb-wrapper ${
                              url === selectedImage ? "selected-thumb" : ""
                            }`}
                            onClick={() => {
                              setSelectedImage(url);
                              setImageErrored(false);
                            }}
                          >
                            <ShimmerImage
                              src={url}
                              alt={`Thumb ${idx + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                cursor: "pointer",
                              }}
                              objectFit="contain"
                              loaderBackgroundColor="var(--background-light)"
                              loaderForegroundColor="var(--border-color)"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <hr className="my-2" style={{ borderColor: "lightgrey" }} />
                    {/* Share Buttons */}
                    <div className="share-buttons">
                      <span className="fw-semibold me-2">Share:</span>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          window.location.href
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-facebook"
                        title="Share on Facebook"
                      >
                        <i className="bi bi-facebook" />
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                          window.location.href
                        )}&text=${encodeURIComponent(product.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-twitter"
                        title="Share on Twitter"
                      >
                        <i className="bi bi-twitter-x" />
                      </a>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          product.name + " " + window.location.href
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp"
                        title="Share on WhatsApp"
                      >
                        <i className="bi bi-whatsapp" />
                      </a>
                    </div>
                  </Col>

                  {/* Basic Product Info */}
                  <Col md={6} className="mb-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span className="category-badge">
                        {product.category_text || "Uncategorized"}
                      </span>

                      <WishlistButton
                        productId={product.id}
                        productName={product.name}
                        variant="icon"
                        size="md"
                      />
                    </div>

                    <h1 className="product-title">{product.name}</h1>

                    {/* Rating */}
                    {product.rating && Number(product.rating) > 0 && (
                      <div className="rating-container mb-4">
                        <div className="rating-stars">
                          {renderStars(Number(product.rating))}
                        </div>
                        <span className="rating-value">
                          {Number(product.rating).toFixed(1)}
                        </span>
                        <span className="rating-count">
                          ({Number(product.reviewsCount) || 0} review
                          {(Number(product.reviewsCount) || 0) !== 1 ? "s" : ""}
                          )
                        </span>
                      </div>
                    )}

                    {/* Product Attributes/Specifications */}
                    {Array.isArray(product.attributes_array) &&
                      product.attributes_array.length > 0 && (
                        <div className="product-attributes">
                          <h5>Specifications</h5>

                          <div className="attributes-grid">
                            {product.attributes_array.map((attr, index) => (
                              <div key={index} className="attribute-row">
                                <span className="attribute-label">
                                  {attr?.name || "Unknown"}
                                </span>
                                <span className="attribute-value">
                                  {attr?.value || "N/A"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Fallback: Basic Product Info when no attributes */}
                    {(!Array.isArray(product.attributes_array) ||
                      product.attributes_array.length === 0) && (
                      <div className="product-attributes">
                        <h5>Product Information</h5>

                        <div className="attributes-grid">
                          <div className="attribute-row">
                            <span className="attribute-label">Category</span>
                            <span className="attribute-value">
                              {product.category_text || "Uncategorized"}
                            </span>
                          </div>
                          <div className="attribute-row">
                            <span className="attribute-label">Product ID</span>
                            <span className="attribute-value">
                              {product.id || "N/A"}
                            </span>
                          </div>
                          {product.local_id && (
                            <div className="attribute-row">
                              <span className="attribute-label">SKU</span>
                              <span className="attribute-value">
                                {product.local_id}
                              </span>
                            </div>
                          )}
                          <div className="attribute-row">
                            <span className="attribute-label">
                              Availability
                            </span>
                            <span className="attribute-value">
                              {product.in_stock === 1
                                ? "In Stock"
                                : "Out of Stock"}
                            </span>
                          </div>
                          {product.has_colors === "Yes" && product.colors && (
                            <div className="attribute-row">
                              <span className="attribute-label">
                                Available Colors
                              </span>
                              <span className="attribute-value">
                                {product.colors}
                              </span>
                            </div>
                          )}
                          {product.has_sizes === "Yes" && product.sizes && (
                            <div className="attribute-row">
                              <span className="attribute-label">
                                Available Sizes
                              </span>
                              <span className="attribute-value">
                                {product.sizes}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {Array.isArray(product.tags_array) &&
                      product.tags_array.length > 0 && (
                        <div style={{ marginTop: "1rem" }}>
                          <div className="product-tags">
                            {product.tags_array.map((tag, index) => (
                              <span
                                key={index}
                                className="product-tag"
                                onClick={() => handleTagClick(tag)}
                                title={`Search for products with tag: ${tag}`}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleTagClick(tag);
                                  }
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </Col>
                </Row>
              </div>

            {/* Description Card - Below main product card */}
            <div className="description-container mt-4">
                <h5 className="section-title">
                  <i className="bi bi-file-text"></i>
                  Product Description
                </h5>
                {product.description ? (
                  <div
                    className="product-description-content"
                    dangerouslySetInnerHTML={{
                      __html: product.description,
                    }}
                  />
                ) : (
                  <p className="text-muted">No description available for this product.</p>
                )}
              </div>
          </Col>

          {/* Right Sidebar */}
          <Col lg={4} md={5}>
            <div className="sidebar-container">
              <div className="sidebar-content">
                {/* Pricing */}
                <div className="pricing-section">
                  <div className="d-flex align-items-center flex-wrap">
                    <div className="current-price">
                      UGX {price1.toLocaleString()}
                    </div>
                    {price2 > price1 && (
                      <span className="old-price">
                        UGX {price2.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <span className="savings-badge">Save {discount}%</span>
                  )}
                </div>

               

                {/* Variants Selection */}
                {product.variants &&
                  typeof product.variants === "object" &&
                  Object.keys(product.variants).length > 0 && (
                    <div className="variants-section mb-0">
                      {Object.entries(product.variants).map(([type, options]) =>
                        Array.isArray(options) && options.length > 0 ? (
                          <div key={type} className="mb-3">
                            <label className="variant-label">{type}:</label>
                            <div className="variant-options">
                              {options.map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  className={`variant-btn ${
                                    variantsSelection[type] === option
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() => onVariantSelect(type, option)}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}

                {/* Quantity Selection */}
                <div className="quantity-section w-100 mt-0">
                  <label className="quantity-label">Quantity:</label>
                  <Form.Control
                  type="number"
                  min="1"
                  max={remaining}
                  value={quantity}
                  onChange={onQuantityChange}
                  disabled={outOfStock}
                  className="quantity-input w-100"
                  />
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <Button
                    className="btn-add-to-cart"
                    onClick={onAddToCart}
                    disabled={outOfStock}
                  >
                    <i className="bi bi-cart-plus"></i>
                    Add to Cart
                  </Button>
                  <Button
                    className="btn-buy-now"
                    onClick={onBuyNow}
                    disabled={outOfStock}
                  >
                    <i className="bi bi-lightning"></i>
                    Buy Now
                  </Button>
                  
                  {/* Checkout Button - Shows when product is in cart */}
                  {productInCart && (
                    <Button
                      className="btn-checkout"
                      onClick={() => navigate("/checkout")}
                      variant="success"
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Proceed to Checkout
                    </Button>
                  )}
                </div>

                {/* Page Navigator */}
                <div className="page-navigator mt-4">
                  <h6 className="navigator-title">
                    <i className="bi bi-list-ul"></i>
                    Quick Navigation
                  </h6>
                  <div className="navigator-links">
                    <button
                      type="button"
                      className="nav-link-btn"
                      onClick={() => {
                        const element = document.querySelector('.product-description-content');
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <i className="bi bi-file-text"></i>
                      <span>Description</span>
                    </button>
                    <button
                      type="button"
                      className="nav-link-btn"
                      onClick={() => {
                        const element = document.querySelector('[data-section="reviews"]');
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <i className="bi bi-star"></i>
                      <span>Reviews</span>
                    </button>
                    <button
                      type="button"
                      className="nav-link-btn"
                      onClick={() => {
                        const element = document.querySelector('.related-products');
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <i className="bi bi-grid"></i>
                      <span>Related Products</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        {/* Product Details Cards */}
        <Row className="mt-4">
          {/* Reviews Card */}
          <Col xs={12} className="mb-4">
            <div data-section="reviews">
              <ReviewList
                productId={product.id}
                onWriteReviewClick={() => setShowReviewModal(true)}
                showWriteReviewButton={true}
              />
            </div>
          </Col>
        </Row>

        {/* Fullscreen Image Modal */}
        <Modal
          show={showModal}
          onHide={handleModalClose}
          size="xl"
          centered
          className="fullscreen-modal"
          backdrop="static"
        >
          <Modal.Body>
            <div
              className="modal-image-container"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <button
                className="modal-close-btn"
                onClick={handleModalClose}
                aria-label="Close modal"
              >
                ×
              </button>

              {gallery.length > 1 && (
                <>
                  <button
                    className="modal-nav-btn prev"
                    onClick={handleModalPrev}
                    disabled={modalImageIndex === 0}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    className="modal-nav-btn next"
                    onClick={handleModalNext}
                    disabled={modalImageIndex === gallery.length - 1}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}

              <div className="modal-image-wrapper">
                {currentModalImage ? (
                  <ShimmerImage
                    src={currentModalImage}
                    alt={`${product.name} - Image ${modalImageIndex + 1}`}
                    width="100%"
                    height="100%"
                    style={{
                      width: "100%",
                      height: "100%",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      borderRadius: "0px",
                      display: "block",
                    }}
                    objectFit="contain"
                    loaderBackgroundColor="rgba(255, 255, 255, 0.2)"
                    loaderForegroundColor="rgba(255, 255, 255, 0.4)"
                    loaderSpeed={1.2}
                    onError={(e) => {
                      // Optionally handle image load error here
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: "18px",
                    }}
                  >
                    No image available
                  </div>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="modal-image-counter">
                  {modalImageIndex + 1}/{gallery.length}
                </div>
              )}
            </div>
          </Modal.Body>
        </Modal>
      </Container>

      {/* Related Products Section - Separate Card */}
      {relatedProducts.length > 0 && (
        <Container fluid className="mt-4">
          <div className="related-products">
            <h3>Related Products</h3>
            
            <div className="related-products-slider">
              <button
                className="slider-button prev"
                onClick={handleSliderPrev}
                type="button"
                aria-label="Previous products"
              >
                ‹
              </button>
              
              <div className="related-products-container">
                {relatedProducts.map((relatedProduct) => (
                  <div key={relatedProduct.id} className="related-product-item">
                    <div className="related-product-card">
                      <div className="related-product-image">
                        <img
                          src={Utils.img(relatedProduct.feature_photo)}
                          alt={relatedProduct.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = Utils.img('default.png');
                          }}
                        />
                      </div>
                      
                      <div className="related-product-content">
                        <Link
                          to={`/product/${relatedProduct.id}`}
                          className="related-product-title"
                        >
                          {relatedProduct.name}
                        </Link>
                        
                        <div className="related-product-price">
                          <span className="related-product-price-current">
                            UGX {relatedProduct.price_2 || relatedProduct.price_1}
                          </span>
                          {relatedProduct.price_2 && parseFloat(relatedProduct.price_2) < parseFloat(relatedProduct.price_1) && (
                            <>
                              <span className="related-product-price-original">
                                UGX {relatedProduct.price_1}
                              </span>
                              <span className="related-product-discount">
                                -{Math.round(((parseFloat(relatedProduct.price_1) - parseFloat(relatedProduct.price_2)) / parseFloat(relatedProduct.price_1)) * 100)}%
                              </span>
                            </>
                          )}
                        </div>
                        
                        <div className="related-product-actions">
                          <button
                            className="related-product-btn related-product-btn-primary"
                            onClick={async () => {
                              try {
                                const success = await addToCartHook(relatedProduct, 1);
                                if (success) {
                                  dispatch(showNotification({
                                    message: `${relatedProduct.name} added to cart!`,
                                    type: 'success'
                                  }));
                                }
                              } catch (error) {
                                dispatch(showNotification({
                                  message: 'Failed to add item to cart',
                                  type: 'error'
                                }));
                              }
                            }}
                          >
                            + Cart
                          </button>
                          <Link
                            to={`/product/${relatedProduct.id}`}
                            className="related-product-btn related-product-btn-outline"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                className="slider-button next"
                onClick={handleSliderNext}
                type="button"
                aria-label="Next products"
              >
                ›
              </button>
            </div>
          </div>
        </Container>
      )}

      {/* Mobile Sticky Bottom Bar */}
      <div className="mobile-sticky-bottom">
        <div className="mobile-action-buttons">
          <Button
            className="mobile-btn-add-to-cart"
            onClick={onAddToCart}
            disabled={outOfStock}
          >
            <i className="bi bi-cart-plus"></i>
            Add to Cart
          </Button>
          <Button
            className="mobile-btn-buy-now"
            onClick={onBuyNow}
            disabled={outOfStock}
          >
            <i className="bi bi-lightning"></i>
            Buy Now
          </Button>
        </div>
      </div>

      {/* Review Form Modal */}
      <ReviewForm
        productId={product.id}
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        asModal={true}
        onReviewSubmitted={() => {
          // The ReviewList will automatically refetch due to cache invalidation
          // Don't close modal here - let ReviewForm handle it after successful submission
        }}
      />
    </>
  );
};

export default ProductDetailPage;
