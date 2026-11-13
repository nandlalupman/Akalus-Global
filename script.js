// ============================================
// AKALUs Global — Interactive JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // === Detect touch device ===
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // === Scroll Animations (Intersection Observer) ===
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Don't unobserve — allow re-trigger if needed for some elements
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        scrollObserver.observe(el);
    });

    // === Navbar Scroll Effect ===
    const navbar = document.getElementById('navbar');
    let lastScrollY = 0;

    const handleNavScroll = () => {
        const scrollY = window.scrollY;
        
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScrollY = scrollY;
    };

    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // === Active Nav Link on Scroll ===
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const highlightNav = () => {
        const scrollPos = window.scrollY + 200;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });

    // === Hamburger Menu ===
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    const openMobileMenu = () => {
        hamburger.classList.add('active');
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeMobileMenu = () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', () => {
        if (mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // === Smooth Scroll for Anchor Links ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return; // Skip "#" only links (like Sign In)
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = navbar.offsetHeight;
                const offset = window.innerWidth <= 768 ? 10 : 20; // Less offset on mobile
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // === Counter Animation ===
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.stat-number[data-count]');
                counters.forEach(counter => {
                    animateCounter(counter);
                });
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
        counterObserver.observe(statsGrid);
    }

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            
            el.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        }

        requestAnimationFrame(update);
    }

    // === Parallax effect for hero visual (DESKTOP ONLY) ===
    if (!isTouchDevice) {
        const heroVisual = document.querySelector('.hero-visual');
        if (heroVisual) {
            window.addEventListener('mousemove', (e) => {
                const moveX = (e.clientX - window.innerWidth / 2) * 0.02;
                const moveY = (e.clientY - window.innerHeight / 2) * 0.02;
                heroVisual.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        }
    }

    // === Pipeline step hover effect ===
    document.querySelectorAll('.pipeline-step').forEach(step => {
        step.addEventListener('mouseenter', () => {
            step.style.transform = 'scale(1.05)';
        });
        step.addEventListener('mouseleave', () => {
            step.style.transform = 'scale(1)';
        });
    });

    // === Scroll Progress Indicator (subtle) ===
    const createScrollProgress = () => {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #E8822A, #F5A623);
            z-index: 10000;
            transition: width 0.1s ease;
            border-radius: 0 2px 2px 0;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (window.scrollY / scrollHeight) * 100;
            progressBar.style.width = `${scrolled}%`;
        }, { passive: true });
    };

    createScrollProgress();

    // === Tilt effect for cards on hover (DESKTOP ONLY) ===
    if (!isTouchDevice) {
        const addTiltEffect = (selector) => {
            document.querySelectorAll(selector).forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = (y - centerY) / centerY * -3;
                    const rotateY = (x - centerX) / centerX * 3;

                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
                });
            });
        };

        addTiltEffect('.who-help-orb');
    }

    // === Auto-scroll testimonials on mobile ===
    if (window.innerWidth < 768) {
        const slider = document.querySelector('.testimonials-slider');
        if (slider) {
            slider.style.overflowX = 'auto';
            slider.style.scrollSnapType = 'x mandatory';
            slider.querySelectorAll('.testimonial-card').forEach(card => {
                card.style.scrollSnapAlign = 'start';
                card.style.minWidth = '85vw';
            });
        }
    }

    // === Who We Help — Carousel Dot Navigation ===
    const carouselTrack = document.querySelector('.who-help-track');
    const carouselDots = document.querySelectorAll('.carousel-dots .dot');
    if (carouselTrack && carouselDots.length) {
        // Sync dots with scroll position
        carouselTrack.addEventListener('scroll', () => {
            const scrollLeft = carouselTrack.scrollLeft;
            const trackWidth = carouselTrack.scrollWidth - carouselTrack.clientWidth;
            const orbs = carouselTrack.querySelectorAll('.who-help-orb');
            const orbCount = orbs.length;
            if (orbCount === 0 || trackWidth === 0) return;

            const progress = scrollLeft / trackWidth;
            const activeIndex = Math.round(progress * (orbCount - 1));

            carouselDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === activeIndex);
            });
        }, { passive: true });

        // Click on dot to scroll
        carouselDots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                const orbs = carouselTrack.querySelectorAll('.who-help-orb');
                if (orbs[i]) {
                    orbs[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }
            });
        });
    }

    // ============================================
    // BACK TO TOP BUTTON
    // ============================================
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============================================
    // AUTH MODAL LOGIC
    // ============================================
    // ============================================
    // KEYBOARD SUPPORT (Escape key)
    // ============================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close mobile menu
            if (mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        }
    });

    // ============================================
    // GSAP ANIMATIONS (Trending & Professional)
    // ============================================
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Final Content — corrected selectors
        gsap.from(".hero-final-title", { y: 50, opacity: 0, duration: 1, ease: "power3.out", delay: 0.2 });
        gsap.from(".hero-final-desc", { y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.4 });
        gsap.from(".hero-final-btns", { y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.6 });
        gsap.from(".hero-final-badge", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.1 });
        gsap.from(".hero-final-metrics", { y: 40, opacity: 0, duration: 1, ease: "power3.out", delay: 0.8 });

        // Reveal animations for sections
        const sectionsToReveal = gsap.utils.toArray('.section-header');
        sectionsToReveal.forEach(header => {
            gsap.from(header, {
                opacity: 0,
                y: 50,
                duration: 1,
                scrollTrigger: {
                    trigger: header,
                    start: "top 80%",
                }
            });
        });

        // Staggered card animations for Who We Help
        gsap.from(".who-help-orb", {
            scrollTrigger: {
                trigger: ".who-help-track",
                start: "top 80%",
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.7)"
        });
        
        // Floating effect for hero badge
        gsap.to(".hero-final-badge", {
            y: -10,
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
    }
});
