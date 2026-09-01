    document.addEventListener('DOMContentLoaded', async () => {
    const ownerEmail = 'omarmamoun2004@gmail.com';
    let session = null;
    try { session = JSON.parse(localStorage.getItem('zaher-session') || 'null'); } catch (error) { session = null; }
    try {
        const authResponse = await fetch('../api/auth.php', { credentials: 'same-origin' });
        if (!authResponse.ok) { window.location.href = '../login/login.html'; return; }
        session = (await authResponse.json()).user;
        localStorage.setItem('zaher-session', JSON.stringify(session));
    } catch (error) { window.location.href = '../login/login.html'; return; }
    const adminEmail = session?.email?.toLowerCase() || '';
    const csrfToken = session?.csrf || '';
    const role = session?.role || (adminEmail === ownerEmail ? 'owner' : 'viewer');
    const roleNames = { owner: 'Owner · المالك', admin: 'Admin شامل', editor: 'Editor · محرر', writer: 'Writer · كاتب', moderator: 'Moderator · مشرف', viewer: 'Viewer · مشاهدة' };
    const capabilities = { owner: ['manage_admins', 'manage_content', 'upload_media', 'moderate_comments', 'view_dashboard'], admin: ['manage_content', 'upload_media', 'moderate_comments', 'view_dashboard'], editor: ['manage_content', 'upload_media', 'view_dashboard'], writer: ['manage_content', 'view_dashboard'], moderator: ['moderate_comments', 'view_dashboard'], viewer: ['view_dashboard'] };
    const can = capability => (capabilities[role] || []).includes(capability);
    const isOwner = role === 'owner' || adminEmail === ownerEmail;
    const isAdmin = isOwner || can('view_dashboard');
    if (!session || !isAdmin) {
        window.location.href = '../login/login.html';
        return;
    }

    const form = document.getElementById('article-form');
    const list = document.getElementById('article-list');
    const message = document.getElementById('admin-message');
    const deleteButton = document.getElementById('delete-article');
    let articles = { ...(typeof articlesData === 'undefined' ? {} : articlesData) };
    let overrides = { articles: {}, deleted: [] };
    const searchInput = document.getElementById('article-search');
    const categoryFilter = document.getElementById('article-filter');
    const contentEditorPanel = document.getElementById('content-editor-panel');
    const contentListPanel = document.getElementById('content-list-panel');
    document.getElementById('session-name').textContent = session.name || 'فريق التحرير';
    document.getElementById('session-role-badge').textContent = roleNames[role] || role;
    document.getElementById('dashboard-role').textContent = roleNames[role] || role;
    document.getElementById('dashboard-date').textContent = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
    if (!can('manage_content')) {
        contentEditorPanel.hidden = true;
        contentListPanel.classList.add('read-only-panel');
    }

    const ownerAdminPanel = document.getElementById('owner-admin-panel');
    const adminForm = document.getElementById('admin-form');
    const adminUsersList = document.getElementById('admin-users-list');
    const adminUsersMessage = document.getElementById('admin-users-message');
    if (isOwner) ownerAdminPanel.hidden = false;

    function escapeHtml(value) {
        return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
    async function readJsonResponse(response, fallbackMessage) {
        const text = await response.text();
        let result;
        try { result = text ? JSON.parse(text) : {}; } catch (error) { throw new Error(fallbackMessage); }
        if (!response.ok) throw new Error(result.error || fallbackMessage);
        return result;
    }

    function showAdminUsersMessage(text, isError = false) {
        adminUsersMessage.textContent = text;
        adminUsersMessage.style.color = isError ? '#c21d29' : '#198754';
    }
    function renderAdminUsers(users) {
        adminUsersList.innerHTML = users.length ? users.map(user => `<div class="admin-user-row"><div><strong>${escapeHtml(user.email)}</strong><small>${escapeHtml(user.phone)} · ${escapeHtml(user.jobTitle)}</small></div><div class="user-row-actions"><select data-role-email="${escapeHtml(user.email)}" aria-label="دور الأدمن"><option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option><option value="editor" ${user.role === 'editor' || !user.role ? 'selected' : ''}>Editor</option><option value="writer" ${user.role === 'writer' ? 'selected' : ''}>Writer</option><option value="moderator" ${user.role === 'moderator' ? 'selected' : ''}>Moderator</option><option value="viewer" ${user.role === 'viewer' ? 'selected' : ''}>Viewer</option></select><button type="button" data-remove-admin="${escapeHtml(user.email)}" title="حذف الأدمن"><i class="fas fa-trash"></i></button></div></div>`).join('') : '<p class="panel-hint">لا يوجد أدمن مضاف حتى الآن.</p>';
        adminUsersList.querySelectorAll('[data-remove-admin]').forEach(button => button.addEventListener('click', () => removeAdmin(button.dataset.removeAdmin)));
        adminUsersList.querySelectorAll('[data-role-email]').forEach(select => select.addEventListener('change', () => updateAdminRole(select.dataset.roleEmail, select.value)));
    }
    async function loadAdminUsers() {
        if (!isOwner) return;
        try {
            const response = await fetch('../api/admins.php', { credentials: 'same-origin' });
            const result = await readJsonResponse(response, 'تعذر تحميل بيانات الأدمن.');
            const admins = result.admins || [];
            document.getElementById('stat-admins').textContent = admins.length + 1;
            renderAdminUsers(admins);
        } catch (error) { showAdminUsersMessage(error.message, true); }
    }
    async function adminRequest(payload) {
        const response = await fetch('../api/admins.php', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }, credentials: 'same-origin', body: JSON.stringify(payload) });
        return readJsonResponse(response, 'تعذر تنفيذ عملية إدارة الأدمن.');
    }
    async function removeAdmin(email) {
        if (!confirm('هل تريد إزالة هذا الأدمن؟')) return;
        try { await adminRequest({ action: 'remove', email }); await loadAdminUsers(); showAdminUsersMessage('تمت إزالة الأدمن.'); } catch (error) { showAdminUsersMessage(error.message, true); }
    }
    async function updateAdminRole(email, newRole) {
        try { await adminRequest({ action: 'update', email, role: newRole }); await loadAdminUsers(); showAdminUsersMessage('تم تحديث دور الأدمن.'); } catch (error) { showAdminUsersMessage(error.message, true); }
    }
    adminForm?.addEventListener('submit', async event => {
        event.preventDefault();
        try {
            await adminRequest({ action: 'add', email: document.getElementById('new-admin-email').value.trim(), phone: document.getElementById('new-admin-phone').value.trim(), jobTitle: document.getElementById('new-admin-job-title').value.trim(), role: document.getElementById('new-admin-role').value });
            adminForm.reset(); await loadAdminUsers(); showAdminUsersMessage('تمت إضافة الأدمن. عليه إنشاء حساب بالبريد نفسه.');
        } catch (error) { showAdminUsersMessage(error.message, true); }
    });
    loadAdminUsers();
    document.getElementById('new-article-quick').addEventListener('click', () => {
        if (!can('manage_content')) { showMessage('هذا الدور لا يملك صلاحية إضافة الأخبار.', true); return; }
        fillForm();
        contentEditorPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    function showMessage(text, isError = false) { message.textContent = text; message.style.color = isError ? '#c21d29' : '#198754'; }
    function fillForm(id, article = {}) {
        document.getElementById('article-id').value = id || '';
        document.getElementById('article-key').value = id || '';
        document.getElementById('article-key').disabled = Boolean(id);
        document.getElementById('article-category').value = article.category || 'سياسة';
        document.getElementById('article-title').value = article.title || '';
        document.getElementById('article-image').value = article.image || '';
        document.getElementById('article-video').value = article.video || '';
        document.getElementById('article-source').value = article.source || '';
        document.getElementById('article-date').value = article.date || new Date().toLocaleDateString('ar-EG');
        document.getElementById('article-body').value = (article.body || '').replace(/<[^>]*>/g, '');
        updateImagePreview();
        updateVideoPreview();
        document.getElementById('form-title').textContent = id ? 'تعديل الخبر' : 'إضافة خبر';
        deleteButton.hidden = !id;
        showMessage('');
    }
    function renderList() {
        const query = searchInput.value.trim().toLowerCase();
        const category = categoryFilter.value;
        const ids = Object.keys(articles).filter(id => !overrides.deleted.includes(id)).filter(id => {
            const article = articles[id];
            return (!query || `${id} ${article.title}`.toLowerCase().includes(query)) && (category === 'all' || article.category === category);
        });
        const total = Object.keys(articles).filter(id => !overrides.deleted.includes(id));
        document.getElementById('article-count').textContent = `${ids.length} من ${total.length} خبر`;
        document.getElementById('stat-total').textContent = total.length;
        document.getElementById('stat-categories').textContent = new Set(total.map(id => articles[id].category)).size;
        document.getElementById('stat-updates').textContent = Object.keys(overrides.articles || {}).length;
        list.innerHTML = ids.map(id => `<div class="article-row"><div><strong>${escapeHtml(articles[id].title)}</strong><small>${escapeHtml(articles[id].category)} · ${escapeHtml(id)}</small></div><button type="button" data-edit="${escapeHtml(id)}" title="تعديل"><i class="fas fa-pen"></i></button><button type="button" data-delete="${escapeHtml(id)}" title="حذف"><i class="fas fa-trash"></i></button></div>`).join('');
        list.querySelectorAll('[data-edit]').forEach(button => button.addEventListener('click', () => fillForm(button.dataset.edit, articles[button.dataset.edit])));
        list.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', () => removeArticle(button.dataset.delete)));
    }
    async function request(payload) {
            const response = await fetch('../api/articles.php', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }, credentials: 'same-origin', body: JSON.stringify(payload) });
        const text = await response.text();
        let result;
        try { result = JSON.parse(text); } catch (error) { throw new Error('شغّل الموقع عبر خادم PHP لحفظ الأخبار.'); }
        if (!response.ok) throw new Error(result.error || 'تعذر تنفيذ العملية');
        return result;
    }
    function socialResultMessage(social) {
        if (!social || !Object.keys(social).length) return '';
        const labels = { facebook: 'Facebook', instagram: 'Instagram', telegram: 'Telegram', x: 'X' };
        const configured = Object.entries(social).filter(([, result]) => result.status !== 'not_configured');
        if (!configured.length) return ' لم يتم إعداد مفاتيح النشر الاجتماعي بعد.';
        const successful = configured.filter(([, result]) => result.ok).map(([name]) => labels[name]);
        const failed = configured.filter(([, result]) => !result.ok).map(([name]) => labels[name]);
        return `${successful.length ? ` تم النشر على ${successful.join(' و')}.` : ''}${failed.length ? ` تعذر النشر على ${failed.join(' و')}.` : ''}`;
    }
    async function removeArticle(id) {
        if (!confirm('هل تريد حذف هذا الخبر؟')) return;
        try { await request({ action: 'delete', id }); delete articles[id]; overrides.deleted.push(id); fillForm(); renderList(); showMessage('تم حذف الخبر.'); } catch (error) { showMessage(error.message, true); }
    }
    try {
        const response = await fetch('../api/articles.php');
        if (response.ok) {
            const text = await response.text();
            try { overrides = JSON.parse(text); } catch (error) { showMessage('شغّل الموقع عبر خادم PHP لحفظ الأخبار.', true); }
        }
        Object.assign(articles, overrides.articles || {});
        (overrides.deleted || []).forEach(id => delete articles[id]);
    } catch (error) { showMessage('تعذر تحميل تحديثات الخادم.'); }
    renderList();
    fillForm();
    document.getElementById('new-article').addEventListener('click', () => { if (can('manage_content')) fillForm(); });
    searchInput.addEventListener('input', renderList);
    categoryFilter.addEventListener('change', renderList);
    document.getElementById('refresh-articles').addEventListener('click', () => window.location.reload());
    document.getElementById('preview-article').addEventListener('click', () => {
        document.getElementById('preview-category').textContent = document.getElementById('article-category').value;
        document.getElementById('preview-title').textContent = document.getElementById('article-title').value || 'بدون عنوان';
        const previewImage = document.getElementById('preview-image');
        const imageUrl = document.getElementById('article-image').value.trim();
        previewImage.src = resolveMediaUrl(imageUrl);
        previewImage.hidden = !imageUrl;
        document.getElementById('preview-body').textContent = document.getElementById('article-body').value;
        const previewVideo = document.getElementById('preview-video');
        const videoUrl = getVideoEmbedUrl(document.getElementById('article-video').value.trim());
        previewVideo.innerHTML = videoUrl ? `<iframe src="${videoUrl}" title="فيديو المعاينة" allowfullscreen></iframe>` : '';
        document.getElementById('preview-modal').hidden = false;
    });
    document.getElementById('close-preview').addEventListener('click', () => { document.getElementById('preview-modal').hidden = true; });
    document.getElementById('preview-modal').addEventListener('click', event => { if (event.target.id === 'preview-modal') event.currentTarget.hidden = true; });
    function updateImagePreview() {
        const image = document.getElementById('image-preview');
        const url = resolveMediaUrl(document.getElementById('article-image').value.trim());
        image.src = url;
        image.hidden = !url;
    }
    document.getElementById('article-image').addEventListener('input', updateImagePreview);
    document.getElementById('insert-image').addEventListener('click', () => {
        const imageUrl = document.getElementById('article-image').value.trim();
        if (!imageUrl) { showMessage('ألصق رابط الصورة أولًا.', true); return; }
        updateImagePreview();
        showMessage('تم إدراج الصورة ومعاينتها.');
    });
    function getVideoEmbedUrl(url) {
        try {
            const parsed = new URL(url);
            if (parsed.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
            if (parsed.hostname.includes('youtube.com')) return `https://www.youtube.com/embed/${parsed.searchParams.get('v') || parsed.pathname.split('/').pop()}`;
            return url;
        } catch (error) { return ''; }
    }
    function updateVideoPreview() {
        const preview = document.getElementById('video-preview');
        const url = getVideoEmbedUrl(document.getElementById('article-video').value.trim());
        preview.src = resolveMediaUrl(url);
        preview.hidden = !url;
    }
    document.getElementById('article-video').addEventListener('input', updateVideoPreview);
    document.getElementById('insert-video').addEventListener('click', () => {
        if (!document.getElementById('article-video').value.trim()) { showMessage('ألصق رابط الفيديو أولًا.', true); return; }
        updateVideoPreview();
        showMessage('تم إدراج الفيديو ومعاينته.');
    });
    function resolveMediaUrl(url) {
        return url && !/^https?:\/\//i.test(url) ? `../${url.replace(/^\.\//, '')}` : url;
    }
    async function uploadFile(inputId, targetId, type) {
        const input = document.getElementById(inputId);
        const file = input.files[0];
        if (!file) { showMessage('اختر ملفًا من الجهاز أولًا.', true); return; }
        if (window.location.protocol === 'file:') {
            const localUrl = URL.createObjectURL(file);
            document.getElementById(targetId).value = localUrl;
            targetId === 'article-image' ? updateImagePreview() : updateVideoPreview();
            showMessage('تم إدراج الملف للمعاينة المحلية. للحفظ الدائم شغّل PHP.', false);
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        try {
            const response = await fetch('../api/upload.php', { method: 'POST', headers: { 'X-CSRF-Token': csrfToken }, credentials: 'same-origin', body: formData });
            const text = await response.text();
            let result;
            try { result = JSON.parse(text); } catch (error) { throw new Error('شغّل الموقع عبر خادم PHP لرفع الملفات.'); }
            if (!response.ok) throw new Error(result.error || 'تعذر رفع الملف');
            document.getElementById(targetId).value = result.path;
            targetId === 'article-image' ? updateImagePreview() : updateVideoPreview();
            showMessage('تم رفع الملف وإدراجه.');
        } catch (error) {
            showMessage(error.message, true);
        }
    }
    document.getElementById('image-file').addEventListener('change', () => uploadFile('image-file', 'article-image', 'image'));
    document.getElementById('video-file').addEventListener('change', () => uploadFile('video-file', 'article-video', 'video'));
    document.getElementById('admin-logout').addEventListener('click', async () => { await fetch('../api/auth.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ action: 'logout' }) }); localStorage.removeItem('zaher-session'); window.location.href = '../index.html'; });
    deleteButton.addEventListener('click', () => removeArticle(document.getElementById('article-id').value));
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton.disabled) return;
        submitButton.disabled = true;
        submitButton.dataset.originalText = submitButton.textContent;
        submitButton.textContent = 'جارٍ الحفظ...';
        const id = document.getElementById('article-id').value || document.getElementById('article-key').value.trim().toLowerCase();
        const article = { category: document.getElementById('article-category').value, title: document.getElementById('article-title').value.trim(), image: document.getElementById('article-image').value.trim(), video: document.getElementById('article-video').value.trim(), source: document.getElementById('article-source').value.trim(), date: document.getElementById('article-date').value.trim(), body: `<p>${document.getElementById('article-body').value.trim()}</p>` };
        try { const result = await request({ action: 'save', id, article, publishSocial: !document.getElementById('article-id').value }); articles[id] = article; renderList(); fillForm(id, article); showMessage(`تم حفظ الخبر.${socialResultMessage(result.social)}`); } catch (error) { showMessage(error.message, true); }
        finally { submitButton.disabled = false; submitButton.textContent = submitButton.dataset.originalText || 'حفظ الخبر'; }
    });
});