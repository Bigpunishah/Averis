// Right On Junk Removal - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeScrollAnimations();
    initializeModals();
    initializeForms();
    initializeSmoothScrolling();
    initializeHeroSlideshow();
    initializeSlideshow();
    initializeBookingSystem();
    setMinBookingDate();
});

// Navigation Functions
function initializeNavigation() {
    const checkbox = document.querySelector('#checkbox');
    const navMenu = document.querySelector('.nav-menu');
    
    // Simple hamburger toggle - checkbox controls menu and animation
    if (checkbox && navMenu) {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                // Open menu
                navMenu.classList.add('active');
            } else {
                // Close menu  
                navMenu.classList.remove('active');
            }
        });
    }
    
    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
        
        lastScroll = currentScroll;
    });
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);
    
    // Elements to animate
    const elementsToAnimate = [
        '.service-card',
        '.about-feature',
        '.gallery-item',
        '.contact-method',
        '.stat-item',
        '.hero-content > *'
    ];
    
    elementsToAnimate.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            element.classList.add('fade-in');
            // Stagger animation for multiple elements
            element.style.transitionDelay = `${index * 100}ms`;
            observer.observe(element);
        });
    });
}

// Hero Slideshow Functions
function initializeHeroSlideshow() {
    const slides = document.querySelectorAll('.hero-slideshow .slide');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    
    // Start the slideshow
    setInterval(nextSlide, 1500); // 1.5 seconds per slide
}

// Modal Functions
function initializeModals() {
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const activeModals = document.querySelectorAll('.modal[style*="block"]');
            activeModals.forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        const firstInput = modal.querySelector('input, textarea, select, button');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Form Functions
function initializeForms() {
    // Main contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Quick quote form
    const quickQuoteForm = document.getElementById('quickQuoteForm');
    if (quickQuoteForm) {
        quickQuoteForm.addEventListener('submit', handleQuickQuote);
    }
    
    // Booking form is initialized separately in initializeBookingSystem()
    
    // Phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', formatPhoneNumber);
    });
}

function handleContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission (replace with actual submission logic)
    setTimeout(() => {
        // Reset form
        form.reset();
        
        // Show success message
        showNotification('Thank you! We\'ll contact you within 24 hours with your free quote.', 'success');
        
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Send to phone/email (you would implement actual submission here)
        console.log('Form submitted:', data);
        
    }, 2000);
}

function handleQuickQuote(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        // Close modal
        closeModal('quoteModal');
        
        // Show success message
        showNotification('Quote request sent! We\'ll call you back within the hour.', 'success');
        
        // Reset form
        form.reset();
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        console.log('Quick quote submitted:', data);
        
    }, 1500);
}

function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length >= 6) {
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    } else if (value.length >= 3) {
        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    }
    
    event.target.value = value;
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        font-weight: 500;
    `;
    
    // Add animation styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                margin-left: auto;
            }
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Slideshow Functions
function initializeSlideshow() {
    const indicators = document.querySelectorAll('.indicator');
    const slides = document.querySelectorAll('.gallery-slide');
    let currentSlide = 0;
    let slideInterval;
    
    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Show selected slide
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (indicators[index]) {
            indicators[index].classList.add('active');
        }
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function startSlideshow() {
        slideInterval = setInterval(nextSlide, 1500); // 1.5 seconds per slide
    }
    
    function stopSlideshow() {
        clearInterval(slideInterval);
    }
    
    // Add click handlers to indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
            stopSlideshow();
            startSlideshow(); // Restart the slideshow
        });
    });
    
    // Pause slideshow on hover
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (slideshowContainer) {
        slideshowContainer.addEventListener('mouseenter', stopSlideshow);
        slideshowContainer.addEventListener('mouseleave', startSlideshow);
    }
    
    // Start the slideshow
    if (slides.length > 0) {
        showSlide(0);
        startSlideshow();
    }
}

// Booking System Functions
function initializeBookingSystem() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmission);
    }
}

let currentBookingStep = 1;

function nextBookingStep() {
    if (validateCurrentStep()) {
        currentBookingStep++;
        updateBookingStep();
        if (currentBookingStep === 3) {
            updateBookingSummary();
        }
    }
}

function previousBookingStep() {
    currentBookingStep--;
    updateBookingStep();
}

function updateBookingStep() {
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 <= currentBookingStep);
    });
    
    // Update step content
    document.querySelectorAll('.booking-step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 === currentBookingStep);
    });
}

function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.booking-step.step-${currentBookingStep}`);
    
    if (currentBookingStep === 1) {
        // Validate service selection
        const selectedServices = document.querySelectorAll('input[name="services[]"]:checked');
        if (selectedServices.length === 0) {
            showNotification('Please select at least one service', 'error');
            return false;
        }
    } else if (currentBookingStep === 2) {
        // Validate date and time
        const date = document.querySelector('input[name="preferred_date"]').value;
        const time = document.querySelector('select[name="preferred_time"]').value;
        
        if (!date || !time) {
            showNotification('Please select both date and time', 'error');
            return false;
        }
    }
    
    return true;
}

