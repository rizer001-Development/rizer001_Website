'use strict';

// ============================================================
//  1.  PARTICLE BACKGROUND
// ============================================================
(function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = -1000;
    let mouseY = -1000;
    let animationId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    function createParticles(count) {
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.5 + 0.1,
            });
        }
    }

    createParticles(100);

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Mouse interaction
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150 * 0.3;
                p.vx -= (dx / dist) * force;
                p.vy -= (dy / dist) * force;
            }

            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha})`;
            ctx.fill();

            // Draw connections
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx2 = p.x - p2.x;
                const dy2 = p.y - p2.y;
                const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                if (dist2 < 120) {
                    const alpha = (120 - dist2) / 120 * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    animate();

    // Background particle count adjustment
    function adjustParticleCount() {
        const area = canvas.width * canvas.height;
        const count = Math.min(120, Math.max(40, Math.floor(area / 10000)));
        const currentLen = particles.length;
        if (currentLen < count) {
            for (let i = currentLen; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: (Math.random() - 0.5) * 0.6,
                    size: Math.random() * 2 + 0.5,
                    alpha: Math.random() * 0.5 + 0.1,
                });
            }
        } else if (currentLen > count) {
            particles.length = count;
        }
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            adjustParticleCount();
        }, 200);
    });
})();

// ============================================================
//  2.  NAVBAR
// ============================================================
(function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    const navAnchors = document.querySelectorAll('.nav-link');

    const navOverlay = document.getElementById('nav-overlay');

    function closeMenu() {
        navToggle?.classList.remove('active');
        navLinks?.classList.remove('open');
        navOverlay?.classList.remove('visible');
        document.body.style.overflow = '';
    }

    function openMenu() {
        navToggle?.classList.add('active');
        navLinks?.classList.add('open');
        navOverlay?.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    // Mobile toggle
    navToggle?.addEventListener('click', () => {
        const isOpen = navLinks?.classList.contains('open');
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu on overlay click
    navOverlay?.addEventListener('click', closeMenu);

    // Close menu on link click
    navAnchors.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
        lastScroll = currentScroll;

        // Active link
        const sections = document.querySelectorAll('section[id]');
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            const bottom = top + section.offsetHeight;
            if (currentScroll >= top && currentScroll < bottom) {
                current = section.getAttribute('id');
            }
        });

        navAnchors.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    });
})();

// ============================================================
//  3.  REVEAL ON SCROLL
// ============================================================
(function initReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
    });

    revealElements.forEach(el => observer.observe(el));
})();

// ============================================================
//  4.  STAT COUNTER ANIMATION
// ============================================================
(function initStats() {
    const statNumbers = document.querySelectorAll('.stat-number');

    if (!statNumbers.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const targetValue = parseInt(target.getAttribute('data-target'), 10);
                animateCounter(target, targetValue);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));

    function animateCounter(element, target) {
        const duration = 2000;
        const startTime = performance.now();
        const startValue = 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(startValue + (target - startValue) * eased);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target + (target >= 1000 ? '+' : '');
            }
        }

        requestAnimationFrame(update);
    }
})();

// ============================================================
//  5.  GITHUB PROJECTS (with localStorage cache)
// ============================================================
(function loadGithubProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const CACHE_KEY = 'rizer001_github_repos';
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    // Try cache first
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
                renderProjects(data);
                return;
            }
        }
    } catch (e) {
        // Corrupted cache, ignore
    }

    // Fetch from GitHub API
    fetch('https://api.github.com/users/rizer001/repos?sort=updated&per_page=20')
        .then(res => {
            if (!res.ok) throw new Error('GitHub API error: ' + res.status);
            return res.json();
        })
        .then(repos => {
            // Filter out forked repos, sort by stars desc
            const filtered = repos
                .filter(repo => !repo.fork && !repo.archived)
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .slice(0, 9);

            // Save to cache
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: filtered,
                    timestamp: Date.now()
                }));
            } catch (e) {
                // Storage full, ignore
            }

            renderProjects(filtered);
        })
        .catch(err => {
            console.error('Failed to load GitHub repos:', err);
            grid.innerHTML = `
                <div class="project-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <p style="color: var(--text-muted); margin-bottom: 16px;">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; color: var(--accent-orange);"></i>
                    </p>
                    <p style="color: var(--text-muted);">Не удалось загрузить проекты</p>
                    <a href="https://github.com/rizer001" target="_blank" rel="noopener"
                       style="color: var(--accent-cyan); margin-top: 12px; display: inline-block;">
                        Смотреть на GitHub &rarr;
                    </a>
                </div>
            `;
        });
})();

function renderProjects(repos) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    if (!repos.length) {
        grid.innerHTML = '<p style="color: var(--text-muted);">Проекты не найдены</p>';
        return;
    }

    const langColors = {
        'Java': '#b07219',
        'TypeScript': '#3178c6',
        'JavaScript': '#f1e05a',
        'Kotlin': '#A97BFF',
        'Python': '#3572A5',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Shell': '#89e051',
        'Gradle': '#02303a',
    };

    grid.innerHTML = repos.map(repo => {
        const lang = repo.language || '';
        const langColor = langColors[lang] || '#6a6a80';
        const desc = repo.description || 'Нет описания';
        const stars = repo.stargazers_count || 0;

        return `
            <a href="${repo.html_url}" target="_blank" rel="noopener" class="project-card reveal">
                <div class="project-card-header">
                    <div class="project-card-icon">
                        <i class="fa-solid fa-code-branch"></i>
                    </div>
                    <span class="project-card-stars">
                        <i class="fa-solid fa-star"></i> ${stars}
                    </span>
                </div>
                <h3 class="project-card-title">${repo.name}</h3>
                <p class="project-card-desc">${desc}</p>
                <div class="project-card-footer">
                    <span class="project-card-lang">
                        <span class="project-card-lang-dot" style="background: ${langColor};"></span>
                        ${lang || 'N/A'}
                    </span>
                    <span class="project-card-link">Подробнее &rarr;</span>
                </div>
            </a>
        `;
    }).join('');

    // Re-init reveal for newly added elements
    const newReveals = grid.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    newReveals.forEach(el => observer.observe(el));
}

// ============================================================
//  6.  BACK TO TOP
// ============================================================
(function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

// ============================================================
//  7.  TYPING EFFECT (optional extra flair)
// ============================================================
(function initTypewriter() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;

    // The text is already there, but let's add a subtle cursor blink
    const style = document.createElement('style');
    style.textContent = `
        .hero-subtitle::after {
            content: '|';
            display: inline-block;
            margin-left: 2px;
            color: var(--accent-cyan);
            animation: blink-cursor 0.8s step-end infinite;
            font-weight: 100;
        }
        @keyframes blink-cursor {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
})();

// ============================================================
//  8.  PARALLAX ON HERO (only on non-touch devices)
// ============================================================
(function initParallax() {
    const hero = document.querySelector('.hero-content');
    if (!hero) return;

    // Disable on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 6;
        const y = (e.clientY / window.innerHeight - 0.5) * 6;
        hero.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
    });

    window.addEventListener('mouseleave', () => {
        hero.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
        hero.style.transition = 'transform 0.5s ease';
        setTimeout(() => { hero.style.transition = ''; }, 500);
    });
})();

console.log('\u{1F680} rizer001 \u2014 \u0441\u0430\u0439\u0442 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D!');
