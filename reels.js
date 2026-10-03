(() => {
    const feed = document.getElementById('reels-feed');
    const status = document.getElementById('reels-status');
    const commentsDialog = document.getElementById('reel-comments-dialog');
    const commentsList = document.getElementById('reel-comments-list');
    const commentForm = document.getElementById('reel-comment-form');
    const commentInput = document.getElementById('reel-comment-input');
    const reelsApi = 'api/reels.php';
    const loginUrl = 'login/login.html?return=reels.html';
    const demos = [
        {
            id: 'demo-escapes',
            videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
            caption: 'رحلة قصيرة، ومشهد يستحق التوقف عنده.',
            creatorName: 'Pixel News',
            likes: 0,
            views: 0,
            comments: [],
            demo: true
        },
        {
            id: 'demo-fun',
            videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            caption: 'لحظات خفيفة من عالم الفيديو.',
            creatorName: 'Pixel News',
            likes: 0,
            views: 0,
            comments: [],
            demo: true
        },
        {
            id: 'demo-joyrides',
            videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
            caption: 'لقطة سريعة، بطاقة عالية.',
            creatorName: 'Pixel News',
            likes: 0,
            views: 0,
            comments: [],
            demo: true
        }
    ];

    let reels = [];
    let viewer = null;
    let activeReel = null;
    let observer = null;
    let previousFocus = null;
    const manualPlayback = new WeakMap();

    function setStatus(message, type = '') {
        status.textContent = message;
        status.className = `reels-status ${type}`.trim();
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        })[character]);
    }

    function formatCount(value) {
        return new Intl.NumberFormat('ar').format(Number(value) || 0);
    }

    async function requestJson(url, options = {}) {
        let response;
        try {
            response = await fetch(url, { credentials: 'same-origin', ...options });
        } catch (error) {
            throw new Error('تعذر الاتصال بالخادم. شغّل الموقع عبر خادم PHP.');
        }
        const text = await response.text();
        let result;
        try { result = JSON.parse(text); }
        catch (error) { throw new Error('استجابة الخادم غير صالحة. تحقق من تشغيل PHP.'); }
        if (!response.ok) throw new Error(result.error || 'تعذر إكمال العملية');
        return result;
    }

    async function sendAction(payload) {
        if (!viewer?.csrf) throw new Error('سجل الدخول أولاً لاستخدام هذه الميزة.');
        return requestJson(reelsApi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': viewer.csrf },
            body: JSON.stringify(payload)
        });
    }

    function ensureViewer(message = 'سجل الدخول لمتابعة التفاعل.') {
        if (viewer) return true;
        setStatus(message, 'error');
        return false;
    }

    function showComments(reel) {
        activeReel = reel;
        const comments = Array.isArray(reel.comments) ? reel.comments : [];
        commentsList.innerHTML = comments.length
            ? comments.map(comment => `<article class="reel-comment"><strong>${escapeHtml(comment.name || 'قارئ')}</strong><p>${escapeHtml(comment.text || '')}</p></article>`).join('')
            : '<p class="reel-comment-empty">لا توجد تعليقات بعد. ابدأ النقاش.</p>';
        previousFocus = document.activeElement;
        commentsDialog.showModal();
        if (viewer) commentInput.focus();
        else setStatus('سجل الدخول لإضافة تعليق.', 'error');
    }

    function renderReel(reel) {
        const card = document.createElement('article');
        card.className = 'reel-card';
        card.dataset.reelId = reel.id;
        const caption = escapeHtml(reel.caption || 'مقطع قصير من Pixel News');
        const creator = escapeHtml(reel.creatorName || 'Pixel News');
        card.innerHTML = `
            <div class="reel-media">
                <video class="reel-video" src="${escapeHtml(reel.videoUrl)}" playsinline loop muted controls preload="metadata" aria-label="مقطع ${creator}"></video>
                <button class="reel-play-button" type="button" data-action="play" aria-label="تشغيل المقطع"><i class="fas fa-play" aria-hidden="true"></i></button>
                <button class="reel-icon-button reel-audio-button" type="button" data-action="sound" aria-label="تشغيل الصوت" aria-pressed="false"><i class="fas fa-volume-xmark" aria-hidden="true"></i></button>
                <div class="reel-video-shade">
                    <p class="reel-creator"><span class="reel-creator-mark"><i class="fas fa-play" aria-hidden="true"></i></span>${creator}</p>
                    <p class="reel-caption">${caption}</p>
                </div>
            </div>
            <div class="reel-actions" aria-label="إجراءات الريل">
                <button class="reel-action${reel.likedByMe ? ' is-liked' : ''}" type="button" data-action="like" aria-label="إعجاب" aria-pressed="${reel.likedByMe ? 'true' : 'false'}"><i class="fas fa-heart" aria-hidden="true"></i><span data-count="likes">${formatCount(reel.likes)}</span></button>
                <button class="reel-action" type="button" data-action="comments" aria-label="التعليقات"><i class="fas fa-comment" aria-hidden="true"></i><span data-count="comments">${formatCount((reel.comments || []).length)}</span></button>
                <button class="reel-action" type="button" data-action="share" aria-label="مشاركة الريل"><i class="fas fa-share" aria-hidden="true"></i><span>مشاركة</span></button>
                <span class="reel-action" aria-label="المشاهدات"><i class="fas fa-eye" aria-hidden="true"></i><span data-count="views">${formatCount(reel.views)}</span></span>
            </div>`;
        card.querySelector('[data-action="like"]').addEventListener('click', () => toggleLike(reel, card));
        card.querySelector('[data-action="comments"]').addEventListener('click', () => showComments(reel));
        card.querySelector('[data-action="share"]').addEventListener('click', () => shareReel(reel));
        card.querySelector('[data-action="sound"]').addEventListener('click', event => toggleSound(event.currentTarget, card.querySelector('video')));
        const video = card.querySelector('video');
        const playButton = card.querySelector('[data-action="play"]');
        const showVideoError = () => {
            let message = card.querySelector('.reel-media-error');
            if (!message) {
                message = document.createElement('div');
                message.className = 'reel-media-error';
                message.textContent = 'تعذر تحميل هذا المقطع. تحقق من الاتصال أو انتقل إلى مقطع آخر.';
                card.querySelector('.reel-media').append(message);
            }
            playButton.hidden = true;
        };
        video.addEventListener('play', () => { playButton.hidden = true; });
        video.addEventListener('pause', () => { playButton.hidden = false; });
        playButton.addEventListener('click', () => {
            if (video.paused) {
                manualPlayback.set(video, true);
                video.play().catch(showVideoError);
            } else {
                manualPlayback.set(video, false);
                video.pause();
            }
        });
        video.addEventListener('error', showVideoError, { once: true });
        return card;
    }

    function startObserving() {
        if (observer) observer.disconnect();
        observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const video = entry.target.querySelector('video');
                if (!video) return;
                const feedRect = feed.getBoundingClientRect();
                const cardRect = entry.target.getBoundingClientRect();
                const overlap = Math.max(0, Math.min(feedRect.bottom, cardRect.bottom) - Math.max(feedRect.top, cardRect.top));
                const visibleRatio = cardRect.height ? overlap / cardRect.height : 0;
                if (visibleRatio >= 0.65) {
                    const reel = reels.find(item => String(item.id) === entry.target.dataset.reelId);
                    if (reel && !reel.demo && !reel.viewCounted) {
                        reel.viewCounted = true;
                        requestJson(reelsApi, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'view', id: reel.id })
                        }).then(result => {
                            Object.assign(reel, result.reel);
                            entry.target.querySelector('[data-count="views"]').textContent = formatCount(reel.views);
                        }).catch(() => {});
                    }
                } else if (visibleRatio < 0.2 && !video.paused) {
                    video.pause();
                    manualPlayback.delete(video);
                }
            });
        }, { root: feed, threshold: [0, 0.65, 1] });
        feed.querySelectorAll('.reel-card').forEach(card => observer.observe(card));
    }

    function renderFeed() {
        feed.innerHTML = '';
        if (!reels.length) {
            feed.innerHTML = '<div class="reels-empty"><i class="fas fa-film" aria-hidden="true"></i><h2>لا توجد مقاطع منشورة بعد</h2><p>ستظهر المقاطع المنشورة من لوحة التحكم هنا.</p></div>';
            return;
        }
        reels.forEach(reel => feed.append(renderReel(reel)));
        startObserving();
    }

    async function loadFeed() {
        if (window.location.protocol === 'file:') {
            viewer = null;
            reels = demos.map(reel => ({ ...reel }));
            setStatus('وضع المعاينة: هذه مقاطع تجريبية. النشر والتعليقات والإعجابات تحتاج تشغيل الموقع على خادم.');
            renderFeed();
            return;
        }

        try {
            const result = await requestJson(reelsApi);
            viewer = result.viewer;
            reels = Array.isArray(result.reels) && result.reels.length ? result.reels : demos.map(reel => ({ ...reel }));
            setStatus(viewer ? `مرحبًا ${viewer.name || ''}. يمكنك التفاعل مع الريلز.` : 'شاهد المقاطع، وسجّل الدخول للإعجاب أو التعليق.');
        } catch (error) {
            viewer = null;
            reels = demos.map(reel => ({ ...reel }));
            setStatus(error.message, 'error');
        }
        renderFeed();
    }

    async function toggleLike(reel, card) {
        if (reel.demo) return setStatus('سجّل الدخول للتفاعل مع المقاطع المنشورة.', 'error');
        if (!ensureViewer('سجّل الدخول للإعجاب بالمقاطع.')) return;
        const button = card.querySelector('[data-action="like"]');
        button.disabled = true;
        try {
            const result = await sendAction({ action: 'like', id: reel.id });
            Object.assign(reel, result.reel);
            button.classList.toggle('is-liked', reel.likedByMe);
            button.setAttribute('aria-pressed', String(reel.likedByMe));
            button.querySelector('[data-count="likes"]').textContent = formatCount(reel.likes);
            setStatus(reel.likedByMe ? 'أضفت إعجابك.' : 'أزلت إعجابك.', 'success');
        } catch (error) {
            setStatus(error.message, 'error');
            if (error.message.includes('سجل الدخول') || error.message.includes('انتهت الجلسة')) window.location.href = loginUrl;
        } finally { button.disabled = false; }
    }

    async function shareReel(reel) {
        const url = `${window.location.origin}${window.location.pathname}#${encodeURIComponent(reel.id)}`;
        try {
            if (navigator.share) await navigator.share({ title: 'ريل من Pixel News', text: reel.caption || 'شاهد هذا الريل', url });
            else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
                setStatus('تم نسخ رابط الريل.', 'success');
            } else {
                window.prompt('انسخ رابط الريل:', url);
            }
        } catch (error) {
            if (error.name !== 'AbortError') setStatus('تعذرت مشاركة الرابط.', 'error');
        }
    }

    function toggleSound(button, video) {
        video.muted = !video.muted;
        button.setAttribute('aria-pressed', String(!video.muted));
        button.setAttribute('aria-label', video.muted ? 'تشغيل الصوت' : 'كتم الصوت');
        button.innerHTML = `<i class="fas ${video.muted ? 'fa-volume-xmark' : 'fa-volume-high'}" aria-hidden="true"></i>`;
    }

    document.getElementById('close-reel-comments').addEventListener('click', () => commentsDialog.close());
    commentsDialog.addEventListener('close', () => previousFocus?.focus?.());
    commentsDialog.addEventListener('click', event => { if (event.target === commentsDialog) commentsDialog.close(); });

    commentForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (!activeReel) return;
        if (activeReel.demo) return setStatus('سجّل الدخول للتعليق على المقاطع المنشورة.', 'error');
        if (!ensureViewer('سجّل الدخول لإضافة تعليق.')) return;
        const text = commentInput.value.trim();
        if (!text) return;
        const submit = commentForm.querySelector('button');
        submit.disabled = true;
        try {
            const result = await sendAction({ action: 'comment', id: activeReel.id, text });
            Object.assign(activeReel, result.reel);
            const card = feed.querySelector(`[data-reel-id="${CSS.escape(String(activeReel.id))}"]`);
            if (card) card.querySelector('[data-count="comments"]').textContent = formatCount(activeReel.comments.length);
            commentInput.value = '';
            showComments(activeReel);
            commentsList.scrollTop = commentsList.scrollHeight;
            setStatus('تم إضافة التعليق.', 'success');
        } catch (error) {
            setStatus(error.message, 'error');
            if (error.message.includes('انتهت الجلسة')) window.location.href = loginUrl;
        } finally { submit.disabled = false; }
    });

    loadFeed();
})();
