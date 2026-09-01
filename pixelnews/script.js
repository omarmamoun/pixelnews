document.addEventListener('DOMContentLoaded', function() {

    loadRemoteArticleOverrides();

    // --- Mobile Navigation (Hamburger Menu) ---
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }

    // --- Homepage news discovery ---
    const searchInput = document.getElementById('news-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const newsCards = document.querySelectorAll('.news-card');
    const searchStatus = document.getElementById('search-status');
    let activeFilter = 'all';

    function updateNewsVisibility() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let visibleCount = 0;
 
        newsCards.forEach(card => {
            const category = card.querySelector('.category')?.textContent.trim().toLowerCase() || '';
            const text = card.textContent.toLowerCase();
            const matchesFilter = activeFilter === 'all' || category === activeFilter.toLowerCase();
            const matchesSearch = !query || text.includes(query);
            const isVisible = matchesFilter && matchesSearch; 
            card.hidden = !isVisible;
            if (isVisible) visibleCount += 1;
        });

        if (searchStatus) {
            searchStatus.textContent = query || activeFilter !== 'all'
                ? `عرض ${visibleCount} من الأخبار المطابقة`
                : 'أحدث التغطيات من فريق ظاهر';
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
        dots.forEach(dot => dot.classList.remove('active'));

        // Display the current slide and activate the corresponding dot
        slides[currentSlideIndex].classList.add('active');
        dots[currentSlideIndex].classList.add('active');
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
    if (document.querySelector('.article-page')) {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');

        if (articleId && articlesData[articleId]) {
            const article = articlesData[articleId];

            document.title = article.title + ' - منصة ظاهر الإعلامية'; // Update page title
            document.getElementById('article-category').textContent = article.category;
            document.getElementById('article-title').textContent = article.title;
            document.getElementById('article-date').textContent = `تاريخ النشر: ${article.date}`;
            document.getElementById('article-image').src = article.image;
            document.getElementById('article-image').alt = article.title;
            document.getElementById('article-body').innerHTML = article.body;
            renderArticleVideo(article.video);

            trackArticleView(articleId);

            // Dynamically load related articles
            loadRelatedArticles(article.category, articleId);
            // Add comment functionality
            setupCommentForm(articleId);
        } else {
            // Handle case where article is not found
            document.title = 'خطأ - الخبر غير موجود';
            document.querySelector('.full-article').innerHTML = `
                <h1 style="text-align: center;">عذراً، الخبر المطلوب غير موجود.</h1>
                <p style="text-align: center;"><a href="index.html" class="back-link">العودة إلى الصفحة الرئيسية</a></p>
            `;
        }
    }

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

        const categoryArticles = Object.entries(articlesData)
            .filter(([id, article]) => article.category === category)
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
        const response = await fetch(authApiPath(), { method: 'POST', headers, credentials: 'same-origin', body: JSON.stringify(payload) });
        const text = await response.text();
        let result;
        try { result = JSON.parse(text); } catch (error) { throw new Error('استجابة الخادم غير صالحة. شغّل الموقع عبر PHP.'); }
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
        if (!headerControls || document.querySelector('.account-container')) return;
        const session = getSession();
        const isAdmin = session?.role === 'owner' || session?.role === 'admin' || session?.email?.toLowerCase() === ownerEmail;
        const newArticles = session?.wantsNotifications ? getNewArticles() : [];
        const account = document.createElement('div');
        account.className = 'account-container';
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
        headerControls.prepend(account);
        account.querySelector('.logout-button')?.addEventListener('click', async () => {
            try { await requestAuth({ action: 'logout' }); } catch (error) { /* Clear the local view even if the server is unavailable. */ }
            localStorage.removeItem(sessionStorageKey);
            window.location.reload();
        });
        account.querySelector('.profile-settings-button')?.addEventListener('click', () => openAccountSettings(session));
        if (newArticles.length) {
            account.querySelector('.account-button').addEventListener('click', markArticlesAsSeen, { once: true });
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

    async function loadRemoteArticleOverrides() {
        if (window.location.protocol === 'file:' || typeof articlesData === 'undefined') return;
        try {
            const response = await fetch('api/articles.php');
            if (!response.ok) return;
            const payload = await response.json();
            Object.assign(articlesData, payload.articles || {});
            (payload.deleted || []).forEach(id => delete articlesData[id]);
            const previousVersion = localStorage.getItem('zaher-articles-version');
            if (payload.version && payload.version !== previousVersion) {
                localStorage.setItem('zaher-articles-version', payload.version);
                if (previousVersion) window.location.reload();
            }
        } catch (error) {
            // Static hosting can continue using the bundled article data.
        }
    }

    function enhanceArticleCards() {
        const cards = document.querySelectorAll('.news-card, .featured-article');
        cards.forEach(card => {
            if (card.querySelector('.article-stats')) return;
            const articleLink = card.querySelector('a[href*="article.html?id="]');
            const articleId = articleLink?.href.split('id=')[1] || card.querySelector('h2, h3')?.textContent.trim() || 'article';
            const seed = [...articleId].reduce((total, character) => total + character.charCodeAt(0), 0);
            const stats = document.createElement('div');
            stats.className = 'article-stats';
            stats.innerHTML = `
                <span class="view-count" title="المشاهدات"><i class="fas fa-eye" aria-hidden="true"></i>0</span>
                <a class="comment-count" href="${articleLink?.getAttribute('href') || '#comments'}#comments" title="التعليقات"><i class="fas fa-comment" aria-hidden="true"></i>0</a>
                <button class="share-article-button" type="button" title="مشاركة الخبر" aria-label="مشاركة الخبر"><i class="fas fa-share-alt" aria-hidden="true"></i><span>0</span></button>`;
            (card.querySelector('.card-content') || card.querySelector('.article-content') || card).appendChild(stats);
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

    renderAccountControl();
    enhanceArticleCards();
});