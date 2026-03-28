/**
 * Щучинск Санаторий — Main JavaScript
 * Premium Sanatorium Website
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    Preloader.init();
    Navigation.init();
    ScrollAnimations.init();
    RoomsFilter.init();
    ReviewsSlider.init();
    Gallery.init();
    BookingForm.init();
    SmoothScroll.init();
});

/**
 * Preloader Module
 */
const Preloader = {
    init() {
        this.preloader = document.querySelector('.preloader');
        this.hidePreloader();
    },
    
    hidePreloader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.preloader.classList.add('hidden');
                document.body.classList.remove('locked');
                
                // Remove from DOM after animation
                setTimeout(() => {
                    this.preloader.style.display = 'none';
                }, 1000);
            }, 1500);
        });
    }
};

/**
 * Navigation Module
 */
const Navigation = {
    init() {
        this.nav = document.getElementById('nav');
        this.toggle = document.getElementById('navToggle');
        this.menu = document.getElementById('navMenu');
        this.links = document.querySelectorAll('.nav__link');
        
        this.bindEvents();
        this.handleScroll();
    },
    
    bindEvents() {
        // Toggle mobile menu
        this.toggle.addEventListener('click', () => {
            this.toggle.classList.toggle('active');
            this.menu.classList.toggle('active');
            document.body.classList.toggle('locked');
        });
        
        // Close menu on link click
        this.links.forEach(link => {
            link.addEventListener('click', () => {
                this.toggle.classList.remove('active');
                this.menu.classList.remove('active');
                document.body.classList.remove('locked');
            });
        });
        
        // Handle scroll
        window.addEventListener('scroll', () => this.handleScroll());
    },
    
    handleScroll() {
        const scrolled = window.scrollY > 50;
        this.nav.classList.toggle('scrolled', scrolled);
    }
};

/**
 * Scroll Animations Module (Intersection Observer)
 */
const ScrollAnimations = {
    init() {
        this.elements = document.querySelectorAll(
            '.about__card, .rooms__card, .services__card, .gallery__item, .booking__content, .booking__info, .footer__grid > div'
        );
        
        this.setupObserver();
        this.setupCounterAnimation();
    },
    
    setupObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('fade-in', 'visible');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, options);
        
        this.elements.forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });
    },
    
    setupCounterAnimation() {
        const counters = document.querySelectorAll('.about__stat-value');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    },
    
    animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }
};

/**
 * Rooms Filter Module
 */
const RoomsFilter = {
    init() {
        this.buttons = document.querySelectorAll('.rooms__filter-btn');
        this.cards = document.querySelectorAll('.rooms__card');
        
        this.bindEvents();
    },
    
    bindEvents() {
        this.buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filter(btn.dataset.filter);
                this.setActive(btn);
            });
        });
    },
    
    setActive(activeBtn) {
        this.buttons.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    },
    
    filter(category) {
        this.cards.forEach(card => {
            const cardCategory = card.dataset.category;
            
            if (category === 'all' || cardCategory === category) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                card.classList.add('hidden');
            }
        });
    }
};

/**
 * Reviews Slider Module
 */
const ReviewsSlider = {
    init() {
        this.track = document.getElementById('reviewsTrack');
        this.slides = document.querySelectorAll('.reviews__slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.pagination = document.getElementById('pagination');
        
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        
        this.bindEvents();
        this.createPagination();
        this.updateSlider();
    },
    
    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        
        // Auto-play
        this.autoPlay = setInterval(() => this.next(), 5000);
        
        // Pause on hover
        this.track.addEventListener('mouseenter', () => clearInterval(this.autoPlay));
        this.track.addEventListener('mouseleave', () => {
            this.autoPlay = setInterval(() => this.next(), 5000);
        });
        
        // Touch support
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.track.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        this.track.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
        }, { passive: true });
    },
    
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }
    },
    
    createPagination() {
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('span');
            dot.classList.add('reviews__pagination-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goTo(i));
            this.pagination.appendChild(dot);
        }
    },
    
    updateSlider() {
        this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        
        // Update pagination
        const dots = this.pagination.querySelectorAll('.reviews__pagination-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    },
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        this.updateSlider();
    },
    
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
    },
    
    goTo(index) {
        this.currentIndex = index;
        this.updateSlider();
    }
};

/**
 * Gallery Module (Lightbox)
 */
