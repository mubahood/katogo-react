# UGFLIX Design System & Style Guide v2.0

## Table of Contents
1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Components](#components)
7. [CSS Architecture](#css-architecture)
8. [Mobile-First Guidelines](#mobile-first-guidelines)
9. [Development Standards](#development-standards)
10. [Legacy Migration](#legacy-migration)

---

## Overview

The UGFLIX Design System v2.0 provides a comprehensive, mobile-first approach to building consistent user interfaces across the entire application. This system prioritizes:

- **Mobile-first responsive design**
- **Consistent brand colors** (#B71C1C primary, #F9A825 accent)
- **Square-cornered design language** (border-radius: 0)
- **Accessible interactions** with proper focus states
- **Performance optimization** through efficient CSS architecture

---

## Design Principles

### 1. Mobile-First Approach
- Start with mobile designs and progressively enhance for larger screens
- Touch-friendly interactions (minimum 44px touch targets)
- Optimized typography scaling across breakpoints

### 2. Brand Consistency
- All colors derive from the core brand palette
- Square corners throughout (border-radius: 0)
- Consistent spacing using 8px grid system

### 3. Accessibility
- High contrast ratios (WCAG AA compliance)
- Proper focus management
- Screen reader support
- Reduced motion support

### 4. Performance
- CSS custom properties for theming
- Minimal bundle sizes
- Efficient selector specificity
- Progressive enhancement

---

## Color System

### Primary Brand Colors
```css
/* Primary Red */
--brand-primary: #B71C1C;
--brand-primary-50: #FFEBEE;
--brand-primary-100: #FFCDD2;
--brand-primary-200: #EF9A9A;
--brand-primary-300: #E57373;
--brand-primary-400: #EF5350;
--brand-primary-500: #F44336;
--brand-primary-600: #E53935;
--brand-primary-700: #D32F2F;
--brand-primary-800: #C62828;
--brand-primary-900: #B71C1C;

/* Accent Amber */
--brand-accent: #F9A825;
--brand-accent-50: #FFFBF3;
--brand-accent-100: #FFF8E1;
--brand-accent-200: #FFECB3;
--brand-accent-300: #FFE082;
--brand-accent-400: #FFD54F;
--brand-accent-500: #FFCA28;
--brand-accent-600: #FFB300;
--brand-accent-700: #FFA000;
--brand-accent-800: #FF8F00;
--brand-accent-900: #F9A825;
```

### Semantic Colors
```css
--color-success: #4CAF50;
--color-warning: #FF9800;
--color-error: #F44336;
--color-info: #2196F3;
```

### Usage Guidelines
- **Primary**: Main actions, navigation highlights, important buttons
- **Accent**: Secondary actions, highlights, badges, notifications
- **Success**: Positive feedback, confirmations
- **Warning**: Cautions, pending states
- **Error**: Negative feedback, validation errors
- **Info**: Informational messages, tips

---

## Typography

### Font Scale (Mobile-First)
```css
/* Base: 16px on mobile, scales up on larger screens */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

### Font Weights
```css
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Line Heights
```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Usage Guidelines
- **Headings**: Use semibold or bold weights
- **Body text**: Regular weight, normal line height
- **UI text**: Medium weight for better readability on small screens
- **Scale responsively**: Increase font-size at larger breakpoints

---

## Spacing & Layout

### 8px Grid System
```css
--space-1: 0.125rem;   /* 2px */
--space-2: 0.25rem;    /* 4px */
--space-3: 0.5rem;     /* 8px */
--space-4: 0.75rem;    /* 12px */
--space-5: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

### Breakpoints
```css
--screen-sm: 576px;    /* Small devices */
--screen-md: 768px;    /* Medium devices */
--screen-lg: 992px;    /* Large devices */
--screen-xl: 1200px;   /* Extra large devices */
--screen-xxl: 1400px;  /* Extra extra large devices */
```

### Container Sizes
```css
--container-sm: 540px;
--container-md: 720px;
--container-lg: 960px;
--container-xl: 1140px;
--container-xxl: 1320px;
```

---

## Components

### Button System
```css
/* Sizes */
.btn-sm     /* Height: 32px, Padding: 0 12px */
.btn        /* Height: 40px, Padding: 0 16px */
.btn-lg     /* Height: 48px, Padding: 0 24px */

/* Variants */
.btn-primary    /* Primary brand color background */
.btn-secondary  /* Outline style with primary color */
.btn-accent     /* Accent color background */
.btn-ghost      /* Transparent background */

/* States */
.btn:disabled   /* Disabled state */
.btn:hover      /* Hover interactions */
.btn:focus      /* Focus state with outline */
```

### Card System
```css
.card           /* Basic card container */
.card-header    /* Card header section */
.card-body      /* Main card content */
.card-footer    /* Card footer section */

/* Variants */
.card-elevated      /* Enhanced shadow */
.card-interactive   /* Hover effects enabled */
```

### Form Controls
```css
.form-control       /* Standard input styling */
.form-control-sm    /* Small size variant */
.form-control-lg    /* Large size variant */
.form-select        /* Select dropdown styling */
.form-check         /* Checkbox/radio wrapper */
```

---

## CSS Architecture

### Import Order
```css
/* 1. Design System Foundation */
@import './design-system.css';

/* 2. Component Library */
@import './components.css';

/* 3. Theme Layers */
@import './ugflix-global-theme.css';
@import './ugflix-theme.css';
@import './auth-theme.css';

/* 4. Layout Systems */
@import '../components/Header/Header.css';
@import '../components/Layout/AuthLayout.css';

/* 5. Responsive & Utilities */
/* Built into above files */
```

### File Organization
```
src/app/styles/
├── index.css              # Master import file
├── design-system.css      # Core design tokens
├── components.css         # Component library
├── ugflix-global-theme.css # Global theme
├── ugflix-theme.css       # Main app theme
└── auth-theme.css         # Auth-specific theme

src/app/components/
├── Header/
│   └── Header.css         # Component-specific styles
├── shared/
│   └── ProductCard2.css   # Component-specific styles
└── css/
    └── ugflix-theme.css # Legacy theme support
```

### CSS Custom Properties Strategy
- **Global tokens** in `design-system.css`
- **Theme-specific overrides** in theme files
- **Component tokens** for component-specific customization
- **Legacy mappings** for backward compatibility

---

## Mobile-First Guidelines

### Responsive Design Patterns

#### 1. Typography Scaling
```css
/* Mobile first */
.heading {
  font-size: var(--text-lg);
}

/* Tablet and up */
@media (min-width: 768px) {
  .heading {
    font-size: var(--text-xl);
  }
}

/* Desktop and up */
@media (min-width: 992px) {
  .heading {
    font-size: var(--text-2xl);
  }
}
```

#### 2. Touch-Friendly Interactions
```css
/* Minimum touch target: 44px */
.btn {
  min-height: 44px;
  padding: 0 var(--space-4);
}

/* Larger targets on mobile */
@media (max-width: 767px) {
  .btn {
    padding: var(--space-3) var(--space-5);
  }
}
```

#### 3. Progressive Enhancement
```css
/* Base mobile experience */
.card {
  box-shadow: var(--shadow-sm);
}

/* Enhanced for devices with hover capability */
@media (hover: hover) {
  .card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}
```

### Mobile Optimization Checklist
- [ ] Touch targets minimum 44px
- [ ] Readable text without zoom (16px minimum)
- [ ] Optimized image sizes for mobile bandwidth
- [ ] Simplified navigation for small screens
- [ ] Fast loading and smooth animations
- [ ] Proper viewport meta tag
- [ ] Reduced motion support

---

## Development Standards

### CSS Naming Conventions
```css
/* BEM-inspired component naming */
.component-name { }           /* Block */
.component-name__element { }  /* Element */
.component-name--modifier { } /* Modifier */

/* Utility classes */
.u-text-center { }           /* Utility prefix */
.is-active { }               /* State prefix */
.has-shadow { }              /* State prefix */
```

### Component Development Process

#### 1. Design System First
- Check if needed tokens exist in design-system.css
- Use existing color, spacing, and typography tokens
- Create component-specific tokens if needed

#### 2. Mobile-First Implementation
```css
/* Start with mobile styles */
.new-component {
  /* Mobile styles here */
}

/* Add tablet styles */
@media (min-width: 768px) {
  .new-component {
    /* Tablet enhancements */
  }
}

/* Add desktop styles */
@media (min-width: 992px) {
  .new-component {
    /* Desktop enhancements */
  }
}
```

#### 3. Accessibility Integration
```css
.new-component {
  /* Focus management */
}

.new-component:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .new-component {
    transition: none;
  }
}
```

#### 4. Performance Considerations
- Use CSS custom properties for dynamic values
- Minimize expensive properties (box-shadow, transform)
- Prefer CSS Grid and Flexbox over float layouts
- Optimize selector specificity

### Code Review Checklist
- [ ] Uses design system tokens
- [ ] Mobile-first responsive design
- [ ] Proper accessibility support
- [ ] Performance optimized
- [ ] Browser compatibility tested
- [ ] Documentation updated

---

## Legacy Migration

### Migrating Existing Components

#### 1. Color Updates
```css
/* Old */
color: #ff6b35;
background-color: #e55a2e;

/* New */
color: var(--brand-primary);
background-color: var(--brand-primary-700);
```

#### 2. Spacing Updates
```css
/* Old */
margin: 15px;
padding: 20px 10px;

/* New */
margin: var(--space-4);
padding: var(--space-5) var(--space-3);
```

#### 3. Typography Updates
```css
/* Old */
font-size: 14px;
font-weight: 500;

/* New */
font-size: var(--text-sm);
font-weight: var(--font-weight-medium);
```

### Backward Compatibility
- Legacy variable mappings maintained in design-system.css
- Gradual migration path for existing components
- Support for both old and new class names during transition

---

## Implementation Examples

### Example: Button Component
```tsx
// React Component
const Button = ({ variant = 'primary', size = 'md', children, ...props }) => (
  <button 
    className={`btn btn-${variant} btn-${size}`}
    {...props}
  >
    {children}
  </button>
);

// Usage
<Button variant="primary" size="lg">
  Primary Action
</Button>
```

### Example: Responsive Card
```tsx
const ProductCard = ({ product }) => (
  <div className="pc2-card-container">
    <div className="pc2-image-container">
      <img src={product.image} className="pc2-product-image" />
    </div>
    <div className="pc2-card-content">
      <h3 className="pc2-product-title">{product.title}</h3>
      <p className="pc2-current-price">{product.price}</p>
    </div>
  </div>
);
```

---

## Resources

### Tools & Extensions
- **VS Code Extensions**: CSS Peek, Auto Rename Tag, Prettier
- **Browser DevTools**: Chrome DevTools, Firefox Developer Tools
- **Testing**: Lighthouse, WAVE Accessibility Checker

### References
- [MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Grid Garden](https://cssgridgarden.com/)
- [Flexbox Froggy](https://flexboxfroggy.com/)

---

## Changelog

### v2.0 (Current)
- Mobile-first design system implementation
- Comprehensive component library
- CSS architecture restructure
- Brand color system update (#B71C1C, #F9A825)
- Accessibility enhancements
- Performance optimizations

### v1.0 (Legacy)
- Initial color implementation
- Basic theme structure
- Individual component styles

---

*This style guide is a living document and should be updated as the design system evolves.*