/**
 * Pages JavaScript - Функционал для внутренних страниц
 * Щучинск Санаторий
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize page-specific modules
    if (document.querySelector('.rooms-catalog__grid')) {
        RoomsCatalog.init();
    }
    
    if (document.querySelector('.gallery-full__grid')) {
        GalleryFull.init();
    }
    
    if (document.querySelector('.faq-list')) {
        FAQ.init();
    }
    
    if (document.querySelector('.booking-form')) {
        BookingPage.init();
    }
    
    if (document.querySelector('.feedback-form')) {
        FeedbackForm.init();
    }
    
    if (document.querySelector('.video-play-btn')) {
        VideoSection.init();
    }
    
    // Smooth scroll for services nav
    ServicesNav.init();
});

/**
 * Rooms Catalog Module
 */
const RoomsCatalog = {
    init() {
        this.filterButtons = document.querySelectorAll('.rooms-catalog .rooms__filter-btn');
        this.sortSelect = document.getElementById('sortSelect');
        this.cards = document.querySelectorAll('.room-card');
        this.emptyState = document.getElementById('emptyState');
        
        this.bindEvents();
    },
    
    bindEvents() {
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => this.filter(btn.dataset.filter));
        });
        
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => this.sort(this.sortSelect.value));
        }
    },
    
    filter(category) {
        // Update active button
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === category);
        });
        
        let visibleCount = 0;
        
        this.cards.forEach(card => {
            const cardCategory = card.dataset.category;
            
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.5s ease forwards';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show/hide empty state
        if (this.emptyState) {
            this.emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    },
    
    sort(criteria) {
        const cardsArray = Array.from(this.cards);
        
        cardsArray.sort((a, b) => {
            switch (criteria) {
                case 'price-asc':
                    return a.dataset.price - b.dataset.price;
                case 'price-desc':
                    return b.dataset.price - a.dataset.price;
                case 'size':
                    return b.dataset.size - a.dataset.size;
                default:
                    return 0;
            }
        });
        
        const grid = document.querySelector('.rooms-catalog__grid');
        cardsArray.forEach(card => grid.appendChild(card));
    }
};

/**
 * Gallery Full Module
 */
const GalleryFull = {
    init() {
        this.filterButtons = document.querySelectorAll('.gallery-filter__btn');
        this.items = document.querySelectorAll('.gallery-full__item');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        
        this.bindEvents();
    },
    
    bindEvents() {
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => this.filter(btn.dataset.filter));
        });
        
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => this.loadMore());
        }
        
        // Lightbox integration
        this.items.forEach((item, index) => {
            item.addEventListener('click', () => {
                if (typeof Gallery !== 'undefined') {
                    Gallery.currentIndex = index;
                    Gallery.openLightbox(item.querySelector('img').src);
                }
            });
        });
    },
    
    filter(category) {
        // Update active button
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === category);
        });
        
        this.items.forEach(item => {
            const itemCategory = item.dataset.category;
            
            if (category === 'all' || itemCategory === category) {
                item.style.display = 'block';
                item.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                item.style.display = 'none';
            }
        });
    },
    
    loadMore() {
        // Simulate loading more images
        const hiddenItems = Array.from(this.items).filter(item => item.style.display === 'none');
        
        hiddenItems.slice(0, 8).forEach((item, index) => {
            setTimeout(() => {
                item.style.display = 'block';
                item.style.animation = 'fadeInUp 0.5s ease forwards';
            }, index * 100);
        });
        
        // Hide load more button if all items shown
        const remainingHidden = Array.from(this.items).filter(item => item.style.display === 'none');
        if (remainingHidden.length === 0 && this.loadMoreBtn) {
            this.loadMoreBtn.style.display = 'none';
        }
    }
};

/**
 * FAQ Module
 */