const Gallery = {
    init() {
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightboxImg');
        this.closeBtn = document.getElementById('lightboxClose');
        this.prevBtn = document.getElementById('lightboxPrev');
        this.nextBtn = document.getElementById('lightboxNext');
        this.items = document.querySelectorAll('.gallery__item');
        
        this.currentIndex = 0;
        this.images = [];
        
        this.collectImages();
        this.bindEvents();
    },
    
    collectImages() {
        this.items.forEach((item, index) => {
            const img = item.querySelector('img');
            this.images.push(img.src);
            
            item.addEventListener('click', () => {
                this.currentIndex = index;
                this.openLightbox(img.src);
            });
        });
    },
    
    bindEvents() {
        this.closeBtn.addEventListener('click', () => this.closeLightbox());
        this.prevBtn.addEventListener('click', () => this.prevImage());
        this.nextBtn.addEventListener('click', () => this.nextImage());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') this.closeLightbox();
            if (e.key === 'ArrowLeft') this.prevImage();
            if (e.key === 'ArrowRight') this.nextImage();
        });
        
        // Click outside to close
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) this.closeLightbox();
        });
    },
    
    openLightbox(src) {
        this.lightboxImg.src = src;
        this.lightbox.classList.add('active');
        document.body.classList.add('locked');
    },
    
    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.classList.remove('locked');
    },
    
    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.lightboxImg.src = this.images[this.currentIndex];
    },
    
    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.lightboxImg.src = this.images[this.currentIndex];
    }
};

/**
 * Booking Form Module
 */
const BookingForm = {
    init() {
        this.form = document.getElementById('bookingForm');
        this.checkIn = document.getElementById('checkIn');
        this.checkOut = document.getElementById('checkOut');
        this.phone = document.getElementById('phone');
        this.roomType = document.getElementById('roomType');
        
        this.setMinDates();
        this.bindEvents();
    },
    
    setMinDates() {
        const today = new Date().toISOString().split('T')[0];
        this.checkIn.min = today;
        this.checkOut.min = today;
    },
    
    bindEvents() {
        // Update checkOut min when checkIn changes
        this.checkIn.addEventListener('change', () => {
            this.checkOut.min = this.checkIn.value;
            if (this.checkOut.value && this.checkOut.value < this.checkIn.value) {
                this.checkOut.value = '';
            }
        });
        
        // Phone mask
        this.phone.addEventListener('input', (e) => {
            e.target.value = this.formatPhone(e.target.value);
        });
        
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Room selection from rooms section
        document.querySelectorAll('.rooms__btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const room = e.target.dataset.room;
                this.roomType.value = room;
                document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
            });
        });
    },
    
    formatPhone(value) {
        // Remove non-digits
        let digits = value.replace(/\D/g, '');
        
        // Limit to 11 digits (7 + 10)
        if (digits.length > 11) digits = digits.slice(0, 11);
        
        // Add country code if missing
        if (digits.length === 11 && digits[0] === '7') {
            // Already has country code
        } else if (digits.length === 10) {
            digits = '7' + digits;
        } else if (digits.length > 0 && digits[0] !== '7') {
            digits = '7' + digits;
        }
        
        // Format: +7 (XXX) XXX-XX-XX
        if (digits.length >= 11) {
            return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
        } else if (digits.length >= 8) {
            return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}`;
        } else if (digits.length >= 5) {
            return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}`;
        } else if (digits.length >= 2) {
            return `+7 (${digits.slice(1, 4)}`;
        } else if (digits.length >= 1) {
            return `+7`;
        }
        
        return '';
    },
    
    handleSubmit(e) {
        e.preventDefault();
        
        // Validate
        if (!this.validate()) return;
        
        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // Simulate submission
        const submitBtn = this.form.querySelector('.booking__btn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                </path>
            </svg>
            <span>Отправка...</span>
        `;
        
        // Simulate API call
        setTimeout(() => {
            submitBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
                <span>Забронировано!</span>
            `;
            submitBtn.style.background = '#2d5a4a';
            
            // Reset form
            setTimeout(() => {
                this.form.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
            }, 3000);
            
            // Show success message (in real app, show modal)
            console.log('Booking submitted:', data);
        }, 1500);
    },
    
    validate() {
        const inputs = this.form.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#ef4444';
                
                setTimeout(() => {
                    input.style.borderColor = '';
                }, 2000);
            }
        });
        
        // Validate dates
        if (this.checkIn.value && this.checkOut.value) {
            const checkInDate = new Date(this.checkIn.value);
            const checkOutDate = new Date(this.checkOut.value);
            
            if (checkOutDate <= checkInDate) {
                isValid = false;
                this.checkOut.style.borderColor = '#ef4444';
                setTimeout(() => {
                    this.checkOut.style.borderColor = '';
                }, 2000);
            }
        }
        
        // Validate phone
        const phoneValue = this.phone.value.replace(/\D/g, '');
        if (phoneValue.length !== 11) {
            isValid = false;
            this.phone.style.borderColor = '#ef4444';
            setTimeout(() => {
                this.phone.style.borderColor = '';
            }, 2000);
        }
        
        return isValid;
    }
};

/**
 * Smooth Scroll Module
 */
const SmoothScroll = {
    init() {
        this.bindEvents();
    },
    
    bindEvents() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
};

// Add CSS animation for filter
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
