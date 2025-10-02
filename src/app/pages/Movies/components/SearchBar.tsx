// src/app/pages/Movies/components/SearchBar.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, InputGroup, Button, Spinner } from 'react-bootstrap';
import { Search, X } from 'react-feather';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  initialValue?: string;
  isSearching?: boolean;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search movies, series, genres...',
  debounceMs = 500,
  initialValue = '',
  isSearching = false,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle search with debouncing
  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced search
    if (searchQuery || searchQuery === '') {
      debounceTimeoutRef.current = setTimeout(() => {
        console.log('🔍 SearchBar: Executing search with query:', searchQuery);
        onSearch(searchQuery);
      }, debounceMs);
    }

    // Cleanup on unmount or when searchQuery changes
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery, debounceMs, onSearch]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('🔍 SearchBar: Input changed:', value);
    setSearchQuery(value);
  }, []);

  // Handle clear button
  const handleClear = useCallback(() => {
    console.log('🔍 SearchBar: Clearing search');
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Handle form submit (prevent default, trigger immediate search)
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    console.log('🔍 SearchBar: Form submitted, immediate search:', searchQuery);
    onSearch(searchQuery);
  }, [searchQuery, onSearch]);

  return (
    <div className={`search-bar-wrapper ${className}`}>
      <Form onSubmit={handleSubmit} className="search-form">
        <InputGroup className={`search-input-group ${isFocused ? 'focused' : ''}`}>
          <InputGroup.Text className="search-icon-wrapper">
            {isSearching ? (
              <Spinner size="sm" animation="border" className="search-spinner" />
            ) : (
              <Search size={20} className="search-icon" />
            )}
          </InputGroup.Text>
          
          <Form.Control
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="search-input"
            autoComplete="off"
            spellCheck={false}
          />
          
          {searchQuery && (
            <Button
              variant="link"
              onClick={handleClear}
              className="clear-search-btn"
              aria-label="Clear search"
            >
              <X size={18} />
            </Button>
          )}
        </InputGroup>
        
        {/* Search hint text (mobile only) */}
        {isFocused && searchQuery.length > 0 && searchQuery.length < 3 && (
          <div className="search-hint d-lg-none">
            Type at least 3 characters to search
          </div>
        )}
      </Form>
    </div>
  );
};

export default SearchBar;
