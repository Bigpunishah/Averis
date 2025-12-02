// =========================================
// Language Switching Functionality
// =========================================
let currentLanguage = 'en';

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang}`).classList.add('active');
    
    // Update text content
    document.querySelectorAll('[data-en][data-pt]').forEach(element => {
        // Skip textarea elements as they use placeholder instead
        if (element.tagName.toLowerCase() === 'textarea') {
            const enPlaceholder = element.getAttribute('data-en');
            const ptPlaceholder = element.getAttribute('data-pt');
            if (enPlaceholder && ptPlaceholder) {
                element.placeholder = lang === 'en' ? enPlaceholder : ptPlaceholder;
            }
        } else {
            const newText = element.getAttribute(`data-${lang}`);
            if (newText) {
                element.textContent = newText;
            }
        }
    });
    
    // Update placeholders for input elements
    document.querySelectorAll('input[data-en][data-pt]').forEach(element => {
        const enPlaceholder = element.getAttribute('data-en');
        const ptPlaceholder = element.getAttribute('data-pt');
        if (enPlaceholder && ptPlaceholder) {
            element.placeholder = lang === 'en' ? enPlaceholder : ptPlaceholder;
        }
    });
    
    // Update form labels and options
    updateFormContent(lang);
    
    // Store preference
    localStorage.setItem('preferredLanguage', lang);
}

function updateFormContent(lang) {
    const serviceSelect = document.getElementById('service');
    if (serviceSelect) {
        const options = serviceSelect.querySelectorAll('option');
        options.forEach(option => {
            const enText = option.getAttribute('data-en');
            const ptText = option.getAttribute('data-pt');
            if (enText && ptText) {
                option.textContent = lang === 'en' ? enText : ptText;
            }
        });
    }
    
    // Update textarea placeholder - ensure it's empty and only shows placeholder
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
        const enPlaceholder = messageTextarea.getAttribute('data-en');
        const ptPlaceholder = messageTextarea.getAttribute('data-pt');
        if (enPlaceholder && ptPlaceholder) {
            messageTextarea.value = ''; // Ensure textarea is empty
            messageTextarea.placeholder = lang === 'en' ? enPlaceholder : ptPlaceholder;
        }
    }
    
    // Update address field placeholder
    const addressField = document.getElementById('address');
    if (addressField) {
        const enPlaceholder = addressField.getAttribute('data-en');
        const ptPlaceholder = addressField.getAttribute('data-pt');
        if (enPlaceholder && ptPlaceholder) {
            addressField.placeholder = lang === 'en' ? enPlaceholder : ptPlaceholder;
        }
    }
}

// =========================================
// Smooth Scrolling Navigation
// =========================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language preference
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    switchLanguage(savedLanguage);
    
    // Hamburger menu functionality
    const hamburger = document.getElementById('checkbox');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('change', function() {
        if (this.checked) {
            navMenu.classList.add('active');
        } else {
            navMenu.classList.remove('active');
        }
    });
    
    // Close menu when clicking on nav links
    document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.checked = false;
            navMenu.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target);
        const isClickOnHamburger = document.getElementById('menuToggle').contains(event.target);
        
        if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
            hamburger.checked = false;
            navMenu.classList.remove('active');
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 100; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar scroll effect - hide/show on scroll
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    let isScrolling = false;
    
    window.addEventListener('scroll', function() {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Change background and shadow based on scroll position
                if (scrollTop > 50) {
                    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                    navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                } else {
                    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                    navbar.style.boxShadow = 'none';
                }
                
                // Hide/show navbar based on scroll direction (very sensitive)
                if (scrollTop > 100) { // Start hiding after 100px
                    if (scrollTop > lastScrollTop && scrollTop > 150) {
                        // Scrolling down - hide navbar
                        navbar.classList.add('hidden');
                        navbar.classList.remove('visible');
                    } else if (scrollTop < lastScrollTop) {
                        // Scrolling up - show navbar
                        navbar.classList.remove('hidden');
                        navbar.classList.add('visible');
                    }
                } else {
                    // At top of page - always show navbar
                    navbar.classList.remove('hidden');
                    navbar.classList.add('visible');
                }
                
                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
                isScrolling = false;
            });
        }
        isScrolling = true;
    });
});

// =========================================
// Form Handling
// =========================================
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const address = formData.get('address');
            const service = formData.get('service');
            const message = formData.get('message');
            
            // Collect form data for future API implementation
            const formSubmission = {
                name: name,
                email: email,
                phone: phone,
                address: address,
                service: service,
                message: message,
                timestamp: new Date().toISOString(),
                source: 'Broom Broom Cleaning Website'
            };
            
            // Store in localStorage for now (replace with API call later)
            const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
            submissions.push(formSubmission);
            localStorage.setItem('formSubmissions', JSON.stringify(submissions));
            
            console.log('Form submission collected:', formSubmission);
            
            /* TODO: Replace localStorage with API call
            // Create email content
            const subject = encodeURIComponent(`New Cleaning Service Inquiry from ${name}`);
            const body = encodeURIComponent(
                `Name: ${name}\n` +
                `Email: ${email}\n` +
                `Phone: ${phone}\n` +
                `Service Address: ${address}\n` +
                `Service Needed: ${service}\n` +
                `Message: ${message}\n\n` +
                `This inquiry was submitted through the Broom Broom Cleaning website.`
            );
            
            // Open email client
            window.location.href = `mailto:broombroomhousecleaning@gmail.com?subject=${subject}&body=${body}`;
            */
            
            // Show success message and reset form
            showSuccessMessage();
            this.reset();
        });
    }
});

// =========================================
// Success Message Functionality
// =========================================
function showSuccessMessage() {
    // Create success message element if it doesn't exist
    let successMessage = document.getElementById('success-message');
    if (!successMessage) {
        successMessage = document.createElement('div');
        successMessage.id = 'success-message';
        successMessage.className = 'success-message';
        document.body.appendChild(successMessage);
    }
    
    // Set message content based on current language
    const messageText = currentLanguage === 'en' 
        ? 'Message sent successfully! We\'ll get back to you soon.'
        : 'Mensagem enviada com sucesso! Entraremos em contato em breve.';
    
    successMessage.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <div class="success-text">${messageText}</div>
            <button class="close-btn" onclick="closeSuccessMessage()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Show the message
    successMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        closeSuccessMessage();
    }, 5000);
}

function closeSuccessMessage() {
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
        successMessage.style.display = 'none';
    }
}

// =========================================
// Scroll Animations
// =========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    // Apply animation to elements
    const animatedElements = document.querySelectorAll(
        '.service-card, .about-card, .process-step, .review-card, .contact-item'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// =========================================
// Image Loading Optimization
// =========================================
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        // Add loading state
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        // If image is already loaded (cached)
        if (img.complete) {
            img.style.opacity = '1';
        }
    });
});

// =========================================
// Phone Number Formatting
// =========================================
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d{1,3})/, '($1) $2');
            }
            
            e.target.value = value;
        });
    }
});

// =========================================
// Scroll to Top Functionality
// =========================================
function createScrollToTop() {
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollButton.className = 'scroll-to-top';
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #8B5A3C 0%, #A0714F 100%);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        z-index: 1000;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(160, 113, 79, 0.3);
    `;
    
    document.body.appendChild(scrollButton);
    
    // Show/hide on scroll
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollButton.style.display = 'flex';
        } else {
            scrollButton.style.display = 'none';
        }
    });
    
    // Scroll to top on click
    scrollButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effect
    scrollButton.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 6px 25px rgba(160, 113, 79, 0.4)';
    });
    
    scrollButton.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(160, 113, 79, 0.3)';
    });
}

document.addEventListener('DOMContentLoaded', createScrollToTop);

// =========================================
// Performance Optimizations
// =========================================
// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    });
}

// Preload critical resources
document.addEventListener('DOMContentLoaded', function() {
    // Preload hero image
    const heroImage = new Image();
    heroImage.src = 'assets/images/clean-kitchen-main.jpg';
    
    // Preload logo
    const logo = new Image();
    logo.src = 'assets/images/broombroomcleaning-logo.png';
});