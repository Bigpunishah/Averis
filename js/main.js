// Enhanced Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle with animations
    const burgerCheckbox = document.querySelector('#checkbox');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');
    
    if (burgerCheckbox && navMenu) {
        burgerCheckbox.addEventListener('change', function() {
            if (this.checked) {
                navMenu.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scroll
                // Animate menu items
                const menuItems = navMenu.querySelectorAll('.nav-link, .nav-cta');
                menuItems.forEach((item, index) => {
                    item.style.animation = `slideInRight 0.4s ease-out ${index * 0.1}s both`;
                });
            } else {
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                burgerCheckbox.checked = false;
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }
    
    // Enhanced smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                
                // Add scroll animation class
                document.documentElement.style.scrollBehavior = 'smooth';
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Track navigation click
                trackEvent('navigation_click', {
                    target_section: this.getAttribute('href'),
                    source: 'navbar'
                });
            }
        });
    });
    
    // Enhanced navbar effects on scroll
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateNavbar() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbar.classList.add('scrolled');
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.08)';
        }
        
        // Hide/show navbar on scroll direction (optional)
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });
    
    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero');
    const floatingShapes = document.querySelectorAll('.floating-shape');
    
    if (heroSection && window.innerWidth > 768) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            
            floatingShapes.forEach((shape, index) => {
                const speed = 0.2 + (index * 0.1);
                shape.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }
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
            
            // Validate consent checkbox
            const consentCheckbox = document.getElementById('consent');
            if (!consentCheckbox.checked) {
                showNotification('Please agree to the Terms of Service and Privacy Policy to continue.', 'error');
                isValid = false;
            }
            
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

// Enhanced scroll animations with stagger effects
function handleScrollAnimations() {
    // Elements to animate
    const animatedElements = document.querySelectorAll('[data-aos]');
    const fallbackElements = document.querySelectorAll('.service-card, .pricing-card, .benefit, .step');
    
    // Create intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add stagger delay for grouped elements
                const delay = index * 100;
                
                setTimeout(() => {
                    entry.target.classList.add('fade-in');
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.style.opacity = '1';
                }, delay);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with AOS attributes first
    animatedElements.forEach(element => {
        observer.observe(element);
    });
    
    // Fallback for elements without AOS
    fallbackElements.forEach(element => {
        if (!element.hasAttribute('data-aos')) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            observer.observe(element);
        }
    });
    
    // Counter animation for stats
    const counters = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Counter animation function
function animateCounter(element) {
    const text = element.textContent;
    const number = parseInt(text.replace(/[^\d]/g, ''));
    const suffix = text.replace(/[\d]/g, '');
    
    if (isNaN(number)) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = number / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
            current = number;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, duration / steps);
}

// Enhanced button hover effects
function enhanceButtonInteractions() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        // Add ripple effect on click
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Enhanced hover effects
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Card tilt effect for modern interaction
function addCardTiltEffect() {
    const cards = document.querySelectorAll('.service-card, .pricing-card, .benefit, .step');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            if (window.innerWidth < 768) return; // Skip on mobile
            
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `
                perspective(1000px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                translateZ(10px)
            `;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

// Typing animation for hero title
function addTypingAnimation() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    heroTitle.style.borderRight = '3px solid #06b6d4';
    heroTitle.style.animation = 'blink 1s infinite';
    
    let index = 0;
    const typingInterval = setInterval(() => {
        heroTitle.textContent = text.slice(0, index);
        index++;
        
        if (index > text.length) {
            clearInterval(typingInterval);
            heroTitle.style.borderRight = 'none';
            heroTitle.style.animation = 'none';
        }
    }, 50);
}

// Initialize all animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    handleScrollAnimations();
    enhanceButtonInteractions();
    addCardTiltEffect();
    
    // Add typing animation with delay
    setTimeout(addTypingAnimation, 500);
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes blink {
            0%, 50% { border-color: #06b6d4; }
            51%, 100% { border-color: transparent; }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .fade-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
});

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