const FAQ = {
    init() {
        this.items = document.querySelectorAll('.faq-item');
        
        this.bindEvents();
    },
    
    bindEvents() {
        this.items.forEach(item => {
            const header = item.querySelector('.faq-item__header');
            header.addEventListener('click', () => this.toggle(item));
        });
        
        // Open first item by default
        if (this.items.length > 0) {
            this.open(this.items[0]);
        }
    },
    
    toggle(item) {
        const isActive = item.classList.contains('active');
        
        // Close all items
        this.items.forEach(i => i.classList.remove('active'));
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            this.open(item);
        }
    },
    
    open(item) {
        item.classList.add('active');
    }
};

/**
 * Booking Page Module
 */
const BookingPage = {
    init() {
        this.form = document.getElementById('bookingForm');
        this.steps = document.querySelectorAll('.booking-step');
        this.progressSteps = document.querySelectorAll('.booking-progress__step');
        this.nextButtons = document.querySelectorAll('.booking-next');
        this.prevButtons = document.querySelectorAll('.booking-prev');
        this.checkIn = document.getElementById('checkIn');
        this.checkOut = document.getElementById('checkOut');
        this.nightsCount = document.getElementById('nightsCount');
        this.guestsMinus = document.getElementById('guestsMinus');
        this.guestsPlus = document.getElementById('guestsPlus');
        this.guestsValue = document.getElementById('guestsValue');
        this.guestsInput = document.getElementById('guestsInput');
        this.successModal = document.getElementById('successModal');
        this.modalClose = document.getElementById('modalClose');
        
        this.currentStep = 1;
        this.roomPrices = {
            standard: 25000,
            comfort: 40000,
            premium: 70000
        };
        
        this.setMinDates();
        this.bindEvents();
        this.checkURLParams();
    },
    
    setMinDates() {
        if (!this.checkIn || !this.checkOut) return;
        
        const today = new Date().toISOString().split('T')[0];
        this.checkIn.min = today;
        this.checkOut.min = today;
    },
    
    bindEvents() {
        // Next buttons
        this.nextButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const nextStep = parseInt(btn.dataset.next);
                if (this.validateStep(this.currentStep)) {
                    this.goToStep(nextStep);
                }
            });
        });
        
        // Previous buttons
        this.prevButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const prevStep = parseInt(btn.dataset.prev);
                this.goToStep(prevStep);
            });
        });
        
        // Date changes
        if (this.checkIn) {
            this.checkIn.addEventListener('change', () => {
                if (this.checkOut) {
                    this.checkOut.min = this.checkIn.value;
                    if (this.checkOut.value && this.checkOut.value < this.checkIn.value) {
                        this.checkOut.value = '';
                    }
                }
                this.calculateNights();
            });
        }
        
        if (this.checkOut) {
            this.checkOut.addEventListener('change', () => this.calculateNights());
        }
        
        // Guests selector
        if (this.guestsMinus) {
            this.guestsMinus.addEventListener('click', () => this.changeGuests(-1));
        }
        
        if (this.guestsPlus) {
            this.guestsPlus.addEventListener('click', () => this.changeGuests(1));
        }
        
        // Room selection
        document.querySelectorAll('.booking-room').forEach(room => {
            room.addEventListener('change', () => this.updateSummary());
        });
        
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // Modal close
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.closeModal());
        }
        
        if (this.successModal) {
            this.successModal.querySelector('.modal__overlay').addEventListener('click', () => this.closeModal());
        }
    },
    
    checkURLParams() {
        const params = new URLSearchParams(window.location.search);
        const room = params.get('room');
        
        if (room) {
            const roomInput = document.querySelector(`.booking-room input[value="${room}"]`);
            if (roomInput) {
                roomInput.checked = true;
                roomInput.parentElement.classList.add('selected');
            }
        }
    },
    
    goToStep(step) {
        // Hide all steps
        this.steps.forEach(s => s.style.display = 'none');
        
        // Show current step
        const currentStepEl = document.querySelector(`.booking-step[data-step="${step}"]`);
        if (currentStepEl) {
            currentStepEl.style.display = 'block';
            currentStepEl.style.animation = 'fadeInUp 0.5s ease forwards';
        }
        
        // Update progress
        this.progressSteps.forEach((s, index) => {
            s.classList.remove('booking-progress__step--active', 'completed');
            if (index + 1 < step) {
                s.classList.add('completed');
            } else if (index + 1 === step) {
                s.classList.add('booking-progress__step--active');
            }
        });
        
        this.currentStep = step;
        
        // Update summary on step 4
        if (step === 4) {
            this.updateSummary();
        }
        
        // Scroll to top of form
        const formContainer = document.querySelector('.booking-page__form');
        if (formContainer) {
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },
    
    validateStep(step) {
        switch (step) {
            case 1:
                return this.validateDates();
            case 2:
                return this.validateRoom();
            case 3:
                return this.validatePersonalData();
            default:
                return true;
        }
    },
    
    validateDates() {
        let isValid = true;
        
        if (!this.checkIn || !this.checkOut) return true;
        
        if (!this.checkIn.value) {
            this.checkIn.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            this.checkIn.style.borderColor = '';
        }
        
        if (!this.checkOut.value) {
            this.checkOut.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            this.checkOut.style.borderColor = '';
        }
        
        if (this.checkIn.value && this.checkOut.value) {
            const checkInDate = new Date(this.checkIn.value);
            const checkOutDate = new Date(this.checkOut.value);
            
            if (checkOutDate <= checkInDate) {
                this.checkOut.style.borderColor = '#ef4444';
                isValid = false;
            }
        }
        
        return isValid;
    },
    
    validateRoom() {
        const selectedRoom = document.querySelector('.booking-room input[name="roomType"]:checked');
        
        if (!selectedRoom) {
            alert('Пожалуйста, выберите номер');
            return false;
        }
        
        return true;
    },
    
    validatePersonalData() {
        let isValid = true;
        const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                field.style.borderColor = '#ef4444';
                isValid = false;
            } else if (field) {
                field.style.borderColor = '';
            }
        });
        
        // Email validation
        const emailField = document.getElementById('email');
        if (emailField && emailField.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                emailField.style.borderColor = '#ef4444';
                isValid = false;
            }
        }
        
        // Phone validation
        const phoneField = document.getElementById('phone');
        if (phoneField && phoneField.value) {
            const phoneDigits = phoneField.value.replace(/\D/g, '');
            if (phoneDigits.length !== 11) {
                phoneField.style.borderColor = '#ef4444';
                isValid = false;
            }
        }
        
        return isValid;
    },
    
    calculateNights() {
        if (!this.checkIn || !this.checkOut || !this.nightsCount) return;
        
        if (this.checkIn.value && this.checkOut.value) {
            const checkInDate = new Date(this.checkIn.value);
            const checkOutDate = new Date(this.checkOut.value);
            const diffTime = checkOutDate - checkInDate;
            const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (nights > 0) {
                this.nightsCount.textContent = nights;
            } else {
                this.nightsCount.textContent = '0';
            }
        } else {
            this.nightsCount.textContent = '0';
        }
    },
    
    changeGuests(delta) {
        let current = parseInt(this.guestsValue.textContent);
        current += delta;
        
        if (current < 1) current = 1;
        if (current > 10) current = 10;
        
        this.guestsValue.textContent = current;
        this.guestsInput.value = current;
    },
    
    updateSummary() {
        // Dates
        const checkInValue = this.checkIn ? this.formatDate(this.checkIn.value) : '—';
        const checkOutValue = this.checkOut ? this.formatDate(this.checkOut.value) : '—';
        const nightsValue = this.nightsCount ? this.nightsCount.textContent : '0';
        
        document.getElementById('summaryCheckIn').textContent = checkInValue;
        document.getElementById('summaryCheckOut').textContent = checkOutValue;
        document.getElementById('summaryNights').textContent = nightsValue + ' ночей';
        
        // Room
        const selectedRoom = document.querySelector('.booking-room input[name="roomType"]:checked');
        const roomNames = {
            standard: 'Стандарт',
            comfort: 'Комфорт',
            premium: 'Премиум'
        };
        
        const roomType = selectedRoom ? selectedRoom.value : 'standard';
        document.getElementById('summaryRoom').textContent = roomNames[roomType] || '—';
        
        // Guests
        const guestsValue = this.guestsInput ? this.guestsInput.value : '2';
        document.getElementById('summaryGuests').textContent = guestsValue + ' гост' + this.declineGuests(guestsValue);
        
        // Personal data
        const firstName = document.getElementById('firstName')?.value || '—';
        const lastName = document.getElementById('lastName')?.value || '—';
        document.getElementById('summaryName').textContent = `${firstName} ${lastName}`;
        document.getElementById('summaryPhone').textContent = document.getElementById('phone')?.value || '—';
        document.getElementById('summaryEmail').textContent = document.getElementById('email')?.value || '—';
        
        // Total
        const nights = parseInt(nightsValue) || 0;
        const pricePerNight = this.roomPrices[roomType] || 0;
        const total = nights * pricePerNight;
        
        document.getElementById('summaryTotal').textContent = this.formatPrice(total);
    },
    
    formatDate(dateString) {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },
    
    formatPrice(price) {
        return price.toLocaleString('ru-RU') + ' ₸';
    },
    
    declineGuests(number) {
        const num = parseInt(number);
        const lastDigit = num % 10;
        const lastTwoDigits = num % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return 'ей';
        }
        if (lastDigit === 1) {
            return 'ь';
        }
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'я';
        }
        return 'ей';
    },
    
    handleSubmit(e) {
        e.preventDefault();
        
        // Generate booking number
        const bookingNumber = 'BK' + Date.now().toString(36).toUpperCase();
        document.getElementById('bookingNumber').textContent = bookingNumber;
        
        // Show success modal
        this.successModal.classList.add('active');
        document.body.classList.add('locked');
        
        // Log booking data (in real app, send to server)
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        console.log('Booking submitted:', data);
    },
    
    closeModal() {
        this.successModal.classList.remove('active');
        document.body.classList.remove('locked');
    }
};

