// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const burgerCheckbox = document.querySelector('#burger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (burgerCheckbox && navMenu) {
        burgerCheckbox.addEventListener('change', function() {
            if (this.checked) {
                navMenu.classList.add('active');
            } else {
                navMenu.classList.remove('active');
            }
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                burgerCheckbox.checked = false;
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });
});

// Modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Add fade-in animation
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.transition = 'opacity 0.3s ease';
            modal.style.opacity = '1';
        }, 10);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.transition = 'opacity 0.3s ease';
        modal.style.opacity = '0';
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Close modal when clicking outside of it
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
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                closeModal(modal.id);
            }
        });
    }
});

// Service type toggle functionality
function handleServiceTypeToggle() {
    const serviceTypeInputs = document.querySelectorAll('input[name="service_type"]');
    const painPointsGroup = document.querySelector('#pain_points').closest('.form-group');
    const staffSizeGroup = document.querySelector('#staff_size').closest('.form-group');
    
    function toggleQuestions() {
        const selectedService = document.querySelector('input[name="service_type"]:checked').value;
        
        if (selectedService === '24-hour-website') {
            // Hide questions for website service with smooth animation
            painPointsGroup.classList.add('hidden');
            staffSizeGroup.classList.add('hidden');
            
            // Clear the values since they're not relevant
            setTimeout(() => {
                document.getElementById('pain_points').value = '';
                document.getElementById('staff_size').value = '';
            }, 300); // Wait for animation to complete
        } else {
            // Show questions for system optimization with smooth animation
            painPointsGroup.classList.remove('hidden');
            staffSizeGroup.classList.remove('hidden');
        }
    }
    
    // Add event listeners to both radio buttons
    serviceTypeInputs.forEach(input => {
        input.addEventListener('change', toggleQuestions);
    });
    
    // Initialize the form with correct visibility
    toggleQuestions();
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
    const auditForm = document.getElementById('auditForm');
    
    // Initialize service type toggle
    handleServiceTypeToggle();
    
    if (auditForm) {
        auditForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(auditForm);
            const data = Object.fromEntries(formData.entries());
            
            // Validate required fields
            let requiredFields = ['company', 'name', 'email'];
            
            // Add conditional required fields based on service type
            const selectedService = document.querySelector('input[name="service_type"]:checked').value;
            if (selectedService === 'system-optimization') {
                // Only require these fields for system optimization
                requiredFields.push('business_type');
            }
            
            let isValid = true;
            
            requiredFields.forEach(field => {
                const input = document.getElementById(field);
                if (!data[field] || data[field].trim() === '') {
                    input.style.borderColor = '#ef4444';
                    isValid = false;
                } else {
                    input.style.borderColor = '#10b981';
                }
            });
            
            if (!isValid) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                document.getElementById('email').style.borderColor = '#ef4444';
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Submit form (in a real application, this would send to a server)
            submitAuditForm(data);
        });
    }
});

async function submitAuditForm(data) {
    const submitBtn = document.querySelector('#auditForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    try {
        // Create FormData for W3Forms
        const formData = new FormData();
        
        // Add W3Forms access key (keep this secure)
        formData.append("access_key", "84c20cad-57c5-4b25-a85e-22a443dd490a");
        
        // Add form fields
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });
        
        // Add additional metadata
        formData.append("subject", "New Averis Consultation Request");
        formData.append("from_name", data.name || "Website Visitor");
        formData.append("redirect", window.location.href);
        
        // Submit to W3Forms
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Success
            showNotification('Thank you! We\'ll contact you within 24 hours to schedule your free consultation.', 'success');
            
            // Close modal and reset form
            closeModal('auditModal');
            document.getElementById('auditForm').reset();
            
            // Track successful submission
            trackEvent('form_submit_success', {
                form_type: 'audit_consultation',
                service_type: data.service_type
            });
            
        } else {
            // Error from W3Forms
            throw new Error(result.message || 'Form submission failed');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
        
        // Track error
        trackEvent('form_submit_error', {
            error: error.message,
            form_type: 'audit_consultation'
        });
        
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add notification styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 3000;
                max-width: 400px;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                animation: slideInRight 0.3s ease;
            }
            
            .notification-success {
                background: #10b981;
                color: white;
            }
            
            .notification-error {
                background: #ef4444;
                color: white;
            }
            
            .notification-info {
                background: #3b82f6;
                color: white;
            }
            
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            
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
        `;
        document.head.appendChild(style);
    }
    
    // Add notification to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Scroll animations
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.service-card, .pricing-card, .benefit, .step');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', handleScrollAnimations);

// Pricing calculator (optional enhancement)
function calculatePricing(modules = []) {
    const basePrices = {
        core: 2750, // Average of $1,500-$4,000
        automation: 2250, // Average of $500-$4,000
        crm: 2900, // Average of $800-$5,000
        ai: 5500, // Average of $1,000-$10,000
        ecommerce: 4500, // Average of $1,000-$8,000
        integrations: 2750, // Average of $500-$5,000 (per integration)
        analytics: 1750, // Average of $500-$3,000
        training: 125 // Per hour
    };
    
    const monthlyPrices = {
        hosting: 475, // Average of $150-$800
        basicSupport: 100,
        standardSupport: 300,
        premiumSupport: 800,
        aiUsage: 275 // Average of $50-$500
    };
    
    let oneTimeTotal = 0;
    let monthlyTotal = 0;
    
    // Core system is always required
    if (!modules.includes('core')) {
        modules.unshift('core');
    }
    
    modules.forEach(module => {
        if (basePrices[module]) {
            oneTimeTotal += basePrices[module];
        }
    });
    
    // Basic hosting is always required
    monthlyTotal += monthlyPrices.hosting;
    
    return {
        oneTime: oneTimeTotal,
        monthly: monthlyTotal,
        breakdown: {
            modules: modules,
            oneTimePrices: basePrices,
            monthlyPrices: monthlyPrices
        }
    };
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

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

// Performance optimization
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading when DOM is loaded
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Google Analytics (placeholder - replace with actual tracking ID)
function initAnalytics() {
    // Placeholder for Google Analytics
    // Replace 'GA_TRACKING_ID' with your actual tracking ID
    /*
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_TRACKING_ID');
    */
}

// Track events (for analytics)
function trackEvent(eventName, properties = {}) {
    // Placeholder for event tracking
    console.log('Event tracked:', eventName, properties);
    
    // Example for Google Analytics:
    // gtag('event', eventName, properties);
}

// Track form submissions
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            trackEvent('form_submit', {
                form_id: form.id || 'unknown',
                form_name: form.className || 'unknown'
            });
        });
    });
});

// Track button clicks
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            trackEvent('button_click', {
                button_text: this.textContent.trim(),
                button_class: this.className
            });
        });
    });
});