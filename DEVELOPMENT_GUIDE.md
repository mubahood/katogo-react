# UGFLIX Development Standards & Quick Reference

## Quick Start Guide

### 1. Import Order in Components
```tsx
// External libraries
import React from 'react';
import { Link } from 'react-router-dom';

// Internal utilities/types
import { ProductCardProps } from '../types';

// Component-specific styles (if needed)
import './ComponentName.css';
```

### 2. CSS Class Naming
```css
/* Component classes */
.component-name { }           /* Main component */
.component-name__part { }     /* Component part */
.component-name--variant { }  /* Component variant */

/* Use design system classes when possible */
.btn .btn-primary .btn-lg     /* Design system button */
.card .card-elevated          /* Design system card */
```

### 3. Responsive Design Pattern
```css
/* Mobile first (default) */
.my-component {
  padding: var(--space-3);
  font-size: var(--text-sm);
}

/* Tablet enhancement */
@media (min-width: 768px) {
  .my-component {
    padding: var(--space-4);
    font-size: var(--text-base);
  }
}

/* Desktop enhancement */
@media (min-width: 992px) {
  .my-component {
    padding: var(--space-6);
    font-size: var(--text-lg);
  }
}
```

## Design System Quick Reference

### Colors (Always use CSS variables)
```css
/* Brand Colors */
--brand-primary: #B71C1C;     /* Main red */
--brand-accent: #F9A825;      /* Amber */

/* Semantic Colors */
--color-success: #4CAF50;     /* Green */
--color-warning: #FF9800;     /* Orange */
--color-error: #F44336;       /* Red */
--color-info: #2196F3;        /* Blue */

/* Usage Examples */
color: var(--brand-primary);
background-color: var(--brand-accent);
border-color: var(--color-success);
```

### Spacing (8px Grid System)
```css
/* Common Spacings */
--space-1: 0.125rem;   /* 2px */
--space-2: 0.25rem;    /* 4px */
--space-3: 0.5rem;     /* 8px */
--space-4: 0.75rem;    /* 12px */
--space-5: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */

/* Usage Examples */
padding: var(--space-4);
margin: var(--space-3) var(--space-5);
gap: var(--space-2);
```

### Typography
```css
/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */

/* Font Weights */
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Usage Examples */
font-size: var(--text-base);
font-weight: var(--font-weight-medium);
```

### Shadows & Effects
```css
/* Shadows */
--shadow-none: none;
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);

/* Usage Examples */
box-shadow: var(--shadow-md);
```

## Common Component Patterns

### Button Pattern
```tsx
// Standard button implementation
<button className="btn btn-primary">
  Primary Action
</button>

<button className="btn btn-secondary btn-lg">
  Secondary Action
</button>

<button className="btn btn-accent btn-sm">
  Accent Button
</button>
```

### Card Pattern
```tsx
// Standard card implementation
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Card Title</h3>
  </div>
  <div className="card-body">
    <p className="card-text">Card content goes here</p>
  </div>
  <div className="card-footer">
    <button className="btn btn-primary">Action</button>
  </div>
</div>
```

### Form Pattern
```tsx
// Standard form implementation
<div className="form-group">
  <label className="form-label">Label Text</label>
  <input className="form-control" type="text" placeholder="Placeholder" />
</div>

<div className="form-group">
  <label className="form-label">Select Option</label>
  <select className="form-control form-select">
    <option>Choose...</option>
    <option value="1">Option 1</option>
  </select>
</div>
```

### Grid/Layout Pattern
```tsx
// Responsive grid layout
<div className="container">
  <div className="row">
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card">Content 1</div>
    </div>
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card">Content 2</div>
    </div>
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card">Content 3</div>
    </div>
  </div>
</div>
```

## Responsive Breakpoints

```css
/* Mobile First Approach */
/* Base styles: 0px - 575px (Mobile) */

@media (min-width: 576px) {
  /* Small devices (tablets) */
}

@media (min-width: 768px) {
  /* Medium devices (small laptops) */
}

@media (min-width: 992px) {
  /* Large devices (desktops) */
}

@media (min-width: 1200px) {
  /* Extra large devices */
}
```

## Utility Classes Quick Reference

### Display
```css
.d-none         /* display: none */
.d-block        /* display: block */
.d-flex         /* display: flex */
.d-inline-flex  /* display: inline-flex */
.d-grid         /* display: grid */
```

