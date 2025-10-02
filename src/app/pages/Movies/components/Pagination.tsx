// src/app/pages/Movies/components/Pagination.tsx
import React from 'react';
import { Button } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'react-feather';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isLoading = false,
  showPageNumbers = true,
  maxPageNumbers = 5,
  className = ''
}) => {
  // Calculate page range to display
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    
    if (totalPages <= maxPageNumbers) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const halfMax = Math.floor(maxPageNumbers / 2);
      let startPage = Math.max(1, currentPage - halfMax);
      let endPage = Math.min(totalPages, currentPage + halfMax);
      
      // Adjust if near boundaries
      if (currentPage <= halfMax) {
        endPage = maxPageNumbers;
      } else if (currentPage >= totalPages - halfMax) {
        startPage = totalPages - maxPageNumbers + 1;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculate item range
  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !isLoading) {
      console.log('📄 Pagination: Changing to page', page);
      onPageChange(page);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`pagination-wrapper ${className}`}>
      {/* Pagination Info */}
      <div className="pagination-info">
        <span className="pagination-text">
          Showing <strong>{startItem}-{endItem}</strong> of <strong>{totalItems}</strong> movies
        </span>
      </div>

      {/* Pagination Controls */}
      <nav className="pagination-controls" aria-label="Movies pagination">
        {/* First Page Button (Desktop only) */}
        <Button
          variant="outline-secondary"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1 || isLoading}
          className="pagination-btn pagination-btn-first d-none d-md-flex"
          aria-label="Go to first page"
        >
          <ChevronsLeft size={18} />
        </Button>

        {/* Previous Page Button */}
        <Button
          variant="outline-secondary"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="pagination-btn pagination-btn-prev"
          aria-label="Go to previous page"
        >
          <ChevronLeft size={18} />
          <span className="d-none d-sm-inline">Previous</span>
        </Button>

        {/* Page Numbers */}
        {showPageNumbers && (
          <div className="pagination-pages">
            {/* Show first page + ellipsis if needed */}
            {pageNumbers[0] > 1 && (
              <>
                <Button
                  variant="outline-secondary"
                  onClick={() => handlePageChange(1)}
                  disabled={isLoading}
                  className="pagination-btn pagination-btn-page d-none d-md-flex"
                >
                  1
                </Button>
                {pageNumbers[0] > 2 && (
                  <span className="pagination-ellipsis d-none d-md-inline">...</span>
                )}
              </>
            )}

            {/* Page number buttons */}
            {pageNumbers.map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? 'primary' : 'outline-secondary'}
                onClick={() => handlePageChange(page)}
                disabled={isLoading}
                className={`pagination-btn pagination-btn-page ${
                  page === currentPage ? 'active' : ''
                }`}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </Button>
            ))}

            {/* Show last page + ellipsis if needed */}
            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <>
                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                  <span className="pagination-ellipsis d-none d-md-inline">...</span>
                )}
                <Button
                  variant="outline-secondary"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={isLoading}
                  className="pagination-btn pagination-btn-page d-none d-md-flex"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Next Page Button */}
        <Button
          variant="outline-secondary"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="pagination-btn pagination-btn-next"
          aria-label="Go to next page"
        >
          <span className="d-none d-sm-inline">Next</span>
          <ChevronRight size={18} />
        </Button>

        {/* Last Page Button (Desktop only) */}
        <Button
          variant="outline-secondary"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || isLoading}
          className="pagination-btn pagination-btn-last d-none d-md-flex"
          aria-label="Go to last page"
        >
          <ChevronsRight size={18} />
        </Button>
      </nav>

      {/* Current Page Indicator (Mobile only) */}
      <div className="pagination-mobile-info d-md-none">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
