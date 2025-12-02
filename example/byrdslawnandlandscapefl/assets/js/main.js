// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const hamburgerCheckbox = document.getElementById('hamburger-checkbox');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    if (navToggle && hamburgerCheckbox) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // Also handle checkbox change for accessibility
        hamburgerCheckbox.addEventListener('change', function() {
            if (this.checked) {
                navMenu.classList.add('active');
            } else {
                navMenu.classList.remove('active');
            }
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            if (hamburgerCheckbox) {
                hamburgerCheckbox.checked = false;
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target) || navToggle.contains(event.target);
        
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (hamburgerCheckbox) {
                hamburgerCheckbox.checked = false;
            }
        }
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Smart Navigation - Hide on scroll down, show on scroll up
let lastScrollTop = 0;
let scrollDirection = 'up';
let hideTimeout;

window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDelta = 1; // Minimum scroll distance to trigger hide/show
    
    // Determine scroll direction
    if (Math.abs(lastScrollTop - scrollTop) <= scrollDelta) return;
    
    // Add scrolled class for background change
    if (scrollTop > 10) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Smart hide/show logic
    if (scrollTop > lastScrollTop && scrollTop > 10) {
        // Scrolling down & past hero section
        scrollDirection = 'down';
        clearTimeout(hideTimeout);
        header.classList.add('hidden');
    } else if (scrollTop < lastScrollTop) {
        // Scrolling up
        scrollDirection = 'up';
        clearTimeout(hideTimeout);
        header.classList.remove('hidden');
    }
    
    // Always show navbar at the top
    if (scrollTop <= 100) {
        header.classList.remove('hidden');
    }
    
    lastScrollTop = scrollTop;
}, { passive: true });

// Modern fade-up animation system
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeUpObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            fadeUpObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Initialize fade-up animations
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-up classes to elements
    const elementsToAnimate = [
        '.hero-title',
        '.hero-subtitle', 
        '.hero-buttons',
        '.hero-features',
        '.section-title',
        '.section-subtitle',
        '.service-card',
        '.testimonial-card',
        '.gallery-item',
        '.contact-item',
        '.about-text',
        '.about-image',
        '.areas-content > *',
        '.company-stats',
        '.referral-content'
    ];

    elementsToAnimate.forEach((selector, index) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, elIndex) => {
            el.classList.add('fade-up');
            
            // Add staggered delays
            if (selector === '.service-card' || selector === '.testimonial-card' || selector === '.gallery-item') {
                el.classList.add(`fade-up-delay-${(elIndex % 4) + 1}`);
            }
            
            fadeUpObserver.observe(el);
        });
    });

    // Animate hero elements with custom delays
    setTimeout(() => {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) heroTitle.classList.add('animate');
    }, 200);

    setTimeout(() => {
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) heroSubtitle.classList.add('animate');
    }, 400);

    setTimeout(() => {
        const heroButtons = document.querySelector('.hero-buttons');
        if (heroButtons) heroButtons.classList.add('animate');
    }, 600);

    setTimeout(() => {
        const heroFeatures = document.querySelector('.hero-features');
        if (heroFeatures) heroFeatures.classList.add('animate');
    }, 800);
});

// Contact Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = collectFormData(contactForm);
            
            // Validate form data
            if (!validateFormData(formData)) {
                return;
            }
            
            // Show loading state
            setFormLoadingState(true);
            
            // Process form submission
            processFormSubmission(formData);
        });
    }
});

// Collect and prepare form data for submission
function collectFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    // Extract all form fields
    for (let [key, value] of formData.entries()) {
        data[key] = value.trim();
    }
    
    // Add timestamp and additional metadata
    data.timestamp = new Date().toISOString();
    data.source = 'website_contact_form';
    data.userAgent = navigator.userAgent;
    data.referrer = document.referrer;
    
    return data;
}

// Validate form data
function validateFormData(data) {
    const errors = [];
    
    // Required fields validation
    const requiredFields = {
        'name': 'Full Name',
        'email': 'Email Address', 
        'phone': 'Phone Number',
        'address': 'Service Address',
        'service': 'Service Type'
    };
    
    Object.keys(requiredFields).forEach(field => {
        if (!data[field] || data[field] === '') {
            errors.push(`${requiredFields[field]} is required`);
        }
    });
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Phone validation (basic US phone format)
    const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
    if (data.phone && !phoneRegex.test(data.phone)) {
        errors.push('Please enter a valid phone number');
    }
    
    // Display errors if any
    if (errors.length > 0) {
        showFormMessage(errors.join('<br>'), 'error');
        return false;
    }
    
    return true;
}