### Flexbox
```css
.justify-start    /* justify-content: flex-start */
.justify-center   /* justify-content: center */
.justify-between  /* justify-content: space-between */
.align-center     /* align-items: center */
.flex-column      /* flex-direction: column */
```

### Spacing
```css
/* Margin */
.m-0   .m-1   .m-2   .m-3   .m-4   .m-5
.mt-0  .mt-1  .mt-2  .mt-3  .mt-4  .mt-5  /* margin-top */
.mr-0  .mr-1  .mr-2  .mr-3  .mr-4  .mr-5  /* margin-right */
.mb-0  .mb-1  .mb-2  .mb-3  .mb-4  .mb-5  /* margin-bottom */
.ml-0  .ml-1  .ml-2  .ml-3  .ml-4  .ml-5  /* margin-left */
.mx-0  .mx-1  .mx-2  .mx-3  .mx-4  .mx-5  /* horizontal margin */
.my-0  .my-1  .my-2  .my-3  .my-4  .my-5  /* vertical margin */

/* Padding */
.p-0   .p-1   .p-2   .p-3   .p-4   .p-5   /* Same pattern as margin */
```

### Text
```css
.text-left      /* text-align: left */
.text-center    /* text-align: center */
.text-right     /* text-align: right */

.text-xs        /* font-size: 0.75rem */
.text-sm        /* font-size: 0.875rem */
.text-base      /* font-size: 1rem */
.text-lg        /* font-size: 1.125rem */

.font-normal    /* font-weight: 400 */
.font-medium    /* font-weight: 500 */
.font-semibold  /* font-weight: 600 */
.font-bold      /* font-weight: 700 */

.text-primary   /* color: var(--brand-primary) */
.text-accent    /* color: var(--brand-accent) */
.text-success   /* color: var(--color-success) */
.text-muted     /* color: var(--ugflix-text-muted) */
```

## Common Mistakes to Avoid

### ❌ Don't Do This
```css
/* Hardcoded colors */
color: #B71C1C;
background-color: #F9A825;

/* Hardcoded spacing */
margin: 16px;
padding: 8px 12px;

/* Desktop-first approach */
.component {
  font-size: 18px;
}
@media (max-width: 768px) {
  .component {
    font-size: 14px;
  }
}

/* Hardcoded font sizes */
font-size: 16px;
```

### ✅ Do This Instead
```css
/* Use design system variables */
color: var(--brand-primary);
background-color: var(--brand-accent);

/* Use spacing system */
margin: var(--space-5);
padding: var(--space-3) var(--space-4);

/* Mobile-first approach */
.component {
  font-size: var(--text-sm);
}
@media (min-width: 768px) {
  .component {
    font-size: var(--text-lg);
  }
}

/* Use typography system */
font-size: var(--text-base);
```

## Development Workflow

### 1. Before Creating New Styles
- [ ] Check if design system components exist
- [ ] Review existing utility classes
- [ ] Consider if customization is needed

### 2. Writing New Component Styles
- [ ] Start with mobile styles
- [ ] Use design system tokens
- [ ] Add responsive enhancements
- [ ] Include accessibility features
- [ ] Test on multiple devices

### 3. Code Review Checklist
- [ ] Uses CSS custom properties
- [ ] Mobile-first responsive design
- [ ] Proper accessibility support
- [ ] No hardcoded values
- [ ] Follows naming conventions
- [ ] Performance optimized

## Testing Checklist

### Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Edge

### Device Testing
- [ ] Mobile phones (320px - 480px)
- [ ] Tablets (768px - 1024px)
- [ ] Desktop (1200px+)
- [ ] Touch vs hover interactions

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader compatibility
- [ ] Reduced motion respected

## Performance Guidelines

### CSS Best Practices
- Use CSS custom properties for dynamic values
- Minimize expensive properties (transform, box-shadow)
- Prefer CSS Grid/Flexbox over float layouts
- Optimize selector specificity
- Use will-change sparingly

### Loading Optimization
- Critical CSS inlined
- Non-critical CSS loaded asynchronously
- Minimize unused CSS
- Use CSS containment when possible

## Need Help?

### Resources
- [Design System Documentation](./DESIGN_SYSTEM.md)
- [CSS Reference (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Common Issues & Solutions
1. **Colors not applying**: Check if CSS variables are loaded
2. **Responsive not working**: Ensure mobile-first approach
3. **Accessibility issues**: Add proper focus states and ARIA labels
4. **Performance problems**: Review selector complexity and properties used

---

*Keep this guide handy while developing. Update it as the system evolves.*