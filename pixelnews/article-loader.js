document.addEventListener('DOMContentLoaded', function() {
    // Get the article ID from the URL query parameter
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');

    // Check if the articlesData object exists and if the articleId is valid
    if (typeof articlesData !== 'undefined' && articlesData[articleId]) {
        const article = articlesData[articleId];

        // Find the placeholder elements in article.html
        const categoryEl = document.getElementById('article-category');
        const titleEl = document.getElementById('article-title');
        const dateEl = document.getElementById('article-date');
        const imageEl = document.getElementById('article-image');
        const bodyEl = document.getElementById('article-body');
        const pageTitle = document.querySelector('title');

        // If the article is found, populate the elements
        pageTitle.textContent = article.title + " - منصة ظاهر الإعلامية";
        if (categoryEl) categoryEl.textContent = article.category;
        if (titleEl) titleEl.textContent = article.title;
        if (dateEl) dateEl.textContent = "تاريخ النشر: " + article.date;
        if (imageEl) {
            imageEl.src = article.image;
            imageEl.alt = article.title;
            imageEl.style.display = 'block'; // Show the image after setting the source
        }
        if (bodyEl) bodyEl.innerHTML = article.body;
    } else {
        // If no article is found, display an error message
        const articleContainer = document.querySelector('.full-article');
        if (articleContainer) {
            articleContainer.innerHTML = `
                <h1>المقال غير موجود</h1>
                <p>عذراً، المقال الذي تبحث عنه غير موجود أو تم حذفه.</p>
                <a href="index.html" class="back-link">العودة إلى الصفحة الرئيسية</a>
            `;
        }
    }
});