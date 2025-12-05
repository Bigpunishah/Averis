// === MODERN NAVIGATION ===
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger .checkbox');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Navbar scroll effect
    function handleScroll() {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active nav link based on scroll position
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 120) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    }

    // Smooth scrolling for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile menu toggle
    hamburger.addEventListener('change', function() {
        navMenu.classList.toggle('active');
        document.body.style.overflow = this.checked ? 'hidden' : 'auto';
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.checked = false;
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            hamburger.checked = false;
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Initialize scroll handler
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
});

// === HERO SLIDESHOW ===
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    // Auto-advance slideshow every 5 seconds
    setInterval(nextSlide, 5000);

    // Preload images
    slides.forEach(slide => {
        const img = slide.querySelector('img');
        if (img && img.src) {
            const preloadImg = new Image();
            preloadImg.src = img.src;
        }
    });
});

// === PROGRESS BAR AND ACTIVE NAVIGATION ===
document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.getElementById('progress-bar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    function updateProgressBar() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    }
    
    function updateActiveNavigation() {
        const scrollTop = window.pageYOffset + 100; // Offset for navbar height
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
                current = section.id;
            }
        });
        
        // Update active nav link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }
    
    function handleScroll() {
        updateProgressBar();
        updateActiveNavigation();
    }
    
    // Throttled scroll handler
    let ticking = false;
    function throttledScrollHandler() {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', throttledScrollHandler);
    
    // Initial calls
    updateProgressBar();
    updateActiveNavigation();
});

// === SMOOTH SCROLLING ===
document.addEventListener('DOMContentLoaded', function() {
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
});

// === NAVBAR SCROLL EFFECT ===
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    });
});

// === FORM VALIDATION ===
document.addEventListener('DOMContentLoaded', function() {
    // Property evaluation form validation
    const evaluationForm = document.querySelector('.evaluation-form');
    if (evaluationForm) {
        evaluationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = '#dc3545';
                    isValid = false;
                } else {
                    field.style.borderColor = '#e9ecef';
                }
            });
            
            if (isValid) {
                // Show success message
                showNotification('Thank you! Your property evaluation request has been submitted. We\'ll contact you soon.', 'success');
                this.reset();
            } else {
                showNotification('Please fill in all required fields.', 'error');
            }
        });
    }
    
    // Contact form validation
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = '#dc3545';
                    isValid = false;
                } else {
                    field.style.borderColor = '#e9ecef';
                }
            });
            
            if (isValid) {
                // Show success message
                showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
                this.reset();
            } else {
                showNotification('Please fill in all required fields.', 'error');
            }
        });
    }
});

// === NOTIFICATION SYSTEM ===
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add notification animations to CSS
const style = document.createElement('style');
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
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
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
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(style);

// === INTERSECTION OBSERVER FOR ANIMATIONS ===
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fadeInUp');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .benefit-card, .location-btn, .stat');
    animateElements.forEach(el => observer.observe(el));
});

// === PHONE NUMBER FORMATTING ===
document.addEventListener('DOMContentLoaded', function() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 10) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})/, '($1) $2-');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})/, '($1) ');
            }
            
            e.target.value = value;
        });
    });
});

// === EMAIL VALIDATION ===
document.addEventListener('DOMContentLoaded', function() {
    const emailInputs = document.querySelectorAll('input[type="email"]');
    
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const email = this.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (email && !emailRegex.test(email)) {
                this.style.borderColor = '#dc3545';
                this.setCustomValidity('Please enter a valid email address');
            } else {
                this.style.borderColor = '#e9ecef';
                this.setCustomValidity('');
            }
        });
    });
});

