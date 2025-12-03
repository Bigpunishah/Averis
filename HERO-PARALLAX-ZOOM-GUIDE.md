# Hero Section Parallax & Zoom Control Guide

## Overview

This guide covers how to implement hero sections with parallax scrolling effects while preventing excessive image zoom on mobile devices. The parallax effect keeps the background image stationary while content scrolls over it, creating an engaging visual experience.

## Essential Parallax Code

### Base CSS Requirements

The fundamental property that creates the parallax effect:

```css
.hero {
    background-attachment: fixed; /* CRITICAL: This creates the parallax effect */
    background-image: url('your-hero-image.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    min-height: 100vh;
}
```

### ⚠️ CRITICAL UNDERSTANDING

**`background-attachment: fixed` is what creates the parallax effect.** Without this property, there is NO parallax - the background will scroll normally with the content.

- **Fixed**: Background stays stationary while content scrolls over it (parallax effect)
- **Scroll**: Background moves with content (normal scrolling, no parallax)

## Mobile Zoom Prevention Rules

### The Problem

On mobile devices, hero images often appear excessively zoomed in because:
- Mobile screens have different aspect ratios (tall and narrow)
- Default `background-position: center` may crop important image content
- Images designed for desktop (16:9) don't fit well on mobile (9:16)

### The Solution: Background Positioning

Use `background-position` to show more of the top portion of the image on mobile:

```css
/* Mobile devices - Show more of the top of the image */
@media (max-width: 768px) {
    .hero {
        background-position: center 30%; /* 30% from top instead of center (50%) */
    }
}

/* Very small screens - Even less zoom */
@media (max-width: 480px) {
    .hero {
        background-position: center 25%; /* 25% from top */
    }
}
```

## Complete Implementation

### HTML Structure
```html
<section id="hero" class="hero">
    <div class="hero-content">
        <h1>Your Hero Title</h1>
        <p>Your hero subtitle</p>
        <a href="#" class="btn">Call to Action</a>
    </div>
</section>
```

### CSS Implementation
```css
/* Base Hero Section */
.hero {
    position: relative;
    min-height: 100vh;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    
    /* Background image setup */
    background-image: url('path/to/your-hero-image.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed; /* ESSENTIAL: Creates parallax effect */
}

/* Hero content styling */
.hero-content {
    text-align: center;
    color: white;
    z-index: 2;
    position: relative;
}

/* Optional: Hero overlay for better text readability */
.hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%);
    z-index: 1;
}

/* Mobile zoom prevention */
@media (max-width: 768px) {
    .hero {
        background-position: center 30%; /* Prevent zoom-in effect */
    }
}

/* Very small screens */
@media (max-width: 480px) {
    .hero {
        background-position: center 25%; /* Even less zoom */
    }
}
```

## Background Position Values Explained

### Understanding the Values
```css
/* Percentage values for background-position */
background-position: center top;     /* 0% from top - shows very top of image */
background-position: center 25%;     /* 25% from top - good for small mobile */
background-position: center 30%;     /* 30% from top - good for mobile */
background-position: center center;  /* 50% from top - default, may zoom on mobile */
background-position: center 75%;     /* 75% from top - shows bottom portion */
background-position: center bottom;  /* 100% from top - shows very bottom */
```

### Choosing the Right Values

**For most hero images:**
- **Desktop**: `center` (50%) - default positioning
- **Mobile (768px)**: `center 30%` - shows more of the top portion
- **Small Mobile (480px)**: `center 25%` - prevents excessive zoom

**For images with faces/people:**
- Use `center 20%` to `center 35%` to keep faces visible

**For landscape images:**
- Use `center 40%` to `center 60%` to show horizon line

**For text-heavy images:**
- Use `center 15%` to `center 30%` to keep text readable

## Common Issues & Solutions

### Issue 1: No Parallax Effect
**Problem**: Background scrolls with content instead of staying fixed
**Solution**: Ensure `background-attachment: fixed` is in the base CSS

```css
/* WRONG - No parallax */
.hero {
    background-attachment: scroll;
}

/* CORRECT - Parallax effect */
.hero {
    background-attachment: fixed;
}
```

### Issue 2: Mobile Override Conflicts
**Problem**: Mobile CSS overrides are removing the parallax effect
**Solution**: Only use positioning changes in mobile queries, not attachment changes