/**
 * Feedback Form Module
 */
const FeedbackForm = {
    init() {
        this.form = document.getElementById('feedbackForm');
        
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    },
    
    handleSubmit(e) {
        e.preventDefault();
        
        // Simulate submission
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Отправка...</span>';
        
        setTimeout(() => {
            submitBtn.innerHTML = '<span>Отправлено!</span>';
            submitBtn.style.background = '#2d5a4a';
            
            setTimeout(() => {
                this.form.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
            }, 2000);
        }, 1500);
    }
};

/**
 * Video Section Module
 */
const VideoSection = {
    init() {
        this.playBtn = document.querySelector('.video-play-btn');
        
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.openVideo());
        }
    },
    
    openVideo() {
        // In real implementation, open video modal or play embedded video
        alert('Видео будет воспроизведено здесь. В реальной версии будет встроенный видеоплеер.');
    }
};

/**
 * Services Navigation Module
 */
const ServicesNav = {
    init() {
        this.links = document.querySelectorAll('.services-nav__item');
        
        if (this.links.length === 0) return;
        
        this.bindEvents();
        this.handleScroll();
    },
    
    bindEvents() {
        window.addEventListener('scroll', () => this.handleScroll());
        
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    const offsetTop = target.offsetTop - 100;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    },
    
    handleScroll() {
        const sections = document.querySelectorAll('.service-section');
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const isVisible = rect.top <= 150 && rect.bottom >= 150;
            
            if (isVisible) {
                const id = section.id;
                this.links.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }
};

// Phone mask for feedback form
document.addEventListener('DOMContentLoaded', () => {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length >= 1 && value[0] !== '7') {
                value = '7' + value;
            }
            
            if (value.length >= 11) {
                value = `+7 (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7, 9)}-${value.slice(9, 11)}`;
            } else if (value.length >= 8) {
                value = `+7 (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7, 9)}`;
            } else if (value.length >= 5) {
                value = `+7 (${value.slice(1, 4)}) ${value.slice(4, 7)}`;
            } else if (value.length >= 2) {
                value = `+7 (${value.slice(1, 4)}`;
            } else if (value.length >= 1) {
                value = `+7`;
            }
            
            e.target.value = value;
        });
    });
});
