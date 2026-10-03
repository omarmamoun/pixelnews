(() => {
    const modal = document.getElementById('gameModal');
    const title = document.getElementById('gameTitle');
    const difficulty = document.getElementById('gameDifficulty');
    const content = document.getElementById('gameContent');
    const closeButton = modal.querySelector('.modal-close');
    const labels = { easy: 'سهل', medium: 'متوسط', hard: 'صعب' };
    const gameTitles = {
        puzzle: 'لعبة الألغاز',
        memory: 'لعبة الذاكرة',
        quiz: 'المسابقة الثقافية',
        wordchain: 'سلسلة الكلمات',
        sudoku: 'السودوكو',
        wordcount: 'عد الكلمات'
    };
    const riddles = {
        easy: [
            { question: 'له أسنان ولا يعض، ما هو؟', choices: ['المشط', 'الكتاب', 'المفتاح'], answer: 0 },
            { question: 'شيء يكتب ولا يقرأ، ما هو؟', choices: ['القلم', 'الساعة', 'الباب'], answer: 0 },
            { question: 'كلما أخذت منه كبر، ما هو؟', choices: ['الحفرة', 'الظل', 'الطريق'], answer: 0 }
        ],
        medium: [
            { question: 'ما الشيء الذي له عين ولا يرى؟', choices: ['الإبرة', 'العاصفة', 'الميزان'], answer: 0 },
            { question: 'ما الشيء الذي يسمع بلا أذن ويتكلم بلا لسان؟', choices: ['الصدى', 'الراديو', 'الكتاب'], answer: 0 },
            { question: 'ما العدد الذي إذا ضربته بنفسه ثم أضفت إليه نفسه كان الناتج 30؟', choices: ['5', '6', '4'], answer: 0 }
        ],
        hard: [
            { question: 'لديك 3 مفاتيح خارج غرفة ومصباح واحد داخلها. كيف تعرف المفتاح الصحيح بدخول واحد؟', choices: ['استخدم حرارة المصباح مع الضوء', 'جرّب المفاتيح بسرعة', 'لا يمكن معرفة ذلك'], answer: 0 },
            { question: 'عدد من رقمين، مجموع رقميه 9 والفرق بينهما 3. ما العدد الأكبر؟', choices: ['63', '72', '54'], answer: 0 },
            { question: 'إذا تجاوزت المتسابق صاحب المركز الثاني، فما مركزك؟', choices: ['الثاني', 'الأول', 'الثالث'], answer: 0 }
        ]
    };
    const quizzes = {
        easy: [
            { question: 'ما عاصمة الأردن؟', choices: ['عمّان', 'إربد', 'العقبة'], answer: 0 },
            { question: 'كم عدد أيام الأسبوع؟', choices: ['7', '6', '8'], answer: 0 },
            { question: 'أي كوكب نعيش عليه؟', choices: ['الأرض', 'المريخ', 'الزهرة'], answer: 0 }
        ],
        medium: [
            { question: 'ما أكبر محيط على الأرض؟', choices: ['الهادئ', 'الأطلسي', 'الهندي'], answer: 0 },
            { question: 'ما الغاز الذي تمتصه النباتات من الجو؟', choices: ['ثاني أكسيد الكربون', 'الأكسجين', 'النيتروجين'], answer: 0 },
            { question: 'كم ضلعًا للمسدس؟', choices: ['6', '5', '8'], answer: 0 }
        ],
        hard: [
            { question: 'ما العنصر الكيميائي الذي رمزه Fe؟', choices: ['الحديد', 'الفلور', 'الفضة'], answer: 0 },
            { question: 'ما اسم العملية التي تصنع بها النباتات غذاءها؟', choices: ['البناء الضوئي', 'التبخر', 'التلقيح'], answer: 0 },
            { question: 'ما أصغر عدد أولي؟', choices: ['2', '1', '3'], answer: 0 }
        ]
    };
    const chainWords = [
        'مطر', 'مفتاح', 'موز', 'مدينة', 'مدرسة', 'مسجد', 'رمان', 'رجل', 'رسالة', 'ريح',
        'نهر', 'نجم', 'نمر', 'ليمون', 'لوز', 'لعب', 'هلال', 'هدية', 'هدهد', 'حجر',
        'حليب', 'حوت', 'زيت', 'زهر', 'تمر', 'تاج', 'تفاح', 'كتاب', 'كرة', 'كوب',
        'بحر', 'بيت', 'باب', 'بستان', 'جبل', 'جمل', 'علم', 'عنب', 'قمر', 'قلب', 'سوق', 'سمك'
    ];
    const wordChallenges = {
        easy: { letters: 'سلام', words: ['سلام', 'سالم', 'سال', 'مال', 'لام', 'ماس', 'سم', 'لمس'] },
        medium: { letters: 'كتاب', words: ['كتاب', 'كاتب', 'كتب', 'تاب', 'بات', 'كبت', 'كاب', 'بكت'] },
        hard: { letters: 'مدرسة', words: ['مدرسة', 'مدرس', 'درس', 'رسم', 'سرد', 'دسم', 'هدم', 'سم', 'دم', 'سهر', 'هدر'] }
    };

    let currentGame = '';
    let currentDifficulty = 'easy';
    let currentTrigger = null;
    let state = {};
    let memoryTimer = null;

    function normalizeWord(value) {
        return value.trim().toLowerCase().normalize('NFC')
            .replace(/[\u064B-\u065F\u0670]/g, '')
            .replace(/[أإآ]/g, 'ا')
            .replace(/ى/g, 'ي')
            .replace(/ة/g, 'ه');
    }

    function setStatus(message, type = '') {
        const status = content.querySelector('.game-status');
        if (!status) return;
        status.textContent = message;
        status.className = `game-status ${type}`.trim();
    }

    function renderDifficultyButtons() {
        difficulty.innerHTML = Object.entries(labels).map(([key, label]) =>
            `<button class="difficulty-btn${key === currentDifficulty ? ' active' : ''}" type="button" data-difficulty="${key}" aria-pressed="${key === currentDifficulty}">${label}</button>`
        ).join('');
    }

    function startGame(gameType, trigger) {
        currentGame = gameType;
        currentDifficulty = 'easy';
        currentTrigger = trigger;
        title.textContent = gameTitles[gameType] || 'لعبة';
        renderDifficultyButtons();
        renderGame();
        modal.hidden = false;
        modal.classList.add('active');
        closeButton.focus();
    }

    function closeGame() {
        clearTimeout(memoryTimer);
        modal.classList.remove('active');
        modal.hidden = true;
        if (currentTrigger?.isConnected) currentTrigger.focus();
    }

    function renderGame() {
        clearTimeout(memoryTimer);
        state = {};
        switch (currentGame) {
            case 'puzzle':
                state = { questions: riddles[currentDifficulty], index: 0, score: 0, answered: false };
                renderChoiceRound('لغز');
                break;
            case 'quiz':
                state = { questions: quizzes[currentDifficulty], index: 0, score: 0, answered: false };
                renderChoiceRound('سؤال');
                break;
            case 'memory':
                startMemoryGame();
                break;
            case 'wordchain':
                startWordChain();
                break;
            case 'sudoku':
                renderSudoku();
                break;
            case 'wordcount':
                startWordCount();
                break;
            default:
                content.innerHTML = '<p class="game-status error">اللعبة غير متاحة.</p>';
        }
    }

    function renderChoiceRound(kind) {
        if (state.index >= state.questions.length) {
            content.innerHTML = `
                <section class="game-round" aria-live="polite">
                    <h3>انتهت الجولة</h3>
                    <p class="game-status success">إجابات صحيحة: ${state.score} من ${state.questions.length}</p>
                    <button class="game-action" type="button" data-action="restart">العب مرة أخرى</button>
                </section>`;
            return;
        }
        const question = state.questions[state.index];
        const choices = question.choices.map((choice, index) => ({ choice, index })).sort(() => Math.random() - 0.5);
        content.innerHTML = `
            <section class="game-round">
                <p class="game-round-meta">${kind} ${state.index + 1} من ${state.questions.length} · النقاط ${state.score}</p>
                <h3>${question.question}</h3>
                <div class="game-options">${choices.map(({ choice, index }) =>
                    `<button class="game-option" type="button" data-choice="${index}">${choice}</button>`
                ).join('')}</div>
                <p class="game-status" role="status" aria-live="polite"></p>
            </section>`;
    }

    function answerChoice(button) {
        if (state.answered) return;
        state.answered = true;
        const question = state.questions[state.index];
        const selected = Number(button.dataset.choice);
        const correct = selected === question.answer;
        if (correct) state.score += 1;
        content.querySelectorAll('.game-option').forEach(option => {
            option.disabled = true;
            if (Number(option.dataset.choice) === question.answer) option.classList.add('correct');
            else if (option === button) option.classList.add('wrong');
        });
        setStatus(correct ? 'إجابة صحيحة!' : `الإجابة الصحيحة: ${question.choices[question.answer]}`, correct ? 'success' : 'error');
        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'game-action';
        next.dataset.action = 'next';
        next.textContent = state.index + 1 === state.questions.length ? 'عرض النتيجة' : 'السؤال التالي';
        content.querySelector('.game-round').append(next);
        next.focus();
    }

    function startMemoryGame() {
        const pairs = { easy: 3, medium: 6, hard: 8 }[currentDifficulty];
        const symbols = ['🍎', '🚲', '🌙', '🎈', '🐟', '⭐', '📚', '🌿'];
        state.deck = symbols.slice(0, pairs).flatMap((symbol, index) => [
            { symbol, id: index }, { symbol, id: index }
        ]).sort(() => Math.random() - 0.5);
        state.flipped = [];
        state.matched = new Set();
        state.moves = 0;
        content.innerHTML = `
            <section class="game-round">
                <p class="game-round-meta">الحركات: <span data-moves>0</span> · الأزواج: <span data-pairs>0</span> من ${pairs}</p>
                <div class="memory-grid" aria-label="بطاقات الذاكرة">${state.deck.map((card, index) =>
                    `<button class="memory-card" type="button" data-memory="${index}" aria-label="بطاقة مخفية">؟</button>`
                ).join('')}</div>
                <p class="game-status" role="status" aria-live="polite"></p>
                <button class="game-action" type="button" data-action="restart">إعادة اللعب</button>
            </section>`;
    }

    function flipMemoryCard(button) {
        const index = Number(button.dataset.memory);
        if (state.locked || state.matched.has(index) || state.flipped.includes(index)) return;
        button.textContent = state.deck[index].symbol;
        button.classList.add('revealed');
        button.setAttribute('aria-label', `بطاقة ${state.deck[index].symbol}`);
        state.flipped.push(index);
        if (state.flipped.length < 2) return;

        state.moves += 1;
        content.querySelector('[data-moves]').textContent = state.moves;
        const [first, second] = state.flipped;
        if (state.deck[first].id === state.deck[second].id) {
            state.matched.add(first);
            state.matched.add(second);
            [first, second].forEach(cardIndex => {
                const card = content.querySelector(`[data-memory="${cardIndex}"]`);
                card.classList.add('matched');
                card.setAttribute('aria-label', `زوج مطابق ${state.deck[cardIndex].symbol}`);
            });
            content.querySelector('[data-pairs]').textContent = state.matched.size / 2;
            state.flipped = [];
            if (state.matched.size === state.deck.length) setStatus(`أحسنت! أكملت اللعبة في ${state.moves} حركات.`, 'success');
            return;
        }

        state.locked = true;
        memoryTimer = setTimeout(() => {
            [first, second].forEach(cardIndex => {
                const card = content.querySelector(`[data-memory="${cardIndex}"]`);
                if (card) {
                    card.textContent = '؟';
                    card.classList.remove('revealed');
                    card.setAttribute('aria-label', 'بطاقة مخفية');
                }
            });
            state.flipped = [];
            state.locked = false;
        }, 750);
    }

    function startWordChain() {
        const starters = { easy: 'قلم', medium: 'كتاب', hard: 'مطر' };
        state.lastWord = starters[currentDifficulty];
        state.used = new Set([normalizeWord(state.lastWord)]);
        state.score = 0;
        renderWordChain();
    }

    function renderWordChain() {
        const nextLetter = normalizeWord(state.lastWord).slice(-1);
        const hintWords = chainWords.filter(word => normalizeWord(word).startsWith(nextLetter) && !state.used.has(normalizeWord(word))).slice(0, 4);
        content.innerHTML = `
            <section class="game-round">
                <p class="game-round-meta">ابدأ بكلمة تبدأ بآخر حرف من الكلمة السابقة. النقاط: ${state.score}</p>
                <p>الكلمة الحالية: <strong>${state.lastWord}</strong> · الحرف المطلوب: <strong>${nextLetter}</strong></p>
                <form class="game-form" data-form="wordchain">
                    <input name="word" type="text" autocomplete="off" required minlength="2" aria-label="الكلمة الجديدة" placeholder="كلمة تبدأ بحرف ${nextLetter}">
                    <button class="game-action" type="submit">إضافة الكلمة</button>
                    <button class="game-action" type="button" data-action="hint">تلميح</button>
                </form>
                <p class="game-hint" data-hint hidden>كلمات مقترحة: ${hintWords.join('، ') || 'لا توجد اقتراحات، أعد بدء اللعبة.'}</p>
                <p class="game-status" role="status" aria-live="polite"></p>
                <ul class="game-word-list">${[...state.used].map(word => `<li>${word}</li>`).join('')}</ul>
            </section>`;
        content.querySelector('input[name="word"]').focus();
    }

    function submitWordChain(form) {
        const input = form.elements.word;
        const word = input.value.trim();
        const normalized = normalizeWord(word);
        const requiredLetter = normalizeWord(state.lastWord).slice(-1);
        if (!/^[\u0621-\u064A]+$/.test(normalized) || normalized.length < 2) {
            setStatus('اكتب كلمة عربية من حرفين أو أكثر.', 'error');
            return;
        }
        if (!chainWords.some(item => normalizeWord(item) === normalized)) {
            setStatus('هذه الكلمة غير موجودة في قائمة اللعبة. جرّب كلمة أخرى أو استخدم التلميح.', 'error');
            return;
        }
        if (!normalized.startsWith(requiredLetter)) {
            setStatus(`ابدأ الكلمة بحرف ${requiredLetter}.`, 'error');
            return;
        }
        if (state.used.has(normalized)) {
            setStatus('استخدمت هذه الكلمة من قبل.', 'error');
            return;
        }
        state.used.add(normalized);
        state.lastWord = word;
        state.score += 1;
        renderWordChain();
        setStatus('سلسلة موفقة! أكمل بكلمة جديدة.', 'success');
    }

    function startWordCount() {
        state.challenge = wordChallenges[currentDifficulty];
        state.found = new Set();
        renderWordCount();
    }

    function renderWordCount() {
        content.innerHTML = `
            <section class="game-round">
                <p class="game-round-meta">كوّن كلمات صحيحة من الحروف الظاهرة، واستخدم كل حرف بقدر مرات ظهوره.</p>
                <h3 class="word-letters" aria-label="الحروف المتاحة">${[...state.challenge.letters].join('　')}</h3>
                <form class="game-form" data-form="wordcount">
                    <input name="word" type="text" autocomplete="off" required aria-label="الكلمة التي كوّنتها" placeholder="اكتب كلمة">
                    <button class="game-action" type="submit">تحقق</button>
                </form>
                <p class="game-status" role="status" aria-live="polite">وجدت ${state.found.size} من ${state.challenge.words.length} كلمات.</p>
                <ul class="game-word-list">${[...state.found].map(word => `<li>${word}</li>`).join('')}</ul>
            </section>`;
        content.querySelector('input[name="word"]').focus();
    }

    function canBuildWord(word, letters) {
        const available = [...normalizeWord(letters)];
        for (const character of normalizeWord(word)) {
            const index = available.indexOf(character);
            if (index === -1) return false;
            available.splice(index, 1);
        }
        return true;
    }

    function submitWordCount(form) {
        const word = form.elements.word.value.trim();
        const normalized = normalizeWord(word);
        const answers = state.challenge.words.map(normalizeWord);
        if (!/^[\u0621-\u064A]+$/.test(normalized) || normalized.length < 2) {
            setStatus('اكتب كلمة عربية من حرفين أو أكثر.', 'error');
            return;
        }
        if (!canBuildWord(word, state.challenge.letters) || !answers.includes(normalized)) {
            setStatus('هذه الكلمة غير مقبولة من الحروف المتاحة.', 'error');
            return;
        }
        if (state.found.has(normalized)) {
            setStatus('وجدت هذه الكلمة من قبل.', 'error');
            return;
        }
        state.found.add(normalized);
        renderWordCount();
        setStatus(state.found.size === state.challenge.words.length
            ? `رائع! وجدت كل الكلمات (${state.found.size} من ${state.challenge.words.length}).`
            : `كلمة صحيحة! وجدت ${state.found.size} من ${state.challenge.words.length}.`, 'success');
    }

    function renderSudoku() {
        const solution = Array.from({ length: 9 }, (_, row) =>
            Array.from({ length: 9 }, (_, column) => ((row * 3 + Math.floor(row / 3) + column) % 9) + 1)
        );
        const blankThreshold = { easy: 2, medium: 4, hard: 5 }[currentDifficulty];
        const blanks = new Set();
        for (let row = 0; row < 9; row += 1) {
            for (let column = 0; column < 9; column += 1) {
                if ((row * 3 + column * 5) % 9 < blankThreshold) blanks.add(row * 9 + column);
            }
        }
        state.solution = solution.flat();
        content.innerHTML = `
            <section class="game-round">
                <p class="game-round-meta">أكمل الخانات الفارغة بالأرقام من 1 إلى 9 ثم تحقق من الحل.</p>
                <div class="sudoku-board" role="group" aria-label="شبكة السودوكو">${state.solution.map((value, index) => {
                    if (!blanks.has(index)) return `<span class="sudoku-cell">${value}</span>`;
                    const row = Math.floor(index / 9) + 1;
                    const column = (index % 9) + 1;
                    return `<label class="sudoku-cell"><span class="visually-hidden">الصف ${row} العمود ${column}</span><input class="sudoku-input" type="text" inputmode="numeric" maxlength="1" pattern="[1-9]" data-cell="${index}" aria-label="الصف ${row} العمود ${column}"></label>`;
                }).join('')}</div>
                <button class="game-action" type="button" data-action="check-sudoku">تحقق من الحل</button>
                <p class="game-status" role="status" aria-live="polite"></p>
            </section>`;
    }

    function checkSudoku() {
        const inputs = [...content.querySelectorAll('.sudoku-input')];
        let correct = 0;
        let complete = true;
        inputs.forEach(input => {
            const index = Number(input.dataset.cell);
            const isCorrect = input.value === String(state.solution[index]);
            input.classList.toggle('wrong', input.value !== '' && !isCorrect);
            if (isCorrect) correct += 1;
            if (!input.value) complete = false;
        });
        if (complete && correct === inputs.length) setStatus('حل صحيح! أحسنت.', 'success');
        else setStatus(`الخانات الصحيحة: ${correct} من ${inputs.length}. أكمل الخانات وصحح المميزة بالأحمر.`, 'error');
    }

    document.querySelectorAll('.play-btn[data-game]').forEach(button => {
        button.addEventListener('click', () => startGame(button.dataset.game, button));
    });

    difficulty.addEventListener('click', event => {
        const button = event.target.closest('[data-difficulty]');
        if (!button || button.dataset.difficulty === currentDifficulty) return;
        currentDifficulty = button.dataset.difficulty;
        renderDifficultyButtons();
        renderGame();
    });

    content.addEventListener('click', event => {
        const choice = event.target.closest('[data-choice]');
        if (choice) return answerChoice(choice);
        const memoryCard = event.target.closest('[data-memory]');
        if (memoryCard) return flipMemoryCard(memoryCard);
        const action = event.target.closest('[data-action]')?.dataset.action;
        if (action === 'next') {
            state.index += 1;
            state.answered = false;
            return renderChoiceRound(currentGame === 'puzzle' ? 'لغز' : 'سؤال');
        }
        if (action === 'restart') return renderGame();
        if (action === 'hint') {
            const hint = content.querySelector('[data-hint]');
            hint.hidden = false;
        }
        if (action === 'check-sudoku') checkSudoku();
    });

    content.addEventListener('input', event => {
        if (event.target.matches('.sudoku-input')) {
            event.target.value = event.target.value.replace(/[^1-9]/g, '').slice(0, 1);
            event.target.classList.remove('wrong');
        }
    });

    content.addEventListener('submit', event => {
        event.preventDefault();
        if (event.target.dataset.form === 'wordchain') submitWordChain(event.target);
        if (event.target.dataset.form === 'wordcount') submitWordCount(event.target);
    });

    closeButton.addEventListener('click', closeGame);
    modal.addEventListener('click', event => {
        if (event.target === modal) closeGame();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !modal.hidden) closeGame();
    });
})();