// Property Data
const propertyData = {
    property1: {
        title: "Waterfront Estate",
        location: "Palm Beach",
        price: "$12,500,000",
        beds: "8 Beds",
        baths: "10 Baths",
        sqft: "15,000 sqft",
        image: "assets/images/mansion-1.avif",
        description: "An extraordinary waterfront estate offering unparalleled luxury and privacy. This magnificent property features panoramic ocean views, private beach access, and world-class amenities throughout.",
        features: [
            "Private beach access",
            "Infinity pool with ocean views",
            "Wine cellar for 500+ bottles",
            "Home theater and game room",
            "Chef's kitchen with butler's pantry",
            "Master suite with private balcony",
            "Guest house with separate entrance",
            "Three-car garage with EV charging"
        ]
    },
    property2: {
        title: "Contemporary Masterpiece",
        location: "Miami Beach",
        price: "$8,750,000",
        beds: "6 Beds",
        baths: "8 Baths",
        sqft: "12,000 sqft",
        image: "assets/images/mansion-9.avif",
        description: "A stunning contemporary masterpiece showcasing cutting-edge architecture and design. This home epitomizes modern luxury living with smart home technology and sustainable features.",
        features: [
            "Smart home automation system",
            "Solar panels and energy storage",
            "Rooftop terrace with city views",
            "Indoor-outdoor living spaces",
            "Spa-like master bathroom",
            "Gourmet kitchen with island",
            "Home office with built-ins",
            "Landscaped courtyard garden"
        ]
    },
    property3: {
        title: "Sky-High Penthouse",
        location: "Downtown Miami",
        price: "$15,200,000",
        beds: "4 Beds",
        baths: "6 Baths",
        sqft: "8,500 sqft",
        image: "assets/images/mansion-3.webp",
        description: "Soar above the city in this extraordinary penthouse offering 360-degree views of Miami's skyline, bay, and ocean. The ultimate in urban luxury living.",
        features: [
            "360-degree panoramic views",
            "Private elevator access",
            "Wraparound terrace",
            "Floor-to-ceiling windows",
            "Butler's kitchen",
            "Master suite with sitting area",
            "Library and study",
            "Building concierge service"
        ]
    },
    property4: {
        title: "Modern Estate",
        location: "Naples",
        price: "$22,800,000",
        beds: "7 Beds",
        baths: "9 Baths",
        sqft: "18,000 sqft",
        image: "assets/images/mansion-4.webp",
        description: "An architectural marvel set on pristine grounds in Naples' most exclusive enclave. This modern estate combines innovative design with timeless elegance.",
        features: [
            "Award-winning architecture",
            "Resort-style pool complex",
            "Tennis court and putting green",
            "Guest wing with 3 suites",
            "Climate-controlled wine room",
            "Fitness center and spa",
            "Outdoor kitchen and bar",
            "Circular driveway with fountain"
        ]
    },
    property5: {
        title: "Oceanfront Villa",
        location: "Key Biscayne",
        price: "$28,500,000",
        beds: "9 Beds",
        baths: "12 Baths",
        sqft: "25,000 sqft",
        image: "assets/images/mansion-6.webp",
        description: "The crown jewel of Key Biscayne luxury real estate. This palatial oceanfront villa offers unmatched grandeur and sophisticated living on a private estate.",
        features: [
            "300 feet of private beach",
            "Grand ballroom for entertaining",
            "Professional-grade kitchen",
            "Library with custom millwork",
            "Master wing with his/her suites",
            "Guest cottage and staff quarters",
            "Private yacht dock",
            "Helipad for ultimate convenience"
        ]
    },
    property6: {
        title: "Golf Course Estate",
        location: "Jupiter",
        price: "$19,900,000",
        beds: "6 Beds",
        baths: "8 Baths",
        sqft: "14,500 sqft",
        image: "assets/images/mansion-5.jpg",
        description: "Exceptional estate positioned on the prestigious Jupiter golf course. This property seamlessly blends luxury living with world-class recreational amenities.",
        features: [
            "Golf course frontage",
            "Resort-style backyard oasis",
            "Gourmet kitchen with breakfast nook",
            "Formal dining room",
            "Home theater with stadium seating",
            "Exercise room and yoga studio",
            "Guest house with kitchenette",
            "Four-car garage with workshop"
        ]
    }
};

