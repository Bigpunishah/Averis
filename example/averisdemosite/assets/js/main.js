// =============================================================================
// AVERIS COFFEE - INTERACTIVE FUNCTIONALITY
// Modern JavaScript for enhanced user experience
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    
    // =============================================================================
    // NAVIGATION FUNCTIONALITY
    // =============================================================================
    
    // Mobile hamburger menu functionality
    const hamburger = document.querySelector('.hamburger .checkbox');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger.checked) {
                hamburger.checked = false;
            }
        });
    });
    
    // Enhanced navbar scroll effect with modern styling
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(44, 24, 16, 0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
            navbar.style.boxShadow = '0 4px 32px rgba(44, 24, 16, 0.4)';
        } else {
            navbar.style.background = 'rgba(44, 24, 16, 0.9)';
            navbar.style.boxShadow = '0 2px 16px rgba(44, 24, 16, 0.2)';
        }
        
        // Smooth hide/show navbar based on scroll direction
        if (window.scrollY > lastScrollY && window.scrollY > 150) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScrollY = window.scrollY;
    });
    
    // =============================================================================
    // SMOOTH SCROLLING FOR ANCHOR LINKS
    // =============================================================================
    
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
    
    // =============================================================================
    // MENU CATEGORY SWITCHING
    // =============================================================================
    
    const menuCategories = document.querySelectorAll('.menu-category');
    const menuItems = document.querySelectorAll('.menu-items');
    
    menuCategories.forEach(category => {
        category.addEventListener('click', () => {
            const targetCategory = category.getAttribute('data-category');
            
            // Remove active class from all categories and menu items
            menuCategories.forEach(cat => cat.classList.remove('active'));
            menuItems.forEach(items => items.classList.remove('active'));
            
            // Add active class to clicked category and corresponding menu items
            category.classList.add('active');
            const targetItems = document.querySelector(`.menu-items.${targetCategory}`);
            if (targetItems) {
                targetItems.classList.add('active');
            }
        });
    });
    
    // =============================================================================
    // SCROLL REVEAL ANIMATIONS
    // =============================================================================
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.section-title, .menu-item, .experience-card, .gallery-item');
    animateElements.forEach(el => observer.observe(el));
    
    // =============================================================================
    // HERO SECTION PARALLAX EFFECT
    // =============================================================================
    
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (hero && heroContent) {
            heroContent.style.transform = `translateY(${rate}px)`;
        }
    });
    
    // =============================================================================
    // INTERACTIVE COFFEE MENU ANIMATIONS
    // =============================================================================
    
    const menuItemElements = document.querySelectorAll('.menu-item');
    
    menuItemElements.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-6px) scale(1.02)';
            item.style.boxShadow = '0 12px 40px rgba(244, 162, 97, 0.3)';
            item.style.background = 'rgba(93, 64, 55, 0.8)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) scale(1)';
            item.style.boxShadow = '0 2px 16px rgba(44, 24, 16, 0.2)';
            item.style.background = 'rgba(93, 64, 55, 0.6)';
        });
        
        // Add a subtle coffee steam animation effect
        const steamEffect = document.createElement('div');
        steamEffect.innerHTML = '☕';
        steamEffect.style.cssText = `
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 1.2rem;
            opacity: 0;
            transition: all 0.3s ease;
        `;
        item.style.position = 'relative';
        item.appendChild(steamEffect);
        
        item.addEventListener('mouseenter', () => {
            steamEffect.style.opacity = '0.6';
            steamEffect.style.transform = 'translateY(-2px)';
        });
        
        item.addEventListener('mouseleave', () => {
            steamEffect.style.opacity = '0';
            steamEffect.style.transform = 'translateY(0)';
        });
    });
    
    // =============================================================================
    // GALLERY LIGHTBOX EFFECT
    // =============================================================================
    
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Create lightbox overlay
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox-overlay';
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <div class="image-placeholder large">
                        <i class="fas fa-coffee"></i>
                        <span>High Resolution Image</span>
                        <p>In a real implementation, this would show the full-size image</p>
                    </div>
                    <button class="lightbox-close">&times;</button>
                </div>
            `;
            
            // Add lightbox styles
            lightbox.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(26, 15, 10, 0.95);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            document.body.appendChild(lightbox);
            
            // Animate in
            setTimeout(() => {
                lightbox.style.opacity = '1';
            }, 10);
            
            // Close functionality
            const closeBtn = lightbox.querySelector('.lightbox-close');
            closeBtn.addEventListener('click', closeLightbox);
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });
            
            function closeLightbox() {
                lightbox.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(lightbox);
                }, 300);
            }
        });
    });
    
    // =============================================================================
    // COFFEE BREWING ANIMATION
    // =============================================================================
    
    const logo = document.querySelector('.logo-main');
    if (logo) {
        setInterval(() => {
            logo.style.animation = 'pulse 2s ease-in-out';
            setTimeout(() => {
                logo.style.animation = '';
            }, 2000);
        }, 10000); // Pulse every 10 seconds
    }
    
    // =============================================================================
    // DEMO NOTIFICATIONS
    // =============================================================================
    
    // Show enhanced welcome notification
    if (!sessionStorage.getItem('demoNotificationShown')) {
        setTimeout(() => {
            showNotification('☕ Welcome to Averis Coffee!', 'Experience our modern coffee shop atmosphere. Every element has been crafted to create the perfect coffee house vibe.', 'info');
            sessionStorage.setItem('demoNotificationShown', 'true');
        }, 2500);
    }
    
    // Add coffee aroma animation effect
    function createAromaEffect() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const aroma = document.createElement('div');
                aroma.innerHTML = '☁️';
                aroma.style.cssText = `
                    position: absolute;
                    left: ${20 + Math.random() * 60}%;
                    bottom: 20%;
                    font-size: 2rem;
                    opacity: 0.7;
                    pointer-events: none;
                    animation: floatUp 4s ease-out forwards;
                    z-index: 3;
                `;
                
                hero.appendChild(aroma);
                
                setTimeout(() => {
                    if (hero.contains(aroma)) {
                        hero.removeChild(aroma);
                    }
                }, 4000);
            }, i * 800);
        }
    }
    
    // Add CSS animation for floating effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% { transform: translateY(0) scale(0.8); opacity: 0.7; }
            50% { transform: translateY(-50px) scale(1); opacity: 0.4; }
            100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Trigger aroma effect periodically
    setInterval(createAromaEffect, 8000);
    
    function showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(45, 28, 20, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid var(--warm-gold);
            border-radius: 12px;
            padding: 1.5rem;
            max-width: 350px;
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', closeNotification);
        
        // Auto close after 8 seconds
        setTimeout(closeNotification, 8000);
        
        function closeNotification() {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }
    
    // =============================================================================
    // CONTACT FORM FUNCTIONALITY (Demo)
    // =============================================================================
    
    // Add demo contact form if needed
    const contactSection = document.querySelector('#contact');
    if (contactSection && !contactSection.querySelector('.contact-form')) {
        const formHTML = `
            <div class="contact-form">
                <h3>Get in Touch (Demo)</h3>
                <form class="demo-form">
                    <div class="form-group">
                        <input type="text" placeholder="Your Name" required>
                    </div>
                    <div class="form-group">
                        <input type="email" placeholder="Your Email" required>
                    </div>
                    <div class="form-group">
                        <textarea placeholder="Your Message" rows="4" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Send Message (Demo)</button>
                </form>
            </div>
        `;
        
        const contactInfo = contactSection.querySelector('.contact-info');
        if (contactInfo) {
            contactInfo.insertAdjacentHTML('afterend', formHTML);
        }
    }
    
    // Handle demo form submission
    const demoForm = document.querySelector('.demo-form');
    if (demoForm) {
        demoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Message Sent!', 'This is a demo form. In a real website, your message would be sent to the coffee shop.', 'success');
            demoForm.reset();
        });
    }
    
    // =============================================================================
    // PERFORMANCE OPTIMIZATIONS
    // =============================================================================
    
    // Lazy loading for images (when real images are added)
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
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
    
    // =============================================================================
    // ACCESSIBILITY ENHANCEMENTS
    // =============================================================================
    
    // Keyboard navigation for menu categories
    menuCategories.forEach(category => {
        category.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                category.click();
            }
        });
        
        // Make focusable
        category.setAttribute('tabindex', '0');
    });
    
    // Focus management for mobile menu
    if (hamburger) {
        hamburger.addEventListener('change', () => {
            if (hamburger.checked) {
                // Focus first nav link when menu opens
                setTimeout(() => {
                    const firstLink = navMenu.querySelector('.nav-link');
                    if (firstLink) firstLink.focus();
                }, 300);
            }
        });
    }
    
    // Escape key to close mobile menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && hamburger && hamburger.checked) {
            hamburger.checked = false;
        }
    });
    
    console.log('🔥 Averis Coffee Demo loaded successfully!');
    console.log('☕ This is a demonstration website for portfolio purposes.');
    console.log('🚀 Showcasing modern web design for coffee businesses.');
});