// Process form submission - ready for API integration
function processFormSubmission(formData) {
    // TODO: Add API service implementation here
    // Example API call structure:
    /*
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const result = await response.json();
            handleFormSuccess(result);
        } else {
            throw new Error('Failed to submit form');
        }
    } catch (error) {
        handleFormError(error);
    }
    */
    
    // For now, simulate API call with timeout
    setTimeout(() => {
        handleFormSuccess(formData);
    }, 1500);
}

// Handle successful form submission
function handleFormSuccess(data) {
    // Reset loading state
    setFormLoadingState(false);
    
    // Clear the form
    clearContactForm();
    
    // Show success message
    const successMessage = `<i class="fas fa-check-circle"></i> Thank you, ${data.name}! Your message has been sent successfully. We'll contact you soon at ${data.phone || data.email}.`;
    showFormMessage(successMessage, 'success');
    
    // Optional: Track successful submission
    if (typeof trackEvent === 'function') {
        trackEvent('form_submission_success', {
            service_type: data.service,
            contact_method: data.phone ? 'phone' : 'email'
        });
    }
}

// Handle form submission error
function handleFormError(error) {
    // Reset loading state
    setFormLoadingState(false);
    
    // Show error message
    showFormMessage(
        `<i class="fas fa-exclamation-triangle"></i> Sorry, there was an error sending your message. Please try again or call us directly at <a href="tel:3214123006">(321) 412-3006</a>.`,
        'error'
    );
    
    // Optional: Track form errors
    if (typeof trackEvent === 'function') {
        trackEvent('form_submission_error', {
            error_message: error.message
        });
    }
}

// Set form loading state
function setFormLoadingState(isLoading) {
    const submitBtn = document.querySelector('.contact-form button[type="submit"]');
    const form = document.querySelector('.contact-form');
    
    if (!submitBtn || !form) {
        return;
    }
    
    if (isLoading) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Message...';
        submitBtn.disabled = true;
        form.style.opacity = '0.7';
    } else {
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        submitBtn.disabled = false;
        form.style.opacity = '1';
    }
}

// Clear contact form
function clearContactForm() {
    const form = document.querySelector('.contact-form');
    if (form) {
        form.reset();
    }
}

// Show form message with close button (only closes when X is clicked)
function showFormMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message container
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    
    // Create message content
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = message;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'message-close';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.addEventListener('click', () => {
        removeFormMessage(messageDiv);
    });
    
    // Assemble message
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(closeButton);
    
    // Style the message
    const backgroundColor = type === 'success' ? '#27ae60' : '#e74c3c';
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        background: ${backgroundColor};
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        animation: slideInFromRight 0.4s ease-out;
        font-size: 14px;
        line-height: 1.4;
    `;
    
    // Style the content
    messageContent.style.cssText = `
        flex: 1;
    `;
    
    // Style the close button
    closeButton.style.cssText = `
        background: transparent;
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
        padding: 0;
        margin: 0;
        opacity: 0.8;
        transition: opacity 0.2s;
        flex-shrink: 0;
    `;
    
    // Add hover effect for close button
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.opacity = '1';
    });
    
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.opacity = '0.8';
    });
    
    // Add to page
    document.body.appendChild(messageDiv);
}

// Remove form message with animation
function removeFormMessage(messageDiv) {
    messageDiv.style.animation = 'slideOutToRight 0.4s ease-out';
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 400);
}

// Add CSS animations for form messages
const messageAnimationStyle = document.createElement('style');
messageAnimationStyle.textContent = `
    @keyframes slideInFromRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutToRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .form-message a {
        color: white !important;
        text-decoration: underline;
    }
    
    .form-message a:hover {
        text-decoration: none;
    }