```css
/* WRONG - Removes parallax on mobile */
@media (max-width: 768px) {
    .hero {
        background-attachment: scroll !important; /* BAD */
    }
}

/* CORRECT - Keeps parallax, fixes zoom */
@media (max-width: 768px) {
    .hero {
        background-position: center 30%; /* GOOD */
    }
}
```

### Issue 3: Image Still Too Zoomed
**Problem**: 30% positioning still shows too much zoom
**Solutions**:
1. Try lower percentage: `center 20%` or `center 15%`
2. Use different image with better mobile aspect ratio
3. Consider `background-size: contain` for very problematic images

### Issue 4: Inline Styles Override CSS
**Problem**: HTML inline styles prevent CSS media queries from working
**Solution**: Move styles to CSS or use `!important` in media queries

```css
/* If you must use inline styles, override with !important */
@media (max-width: 768px) {
    .hero {
        background-position: center 30% !important;
    }
}
```

## Browser Compatibility

### Desktop Browsers
- ✅ **Chrome/Edge**: Full support for `background-attachment: fixed`
- ✅ **Firefox**: Full support
- ✅ **Safari**: Full support

### Mobile Browsers
- ⚠️ **iOS Safari**: May disable fixed backgrounds for performance (varies by iOS version)
- ⚠️ **Android Chrome**: Generally works but may have performance limitations
- ✅ **Mobile Firefox**: Good support

### Fallback Strategy
If parallax doesn't work on some mobile browsers, the background will simply scroll normally - this is acceptable as it doesn't break functionality.

## Testing Checklist

### ✅ Desktop Testing
- [ ] Parallax effect works (background stays fixed while scrolling)
- [ ] Image positioning looks good
- [ ] Performance is smooth during scroll

### ✅ Mobile Testing
- [ ] Test on actual devices (not just browser dev tools)
- [ ] Check image isn't too zoomed in
- [ ] Verify text is still readable
- [ ] Test on various screen sizes (320px, 375px, 414px, etc.)

### ✅ Cross-Browser Testing
- [ ] Chrome/Edge desktop and mobile
- [ ] Firefox desktop and mobile
- [ ] Safari desktop and mobile (iOS)

## Performance Considerations

### Optimize Images
- **Size**: Keep hero images under 500KB when possible
- **Dimensions**: Use appropriate resolution (1920px width max for most cases)
- **Format**: Use modern formats (WebP with fallbacks)

### CSS Optimization
```css
/* Add will-change for better performance */
.hero {
    will-change: transform;
}

/* Use transform3d to enable hardware acceleration */
.hero {
    transform: translate3d(0, 0, 0);
}
```

## Real-World Examples

### Example 1: Cleaning Service (Broom Broom)
```css
.hero {
    background-image: url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7');
    background-attachment: fixed;
    background-position: center;
}

@media (max-width: 768px) {
    .hero {
        background-position: center 30%;
    }
}

@media (max-width: 480px) {
    .hero {
        background-position: center 25%;
    }
}
```

### Example 2: Roofing Service (DC Roofing)
```html
<!-- Inline styles approach -->
<section class="hero" style="background-image: url('assets/images/Metal-Roof-2-scaled-hero.jpg'); background-attachment: fixed;">
```

```css
/* CSS overrides for mobile */
@media (max-width: 768px) {
    .hero {
        background-position: center 30% !important;
    }
}

@media (max-width: 480px) {
    .hero {
        background-position: center 25% !important;
    }
}
```

## Quick Reference

### Essential Properties
```css
background-attachment: fixed;    /* Creates parallax effect */
background-position: center 30%; /* Prevents mobile zoom */
background-size: cover;          /* Fills container */
background-repeat: no-repeat;    /* Prevents tiling */
```

### Media Query Template
```css
/* Base - Desktop */
.hero {
    background-attachment: fixed;
    background-position: center;
}

/* Mobile */
@media (max-width: 768px) {
    .hero {
        background-position: center 30%;
    }
}

/* Small Mobile */
@media (max-width: 480px) {
    .hero {
        background-position: center 25%;
    }
}
```

---

*Last updated: December 2025*  
*Tested on: Chrome, Firefox, Safari (desktop and mobile)*