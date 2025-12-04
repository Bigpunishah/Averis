// DC Roofing Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Navigation functionality
    initNavigation();
    
    // Mobile menu functionality
    initMobileMenu();
    
    // FAQ functionality
    initFAQ();
    
    // Form validation
    initFormValidation();
    
    // Smooth scrolling
    initSmoothScrolling();
    
    // Scroll effects
    initScrollEffects();
    
    // Loading animations
    initAnimations();
    
    // Fade in animations
    initFadeAnimations();
    
});

// Fade Animation Functions
function initFadeAnimations() {
    // Create intersection observer for fade animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                // Unobserve after animation to prevent repeated triggers
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all elements with fade classes
    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .fade-in-scale');
    fadeElements.forEach(element => {
        observer.observe(element);
    });
}

// Navigation Functions
function initNavigation() {
    const navbar = document.getElementById('navbar');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Logo click handler
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToTop();
        });
    }
}

// Mobile Menu Functions
function initMobileMenu() {
    const hamburgerCheckbox = document.getElementById('hamburger-checkbox');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    // Toggle mobile menu
    if (hamburgerCheckbox && mobileMenu) {
        hamburgerCheckbox.addEventListener('change', function() {
            if (this.checked) {
                mobileMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Close mobile menu when clicking nav links
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (hamburgerCheckbox) {
                hamburgerCheckbox.checked = false;
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!e.target.closest('.hamburger') && !e.target.closest('.mobile-menu')) {
                hamburgerCheckbox.checked = false;
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}

// FAQ Functions
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // Close other open FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

// Form Validation Functions
function initFormValidation() {
    const quoteForm = document.getElementById('roofing-quote-form');
    const employmentForm = document.getElementById('employment-form');
    
    if (quoteForm) {
        quoteForm.addEventListener('submit', handleQuoteFormSubmission);
        addInputValidation(quoteForm);
    }
    
    if (employmentForm) {
        employmentForm.addEventListener('submit', handleEmploymentFormSubmission);
        addInputValidation(employmentForm);
    }
}

function addInputValidation(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateInput(this);
            }
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error styling
    input.classList.remove('error');
    removeErrorMessage(input);
    
    // Required field validation
    if (input.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required.';
    }
    
    // Email validation
    if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address.';
        }
    }
    
    // Phone validation
    if (input.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = value.replace(/[\s\-\(\)\.]/g, '');
        if (cleanPhone.length < 10) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number.';
        }
    }
    
    if (!isValid) {
        input.classList.add('error');
        showErrorMessage(input, errorMessage);
    }
    
    return isValid;
}

function showErrorMessage(input, message) {
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#dc2626';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '0.25rem';
    errorElement.style.display = 'block';
    
    input.parentNode.appendChild(errorElement);
}

function removeErrorMessage(input) {
    const errorElement = input.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

function handleQuoteFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    let isFormValid = true;
    
    // Validate all required fields
    const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    requiredInputs.forEach(input => {
        if (!validateInput(input)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showNotification('Please fix the errors in the form before submitting.', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission (replace with actual submission logic)
    setTimeout(() => {
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Show success message
        showNotification('Thank you for your request! We will contact you soon for your free estimate.', 'success');
        
        // Reset form
        form.reset();
        
        // Log form data (for development - remove in production)
        console.log('Quote Form Data:', Object.fromEntries(formData));
        
    }, 2000);
}

function handleEmploymentFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    let isFormValid = true;
    
    // Validate all required fields
    const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    requiredInputs.forEach(input => {
        if (!validateInput(input)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showNotification('Please fix the errors in the form before submitting.', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitButton.disabled = true;
    
    // Simulate form submission (replace with actual submission logic)
    setTimeout(() => {
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Show success message
        showNotification('Thank you for your application! We will review it and contact you soon.', 'success');
        
        // Reset form
        form.reset();
        
        // Log form data (for development - remove in production)
        console.log('Employment Form Data:', Object.fromEntries(formData));
        
    }, 2000);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'error' ? '#dc2626' : '#22c55e',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        maxWidth: '400px',
        animation: 'slideInRight 0.3s ease-out'
    });
    
    // Add animation keyframes if not exists
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '1.5rem';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0';
    closeButton.style.lineHeight = '1';
    
    closeButton.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Smooth Scrolling Functions
function initSmoothScrolling() {
    // Handle navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#home' || targetId === '#') {
                scrollToTop();
            } else {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    scrollToElement(targetElement);
                }
            }
        });
    });
}

function scrollToElement(element) {
    const headerHeight = 80; // Account for fixed header
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerHeight;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Scroll Effects Functions
function initScrollEffects() {
    // Scroll to top button
    createScrollToTopButton();
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .testimonial-card, .about-feature, .contact-item');
    animateElements.forEach(el => observer.observe(el));
}

function createScrollToTopButton() {
    const scrollButton = document.createElement('button');
    scrollButton.className = 'scroll-to-top';
    scrollButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollButton.setAttribute('aria-label', 'Scroll to top');
    
    scrollButton.addEventListener('click', scrollToTop);
    
    document.body.appendChild(scrollButton);
    
    // Show/hide scroll to top button
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    });
}