// === LAZY LOADING FOR IMAGES ===
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                img.onload = () => {
                    img.style.opacity = '1';
                };
                
                // If image is already loaded
                if (img.complete) {
                    img.style.opacity = '1';
                }
                
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// === SCROLL TO TOP ===
document.addEventListener('DOMContentLoaded', function() {
    // Create scroll to top button
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollTopBtn.className = 'scroll-to-top';
    scrollTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: var(--accent-color);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.2rem;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
        opacity: 0;
        visibility: hidden;
        z-index: 1000;
    `;
    
    document.body.appendChild(scrollTopBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.visibility = 'visible';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top functionality
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effects
    scrollTopBtn.addEventListener('mouseenter', () => {
        scrollTopBtn.style.background = 'var(--dark-accent)';
        scrollTopBtn.style.transform = 'translateY(-2px)';
    });
    
    scrollTopBtn.addEventListener('mouseleave', () => {
        scrollTopBtn.style.background = 'var(--accent-color)';
        scrollTopBtn.style.transform = 'translateY(0)';
    });
});

// === LOADING SCREEN ===
document.addEventListener('DOMContentLoaded', function() {
    // Create loading screen
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-logo">
                <h1>Nexus Realty <span style="color: var(--accent-color);">Florida</span></h1>
            </div>
            <div class="loader-spinner">
                <div class="spinner"></div>
            </div>
        </div>
    `;
    
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        transition: opacity 0.5s ease;
    `;
    
    document.body.insertBefore(loader, document.body.firstChild);
    
    // Hide loader after page loads
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                if (loader.parentElement) {
                    loader.remove();
                }
            }, 500);
        }, 1000);
    });
});

// Add spinner styles
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
    .loader-content {
        text-align: center;
    }
    
    .loader-logo h1 {
        font-family: 'Playfair Display', serif;
        font-size: 2rem;
        margin-bottom: 2rem;
        color: var(--theme-color);
    }
    
    .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid var(--accent-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(spinnerStyle);

// === PERFORMANCE OPTIMIZATION ===
// Debounce function for scroll events
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

// Optimize scroll events
const optimizedScrollHandler = debounce(() => {
    // Your scroll handler code here
}, 10);

window.addEventListener('scroll', optimizedScrollHandler);



// === ACCESSIBILITY ENHANCEMENTS ===
document.addEventListener('DOMContentLoaded', function() {
    // Add main content ID for accessibility
    const heroSection = document.querySelector('#home');
    if (heroSection) {
        heroSection.setAttribute('aria-label', 'Main content');
    }
});

console.log('Nexus Realty Florida website loaded successfully!');

// === SCROLL ANIMATIONS ===
// Initialize scroll animations with Intersection Observer
function initScrollAnimations() {
    // Only skip animations if user specifically prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    
    const animatedElements = document.querySelectorAll([
        '.animate-slide-left',
        '.animate-slide-right',
        '.animate-slide-up',
        '.animate-slide-down',
        '.animate-fade-in',
        '.animate-zoom-in'
    ].join(', '));
    
    if (animatedElements.length === 0) return;
    
    const isMobile = window.innerWidth <= 768;
    const observerOptions = {
        threshold: isMobile ? 0.1 : 0.15, // Lower threshold for mobile for earlier trigger
        rootMargin: isMobile ? '0px 0px -30px 0px' : '0px 0px -50px 0px' // Smaller margin for mobile
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach((element, index) => {
        // Add staggered delay for elements in the same container
        const container = element.closest('.services-grid, .about-stats, .affordability-grid');
        if (container) {
            const siblings = container.querySelectorAll([
                '.animate-slide-left',
                '.animate-slide-right', 
                '.animate-slide-up',
                '.animate-slide-down',
                '.animate-fade-in',
                '.animate-zoom-in'
            ].join(', '));
            
            const siblingIndex = Array.from(siblings).indexOf(element);
            element.style.animationDelay = `${siblingIndex * 0.1}s`;
        }
        
        observer.observe(element);
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add animation classes to existing elements
    addAnimationClasses();
    initScrollAnimations();
});

// Add animation classes to existing elements
function addAnimationClasses() {
    // Add animations to testimonial cards
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach((card, index) => {
        card.classList.add('animate-slide-up');
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Add animations to location buttons with mobile optimization
    const locationButtons = document.querySelectorAll('.location-btn');
    const isMobile = window.innerWidth <= 768;
    
    // Separate buttons by county for consistent timing
    const browardButtons = document.querySelectorAll('.location-category:first-child .location-btn');
    const palmBeachButtons = document.querySelectorAll('.location-category:last-child .location-btn');
    
    // Apply mobile optimization to Broward County buttons
    browardButtons.forEach((btn, index) => {
        btn.classList.add('animate-zoom-in');
        if (isMobile) {
            const batchSize = 4; // Smaller batches for faster loading
            const batchIndex = Math.floor(index / batchSize);
            const indexInBatch = index % batchSize;
            const delay = (batchIndex * 0.15) + (indexInBatch * 0.02);
            btn.style.animationDelay = `${Math.min(delay, 0.4)}s`;
        } else {
            btn.style.animationDelay = `${index * 0.03}s`;
        }
    });
    
    // Apply mobile optimization to Palm Beach County buttons  
    palmBeachButtons.forEach((btn, index) => {
        btn.classList.add('animate-zoom-in');
        if (isMobile) {
            const batchSize = 3; // Even smaller batches for Palm Beach (fewer buttons)
            const batchIndex = Math.floor(index / batchSize);
            const indexInBatch = index % batchSize;
            const delay = (batchIndex * 0.12) + (indexInBatch * 0.02);
            btn.style.animationDelay = `${Math.min(delay, 0.3)}s`;
        } else {
            btn.style.animationDelay = `${index * 0.03}s`;
        }
    });
    
    // Add animations to service cards that don't have them yet
    const serviceCards = document.querySelectorAll('.service-card:not(.animate-slide-up)');
    serviceCards.forEach((card, index) => {
        card.classList.add('animate-slide-up');
        card.style.animationDelay = `${index * 0.1}s`;
    });
}
