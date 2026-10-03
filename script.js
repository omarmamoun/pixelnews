document.addEventListener('DOMContentLoaded', function() {

    const articleCatalog = typeof articlesData === 'undefined' ? {} : articlesData;
    const bundledArticleIds = new Set(Object.keys(articleCatalog));
    const savedArticleStorageKey = 'zaher-saved-article-ids';
    const savedArticleIds = new Set(readSavedArticleIds());
    let deletedArticleIds = new Set();
    let articleDataVersion = '';
    loadRemoteArticleOverrides();

    // --- Mobile Navigation (Hamburger Menu) ---
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mainNav) {
        const navigationItems = [
            ['index.html', 'الرئيسية', 'fa-house'],
            ['index.html#breaking-news', 'أخبار عاجلة', 'fa-bolt'],
            ['politics.html', 'سياسة', 'fa-flag'],
            ['economy.html', 'اقتصاد', 'fa-chart-line'],
            ['sports.html', 'رياضة', 'fa-futbol'],
            ['technology.html', 'تكنولوجيا', 'fa-microchip'],
            ['world.html', 'العالم', 'fa-globe'],
            ['tourism.html', 'السياحة', 'fa-plane'],
            ['environment.html', 'البيئة', 'fa-leaf'],
            ['culture.html', 'الثقافة والفنون', 'fa-palette'],
            ['celebrities.html', 'المشاهير', 'fa-star'],
            ['events.html', 'المناسبات والوفيات', 'fa-calendar'],
            ['saved.html', 'المحفوظات', 'fa-bookmark'],
            ['games.html', 'ألعاب ذكاء', 'fa-puzzle-piece']
        ];
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        mainNav.setAttribute('aria-label', 'التنقل الرئيسي');
        mainNav.innerHTML = `<ul>${navigationItems.map(([href, label, icon]) => {
            const page = href.split('#')[0];
            const isCurrentPage = page === currentPage && page !== 'index.html' || page === 'index.html' && currentPage === 'index.html' && !href.includes('#');
            const savedCount = page === 'saved.html' ? `<span class="saved-count"${savedArticleIds.size ? '' : ' hidden'}>${savedArticleIds.size.toLocaleString('ar-EG')}</span>` : '';
            return `<li><a href="${href}"${isCurrentPage ? ' class="active" aria-current="page"' : ''}><i class="fas ${icon} nav-icon" aria-hidden="true"></i><span>${label}</span>${savedCount}</a></li>`;
        }).join('')}</ul>`;
    }

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = mainNav.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', String(isExpanded));
        });
    }

    const siteSearch = document.querySelector('.site-search');
    const headerControls = siteSearch?.closest('.header-right-controls');
    let searchToggle = null;
    if (siteSearch && headerControls) {
        searchToggle = document.createElement('button');
        searchToggle.className = 'header-search-toggle';
        searchToggle.type = 'button';
        searchToggle.setAttribute('aria-label', 'فتح البحث');
        searchToggle.setAttribute('aria-expanded', 'false');
        searchToggle.setAttribute('aria-controls', 'news-search');
        searchToggle.innerHTML = '<i class="fas fa-search" aria-hidden="true"></i>';
        headerControls.insertBefore(searchToggle, siteSearch);
        searchToggle.addEventListener('click', () => {
            const isOpen = headerControls.classList.toggle('search-open');
            searchToggle.setAttribute('aria-expanded', String(isOpen));
            searchToggle.setAttribute('aria-label', isOpen ? 'إغلاق البحث' : 'فتح البحث');
            if (isOpen) siteSearch.querySelector('input')?.focus();
        });
    }

    const settingsContainer = document.querySelector('.settings-container');
    const legacySettingsIcon = settingsContainer?.querySelector('.settings-icon');
    if (legacySettingsIcon && legacySettingsIcon.tagName !== 'BUTTON') {
        const settingsToggle = document.createElement('button');
        settingsToggle.className = 'settings-icon';
        settingsToggle.type = 'button';
        settingsToggle.setAttribute('aria-label', 'الإعدادات');
        settingsToggle.setAttribute('aria-expanded', 'false');
        settingsToggle.innerHTML = '<i class="fas fa-cog" aria-hidden="true"></i>';
        legacySettingsIcon.replaceWith(settingsToggle);
    }
    const settingsToggle = settingsContainer?.querySelector('.settings-icon');
    const settingsMenu = settingsContainer?.querySelector('.settings-menu');
    if (settingsMenu && !settingsMenu.id) settingsMenu.id = 'site-settings-menu';
    function positionSettingsMenu() {
        if (!settingsMenu || !settingsToggle || !settingsContainer?.classList.contains('is-open')) return;
        const anchor = settingsToggle.getBoundingClientRect();
        const menu = settingsMenu.getBoundingClientRect();
        const gutter = 12;
        const left = Math.max(gutter, Math.min(anchor.right - menu.width, window.innerWidth - menu.width - gutter));
        const top = Math.max(gutter, Math.min(anchor.bottom + 8, window.innerHeight - menu.height - gutter));
        settingsMenu.style.position = 'fixed';
        settingsMenu.style.left = `${left}px`;
        settingsMenu.style.right = 'auto';
        settingsMenu.style.top = `${top}px`;
    }
    function resetSettingsMenuPosition() {
        if (!settingsMenu) return;
        settingsMenu.style.removeProperty('position');
        settingsMenu.style.removeProperty('left');
        settingsMenu.style.removeProperty('right');
        settingsMenu.style.removeProperty('top');
    }
    if (settingsToggle && settingsMenu) {
        settingsToggle.setAttribute('aria-controls', settingsMenu.id);
        settingsToggle.addEventListener('click', () => {
            const isOpen = settingsContainer.classList.toggle('is-open');
            settingsToggle.setAttribute('aria-expanded', String(isOpen));
            if (isOpen) positionSettingsMenu();
            else resetSettingsMenuPosition();
        });
        window.addEventListener('resize', positionSettingsMenu);
        window.addEventListener('scroll', positionSettingsMenu, true);
    }

    function closeHeaderPopovers() {
        if (settingsContainer?.classList.contains('is-open')) {
            settingsContainer.classList.remove('is-open');
            settingsToggle?.setAttribute('aria-expanded', 'false');
            resetSettingsMenuPosition();
        }
        if (headerControls?.classList.contains('search-open')) {
            headerControls.classList.remove('search-open');
            searchToggle?.setAttribute('aria-expanded', 'false');
            searchToggle?.setAttribute('aria-label', 'فتح البحث');
        }
    }
    document.addEventListener('click', event => {
        if (settingsContainer && !settingsContainer.contains(event.target)) {
            settingsContainer.classList.remove('is-open');
            settingsToggle?.setAttribute('aria-expanded', 'false');
            resetSettingsMenuPosition();
        }
        if (headerControls && !headerControls.contains(event.target)) {
            headerControls.classList.remove('search-open');
            searchToggle?.setAttribute('aria-expanded', 'false');
            searchToggle?.setAttribute('aria-label', 'فتح البحث');
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        const shouldFocusSettings = settingsContainer?.classList.contains('is-open');
        const shouldFocusSearch = headerControls?.classList.contains('search-open');
        closeHeaderPopovers();
        if (shouldFocusSettings) settingsToggle?.focus();
        else if (shouldFocusSearch) searchToggle?.focus();
    });

    // --- Homepage news discovery ---
    const searchInput = document.getElementById('news-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchStatus = document.getElementById('search-status');
    let activeFilter = 'all';

    function updateNewsVisibility() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const filterCategories = {
            football: 'كرة القدم',
            basketball: 'كرة السلة',
            tennis: 'التنس',
            olympics: 'الأولمبياد',
            motorsport: 'رياضة المحركات'
        };
        const expectedCategory = (filterCategories[activeFilter] || activeFilter).toLowerCase();
        let visibleCount = 0;
 
        document.querySelectorAll('.news-card').forEach(card => {
            const category = card.querySelector('.category')?.textContent.trim().toLowerCase() || '';
            const text = card.textContent.toLowerCase();
            const articleLink = card.querySelector('a[href*="article.html?id="]');
            const articleId = articleLink ? getArticleIdFromLink(articleLink) : '';
            const articleExists = !articleLink || Boolean(articleCatalog[articleId] && !deletedArticleIds.has(articleId));
            const matchesFilter = activeFilter === 'all' || category === expectedCategory;
            const matchesSearch = !query || text.includes(query);
            const isVisible = articleExists && matchesFilter && matchesSearch;
            card.hidden = !isVisible;
            if (isVisible) visibleCount += 1;
        });

        if (searchStatus) {
            searchStatus.textContent = query || activeFilter !== 'all'
                ? `عرض ${visibleCount} من الأخبار المطابقة`
                : visibleCount ? 'أحدث التغطيات من فريق ظاهر' : 'لا توجد أخبار منشورة حاليًا';
        }
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.filter.toLowerCase();
            filterButtons.forEach(item => item.classList.toggle('active', item === button));
            updateNewsVisibility();
        });
    });

    if (searchInput) searchInput.addEventListener('input', updateNewsVisibility);

    // --- Back to Top Button ---
    const backToTopButton = document.getElementById('back-to-top');

    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) { // Show button after scrolling 300px
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });

        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const body = document.body;

    // --- Settings Dropdown Logic (Theme & Font Size) ---

    // Find buttons in the new settings menu
    const lightModeBtn = document.getElementById('light-mode-btn');
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const fontSmallBtn = document.getElementById('font-small-btn');
    const fontMediumBtn = document.getElementById('font-medium-btn');
    const fontLargeBtn = document.getElementById('font-large-btn');

    // Function to apply theme
    function applyTheme(theme) {
        // Use toggle with a boolean to add/remove the class
        body.classList.toggle('dark-mode', theme === 'dark'); // Apply dark-mode class to body
        // Update button active states
        if (lightModeBtn) lightModeBtn.classList.toggle('active', theme === 'light'); // Set active state for light button
        if (darkModeBtn) darkModeBtn.classList.toggle('active', theme === 'dark'); // Set active state for dark button
        localStorage.setItem('theme', theme);
    }

    // Function to apply font size
    function applyFontSize(size) {
        // Remove all font size classes from body
        ['small', 'medium', 'large'].forEach(s => body.classList.remove(`font-${s}`));
        // Add the correct class
        body.classList.add(`font-${size}`);

        // Update button active states
        if (fontSmallBtn) fontSmallBtn.classList.toggle('active', size === 'small'); // Set active state for small font button
        if (fontMediumBtn) fontMediumBtn.classList.toggle('active', size === 'medium'); // Set active state for medium font button
        if (fontLargeBtn) fontLargeBtn.classList.toggle('active', size === 'large'); // Set active state for large font button

        localStorage.setItem('font-size', size);
    }

    // Apply saved settings on page load
    const savedTheme = localStorage.getItem('theme') || 'light'; // Get saved theme or default to light
    applyTheme(savedTheme);

    const savedFontSize = localStorage.getItem('font-size') || 'medium'; // Get saved font size or default to medium
    applyFontSize(savedFontSize); // Apply saved font size

    // Add event listeners if the buttons exist on the page
    if (lightModeBtn) lightModeBtn.addEventListener('click', () => applyTheme('light'));
    if (darkModeBtn) darkModeBtn.addEventListener('click', () => applyTheme('dark'));
    if (fontSmallBtn) fontSmallBtn.addEventListener('click', () => applyFontSize('small'));
    if (fontMediumBtn) fontMediumBtn.addEventListener('click', () => applyFontSize('medium'));
    if (fontLargeBtn) fontLargeBtn.addEventListener('click', () => applyFontSize('large'));

    // --- Featured Article Slider Logic ---
    let currentSlideIndex = 0; // Start with the first slide (0-indexed)
    const slides = document.querySelectorAll('.featured-articles-slider .featured-article');
    const dots = document.querySelectorAll('.slider-dots .dot');
    let slideInterval;

    function showSlide(n) {
        // Ensure there are slides to show
        if (slides.length === 0) return;

        // Wrap around if index goes out of bounds
        currentSlideIndex = (n + slides.length) % slides.length; // Ensure index stays within bounds

        // Hide all slides and deactivate all dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlideIndex);
            dot.setAttribute('aria-pressed', String(index === currentSlideIndex));
        });

        // Display the current slide and activate the corresponding dot
        slides[currentSlideIndex].classList.add('active');
    }

    function startSlideShow() { // Function to start/reset the slideshow interval
        clearInterval(slideInterval); // Clear any existing interval to prevent multiple timers
        slideInterval = setInterval(() => {
            showSlide(currentSlideIndex + 1); // Move to the next slide
        }, 35000); // Change slide every 35 seconds
    }

    // Initialize the first slide and start the automatic slideshow
    if (slides.length > 0) {
        showSlide(0); // Show the first slide immediately
        startSlideShow();
    }

    // Add click functionality to dots for manual navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index); // Show the slide corresponding to the clicked dot
            startSlideShow(); // Reset the timer when user manually navigates
        });
    });

    // --- Video Modal Logic ---
    const videoCards = document.querySelectorAll('.video-card');
    const videoModal = document.getElementById('video-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const videoIframe = document.getElementById('video-iframe');

    function openModal(videoSrc) {
        if (videoModal && videoIframe) {
            const separator = videoSrc.includes('?') ? '&' : '?';
            videoIframe.src = `${videoSrc}${separator}autoplay=1`; // Set video source and autoplay
            videoIframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
            videoModal.classList.add('active'); // Show the modal
            body.classList.add('modal-open'); // Prevent scrolling on body
        }
    }

    function closeModal() {
        if (videoModal && videoIframe) {
            videoIframe.src = ''; // Stop the video by clearing its source
            videoModal.classList.remove('active'); // Hide the modal
            body.classList.remove('modal-open'); // Re-enable scrolling on body
        }
    }

    videoCards.forEach(card => {
        const playCard = () => {
            const videoSrc = card.getAttribute('data-video-src');
            if (videoSrc) {
                openModal(videoSrc);
            }
        };
        card.addEventListener('click', playCard);
        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                playCard();
            }
        });
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (videoModal) { // Check if modal exists before adding event listener
        // Close modal if user clicks outside the video content
        videoModal.addEventListener('click', (event) => {
            if (event.target === videoModal) {
                closeModal();
            }
        });
    }

    // --- Weather Update Logic (Simulated) ---
    function updateWeather() {
        const weatherCards = document.querySelectorAll('.weather-card strong');
        weatherCards.forEach(card => {
            // Get the current temperature as a number
            let currentTemp = parseInt(card.textContent);
            // Generate a random change between -2 and +2
            let change = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
            // Calculate the new temperature
            let newTemp = currentTemp + change;
            // Update the text content
            card.textContent = newTemp + '°';
        });
    }

    // Update weather on page load and then every 24 hours
    updateWeather(); // Perform initial update when the page loads
    setInterval(updateWeather, 24 * 60 * 60 * 1000); // Schedule updates every 24 hours

    // --- Dynamic Article Loading for article.html ---
    if (document.querySelector('.article-page')) renderArticlePage(true);

    // --- Dynamic Category Page Loading ---
    if (document.body.classList.contains('category-page')) {
        const categoryName = document.body.dataset.category;
        if (categoryName) {
            loadCategoryArticles(categoryName);
        }
    }

    // --- Function to load articles on category pages ---
    function loadCategoryArticles(category) {
        const articlesGrid = document.querySelector('.articles-grid');
        if (!articlesGrid || typeof articlesData === 'undefined') return;

        const sportCategories = new Set(['كرة القدم', 'كرة السلة', 'التنس', 'الأولمبياد', 'رياضة المحركات', 'الفورمولا 1', 'السباحة', 'الكرة الطائرة']);
        const categoryArticles = Object.entries(articlesData)
            .filter(([id, article]) => category === 'رياضة'
                ? article.category === category || sportCategories.has(article.category)
                : article.category === category)
            .map(([id, article]) => ({ id, ...article }));

        if (categoryArticles.length > 0) {
            articlesGrid.innerHTML = categoryArticles.map(article => `
                <article class="news-card">
                    <a href="article.html?id=${article.id}">
                        <img src="${article.image}" alt="${article.title}">
                    </a>
                    <div class="card-content">
                        <span class="category">${article.category}</span>
                        <h3><a href="article.html?id=${article.id}">${article.title}</a></h3>
                        <p>${stripHtml(article.body).substring(0, 100)}...</p>
                        <a href="article.html?id=${article.id}" class="read-more">اقرأ المزيد</a>
                    </div>
                </article>
            `).join('');
        } else {
            articlesGrid.innerHTML = '<p>لا توجد مقالات في هذا القسم حاليًا.</p>';
        }
    }

    // --- Function to load related articles ---
    function loadRelatedArticles(category, currentArticleId) {
        const relatedGrid = document.querySelector('.related-articles .articles-grid');
        if (!relatedGrid || typeof articlesData === 'undefined') return;

        const related = Object.entries(articlesData)
            .filter(([id, article]) => article.category === category && id !== currentArticleId)
            .slice(0, 3) // Get first 3
            .map(([id, article]) => ({ id, ...article }));

        if (related.length > 0) {
            relatedGrid.innerHTML = related.map(article => `
                <article class="news-card">
                    <a href="article.html?id=${article.id}">
                        <img src="${article.image}" alt="${article.title}">
                    </a>
                    <div class="card-content">
                        <span class="category">${article.category}</span>
                        <h3><a href="article.html?id=${article.id}">${article.title}</a></h3>
                        <p>${stripHtml(article.body).substring(0, 100)}...</p>
                        <a href="article.html?id=${article.id}" class="read-more">اقرأ المزيد</a>
                    </div>
                </article>
            `).join('');
        } else {
            const relatedSection = document.querySelector('.related-articles');
            if (relatedSection) relatedSection.hidden = true;
        }
    }

    // --- Function to handle comment form submission ---
    function setupCommentForm(articleId) {
        const commentForm = document.getElementById('comment-form');
        const commentsList = document.getElementById('comments-list');
        if (!commentForm || !commentsList) return;
        if (window.location.protocol === 'file:') {
            const submitButton = commentForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'يتطلب خادمًا';
                submitButton.title = 'شغّل الموقع عبر PHP لحفظ التعليقات';
            }
            return;
        }

        fetch(`api/comments.php?id=${encodeURIComponent(articleId)}`)
            .then(response => response.ok ? response.json() : null)
            .then(result => {
                if (!result || !Array.isArray(result.comments)) return;
                commentsList.innerHTML = result.comments.map(comment => `
                    <div class="comment-item"><p class="comment-author">${escapeHtml(comment.name)}</p><p class="comment-body">${escapeHtml(comment.body)}</p></div>
                `).join('');
            })
            .catch(() => {});

        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nameInput = document.getElementById('comment-name');
            const bodyInput = document.getElementById('comment-body');

            const name = nameInput.value.trim();
            const body = bodyInput.value.trim();

            if (!name || !body) return;
            fetch('api/comments.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: articleId, name, body })
            }).then(response => {
                if (!response.ok) throw new Error('Comment service unavailable');
                const newComment = document.createElement('div');
                newComment.className = 'comment-item';
                newComment.innerHTML = `<p class="comment-author">${escapeHtml(name)}</p><p class="comment-body">${escapeHtml(body)}</p>`;
                commentsList.prepend(newComment);
                nameInput.value = '';
                bodyInput.value = '';
            }).catch(() => {
                bodyInput.setCustomValidity('تعذر حفظ التعليق. شغّل الموقع على خادم PHP.');
                bodyInput.reportValidity();
                bodyInput.setCustomValidity('');
            });
        });
    }

    // --- Utility function to strip HTML tags for excerpts ---
    function stripHtml(html) {
        let tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    // --- Utility function to escape HTML to prevent XSS ---
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- Local account, notifications, and account icon ---
    const usersStorageKey = 'zaher-users';
    const sessionStorageKey = 'zaher-session';
    const ownerEmail = 'omarmamoun2004@gmail.com';

    function authApiPath() { return window.location.pathname.includes('/login/') ? '../api/auth.php' : 'api/auth.php'; }
    async function requestAuth(payload, csrfToken = '') {
        const headers = { 'Content-Type': 'application/json' };
        if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
        let response;
        try {
            response = await fetch(authApiPath(), { method: 'POST', headers, credentials: 'same-origin', body: JSON.stringify(payload) });
        } catch (error) {
            throw new Error('تعذر الاتصال بخادم الحسابات. افتح الموقع عبر http://localhost:8080 وشغّل start-php-server.cmd.');
        }
        const text = await response.text();
        let result;
        try { result = JSON.parse(text); } catch (error) { throw new Error('الخادم لا يشغّل PHP أو أن مسار API غير صحيح. شغّل الموقع عبر start-php-server.cmd.'); }
        if (!response.ok) throw new Error(result.error || 'تعذر تنفيذ عملية الحساب');
        return result;
    }
    const seenArticlesStorageKey = 'zaher-seen-articles';
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resetForm = document.getElementById('reset-form');
    const authMessage = document.getElementById('auth-message');
    const authTabs = document.querySelectorAll('[data-auth-tab]');

    function getUsers() {
        try {
            const users = JSON.parse(localStorage.getItem(usersStorageKey)) || [];
            return users.map(user => { const { password, ...safeUser } = user; return safeUser; });
        } catch (error) { return []; }
    }

    function getSession() {
        try { return JSON.parse(localStorage.getItem(sessionStorageKey)); } catch (error) { return null; }
    }

    function showAuthMessage(message, type) {
        if (!authMessage) return;
        authMessage.textContent = message;
        authMessage.className = `auth-message ${type || ''}`;
    }

    function setAuthTab(tabName) {
        authTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.authTab === tabName));
        if (loginForm) loginForm.hidden = tabName !== 'login';
        if (registerForm) registerForm.hidden = tabName !== 'register';
        if (resetForm) resetForm.hidden = true;
        showAuthMessage('');
    }

    authTabs.forEach(tab => tab.addEventListener('click', () => setAuthTab(tab.dataset.authTab)));

    function showResetForm() {
        if (loginForm) loginForm.hidden = true;
        if (registerForm) registerForm.hidden = true;
        if (resetForm) resetForm.hidden = false;
        authTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.authTab === 'login'));
        showAuthMessage('أدخل بريدك الإلكتروني لإرسال رمز استرجاع صالح لمدة 15 دقيقة.');
    }

    document.getElementById('forgot-password')?.addEventListener('click', showResetForm);
    document.getElementById('back-to-login')?.addEventListener('click', () => setAuthTab('login'));
    document.getElementById('request-reset')?.addEventListener('click', async () => {
        const email = document.getElementById('reset-email').value.trim().toLowerCase();
        if (!email) { showAuthMessage('اكتب البريد الإلكتروني أولاً.', 'error'); return; }
        try { const result = await requestAuth({ action: 'request_reset', email }); showAuthMessage(result.message, 'success'); } catch (error) { showAuthMessage(error.message, 'error'); }
    });
    resetForm?.addEventListener('submit', async event => {
        event.preventDefault();
        const password = document.getElementById('reset-password').value;
        if (password !== document.getElementById('reset-password-confirm').value) { showAuthMessage('كلمتا المرور غير متطابقتين.', 'error'); return; }
        try {
            const result = await requestAuth({ action: 'reset_password', email: document.getElementById('reset-email').value.trim().toLowerCase(), token: document.getElementById('reset-token').value.trim(), password });
            showAuthMessage(result.message, 'success');
            setTimeout(() => setAuthTab('login'), 900);
        } catch (error) { showAuthMessage(error.message, 'error'); }
    });
    const resetParams = new URLSearchParams(window.location.search);
    if (resetParams.get('reset') === '1') {
        showResetForm();
        document.getElementById('reset-email').value = resetParams.get('email') || '';
        document.getElementById('reset-token').value = resetParams.get('token') || '';
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async event => {
            event.preventDefault();
            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim().toLowerCase();
            const password = document.getElementById('register-password').value;
            const wantsNotifications = document.getElementById('register-notifications').checked;
            try {
                const result = await requestAuth({ action: 'register', name, email, password, wantsNotifications });
                localStorage.setItem(usersStorageKey, JSON.stringify([...getUsers().filter(user => user.email !== email), { name, email, wantsNotifications, avatar: null }]));
                localStorage.setItem(sessionStorageKey, JSON.stringify(result.user));
                showAuthMessage('تم إنشاء حسابك بنجاح. سيتم تحويلك إلى الأخبار.', 'success');
                setTimeout(() => { window.location.href = '../index.html'; }, 700);
            } catch (error) { showAuthMessage(error.message, 'error'); }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async event => {
            event.preventDefault();
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;
            try {
                const result = await requestAuth({ action: 'login', email, password });
                localStorage.setItem(sessionStorageKey, JSON.stringify(result.user));
                showAuthMessage('تم تسجيل الدخول. أهلاً بك في ظاهر.', 'success');
                setTimeout(() => { window.location.href = '../index.html'; }, 700);
            } catch (error) { showAuthMessage(error.message, 'error'); }
        });
    }

    const homepageAlertsButton = document.getElementById('homepage-alerts-button');
    const homepageAlertsMessage = document.getElementById('homepage-alerts-message');
    if (homepageAlertsButton) {
        const existingSession = getSession();
        if (existingSession?.wantsNotifications) {
            homepageAlertsButton.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> التنبيهات مفعّلة';
            homepageAlertsButton.disabled = true;
        }
        homepageAlertsButton.addEventListener('click', () => {
            const session = getSession();
            if (!session) {
                window.location.href = 'login/login.html';
                return;
            }
            const users = getUsers();
            const user = users.find(item => item.email === session.email);
            if (!user) return;
            user.wantsNotifications = true;
            session.wantsNotifications = true;
            localStorage.setItem(usersStorageKey, JSON.stringify(users));
            localStorage.setItem(sessionStorageKey, JSON.stringify(session));
            homepageAlertsButton.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> التنبيهات مفعّلة';
            homepageAlertsButton.disabled = true;
            if (homepageAlertsMessage) {
                homepageAlertsMessage.textContent = 'ستصلك الأخبار الجديدة فور نشرها.';
                homepageAlertsMessage.className = 'alerts-message success';
            }
        });
    }

    function getNewArticles() {
        if (typeof articlesData === 'undefined') return [];
        let seenArticles = [];
        try { seenArticles = JSON.parse(localStorage.getItem(seenArticlesStorageKey)) || []; } catch (error) { seenArticles = []; }
        return Object.entries(articlesData).filter(([id]) => !seenArticles.includes(id)).map(([id, article]) => ({ id, ...article }));
    }

    function markArticlesAsSeen() {
        if (typeof articlesData === 'undefined') return;
        localStorage.setItem(seenArticlesStorageKey, JSON.stringify(Object.keys(articlesData)));
    }

    function renderAccountControl() {
        const headerControls = document.querySelector('.header-right-controls');
        const railAccountSlot = document.querySelector('.site-utility-rail [data-utility-action="account"]');
        if ((!headerControls && !railAccountSlot) || document.querySelector('.account-container')) return;
        const session = getSession();
        const isAdmin = session?.role === 'owner' || session?.role === 'admin' || session?.email?.toLowerCase() === ownerEmail;
        const newArticles = session?.wantsNotifications ? getNewArticles() : [];
        const account = document.createElement('div');
        account.className = railAccountSlot ? 'account-container site-utility-account' : 'account-container';
        const avatarMarkup = session?.avatar
            ? `<img class="account-avatar" src="${session.avatar}" alt="صورة ${escapeHtml(session.name)}">`
            : '<i class="fas fa-user" aria-hidden="true"></i>';
        account.innerHTML = session ? `
            <button class="account-button" type="button" aria-label="حساب ${escapeHtml(session.name)}">
                ${avatarMarkup}<span>${escapeHtml(session.name)}</span>${newArticles.length ? `<b>${newArticles.length}</b>` : ''}
            </button>
            <div class="account-menu">
                <strong>مرحبًا ${escapeHtml(session.name)}</strong>
                <span>${newArticles.length ? `لديك ${newArticles.length} خبر جديد` : 'لا توجد أخبار جديدة'}</span>
                <a href="${window.location.pathname.includes('/login/') ? '../index.html' : 'login/login.html'}">صندوق الأخبار</a>
                ${isAdmin ? '<a href="admin/admin.html" class="admin-link">لوحة تحكم الأدمن</a>' : ''}
                <button type="button" class="profile-settings-button">إعدادات الحساب</button>
                <button type="button" class="logout-button">تسجيل الخروج</button>
            </div>` : `
            <a class="account-button" href="${window.location.pathname.includes('/login/') ? '#' : 'login/login.html'}" aria-label="تسجيل الدخول"><i class="fas fa-user" aria-hidden="true"></i><span>حسابي</span></a>`;
        if (railAccountSlot) railAccountSlot.replaceWith(account);
        else headerControls.prepend(account);
        const accountToggle = account.querySelector('.account-button');
        if (account.querySelector('.account-menu')) {
            accountToggle.setAttribute('aria-expanded', 'false');
            accountToggle.addEventListener('click', () => {
                const isOpen = account.classList.toggle('is-open');
                accountToggle.setAttribute('aria-expanded', String(isOpen));
            });
        }
        account.querySelector('.logout-button')?.addEventListener('click', async () => {
            try { await requestAuth({ action: 'logout' }); } catch (error) { /* Clear the local view even if the server is unavailable. */ }
            localStorage.removeItem(sessionStorageKey);
            window.location.reload();
        });
        account.querySelector('.profile-settings-button')?.addEventListener('click', () => openAccountSettings(session));
        if (newArticles.length) {
            accountToggle.addEventListener('click', markArticlesAsSeen, { once: true });
        }
    }

    function openAccountSettings(session) {
        let modal = document.getElementById('account-settings-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'account-settings-modal';
            modal.className = 'account-modal';
            modal.innerHTML = `
                <div class="account-modal-panel" role="dialog" aria-modal="true" aria-labelledby="account-settings-title">
                    <button class="account-modal-close" type="button" aria-label="إغلاق">&times;</button>
                    <h2 id="account-settings-title">إعدادات الحساب</h2>
                    <form id="profile-form" class="profile-form">
                        <div class="profile-avatar-editor">
                            <div class="profile-avatar-preview" id="profile-avatar-preview"></div>
                            <label class="profile-upload-button" for="profile-avatar-input"><i class="fas fa-camera" aria-hidden="true"></i> تغيير الصورة</label>
                            <input id="profile-avatar-input" type="file" accept="image/png,image/jpeg,image/webp" hidden>
                        </div>
                        <div class="form-group"><label for="profile-name">الاسم الكامل</label><input id="profile-name" type="text" minlength="2" required></div>
                        <div class="form-group"><label for="profile-email">البريد الإلكتروني</label><input id="profile-email" type="email" readonly></div>
                        <div class="form-group"><label for="profile-password">كلمة مرور جديدة <small>(اختياري)</small></label><input id="profile-password" type="password" minlength="8" placeholder="اتركها فارغة دون تغيير"></div>
                        <label class="auth-check"><input id="profile-notifications" type="checkbox"> أرسل لي تنبيهًا عند نشر أخبار جديدة</label>
                        <p id="profile-message" class="auth-message" role="status"></p>
                        <button class="submit-btn auth-submit" type="submit">حفظ التعديلات</button>
                    </form>
                </div>`;
            document.body.appendChild(modal);
            modal.querySelector('.account-modal-close').addEventListener('click', () => modal.classList.remove('active'));
            modal.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('active'); });

            modal.querySelector('#profile-avatar-input').addEventListener('change', event => {
                const file = event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => { modal.dataset.avatar = reader.result; renderProfileAvatar(reader.result); };
                reader.readAsDataURL(file);
            });
            modal.querySelector('#profile-form').addEventListener('submit', async event => {
                event.preventDefault();
                const name = modal.querySelector('#profile-name').value.trim();
                const password = modal.querySelector('#profile-password').value;
                const wantsNotifications = modal.querySelector('#profile-notifications').checked;
                const selectedAvatar = modal.dataset.avatar || null;
                const message = modal.querySelector('#profile-message');
                try {
                    const result = await requestAuth({ action: 'update_profile', name, password, wantsNotifications }, session.csrf);
                    localStorage.setItem(sessionStorageKey, JSON.stringify({ ...result.user, avatar: selectedAvatar }));
                    message.textContent = 'تم حفظ التعديلات.';
                    message.className = 'auth-message success';
                    setTimeout(() => window.location.reload(), 500);
                } catch (error) { message.textContent = error.message; message.className = 'auth-message error'; }
            });
        }
        const avatar = session.avatar || '';
        modal.querySelector('#profile-name').value = session.name;
        modal.querySelector('#profile-email').value = session.email;
        modal.querySelector('#profile-password').value = '';
        modal.querySelector('#profile-notifications').checked = session.wantsNotifications !== false;
        modal.querySelector('#profile-message').textContent = '';
        modal.querySelector('#profile-message').className = 'auth-message';
        modal.dataset.avatar = avatar;
        modal.classList.add('active');
        renderProfileAvatar(avatar);
    }

    function renderProfileAvatar(avatar) {
        const preview = document.getElementById('profile-avatar-preview');
        if (!preview) return;
        preview.innerHTML = avatar ? `<img src="${avatar}" alt="الصورة الشخصية">` : '<i class="fas fa-user" aria-hidden="true"></i>';
    }

    function renderArticleVideo(videoUrl) {
        const container = document.getElementById('article-video');
        if (!container || !videoUrl) return;
        try {
            const url = new URL(videoUrl, window.location.href);
            let embedUrl = url.href;
            let isYouTube = false;
            let isVimeo = false;
            
            // Extract video ID from different YouTube URL formats
            if (url.hostname.includes('youtu.be')) {
                const videoId = url.pathname.slice(1).split('?')[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
                isYouTube = true;
            } else if (url.hostname.includes('youtube.com')) {
                const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
                isYouTube = true;
            } else if (url.hostname.includes('vimeo.com')) {
                isVimeo = true;
                embedUrl = `https://player.vimeo.com/video/${url.pathname.split('/').pop()}`;
            }
            
            // Create and insert iframe for YouTube and Vimeo
            if (isYouTube || isVimeo) {
                const iframe = document.createElement('iframe');
                iframe.src = embedUrl;
                iframe.title = 'فيديو الخبر';
                iframe.width = '100%';
                iframe.height = '400';
                iframe.style.borderRadius = '8px';
                iframe.style.marginBottom = '20px';
                iframe.frameBorder = '0';
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                iframe.setAttribute('allowfullscreen', 'true');
                iframe.loading = 'lazy';
                container.innerHTML = '';
                container.appendChild(iframe);
            } else {
                // For other video types, use HTML5 video element
                const video = document.createElement('video');
                video.src = embedUrl;
                video.controls = true;
                video.preload = 'metadata';
                video.style.width = '100%';
                video.style.borderRadius = '8px';
                video.style.marginBottom = '20px';
                container.innerHTML = '';
                container.appendChild(video);
            }
            container.hidden = false;
        } catch (error) {
            console.error('Error rendering video:', error);
            container.hidden = true;
        }
    }

    function getArticleIdFromLink(link) {
        try { return new URL(link.href, window.location.href).searchParams.get('id') || ''; }
        catch (error) { return ''; }
    }

    function readSavedArticleIds(serialized = null) {
        try {
            const stored = serialized === null ? localStorage.getItem(savedArticleStorageKey) : serialized;
            const parsed = JSON.parse(stored || '[]');
            return Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string') : [];
        } catch (error) {
            return [];
        }
    }

    function updateBookmarkButtons() {
        document.querySelectorAll('.save-article-button[data-article-id]').forEach(button => {
            const isSaved = savedArticleIds.has(button.dataset.articleId);
            button.classList.toggle('is-saved', isSaved);
            button.setAttribute('aria-pressed', String(isSaved));
            button.setAttribute('aria-label', isSaved ? 'إزالة الخبر من المحفوظات' : 'حفظ الخبر');
            button.title = isSaved ? 'إزالة من المحفوظات' : 'حفظ الخبر';
            const label = button.querySelector('span');
            if (label) label.textContent = isSaved ? 'محفوظ' : 'حفظ';
        });
    }

    function updateSavedCountBadge() {
        const badge = document.querySelector('.main-nav .saved-count');
        if (!badge) return;
        badge.textContent = savedArticleIds.size.toLocaleString('ar-EG');
        badge.hidden = savedArticleIds.size === 0;
    }

    function toggleSavedArticle(articleId) {
        if (!articleCatalog[articleId] || deletedArticleIds.has(articleId)) return;
        if (savedArticleIds.has(articleId)) savedArticleIds.delete(articleId);
        else savedArticleIds.add(articleId);
        try { localStorage.setItem(savedArticleStorageKey, JSON.stringify([...savedArticleIds])); }
        catch (error) { return; }
        updateBookmarkButtons();
        updateSavedCountBadge();
        renderSavedArticles();
    }

    function renderSavedArticles() {
        const grid = document.getElementById('saved-articles-grid');
        const status = document.getElementById('saved-articles-status');
        if (!grid || !status) return;

        const validIds = [...savedArticleIds].filter(id => articleCatalog[id] && !deletedArticleIds.has(id));
        grid.replaceChildren();
        validIds.forEach(id => {
            const article = articleCatalog[id];
            const card = document.createElement('article');
            card.className = 'news-card';
            const content = document.createElement('div');
            content.className = 'card-content';
            const category = document.createElement('span');
            category.className = 'category';
            category.textContent = article.category || 'أخبار';
            const heading = document.createElement('h3');
            const titleLink = document.createElement('a');
            titleLink.href = `article.html?id=${encodeURIComponent(id)}`;
            titleLink.textContent = article.title;
            heading.append(titleLink);
            const summary = document.createElement('p');
            summary.textContent = stripHtml(article.body || '').trim().slice(0, 140);
            const readMore = document.createElement('a');
            readMore.href = titleLink.href;
            readMore.className = 'read-more';
            readMore.textContent = 'اقرأ الخبر';
            content.append(category, heading, summary, readMore);
            if (article.image) {
                const image = document.createElement('img');
                image.src = article.image;
                image.alt = article.title;
                card.append(image);
            }
            card.append(content);
            grid.append(card);
        });

        grid.hidden = validIds.length === 0;
        status.textContent = validIds.length
            ? `${validIds.length.toLocaleString('ar-EG')} خبر محفوظ على هذا الجهاز.`
            : 'لا توجد أخبار محفوظة. يمكنك حفظ أي خبر من بطاقته لتجده هنا.';
        enhanceArticleCards();
    }

    function renderArticlePage(trackView = false) {
        const articleContainer = document.querySelector('.full-article');
        if (!articleContainer) return;
        const articleId = new URLSearchParams(window.location.search).get('id');
        const article = articleCatalog[articleId];

        if (!article) {
            if (!articleContainer.dataset.initialMarkup) articleContainer.dataset.initialMarkup = articleContainer.innerHTML;
            articleContainer.innerHTML = '<h1>المقال غير موجود</h1><p>عذراً، المقال الذي تبحث عنه غير موجود أو تم حذفه.</p><a href="index.html" class="back-link">العودة إلى الصفحة الرئيسية</a>';
            articleContainer.dataset.unavailable = 'true';
            const relatedSection = document.querySelector('.related-articles');
            if (relatedSection) relatedSection.hidden = true;
            const commentsSection = document.querySelector('.comments-section');
            if (commentsSection) commentsSection.hidden = true;
            document.title = 'خطأ - الخبر غير موجود';
            return;
        }

        if (articleContainer.dataset.unavailable === 'true') {
            articleContainer.innerHTML = articleContainer.dataset.initialMarkup || '';
            delete articleContainer.dataset.unavailable;
        }

        document.title = `${article.title} - منصة ظاهر الإعلامية`;
        document.getElementById('article-category').textContent = article.category;
        document.getElementById('article-title').textContent = article.title;
        document.getElementById('article-date').textContent = `تاريخ النشر: ${article.date}`;
        const image = document.getElementById('article-image');
        image.src = article.image || '';
        image.alt = article.title;
        image.hidden = !article.image;
        document.getElementById('article-body').innerHTML = article.body || '';
        renderArticleVideo(article.video);
        const saveButton = document.getElementById('article-save-button');
        if (saveButton) {
            saveButton.dataset.articleId = articleId;
            saveButton.hidden = false;
            if (trackView) saveButton.addEventListener('click', () => toggleSavedArticle(articleId));
        }
        updateBookmarkButtons();
        const relatedSection = document.querySelector('.related-articles');
        if (relatedSection) relatedSection.hidden = false;
        const commentsSection = document.querySelector('.comments-section');
        if (commentsSection) commentsSection.hidden = false;
        loadRelatedArticles(article.category, articleId);
        if (trackView) {
            trackArticleView(articleId);
            setupCommentForm(articleId);
        }
    }

    function syncLinkedArticleCards() {
        document.querySelectorAll('a[href*="article.html?id="]').forEach(link => {
            const articleId = getArticleIdFromLink(link);
            if (!articleId) return;
            const article = articleCatalog[articleId];
            const item = link.closest('.news-card, .featured-article, .trending-item, .premium-item, .opinion-card, .sidebar-brief > a, .editor-note');
            if (!item) return;
            item.hidden = deletedArticleIds.has(articleId) || !article;
            if (!article || item.hidden) return;
            item.closest('.trending-section, .featured-articles-section, .featured-premium, .latest-news, .most-read-section, .opinion-section, .sidebar-brief')?.removeAttribute('hidden');

            const category = item.querySelector('.category, .category-small');
            if (category) category.textContent = article.category;
            const title = item.querySelector('.card-content h3, .article-content h2, .trending-item strong, .premium-item h4, .opinion-content h3');
            if (title) title.textContent = article.title;
            const image = item.querySelector('img');
            if (image && article.image) {
                image.src = article.image;
                image.alt = article.title;
            }
            const summary = item.querySelector('.card-content p');
            if (summary && article.body) summary.textContent = stripHtml(article.body).trim().slice(0, 140) + '...';
            if (item.matches('.sidebar-brief > a')) {
                [...item.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()).forEach(node => { node.textContent = ` ${article.title} `; });
            }
        });
    }

    function hideEmptyArticleSections() {
        const sections = [
            ['.trending-section', '.trending-item'],
            ['.featured-articles-section', '.featured-article'],
            ['.featured-premium', '.premium-item'],
            ['.latest-news', '.news-card'],
            ['.most-read-section', '.news-card'],
            ['.opinion-section', '.opinion-card'],
            ['.sidebar-brief', ':scope > a']
        ];
        sections.forEach(([sectionSelector, itemSelector]) => {
            const section = document.querySelector(sectionSelector);
            if (!section) return;
            const items = [...section.querySelectorAll(itemSelector)];
            if (items.length && items.every(item => item.hidden || item.closest('[hidden]'))) section.hidden = true;
        });
    }

    function updateArticleHighlights() {
        const articles = Object.values(articleCatalog);
        const count = articles.length;
        document.querySelectorAll('.pulse-strip, .news-pulse').forEach(strip => {
            const countElement = strip.querySelector('strong');
            if (countElement) countElement.textContent = count.toLocaleString('ar-EG');
            if (strip.classList.contains('pulse-strip')) strip.hidden = count === 0;
        });
        const topStory = document.querySelector('.pulse-strip .pulse-item:last-child strong');
        if (topStory && articles.length) topStory.textContent = articles[articles.length - 1].title;
    }

    function addPublishedArticlesToHomepage() {
        const grid = document.querySelector('.latest-news .articles-grid');
        if (!grid) return;
        const existingIds = new Set([...grid.querySelectorAll('a[href*="article.html?id="]')].map(getArticleIdFromLink));
        Object.entries(articleCatalog).forEach(([id, article]) => {
            if (bundledArticleIds.has(id) || deletedArticleIds.has(id) || existingIds.has(id)) return;
            const card = document.createElement('article');
            card.className = 'news-card';
            card.dataset.articleId = id;

            if (article.image) {
                const imageLink = document.createElement('a');
                imageLink.href = `article.html?id=${encodeURIComponent(id)}`;
                const image = document.createElement('img');
                image.src = article.image;
                image.alt = article.title;
                imageLink.append(image);
                card.append(imageLink);
            }

            const content = document.createElement('div');
            content.className = 'card-content';
            const category = document.createElement('span');
            category.className = 'category';
            category.textContent = article.category;
            const heading = document.createElement('h3');
            const titleLink = document.createElement('a');
            titleLink.href = `article.html?id=${encodeURIComponent(id)}`;
            titleLink.textContent = article.title;
            heading.append(titleLink);
            const summary = document.createElement('p');
            summary.textContent = stripHtml(article.body || '').trim().slice(0, 140) + '...';
            const readMore = document.createElement('a');
            readMore.href = `article.html?id=${encodeURIComponent(id)}`;
            readMore.className = 'read-more';
            readMore.textContent = 'اقرأ المزيد';
            content.append(category, heading, summary, readMore);
            card.append(content);
            grid.prepend(card);
            grid.closest('.latest-news')?.removeAttribute('hidden');
        });
    }

    async function loadRemoteArticleOverrides() {
        if (window.location.protocol === 'file:' || typeof articlesData === 'undefined') return;
        try {
            const apiPath = window.location.pathname.includes('/login/') ? '../api/articles.php' : 'api/articles.php';
            const response = await fetch(apiPath, { cache: 'no-store' });
            if (!response.ok) return;
            const payload = await response.json();
            const nextVersion = String(payload.version || '');
            if (nextVersion && nextVersion === articleDataVersion) return;
            articleDataVersion = nextVersion;
            Object.assign(articleCatalog, payload.articles || {});
            deletedArticleIds = new Set((payload.deleted || []).map(String));
            let removedSavedArticle = false;
            deletedArticleIds.forEach(id => {
                delete articleCatalog[id];
                removedSavedArticle = savedArticleIds.delete(id) || removedSavedArticle;
            });
            if (removedSavedArticle) {
                try { localStorage.setItem(savedArticleStorageKey, JSON.stringify([...savedArticleIds])); }
                catch (error) { }
                updateSavedCountBadge();
            }
            syncLinkedArticleCards();
            addPublishedArticlesToHomepage();
            if (document.body.classList.contains('category-page')) loadCategoryArticles(document.body.dataset.category);
            renderArticlePage();
            updateNewsVisibility();
            updateArticleHighlights();
            hideEmptyArticleSections();
            enhanceArticleCards();
            renderSavedArticles();
            if (payload.version) localStorage.setItem('zaher-articles-version', payload.version);
        } catch (error) {
            // Static hosting can continue using the bundled article data.
        }
    }

    function enhanceArticleCards() {
        const cards = document.querySelectorAll('.news-card, .featured-article');
        cards.forEach(card => {
            if (card.hidden || card.querySelector('.article-stats')) return;
            const articleLink = card.querySelector('a[href*="article.html?id="]');
            const articleId = articleLink ? getArticleIdFromLink(articleLink) : '';
            if (!articleId) return;
            const stats = document.createElement('div');
            stats.className = 'article-stats';
            stats.innerHTML = `
                <span class="view-count" title="المشاهدات"><i class="fas fa-eye" aria-hidden="true"></i>0</span>
                <a class="comment-count" href="${articleLink?.getAttribute('href') || '#comments'}#comments" title="التعليقات"><i class="fas fa-comment" aria-hidden="true"></i>0</a>
                <button class="share-article-button" type="button" title="مشاركة الخبر" aria-label="مشاركة الخبر"><i class="fas fa-share-alt" aria-hidden="true"></i><span>0</span></button>
                <button class="save-article-button" type="button" data-article-id="${escapeHtml(articleId)}" aria-pressed="false"><i class="far fa-bookmark" aria-hidden="true"></i><span>حفظ</span></button>`;
            (card.querySelector('.card-content') || card.querySelector('.article-content') || card).appendChild(stats);
            stats.querySelector('.save-article-button').addEventListener('click', () => toggleSavedArticle(articleId));
            loadArticleMetricCount(articleId, 'views', stats.querySelector('.view-count'));
            loadArticleMetricCount(articleId, 'comments', stats.querySelector('.comment-count'));
            loadArticleMetricCount(articleId, 'shares', stats.querySelector('.share-article-button span'));
            stats.querySelector('.share-article-button').addEventListener('click', async () => {
                const url = articleLink?.href || window.location.href;
                try {
                    if (navigator.share) await navigator.share({ title: card.querySelector('h2, h3')?.textContent.trim(), url });
                    else await navigator.clipboard.writeText(url);
                    const response = await fetch('api/views.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: articleId, metric: 'shares' }) });
                    if (response.ok) {
                        const result = await response.json();
                        stats.querySelector('.share-article-button span').textContent = Number(result.views || 0).toLocaleString('ar-EG');
                    }
                } catch (error) {
                    if (error.name !== 'AbortError') stats.querySelector('.share-article-button span').textContent = '0';
                }
            });
        });
        updateBookmarkButtons();
    }

    async function loadArticleMetricCount(articleId, metric, viewElement) {
        if (window.location.protocol === 'file:') return;
        try {
            const endpoint = metric === 'comments' ? 'api/comments.php' : 'api/views.php';
            const response = await fetch(`${endpoint}?id=${encodeURIComponent(articleId)}${metric === 'comments' ? '' : `&metric=${metric}`}`);
            if (!response.ok) return;
            const result = await response.json();
            const count = metric === 'comments' ? result.count : result.views;
            if (Number.isFinite(count)) viewElement.innerHTML = metric === 'views' ? `<i class="fas fa-eye" aria-hidden="true"></i>${count.toLocaleString('ar-EG')}` : count.toLocaleString('ar-EG');
        } catch (error) {
            // Local file mode has no PHP endpoint, so the fallback number remains visible.
        }
    }

    async function trackArticleView(articleId) {
        if (window.location.protocol === 'file:') return;
        try {
            const response = await fetch('api/views.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: articleId, metric: 'views' })
            });
            if (!response.ok) return;
            const result = await response.json();
            const viewElement = document.querySelector('#article-view-count');
            if (viewElement && Number.isFinite(result.views)) viewElement.textContent = result.views.toLocaleString('ar-EG');
        } catch (error) {
            // Local file mode has no PHP endpoint.
        }
    }

    function resolvePublicAdAsset(url) {
        const value = String(url || '').trim();
        if (/^https?:\/\//i.test(value)) return value;
        const relative = value.replace(/^\.\//, '').replace(/^\//, '');
        return `${window.location.pathname.includes('/login/') ? '../' : ''}${relative}`;
    }

    function renderManualAd(ad, placement, parent) {
        const wrapper = document.createElement('aside');
        wrapper.className = `site-ad-banner site-ad-${placement}`;
        wrapper.setAttribute('aria-label', 'إعلان');
        const label = document.createElement('span');
        label.className = 'site-ad-label';
        label.textContent = 'إعلان';
        const link = document.createElement('a');
        link.className = 'site-ad-link';
        link.href = ad.clickUrl;
        link.target = '_blank';
        link.rel = 'sponsored noopener noreferrer';
        link.setAttribute('aria-label', ad.title || 'عرض الإعلان');
        const image = document.createElement('img');
        image.src = resolvePublicAdAsset(ad.imageUrl);
        image.alt = ad.title || 'إعلان';
        image.loading = 'lazy';
        link.append(image);
        wrapper.append(label, link);
        parent.insertBefore(wrapper, parent.querySelector('main'));
        return wrapper;
    }

    function showInterstitialAd(ad) {
        const frequencyKey = 'pixelnews-interstitial-last-shown';
        const now = Date.now();
        let lastShown = 0;
        try { lastShown = Number(localStorage.getItem(frequencyKey)) || 0; } catch (error) { return; }
        if (now - lastShown < 24 * 60 * 60 * 1000 || document.visibilityState !== 'visible') return;

        const dialog = document.createElement('dialog');
        dialog.className = 'site-interstitial-ad';
        dialog.setAttribute('aria-label', 'إعلان');
        const header = document.createElement('div');
        header.className = 'site-interstitial-ad-header';
        const label = document.createElement('span');
        label.textContent = 'إعلان';
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'site-interstitial-ad-close';
        close.setAttribute('aria-label', 'إغلاق الإعلان');
        close.innerHTML = '<i class="fas fa-xmark" aria-hidden="true"></i>';
        header.append(label, close);
        const link = document.createElement('a');
        link.href = ad.clickUrl;
        link.target = '_blank';
        link.rel = 'sponsored noopener noreferrer';
        link.setAttribute('aria-label', ad.title || 'عرض الإعلان');
        const image = document.createElement('img');
        image.src = resolvePublicAdAsset(ad.imageUrl);
        image.alt = ad.title || 'إعلان';
        link.append(image);
        const title = document.createElement('p');
        title.className = 'site-interstitial-ad-title';
        title.textContent = ad.title || '';
        dialog.append(header, link, title);
        document.body.append(dialog);

        const closeDialog = () => {
            if (dialog.open) dialog.close();
            dialog.remove();
        };
        close.addEventListener('click', closeDialog);
        dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
        dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
        try {
            dialog.showModal();
            localStorage.setItem(frequencyKey, String(now));
        } catch (error) { dialog.remove(); }
    }

    function renderAdSenseUnit(config, parent) {
        if (!config?.enabled || !/^ca-pub-[0-9]{16}$/.test(config.publisherId || '') || !/^[0-9]{5,20}$/.test(String(config.slotId || ''))) return;
        const wrapper = document.createElement('aside');
        wrapper.className = 'site-ad-banner site-adsense-banner';
        wrapper.setAttribute('aria-label', 'إعلان');
        const label = document.createElement('span');
        label.className = 'site-ad-label';
        label.textContent = 'إعلان';
        const unit = document.createElement('ins');
        unit.className = 'adsbygoogle';
        unit.style.display = 'block';
        unit.dataset.adClient = config.publisherId;
        unit.dataset.adSlot = String(config.slotId);
        unit.dataset.adFormat = 'auto';
        unit.dataset.fullWidthResponsive = 'true';
        wrapper.append(label, unit);
        parent.insertBefore(wrapper, parent.querySelector('main'));

        let loader = document.querySelector('script[data-pixelnews-adsense]');
        const requestAd = () => {
            try { (window.adsbygoogle = window.adsbygoogle || []).push({}); }
            catch (error) { wrapper.remove(); }
        };
        if (!loader) {
            loader = document.createElement('script');
            loader.async = true;
            loader.crossOrigin = 'anonymous';
            loader.dataset.pixelnewsAdsense = 'true';
            loader.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.publisherId)}`;
            loader.addEventListener('load', requestAd, { once: true });
            loader.addEventListener('error', () => wrapper.remove(), { once: true });
            document.head.append(loader);
        } else if (window.adsbygoogle) requestAd();
        else loader.addEventListener('load', requestAd, { once: true });
    }

    async function loadSiteAds() {
        if (window.location.protocol === 'file:') return;
        const parent = document.body;
        if (!parent.querySelector('main')) return;
        const apiPath = window.location.pathname.includes('/login/') ? '../api/ads.php' : 'api/ads.php';
        try {
            const response = await fetch(apiPath, { cache: 'no-store' });
            if (!response.ok) return;
            const result = await response.json();
            const ads = Array.isArray(result.ads) ? result.ads : [];
            ads.filter(ad => ad.active && ['banner', 'both'].includes(ad.placement)).slice(0, 2).forEach(ad => renderManualAd(ad, 'banner', parent));
            renderAdSenseUnit(result.adsense, parent);
            const interstitial = ads.find(ad => ad.active && ['interstitial', 'both'].includes(ad.placement));
            if (interstitial) window.setTimeout(() => showInterstitialAd(interstitial), 20000);
        } catch (error) {
            // Ads are optional; public pages remain usable if the ads endpoint is unavailable.
        }
    }

    function renderSiteUtilityRail() {
        if (document.querySelector('.site-utility-rail')) return;
        const relativePrefix = window.location.pathname.includes('/login/') ? '../' : '';
        const isReelsPage = document.body.classList.contains('reels-page');
        const rail = document.createElement('aside');
        rail.className = 'site-utility-rail';
        rail.setAttribute('aria-label', 'أدوات Pixel News');
        rail.innerHTML = `
            <a class="site-utility-button" href="${relativePrefix}${isReelsPage ? 'index.html' : 'reels.html'}" aria-label="${isReelsPage ? 'العودة إلى الصفحة الرئيسية' : 'الريلز'}" title="${isReelsPage ? 'العودة إلى الرئيسية' : 'الريلز'}"><i class="fas ${isReelsPage ? 'fa-house' : 'fa-clapperboard'}" aria-hidden="true"></i></a>
            <button class="site-utility-button" type="button" data-utility-action="account" aria-label="الحساب" title="الحساب"><i class="fas fa-user" aria-hidden="true"></i></button>
            <button class="site-utility-button" type="button" data-utility-action="settings" aria-label="الإعدادات" aria-expanded="false" aria-controls="site-utility-settings" title="الإعدادات"><i class="fas fa-sliders" aria-hidden="true"></i></button>
            <button class="site-utility-button site-ai-launcher" type="button" data-utility-action="chat" aria-label="محادثة مساعد Pixel News" aria-expanded="false" aria-controls="site-ai-chat" title="مساعد Pixel News"><i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i></button>`;

        const settingsPanel = document.createElement('section');
        settingsPanel.id = 'site-utility-settings';
        settingsPanel.className = 'site-utility-settings';
        settingsPanel.hidden = true;
        settingsPanel.setAttribute('aria-label', 'إعدادات العرض');
        settingsPanel.innerHTML = `
            <div class="site-utility-panel-heading"><strong>إعدادات العرض</strong><button type="button" class="site-utility-close" aria-label="إغلاق الإعدادات"><i class="fas fa-xmark" aria-hidden="true"></i></button></div>
            <div class="site-utility-setting-group"><span>الوضع</span><div><button type="button" data-utility-theme="light">فاتح</button><button type="button" data-utility-theme="dark">داكن</button></div></div>
            <div class="site-utility-setting-group"><span>حجم الخط</span><div><button type="button" data-utility-font="small">صغير</button><button type="button" data-utility-font="medium">متوسط</button><button type="button" data-utility-font="large">كبير</button></div></div>`;

        const chatPanel = document.createElement('section');
        chatPanel.id = 'site-ai-chat';
        chatPanel.className = 'site-ai-chat';
        chatPanel.hidden = true;
        chatPanel.setAttribute('role', 'dialog');
        chatPanel.setAttribute('aria-modal', 'false');
        chatPanel.setAttribute('aria-labelledby', 'site-ai-chat-title');
        chatPanel.innerHTML = `
            <header class="site-ai-chat-header"><div><span class="site-ai-chat-mark"><i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i></span><span><strong id="site-ai-chat-title">مساعد Pixel News</strong><small>مساعد محلي لمحتوى الموقع</small></span></div><button type="button" class="site-utility-close" data-close-chat aria-label="إغلاق المحادثة"><i class="fas fa-xmark" aria-hidden="true"></i></button></header>
            <p class="site-ai-chat-intro">أبحث في أخبار وأقسام Pixel News وأجيب من المحتوى المنشور فقط.</p>
            <div class="site-ai-chat-log" role="log" aria-live="polite" aria-relevant="additions text"><div class="site-ai-message assistant">مرحبًا، أنا مساعد Pixel News. كيف أساعدك؟</div></div>
            <div class="site-ai-suggestions"><button type="button" data-ai-prompt="لخّص الخبر المعروض لي">لخّص هذا الخبر</button><button type="button" data-ai-prompt="ما الأخبار المنشورة في هذا القسم؟">أخبار هذا القسم</button></div>
            <form class="site-ai-chat-form"><textarea id="site-ai-chat-input" name="message" aria-label="اكتب سؤالك لمساعد Pixel News" rows="2" maxlength="1500" placeholder="اكتب سؤالك..." required></textarea><button type="submit" aria-label="إرسال الرسالة"><i class="fas fa-paper-plane" aria-hidden="true"></i></button></form>
            <p class="site-ai-chat-status" role="status" aria-live="polite"></p>`;

        document.body.append(rail, settingsPanel, chatPanel);
        document.querySelector('.site-header .settings-container')?.remove();

        const settingsButton = rail.querySelector('[data-utility-action="settings"]');
        const chatButton = rail.querySelector('[data-utility-action="chat"]');
        const getAccountContainer = () => document.querySelector('.site-utility-account');
        const getAccountToggle = () => getAccountContainer()?.querySelector('.account-button');
        const settingsCloseButton = settingsPanel.querySelector('.site-utility-close');
        const chatCloseButton = chatPanel.querySelector('[data-close-chat]');
        const chatLog = chatPanel.querySelector('.site-ai-chat-log');
        const chatForm = chatPanel.querySelector('.site-ai-chat-form');
        const chatInput = chatPanel.querySelector('#site-ai-chat-input');
        const chatStatus = chatPanel.querySelector('.site-ai-chat-status');
        let chatHistory = [];
        let chatPending = false;

        const siteCategories = ['سياسة', 'اقتصاد', 'رياضة', 'تكنولوجيا', 'العالم', 'السياحة', 'البيئة', 'الثقافة والفنون', 'المشاهير', 'المناسبات والوفيات'];
        const stopWords = new Set(['في', 'من', 'عن', 'على', 'الى', 'إلى', 'ما', 'ماذا', 'كيف', 'هل', 'هو', 'هي', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'مع', 'او', 'أو', 'و', 'يا', 'لي', 'لو', 'كل', 'كان', 'تكون', 'يكون', 'انا', 'أنا', 'انت', 'أنت', 'اريد', 'أريد', 'اعرف', 'أعرف', 'اخبرني', 'أخبرني', 'اشرح', 'فضلا', 'رجاء']);

        function normalizeAssistantText(value) {
            return String(value || '').normalize('NFKC').toLowerCase()
                .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
                .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
                .replace(/[^\p{L}\p{N}\s]/gu, ' ')
                .split(/\s+/).filter(Boolean);
        }

        function answerFromSiteContent(question) {
            const normalizedQuestion = normalizeAssistantText(question).join(' ');
            const greeting = /^(مرحبا|اهلا|السلام عليكم|صباح الخير|مساء الخير|شكرا|شكرًا)/.test(normalizedQuestion);
            if (greeting) return 'أهلًا بك! أستطيع البحث في الأخبار المنشورة وشرح الأقسام ومحتوى المقالات الموجودة في الموقع.';
            if (/من انت|من انت|مساعد الموقع|ماذا تستطيع|كيف تساعد/.test(normalizedQuestion)) {
                return 'أنا مساعد Pixel News المحلي. أبحث في عناوين الأخبار وتصنيفاتها ونصوصها، وألخّص النتائج الموجودة دون جلب معلومات من خارج الموقع.';
            }
            if (/اقسام الموقع|الاقسام|اقسام|تصنيفات الموقع/.test(normalizedQuestion)) {
                return `أقسام الموقع: ${siteCategories.join('، ')}.`;
            }

            let articles = Object.entries(articleCatalog)
                .filter(([id]) => !deletedArticleIds.has(id))
                .map(([id, article]) => ({ id, ...article }));
            const currentArticleId = new URLSearchParams(window.location.search).get('id');
            const currentArticle = currentArticleId ? articleCatalog[currentArticleId] : null;
            if (currentArticle && !articles.some(article => article.id === currentArticleId)) articles.unshift({ id: currentArticleId, ...currentArticle });

            if (!articles.length) return 'لا توجد أخبار منشورة حاليًا لأبحث فيها. أضف خبرًا من لوحة التحكم ثم اسألني عنه أو عن قسمه.';

            const requestedCategory = siteCategories.find(category => normalizedQuestion.includes(normalizeAssistantText(category).join(' ')));
            if (requestedCategory) {
                articles = articles.filter(article => article.category === requestedCategory || (requestedCategory === 'رياضة' && ['كرة القدم', 'كرة السلة', 'التنس', 'الأولمبياد', 'رياضة المحركات', 'الفورمولا 1', 'السباحة', 'الكرة الطائرة'].includes(article.category)));
                if (!articles.length) return `لا توجد أخبار منشورة حاليًا في قسم ${requestedCategory}.`;
            }

            const terms = [...new Set(normalizeAssistantText(question).filter(term => term.length > 1 && !stopWords.has(term)))];
            const wantsLatest = /اخر|احدث|جديد|حديث|اليوم/.test(normalizedQuestion);
            if (!terms.length && !wantsLatest) return 'اسألني عن عنوان خبر أو موضوع أو قسم محدد لأبحث في محتوى الموقع.';

            const scoreArticle = article => {
                const title = normalizeAssistantText(article.title);
                const category = normalizeAssistantText(article.category);
                const body = normalizeAssistantText(stripHtml(article.body || ''));
                return terms.reduce((score, term) => {
                    const matches = words => words.some(word => word === term || (term.length >= 4 && word.length >= 4 && (word.startsWith(term) || term.startsWith(word))));
                    return score + (matches(title) ? 5 : 0) + (matches(category) ? 3 : 0) + (matches(body) ? 1 : 0);
                }, 0);
            };

            const rankedArticles = articles.map((article, index) => ({ article, index, score: scoreArticle(article) }))
                .sort((first, second) => second.score - first.score || second.index - first.index);
            const results = wantsLatest && (!terms.length || rankedArticles[0]?.score === 0)
                ? rankedArticles.slice().sort((first, second) => second.index - first.index).slice(0, 3).map(item => item.article)
                : rankedArticles.filter(item => item.score > 0).slice(0, 3).map(item => item.article);

            if (!results.length) return 'لم أجد خبرًا يطابق سؤالك في المحتوى المنشور. جرّب كلمة من العنوان أو اسم القسم.';

            return results.map((article, index) => {
                const summary = stripHtml(article.body || '').replace(/\s+/g, ' ').trim().split(/(?<=[.!؟])\s+/).filter(Boolean).slice(0, 2).join(' ');
                return `${index + 1}. ${article.title} (${article.category || 'أخبار'})${summary ? `\n${summary}` : ''}`;
            }).join('\n\n');
        }

        function setSettingsOpen(isOpen) {
            settingsPanel.hidden = !isOpen;
            settingsButton.setAttribute('aria-expanded', String(isOpen));
            if (isOpen) settingsPanel.querySelector('[data-utility-theme]')?.focus();
        }

        function setChatOpen(isOpen) {
            chatPanel.hidden = !isOpen;
            chatButton.setAttribute('aria-expanded', String(isOpen));
            if (isOpen) chatInput.focus();
            else chatButton.focus();
        }

        function syncUtilitySettings() {
            const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            const fontSize = ['small', 'medium', 'large'].find(size => document.body.classList.contains(`font-${size}`)) || 'medium';
            settingsPanel.querySelectorAll('[data-utility-theme]').forEach(button => button.classList.toggle('active', button.dataset.utilityTheme === theme));
            settingsPanel.querySelectorAll('[data-utility-font]').forEach(button => button.classList.toggle('active', button.dataset.utilityFont === fontSize));
        }

        function addChatMessage(role, text) {
            const message = document.createElement('div');
            message.className = `site-ai-message ${role}`;
            message.textContent = text;
            chatLog.append(message);
            chatLog.scrollTop = chatLog.scrollHeight;
        }

        settingsButton.addEventListener('click', () => {
            const isOpen = settingsPanel.hidden;
            setSettingsOpen(isOpen);
            if (isOpen) setChatOpen(false);
            syncUtilitySettings();
        });
        settingsCloseButton.addEventListener('click', () => setSettingsOpen(false));
        settingsPanel.querySelectorAll('[data-utility-theme]').forEach(button => button.addEventListener('click', () => {
            applyTheme(button.dataset.utilityTheme);
            syncUtilitySettings();
        }));
        settingsPanel.querySelectorAll('[data-utility-font]').forEach(button => button.addEventListener('click', () => {
            applyFontSize(button.dataset.utilityFont);
            syncUtilitySettings();
        }));

        chatButton.addEventListener('click', () => {
            setSettingsOpen(false);
            getAccountContainer()?.classList.remove('is-open');
            setChatOpen(chatPanel.hidden);
        });
        chatCloseButton.addEventListener('click', () => setChatOpen(false));
        settingsPanel.querySelectorAll('[data-utility-theme], [data-utility-font]').forEach(button => button.addEventListener('click', syncUtilitySettings));
        syncUtilitySettings();

        chatPanel.querySelectorAll('[data-ai-prompt]').forEach(button => button.addEventListener('click', () => {
            chatInput.value = button.dataset.aiPrompt;
            chatInput.focus();
        }));

        chatInput.addEventListener('keydown', event => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                chatForm.requestSubmit();
            }
        });

        chatForm.addEventListener('submit', event => {
            event.preventDefault();
            const message = chatInput.value.trim();
            if (!message || chatPending) return;
            chatPending = true;
            chatInput.value = '';
            chatForm.querySelector('button[type="submit"]').disabled = true;
            chatStatus.textContent = 'أبحث في محتوى الموقع...';
            addChatMessage('user', message);
            window.setTimeout(() => {
                const answer = answerFromSiteContent(message);
                chatHistory = [...chatHistory, { role: 'user', text: message }, { role: 'model', text: answer }].slice(-12);
                addChatMessage('assistant', answer);
                chatStatus.textContent = 'الإجابة من محتوى الموقع المحلي.';
                chatPending = false;
                chatForm.querySelector('button[type="submit"]').disabled = false;
                chatInput.focus();
            }, 60);
        });

        document.addEventListener('click', event => {
            if (!settingsPanel.hidden && !settingsPanel.contains(event.target) && !settingsButton.contains(event.target)) setSettingsOpen(false);
            const accountContainer = getAccountContainer();
            if (accountContainer?.classList.contains('is-open') && !accountContainer.contains(event.target)) {
                accountContainer.classList.remove('is-open');
                accountContainer.querySelector('.account-button')?.setAttribute('aria-expanded', 'false');
            }
        });
        document.addEventListener('keydown', event => {
            if (event.key !== 'Escape') return;
            if (!settingsPanel.hidden) { setSettingsOpen(false); settingsButton.focus(); }
            if (!chatPanel.hidden) setChatOpen(false);
            const accountContainer = getAccountContainer();
            if (accountContainer?.classList.contains('is-open')) {
                accountContainer.classList.remove('is-open');
                accountContainer.querySelector('.account-button')?.setAttribute('aria-expanded', 'false');
                getAccountToggle()?.focus();
            }
        });
    }

    syncLinkedArticleCards();
    hideEmptyArticleSections();
    updateNewsVisibility();
    updateArticleHighlights();
    renderSiteUtilityRail();
    loadSiteAds();
    renderAccountControl();
    enhanceArticleCards();
    updateSavedCountBadge();
    renderSavedArticles();
    window.addEventListener('storage', event => {
        if (event.key === savedArticleStorageKey) {
            savedArticleIds.clear();
            readSavedArticleIds(event.newValue).forEach(id => savedArticleIds.add(id));
            updateBookmarkButtons();
            updateSavedCountBadge();
            renderSavedArticles();
        }
        if (event.key === 'zaher-articles-version' && event.newValue !== articleDataVersion && window.location.protocol !== 'file:') loadRemoteArticleOverrides();
    });
    if (window.location.protocol !== 'file:') {
        window.setInterval(() => {
            if (document.visibilityState === 'visible') loadRemoteArticleOverrides();
        }, 10000);
    }
});