// Animation Functions
function initAnimations() {
    // Add CSS for scroll animations if not already present
    if (!document.querySelector('#scroll-animations')) {
        const styles = document.createElement('style');
        styles.id = 'scroll-animations';
        styles.textContent = `
            .service-card,
            .testimonial-card,
            .about-feature,
            .contact-item {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .service-card.animate-in,
            .testimonial-card.animate-in,
            .about-feature.animate-in,
            .contact-item.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .error {
                border-color: #dc2626 !important;
                box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
            }
        `;
        document.head.appendChild(styles);
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Phone number formatting
function formatPhoneNumber(input) {
    const value = input.value.replace(/\D/g, '');
    let formattedValue = '';
    
    if (value.length >= 6) {
        formattedValue = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    } else if (value.length >= 3) {
        formattedValue = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else {
        formattedValue = value;
    }
    
    input.value = formattedValue;
}

// Add phone formatting to phone inputs
document.addEventListener('DOMContentLoaded', function() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    });
});

// Emergency call tracking (for analytics)
function trackEmergencyCall() {
    // Add analytics tracking here if needed
    console.log('Emergency call initiated');
}

// Add click tracking to emergency call links
document.addEventListener('DOMContentLoaded', function() {
    const emergencyLinks = document.querySelectorAll('a[href^="tel:"]');
    emergencyLinks.forEach(link => {
        link.addEventListener('click', trackEmergencyCall);
    });
});

// Prevent zoom on double tap for mobile
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    const timesince = now - lastTouchEnd;
    if ((timesince < 300) && (timesince > 0)) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

let lastTouchEnd = 0;

// Handle orientation change
window.addEventListener('orientationchange', function() {
    // Force repaint after orientation change
    setTimeout(function() {
        window.scrollTo(window.scrollX, window.scrollY);
    }, 500);
});

// Preload important images
function preloadImages() {
    const imagesToPreload = [
        'assets/images/hero-roofing.jpg',
        'assets/images/about-team.jpg',
        'assets/images/DC-Roofing-logo.png'
    ];
    
    imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialize preloading
document.addEventListener('DOMContentLoaded', preloadImages);

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Google Analytics tracking (placeholder - replace with actual tracking ID)
function initAnalytics() {
    // gtag('config', 'GA_TRACKING_ID');
    
    // Track form submissions
    document.addEventListener('submit', function(e) {
        const formType = e.target.id === 'roofing-quote-form' ? 'quote_request' : 'employment_application';
        // gtag('event', 'form_submission', {
        //     'event_category': 'engagement',
        //     'event_label': formType
        // });
    });
}

// Performance monitoring
function initPerformanceMonitoring() {
    // Monitor Core Web Vitals
    function getCLS(onPerfEntry) {
        // Placeholder for CLS monitoring
    }
    
    function getFID(onPerfEntry) {
        // Placeholder for FID monitoring
    }
    
    function getFCP(onPerfEntry) {
        // Placeholder for FCP monitoring
    }
    
    function getLCP(onPerfEntry) {
        // Placeholder for LCP monitoring
    }
    
    function getTTFB(onPerfEntry) {
        // Placeholder for TTFB monitoring
    }
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateInput,
        formatPhoneNumber,
        showNotification
    };
}