// Debug logging
console.log('JavaScript loaded successfully!');

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    const hamburger = document.querySelector('.hamburger .checkbox');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const navbar = document.querySelector('.navbar');

    // Toggle mobile menu with smooth animation
    hamburger.addEventListener('change', function() {
        if (this.checked) {
            mobileMenu.style.display = 'flex';
            setTimeout(() => {
                mobileMenu.classList.add('show');
            }, 10);
        } else {
            mobileMenu.classList.remove('show');
            setTimeout(() => {
                mobileMenu.style.display = 'none';
            }, 300);
        }
    });

    // Close mobile menu when clicking on a link
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.checked = false;
            mobileMenu.classList.remove('show');
            setTimeout(() => {
                mobileMenu.style.display = 'none';
            }, 300);
        });
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar scroll effect and active section highlighting
    window.addEventListener('scroll', function() {
        // Background color change
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(248, 246, 240, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'rgba(248, 246, 240, 0.95)';
            navbar.style.boxShadow = 'none';
        }
        
        // Active section highlighting  
        const sections = ['home', 'about', 'properties', 'services', 'contact'];
        const navbarHeight = navbar.offsetHeight;
        let activeSection = 'home';
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top + window.scrollY - navbarHeight - 50;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                    activeSection = sectionId;
                }
            }
        });
        
        // Update active nav link
        const allNavLinks = document.querySelectorAll('.nav-link, .mobile-link');
        allNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeSection}`) {
                link.classList.add('active');
            }
        });
    });

    // Contact form submission
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            
            // Convert FormData to object
            for (let [key, value] of formData.entries()) {
                formObject[key] = value;
            }
            
            // Simulate form submission
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate API call delay
            setTimeout(() => {
                submitBtn.textContent = 'Message Sent!';
                submitBtn.style.background = '#4CAF50';
                
                // Reset form
                this.reset();
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
                
                // Show success message
                showNotification('Thank you for your interest! We\'ll contact you within 24 hours.', 'success');
            }, 2000);
        });
    }

    // Property Modal Functionality
    const modal = document.getElementById('propertyModal');
    const closeModal = document.querySelector('.close');
    
    // Debug: Log if modal exists
    console.log('Modal found:', !!modal);
    
    // Use event delegation for better performance and reliability
    document.addEventListener('click', function(event) {
        const propertyCard = event.target.closest('.property-card');
        
        if (propertyCard) {
            event.preventDefault();
            console.log('Property card clicked!');
            
            const propertyId = propertyCard.getAttribute('data-property');
            const property = propertyData[propertyId];
            
            console.log('Property ID:', propertyId, 'Property data:', property);
            
            if (property && modal) {
                // Add click animation
                propertyCard.style.transform = 'translateY(-5px) scale(0.98)';
                
                setTimeout(() => {
                    // Populate modal with property data
                    const modalImage = document.getElementById('modalImage');
                    const modalTitle = document.getElementById('modalTitle');
                    const modalLocation = document.getElementById('modalLocation');
                    const modalPrice = document.getElementById('modalPrice');
                    
                    if (modalImage) modalImage.src = property.image;
                    if (modalTitle) modalTitle.textContent = property.title;
                    if (modalLocation) modalLocation.textContent = property.location;
                    if (modalPrice) modalPrice.textContent = property.price;
                    
                    // Clear and populate specs
                    const specsContainer = document.getElementById('modalSpecs');
                    if (specsContainer) {
                        specsContainer.innerHTML = `
                            <span>${property.beds}</span>
                            <span>${property.baths}</span>
                            <span>${property.sqft}</span>
                        `;
                    }
                    
                    // Set description
                    const modalDescription = document.getElementById('modalDescription');
                    if (modalDescription) {
                        modalDescription.innerHTML = `<p>${property.description}</p>`;
                    }
                    
                    // Clear and populate features
                    const featuresContainer = document.getElementById('modalFeatures');
                    if (featuresContainer) {
                        featuresContainer.innerHTML = '';
                        property.features.forEach(feature => {
                            const li = document.createElement('li');
                            li.textContent = feature;
                            featuresContainer.appendChild(li);
                        });
                    }
                    
                    // Show modal with animation
                    modal.style.display = 'block';
                    setTimeout(() => {
                        modal.classList.add('modal-open');
                    }, 10);
                    document.body.style.overflow = 'hidden';
                    
                    // Reset card transform
                    propertyCard.style.transform = 'translateY(0) scale(1)';
                }, 150);
            } else {
                console.log('Property not found or modal missing');
            }
        }
    });
    
    // Add hover effects to property cards
    document.addEventListener('mouseenter', function(event) {
        const propertyCard = event.target.closest('.property-card');
        if (propertyCard) {
            propertyCard.style.transform = 'translateY(-15px) scale(1.02)';
            propertyCard.style.boxShadow = '0 30px 60px rgba(0,0,0,0.2)';
        }
    }, true);
    
    document.addEventListener('mouseleave', function(event) {
        const propertyCard = event.target.closest('.property-card');
        if (propertyCard) {
            propertyCard.style.transform = 'translateY(0) scale(1)';
            propertyCard.style.boxShadow = '0 15px 30px rgba(0,0,0,0.08)';
        }
    }, true);
    
    // Close modal functionality with animation
    function closeModalWithAnimation() {
        if (modal) {
            modal.classList.remove('modal-open');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }
    
    // Close modal when clicking close button
    if (closeModal) {
        closeModal.addEventListener('click', closeModalWithAnimation);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModalWithAnimation();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModalWithAnimation();
        }
    });
    
    // Modal button functionality with enhanced UX
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal-btn')) {
            const btn = event.target;
            const originalText = btn.textContent;
            
            // Button loading state
            btn.style.opacity = '0.7';
            btn.style.cursor = 'not-allowed';
            btn.disabled = true;
            
            if (btn.classList.contains('primary')) {
                btn.textContent = 'Scheduling...';
                setTimeout(() => {
                    showNotification('Viewing request submitted! We\'ll contact you within 2 hours to confirm your appointment.', 'success');
                    closeModalWithAnimation();
                    
                    // Reset button
                    btn.textContent = originalText;
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                    btn.disabled = false;
                }, 1500);
            } else {
                btn.textContent = 'Sending...';
                setTimeout(() => {
                    showNotification('Information packet sent! Check your email for detailed property information and floor plans.', 'success');
                    closeModalWithAnimation();
                    
                    // Reset button
                    btn.textContent = originalText;
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                    btn.disabled = false;
                }, 1500);
            }
        }
    });

    // Property card animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate property cards
    const propertyCards = document.querySelectorAll('.property-card');
    propertyCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
        observer.observe(card);
    });

    // Animate service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`;
        observer.observe(card);
    });

    // Stats counter animation
    function animateCounter(element, target, duration) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }
        
        updateCounter();
    }

    // Animate stats when in view (Hero Stats)
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    
                    statNumbers.forEach(stat => {
                        const text = stat.textContent;
                        if (text.includes('+')) {
                            const number = parseInt(text.replace('+', ''));
                            stat.textContent = '0+';
                            animateCounter(stat, number, 2000);
                        } else if (text.includes('%')) {
                            const number = parseInt(text.replace('%', ''));
                            stat.textContent = '0%';
                            setTimeout(() => {
                                animateCounter(stat, number, 2000);
                            }, 500);
                        } else {
                            const number = parseInt(text);
                            stat.textContent = '0';
                            setTimeout(() => {
                                animateCounter(stat, number, 2000);
                            }, 1000);
                        }
                    });
                    
                    // Only animate once
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(statsSection);
    }

    // Animate time value stats
    const timeValueStats = document.querySelector('.time-value-stats');
    if (timeValueStats) {
        const timeStatsObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    
                    statNumbers.forEach((stat, index) => {
                        const text = stat.textContent;
                        if (text.includes('%')) {
                            const number = parseInt(text.replace('%', ''));
                            stat.textContent = '0%';
                            setTimeout(() => {
                                animateCounter(stat, number, 1500);
                            }, index * 300);
                        } else {
                            const number = parseInt(text);
                            stat.textContent = '0';
                            setTimeout(() => {
                                animateCounter(stat, number, 1500);
                            }, index * 300);
                        }
                    });
                    
                    // Only animate once
                    timeStatsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        timeStatsObserver.observe(timeValueStats);
    }

    // Phone number formatting
    const phoneInput = document.querySelector('input[type="tel"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
            }
            
            e.target.value = value;
        });
    }

    // True parallax effect - stationary background
    function parallaxHero() {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero');
        const heroBackground = document.querySelector('.hero-background');
        
        if (heroSection && heroBackground) {
            const heroHeight = heroSection.offsetHeight;
            
            // Show background only when hero section is in view
            if (scrolled < heroHeight) {
                heroBackground.style.opacity = '1';
                // Keep background completely stationary
                heroBackground.style.transform = 'translateY(0)';
            } else {
                heroBackground.style.opacity = '0';
            }
        }
    }
    
    // Use scroll event for parallax
    window.addEventListener('scroll', parallaxHero);
    
    // Initialize parallax on load
    parallaxHero();
});

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#1a237e'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries) {
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
});

// Property search functionality (if needed for future expansion)
function searchProperties(criteria) {
    // This would integrate with a property database
    console.log('Searching properties with criteria:', criteria);
}

// Contact methods
function callAveris() {
    window.location.href = 'tel:3055552123';
}

function emailAveris() {
    window.location.href = 'mailto:hello@averis.us?subject=Property Inquiry';
}