function updateBookingSummary() {
    const selectedServices = Array.from(document.querySelectorAll('input[name="services[]"]:checked'))
        .map(input => input.value);
    const date = document.querySelector('input[name="preferred_date"]').value;
    const time = document.querySelector('select[name="preferred_time"] option:checked').textContent;
    const description = document.querySelector('textarea[name="description"]').value;
    
    const summaryContainer = document.getElementById('booking-summary-content');
    
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let summaryHTML = `
        <div class="summary-item">
            <span>Services:</span>
            <span>${selectedServices.join(', ')}</span>
        </div>
        <div class="summary-item">
            <span>Date:</span>
            <span>${formattedDate}</span>
        </div>
        <div class="summary-item">
            <span>Time:</span>
            <span>${time}</span>
        </div>
    `;
    
    if (description.trim()) {
        summaryHTML += `
            <div class="summary-item">
                <span>Description:</span>
                <span>${description}</span>
            </div>
        `;
    }
    
    summaryContainer.innerHTML = summaryHTML;
}

function setMinBookingDate() {
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const minDate = tomorrow.toISOString().split('T')[0];
        dateInput.setAttribute('min', minDate);
    }
}

function handleBookingSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Get selected services
    const selectedServices = Array.from(form.querySelectorAll('input[name="services[]"]:checked'))
        .map(input => input.value);
    
    data.services = selectedServices;
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scheduling...';
    submitButton.disabled = true;
    
    // Simulate booking submission
    setTimeout(() => {
        // Close modal
        closeModal('bookingModal');
        
        // Show success message
        showNotification('Booking request submitted! We\'ll call you within 30 minutes to confirm your appointment.', 'success');
        
        // Reset form and booking step
        form.reset();
        currentBookingStep = 1;
        updateBookingStep();
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        console.log('Booking submitted:', data);
        
        // In a real implementation, you would send this data to your booking system
        // Example: await fetch('/api/bookings', { method: 'POST', body: JSON.stringify(data) })
        
    }, 2000);
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Click to Call Tracking (for analytics)
function trackPhoneClick() {
    // Add your analytics tracking here
    console.log('Phone number clicked');
    
    // Example: Google Analytics event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'phone_click', {
            'event_category': 'contact',
            'event_label': 'header_phone'
        });
    }
}

// Add click tracking to phone links
document.addEventListener('DOMContentLoaded', function() {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
        link.addEventListener('click', trackPhoneClick);
    });
});

// Gallery Image Lazy Loading (if needed)
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading if data-src attributes are present
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('img[data-src]')) {
        initializeLazyLoading();
    }
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Performance Monitoring
function measurePerformance() {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            console.log('Page load time:', loadTime + 'ms');
            
            // Send to analytics if needed
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    'value': Math.round(loadTime)
                });
            }
        }, 0);
    });
}

// Initialize performance monitoring
measurePerformance();

// Error Handling
window.addEventListener('error', function(event) {
    console.error('JavaScript error:', event.error);
    
    // Optional: Send error to analytics or error tracking service
    if (typeof gtag !== 'undefined') {
        gtag('event', 'javascript_error', {
            'event_category': 'error',
            'event_label': event.error.message,
            'value': 1
        });
    }
});

// Expose global functions for inline event handlers
window.openModal = openModal;
window.closeModal = closeModal;
window.nextBookingStep = nextBookingStep;
window.previousBookingStep = previousBookingStep;