`;
document.head.appendChild(messageAnimationStyle);

// Smooth scroll enhancement for better UX
function enhanceSmoothScrolling() {
    // Add momentum scrolling for iOS
    document.body.style.webkitOverflowScrolling = 'touch';
    
    // Optimize scroll performance
    let ticking = false;
    
    function updateScrollEffects() {
        // Add any scroll-based effects here
        ticking = false;
    }
    
    function requestScrollUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
}

// Add fade-in animation CSS
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(animationStyle);

// Removed phone number formatting code

// Add click tracking for analytics (optional)
function trackEvent(eventName, properties = {}) {
    // Implement your analytics tracking here
    console.log(`Event: ${eventName}`, properties);
    
    // Example for Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
}

// Removed contact form tracking code

// Lazy loading for images (modern browsers)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add loading states for buttons (excluding contact form submit)
document.addEventListener('click', function(e) {
    if (e.target.matches('.btn-primary, .btn-secondary, .btn-accent')) {
        const button = e.target;
        const originalText = button.innerHTML;
        
        // Don't add loading state to phone and email links
        if (button.href && (button.href.includes('tel:') || button.href.includes('mailto:'))) {
            return;
        }
        
        // SKIP contact form submit button - it has its own handling
        if (button.closest('.contact-form')) {
            return;
        }
        
        // Add loading state for other form submissions and actions
        if (button.type === 'submit' || button.classList.contains('btn-loading')) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            button.disabled = true;
            
            // Reset after 3 seconds (adjust based on your needs)
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 3000);
        }
    }
});

// Interactive Gallery Slideshow
let currentSlide = 0;
let slideInterval;
let isPaused = false;

// Initialize slideshow
document.addEventListener('DOMContentLoaded', function() {
    initializeSlideshow();
});

function initializeSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    
    if (totalSlides === 0) return;
    
    // Start auto-advance
    startSlideshow();
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            changeSlide(-1);
        } else if (e.key === 'ArrowRight') {
            changeSlide(1);
        } else if (e.key === 'Escape') {
            closeLightbox();
        }
    });
}

function startSlideshow() {
    slideInterval = setInterval(() => {
        if (!isPaused) {
            currentSlide = (currentSlide + 1) % document.querySelectorAll('.slide').length;
            updateSlideshow();
        }
    }, 5000); // Auto-advance every 5 seconds
}

function pauseSlideshow() {
    isPaused = true;
    setTimeout(() => {
        isPaused = false;
    }, 3000); // Resume after 3 seconds
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    
    if (totalSlides === 0) return;
    
    pauseSlideshow();
    
    currentSlide += direction;
    
    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }
    
    updateSlideshow();
}

function goToSlide(index) {
    pauseSlideshow();
    currentSlide = index;
    updateSlideshow();
}

function updateSlideshow() {
    const track = document.getElementById('slideshow-track');
    const indicators = document.querySelectorAll('.indicator');
    
    if (!track) return;
    
    // Update slide position
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update indicators
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
    
    // Update slides active state
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
}

// Lightbox functionality
function openLightbox(imageSrc, caption) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    
    if (lightbox && lightboxImage && lightboxCaption) {
        lightboxImage.src = imageSrc;
        lightboxImage.alt = caption;
        lightboxCaption.textContent = caption;
        lightbox.classList.add('active');
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
        
        // Pause slideshow while lightbox is open
        clearInterval(slideInterval);
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    
    if (lightbox) {
        lightbox.classList.remove('active');
        
        // Restore body scrolling
        document.body.style.overflow = 'auto';
        
        // Resume slideshow
        startSlideshow();
    }
}

// Touch/Swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next slide
            changeSlide(1);
        } else {
            // Swipe right - previous slide
            changeSlide(-1);
        }
    }
}

// Intersection Observer for slideshow performance
const slideshowObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Slideshow is visible, ensure it's running
            if (!slideInterval) {
                startSlideshow();
            }
        } else {
            // Slideshow not visible, pause to save resources
            clearInterval(slideInterval);
            slideInterval = null;
        }
    });
}, { threshold: 0.1 });

// Observe slideshow container
document.addEventListener('DOMContentLoaded', () => {
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (slideshowContainer) {
        slideshowObserver.observe(slideshowContainer);
    }
});

// Preload critical images
document.addEventListener('DOMContentLoaded', function() {
    const criticalImages = [
        'assets/images/byrds-crew.jpg',
        'assets/images/Byrd\'s-Landscaping-Logo-2020-Transparent.webp'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    
    // Preload slideshow images for smooth transitions
    const slideshowImages = [
        'assets/images/cleanup-house4.jpg',
        'assets/images/cleanup-house5.jpg',
        'assets/images/cleanup-house6.jpg',
        'assets/images/cleanup-house7.jpg',
        'assets/images/cleanup-house8.jpg',
        'assets/images/lighting-image.webp',
        'assets/images/lighting-image2.webp',
        'assets/images/drain-ground-installment-pt2.jpg'
    ];
    
    slideshowImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});