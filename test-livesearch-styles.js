// Test script to verify LiveSearchBox inline styles work correctly
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LiveSearchBox from '../src/app/components/search/LiveSearchBox';

// Mock the useManifest hook
jest.mock('../src/app/hooks/useManifest', () => ({
  useManifest: () => ({
    manifest: {
      recent_search_suggestions: ['laptop', 'phone', 'tablet']
    }
  })
}));

// Mock the ApiService
jest.mock('../src/app/services/ApiService', () => ({
  ApiService: {
    liveSearch: jest.fn().mockResolvedValue({
      products: [],
      suggestions: [],
      total: 0,
      search_term: ''
    }),
    clearSearchHistory: jest.fn()
  }
}));

describe('LiveSearchBox Inline Styles', () => {
  test('should inject inline styles into document head', () => {
    render(
      <BrowserRouter>
        <LiveSearchBox />
      </BrowserRouter>
    );

    // Check that styles are injected
    const styleElement = document.getElementById('live-search-box-styles');
    expect(styleElement).toBeTruthy();
    expect(styleElement?.textContent).toContain('.product-image');
    expect(styleElement?.textContent).toContain('width: 36px');
    expect(styleElement?.textContent).toContain('height: 36px');
  });

  test('should contain mobile responsive styles', () => {
    render(
      <BrowserRouter>
        <LiveSearchBox />
      </BrowserRouter>
    );

    const styleElement = document.getElementById('live-search-box-styles');
    expect(styleElement?.textContent).toContain('@media (max-width: 576px)');
    expect(styleElement?.textContent).toContain('width: 32px');
    expect(styleElement?.textContent).toContain('height: 32px');
  });
});
