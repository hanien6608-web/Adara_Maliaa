// 1. نظام النجوم والتحميل الأولي
// هذه القيم ستأخذينها من Settings -> API بعد إنشاء المشروع
const supabaseUrl = 'https://ouwnhwqjtdrhtnajkmoo.supabase.co'; // رابط مشروعك في سوبابيز
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91d25od3FqdGRyaHRuYWprbW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg3MDA4MSwiZXhwIjoyMDk0NDQ2MDgxfQ.053wg2pOwGjAQLUEGNjzypv9ifbE_cP1q05P4Z1ECmg'; // مفتاح الـ Anon Key لمشروعك

let _supabase;
let currentQuizData = []; // متغير لتخزين أسئلة الفصل الحالي

let currentCelebrationInterval = null; // لتخزين مؤقت setInterval للاحتفال
let currentCelebrationTimeout = null; // لتخزين مؤقت setTimeout لإيقاف الاحتفال

// أيقونات SVG هندسية للنتائج
const iconsSVG = {
    trophy: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="#FFD700" style="display:inline-block; vertical-align:middle; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));"><path d="M18 2H6a2 2 0 0 0-2 2v2c0 3.11 2.31 5.67 5.25 6.01C10.21 12.91 11 14.36 11 16v3H8v2h8v-2h-3v-3c0-1.64.79-3.09 1.75-3.99C17.69 11.67 20 9.11 20 6V4a2 2 0 0 0-2-2zM6 6V4h2v3.82C6.84 7.4 6 6.3 6 6zm12 0c0 .3-.84 1.4-2 1.82V4h2v2z"/></svg>`,
    gift: `<svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="#fa2f9f" d="M5,11h14v9c0,1.1-0.9,2-2,2H7c-1.1,0-2-0.9-2-2V11z M4,8h16v3H4V8z"/><rect x="11" y="8" width="2" height="14" fill="#FFD700"/><path fill="#FFD700" d="M12,8c-3-3-6-3-6-1c0,1,2,2,6,1 M12,8c3-3,6-3,6-1c0,1-2,2-6,1"/></svg>`,
    bag: `<svg width="1.2em" height="1em" viewBox="0 0 24 24">
        <g transform="translate(-4, 4) scale(0.7)" fill="#00d2d3"><path d="M19,6h-2c0-2.76-2.24-5-5-5S7,3.24,7,6H5C3.9,6,3,6.9,3,8v12c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V8C21,6.9,20.1,6,19,6z M12,3c1.66,0,3,1.34,3,3H9C9,4.34,10.34,3,12,3z"/></g>
        <g transform="translate(2, 0) scale(0.85)" fill="#ff3f34"><path d="M19,6h-2c0-2.76-2.24-5-5-5S7,3.24,7,6H5C3.9,6,3,6.9,3,8v12c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V8C21,6.9,20.1,6,19,6z M12,3c1.66,0,3,1.34,3,3H9C9,4.34,10.34,3,12,3z"/></g>
        <g transform="translate(9, 4) scale(0.7)" fill="#ffc107"><path d="M19,6h-2c0-2.76-2.24-5-5-5S7,3.24,7,6H5C3.9,6,3,6.9,3,8v12c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V8C21,6.9,20.1,6,19,6z M12,3c1.66,0,3,1.34,3,3H9C9,4.34,10.34,3,12,3z"/></g>
    </svg>`,
    envelope: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="black"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>`,
    balloon: `<svg width="1em" height="1em" viewBox="0 0 24 35"><path d="M12 2a7 7 0 0 0-7 7c0 4.41 3.5 10 7 12 3.5-2 7-7.59 7-12a7 7 0 0 0-7-7z" fill="currentColor"/><path d="M12 21 v12" stroke="black" stroke-width="1.2" fill="none"/></svg>`,
    percent100: `<svg width="3em" height="1em" viewBox="0 0 100 40"><text x="0" y="32" font-family="Cairo" font-weight="900" font-size="32" fill="red">100%</text></svg>`,
    sparkle: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2L14.5,9.5L22,12L14.5,14.5L12,22L9.5,14.5L2,12L9.5,9.5L12,2Z"/></svg>`,
    pen: `<svg width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="#7c3aed" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path fill="#FFD700" d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/><path fill="rgba(255,255,255,0.4)" d="M7 14.94l1.12-1.12l3.75 3.75L10.75 18.7z"/></svg>`,
    paper: `<svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="#f8fafc" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/><path fill="#00d2d3" d="M14 2v6h6L14 2z"/><rect x="7" y="12" width="10" height="1.5" rx="0.5" fill="#00d2d3" opacity="0.3"/><rect x="7" y="15" width="10" height="1.5" rx="0.5" fill="#00d2d3" opacity="0.3"/></svg>`,
    notebook: `<svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="#fa2f9f" d="M18 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/><path fill="rgba(0,0,0,0.15)" d="M5 4v16c0 1.1.9 2 2 2h1V2H7c-1.1 0-2 .9-2 2z"/><rect x="9" y="5" width="7" height="1.5" rx="0.5" fill="white" opacity="0.4"/><rect x="9" y="8" width="7" height="1.5" rx="0.5" fill="white" opacity="0.4"/></svg>`,
    idea: `<svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="#ffc107" d="M12 2C8.14 2 5 5.14 5 9c0 2.38 1.2 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.8-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/><path fill="#333" d="M9 19h6v1H9zM10 21h4v1h-4z"/></svg>`,
    slipper: `<svg width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="#3E2723" d="M16 18c0 2.2-1.8 4-4 4H10c-2.2 0-4-1.8-4-4V8c0-3.3 2.7-6 6-6s6 2.7 6 6v10z"/><path fill="#D32F2F" d="M11 3.5L7 12h2l2-5 2 5h2L11 3.5z"/><circle cx="11" cy="4" r="1" fill="#FFD700"/></svg>`,
    failedText: `<svg width="2.5em" height="1.1em" viewBox="0 0 120 40"><rect x="5" y="5" width="110" height="30" rx="15" fill="#D32F2F"/><text x="60" y="27" text-anchor="middle" font-family="Cairo" font-weight="900" font-size="18" fill="white">ساقط !</text></svg>`,
    zeroText: `<svg width="3.2em" height="1.2em" viewBox="0 0 140 50"><circle cx="25" cy="25" r="20" fill="#D32F2F"/><path d="M18 18l14 14M32 18l-14 14" stroke="white" stroke-width="4" stroke-linecap="round"/><text x="85" y="36" text-anchor="middle" font-family="Cairo" font-weight="900" font-size="30" fill="#D32F2F">صفر</text></svg>`
};

// دالة معالجة محتوى الشرح (تدعم الأجزاء المتداخلة والنقاط والفقرات)
function renderStudyContent(blocks, level = 0) {
    if (!blocks || blocks.length === 0) return '';
    const bullet = level === 0 ? '🌸 ' : '🌼 '; 
    return blocks.map(block => {
        if (block.type === 'point') {
            return `<li style="margin-bottom: 8px;">${bullet}${block.text}</li>`;
        } else if (block.type === 'paragraph') {
            return `<p style="margin-bottom: 10px; line-height: 1.6;">${block.text}</p>`;
        } else if (block.type === 'sub_section') {
            return `
                <div class="accordion nested">
                    <div class="acc-header" onclick="toggleAcc(this, event)">${block.title} <span class="arrow">▼</span></div>
                    <div class="acc-content">
                        <ul style="list-style: none; padding-right: 15px;">
                            ${renderStudyContent(block.points.map(p => ({type: 'point', text: p})), level + 1)}
                        </ul>
                    </div>
                </div>`;
        }
        return '';
    }).join('');
}

document.addEventListener('DOMContentLoaded', function() {
    // 1. تشغيل النجوم أولاً لضمان ظهور الخلفية دائماً حتى لو فشل الاتصال بقاعدة البيانات
    try {
        createStars();
    } catch (e) { console.error("Stars error:", e); }

    // 2. ربط سوبابيز بشكل آمن
    try {
        if (typeof supabase !== 'undefined') {
            _supabase = supabase.createClient(supabaseUrl, supabaseKey);
        }
    } catch (e) {
        console.error("Supabase Connection Error:", e);
    }

    if (document.getElementById('quiz-form')) document.getElementById('quiz-form').reset();
    
    // نظام المظهر التلقائي حسب إعدادات الجهاز
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (systemPrefersDark.matches) {
        document.body.classList.add('dark-mode');
        updateThemeIconUI();
    }
    
    // استماع لتغيير إعدادات الجهاز أثناء فتح الصفحة
    systemPrefersDark.addEventListener('change', e => {
        if (e.matches) document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');
        updateThemeIconUI();
    });
});

function createStars() {
    const sCont = document.getElementById('stars');
    if (!sCont) return;
    for (let i = 0; i < 40; i++) {
        let s = document.createElement('div');
        s.className = 'star';
        s.style.width = s.style.height = (Math.random() * 6 + 2) + 'px';
        s.style.left = Math.random() * 100 + '%';
        s.style.top = Math.random() * 100 + '%';
        sCont.appendChild(s);
    }
}

// 2. مخزن البيانات
// ----------------------------------------------------------------------------------
// ملاحظة هامة: هنا يمكنك تعديل الأسئلة لكل فصل وللاختبار النهائي
// - q: هو نص السؤال
// - options: هي قائمة الاختيارات (4 اختيارات)
// - correctIndex: هو رقم الإجابة الصحيحة. الرقم يبدأ من 0.
//   - 0 = الخيار الأول
//   - 1 = الخيار الثاني
//   - 2 = الخيار الثالث
//   - 3 = الخيار الرابع
//
// يمكنك نسخ وتكرار هيكل السؤال لإضافة المزيد من الأسئلة.
// ----------------------------------------------------------------------------------

// حذفنا المصفوفات الضخمة وسنعتمد على الجلب من سوبابيز

//  3. دالة الدخول
function enter() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    if (name.split(/\s+/).length < 3) return alert("من فضلك اكتبي اسمك الثلاثي! 🌸");
    if (!/^(010|011|012|015)[0-9]{8}$/.test(phone)) return alert("من فضلك رقم موبايل مصري صحيح! ✨");
    const ov = document.getElementById('login-overlay');
    ov.style.transform = 'scale(0) rotate(720deg)';
    ov.style.opacity = '0';
    document.getElementById('whatsapp-btn').style.display = 'block';
    setTimeout(() => {
        ov.style.display = 'none';
        changeCh(1, document.querySelector('.ch-btn'));
    }, 1000);
}

// 4. دالة تبديل الفصول
async function changeCh(num, btn) {
    document.querySelectorAll('.ch-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('ch-title').innerText = "محتوى الفصل " + num;

    if (!_supabase) {
        // إعادة محاولة التهيئة إذا فشلت في البداية
        _supabase = supabase.createClient(supabaseUrl, supabaseKey);
    }
    
    if (!_supabase) {
        alert("لا يمكن الاتصال بسوبابيز. تأكدي من وجود الإنترنت.");
        return;
    }

    // جلب البيانات من سوبابيز بناءً على رقم الفصل
    const { data, error } = await _supabase
        .from('chapters') 
        .select('*')
        .eq('chapter_number', num)
        .maybeSingle(); // استخدام maybeSingle أفضل لتجنب الأخطاء في حال عدم وجود بيانات

    if (error) {
        console.error("Database Error:", error);
        alert("خطأ في قاعدة البيانات: " + error.message);
        return;
    }

    if (!data) {
        console.warn("No data found for chapter:", num);
        document.getElementById('ch-content-area').innerHTML = '<p style="text-align:center;">لا يوجد محتوى لهذا الفصل في قاعدة البيانات حالياً.</p>';
        return;
    }

    document.getElementById('footer-text').innerText = data.footer;

    // تحديث الشرح: يدعم الآن أجزاء رئيسية وكل جزء رئيسي يمكن أن يحتوي على أجزاء فرعية ونقاط وفقرات
    document.getElementById('ch-content-area').innerHTML = (data.study || []).map(s => `
        <div class="accordion">
            <div class="acc-header" onclick="toggleAcc(this, event)">${s.title} <span class="arrow">▼</span></div>
            <div class="acc-content">
                <ul style="list-style: none; padding-right: 15px;">
                    ${renderStudyContent(s.content)}
                </ul>
            </div>
        </div>
    `).join('');
    // ملاحظة: تم تغيير 's.points' إلى 's.content' في هيكل الـ JSON الجديد للشرح

    // تحديث العملي
    document.getElementById('practical-content-area').innerHTML = (data.practical || []).map((p, i) => `
        <div class="practical-item">
            <img src="${p.img}" class="prac-img">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <b>${p.title}</b>
                <button class="audio-btn" onclick="playAudio('aud${num}_${i}')">🎙️</button>
            </div>
            <audio id="aud${num}_${i}" src="${p.audio}"></audio>
        </div>
    `).join('');

    // تحديث الاختبار
    renderQuiz(data.quiz || []); // تمرير بيانات الاختبار إلى دالة العرض
}

async function showFinalTest(btn) {
    // Set active button
    document.querySelectorAll('.ch-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // جلب بيانات الاختبار النهائي من جدول خاص أو تصفية معينة
    const { data, error } = await _supabase
        .from('final_exams')
        .select('*')
        .single();

    if (error) {
        console.error("Error fetching final test:", error);
        return;
    }

    document.getElementById('footer-text').innerText = data.footer;

    // Hide other sections and show quiz section
    show('quiz');

    // Populate quiz questions
    renderQuiz(data.quiz);
}

function renderQuiz(quizData) {
    currentQuizData = quizData; // تخزين بيانات الاختبار الحالية للوصول إليها لاحقاً
    if (!quizData || quizData.length === 0) {
        document.getElementById('quiz-questions-area').innerHTML = '<p style="text-align:center;">لا توجد أسئلة متاحة حالياً.</p>';
        return;
    }
    document.getElementById('quiz-questions-area').innerHTML = quizData.map((q, i) => {
        return `
            <div class="quiz-card">
                <p><b>${q.q}</b></p>
                ${q.options.map((opt, index) => `
                    <label class="option-label">
                        <input type="radio" name="q${i}" value="${index === q.correctIndex ? 'correct' : 'wrong'}"> ${opt}
                    </label>
                `).join('')}
                <div class="feedback" id="f${i}" style="display:none; margin-top:10px; padding:10px; border-radius:10px;"></div>
                <div class="explanation-box" id="exp${i}" style="display:none; background:rgba(167, 139, 250, 0.1); padding:12px; border-radius:15px; margin-top:8px; font-size:0.95em; border-right: 4px solid var(--primary); color:var(--text);">
                    <b>💡 التوضيح:</b> ${q.explanation || 'تمت الإجابة بناءً على دروس الفصل.'}
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('top-score').style.display = 'none';
    document.getElementById('gift-box').style.display = 'none';
}


// 5. وظائف التحكم والهدية
function show(id) {
    document.querySelectorAll('.content-sec').forEach(s => s.style.display = 'none');
    document.getElementById(id + '-sec').style.display = 'block';
}

function toggleAcc(header, event) { 
    if (event) event.stopPropagation();
    header.parentElement.classList.toggle('open'); 
}

function playAudio(id) { const a = document.getElementById(id); a.paused ? a.play() : a.pause(); }
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    updateThemeIconUI();
}

function updateThemeIconUI() {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    const isDark = document.body.classList.contains('dark-mode');

    const sunSvg = `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0 c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2 c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1 S11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0 s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06 c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41 c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36 c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z"/>
    </svg>`;

    const moonSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

    icon.innerHTML = isDark ? moonSvg : sunSvg;
}

function checkAnswers() {
    const cards = document.querySelectorAll('.quiz-card');
    let allAnswered = true;
    let firstUnanswered = null;

    cards.forEach(card => {
        const isChecked = card.querySelector('input:checked');
        card.classList.remove('unanswered'); // حذف الكلاس أولاً لإعادة تشغيل الأنيميشن
        if (!isChecked) {
            allAnswered = false;
            void card.offsetWidth; // سطر سحري لإجبار المتصفح على ملاحظة إعادة إضافة الكلاس
            card.classList.add('unanswered');
            if (!firstUnanswered) firstUnanswered = card;
        }
    });

    if (!allAnswered) {
        if (firstUnanswered) {
            firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // If we reach here, it means all questions are answered.
    // Now, let's calculate the score and show feedback.
    let score = 0;
    cards.forEach((card, i) => {
        const sel = card.querySelector('input:checked');
        const feed = document.getElementById('f' + i);
        const exp = document.getElementById('exp' + i);
        const question = currentQuizData[i]; // الحصول على بيانات السؤال من المخزن
        
        // We know 'sel' is not null because we checked before.
        if (sel && sel.value === 'correct') {
            score++;
            feed.className = "feedback correct-ans";
            feed.innerText = question.correctFeedback || "✅ صح!"; // استخدام النص المخصص أو الافتراضي
        } else {
            feed.className = "feedback wrong-ans";
            feed.innerText = question.wrongFeedback || "❌ حاولي تاني!"; // استخدام النص المخصص أو الافتراضي
        }
        feed.style.display = "block";
        if (exp) exp.style.display = "block"; // إظهار سبب الإجابة دائماً عند التصحيح
    });

    // Display final score, gift, etc.
    const scoreDisplay = document.getElementById('top-score');
    scoreDisplay.innerHTML = `نتيجتك: ${score} من ${cards.length} <span style="font-size:24px; line-height:1; display:inline-block; vertical-align:middle;">${iconsSVG.trophy}</span>`;
    scoreDisplay.style.display = "block";
    scoreDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const gift = document.getElementById('gift-box');
    gift.style.display = "block";
    gift.setAttribute('data-score', score); // تخزين الدرجة لاستخدامها في الرسائل
    const percent = (score / cards.length) * 100;

    let iconHtml = "";
    if (percent >= 80) { 
        iconHtml = iconsSVG.gift; gift.setAttribute('data-status', 'excellent'); createCelebration('full'); 
    } else if (percent >= 50) { 
        iconHtml = iconsSVG.bag; gift.setAttribute('data-status', 'good'); createCelebration('half');
    } else { 
        iconHtml = iconsSVG.envelope; gift.setAttribute('data-status', 'low'); createCelebration('low');
    }
    gift.innerHTML = iconHtml + `<div class="click-hint">افتح</div>`;
}

function openGift() {
    const giftBox = document.getElementById('gift-box');
    const hint = giftBox.querySelector('.click-hint');

    const status = giftBox.getAttribute('data-status');
    
    // تحديد رابط الصوت: إذا كانت الحالة "low" (أقل من 50%) نستخدم رابط الصوت الخاص بكِ
    let audioSrc = 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3';
    if (status === 'low') {
        audioSrc = 'https://ouwnhwqjtdrhtnajkmoo.supabase.co/storage/v1/object/sign/soar/1000781880.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85OWVkMWIyZS1jNTkxLTRkYmEtYmM3MS04OTQ2ZGZjYzQwYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2FyLzEwMDA3ODE4ODAubXAzIiwiaWF0IjoxNzc4ODg1Njc0LCJleHAiOjQ5MzI0ODU2NzR9.YbKCeMLbViCcRL0F8LqN7kiNqx13h9TF06hTOn-OCLQ';
    } else if (status === 'excellent') {
        // هذا هو الرابط الخاص بالهدية (النتيجة الممتازة)
        audioSrc = 'https://ouwnhwqjtdrhtnajkmoo.supabase.co/storage/v1/object/sign/soar/VID-20260516-WA0017.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85OWVkMWIyZS1jNTkxLTRkYmEtYmM3MS04OTQ2ZGZjYzQwYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2FyL1ZJRC0yMDI2MDUxNi1XQTAwMTcubXAzIiwiaWF0IjoxNzc4OTQ4OTcxLCJleHAiOjQ5MzI1NDg5NzF9.4wnc6chGGofz_Pd2DWOXl-TmdsMalj87clpSLN_huxk';
    } else if (status === 'good') {
        // رابط الصوت الخاص بالشنط الثلاث (النتيجة المتوسطة)
        audioSrc = 'https://ouwnhwqjtdrhtnajkmoo.supabase.co/storage/v1/object/sign/soar/1000782723.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85OWVkMWIyZS1jNTkxLTRkYmEtYmM3MS04OTQ2ZGZjYzQwYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2FyLzEwMDA3ODI3MjMubXAzIiwiaWF0IjoxNzc4OTUzMDA3LCJleHAiOjQ5MzI1NTMwMDd9.juZSn7Kwdoh4d19AML8v8kWJltIqdEEv6_Ugc-Kik_M';
    }
    
    const audio = new Audio(audioSrc);
    audio.play().catch(e => console.log("Audio play deferred"));
    
    const score = parseInt(document.getElementById('gift-box').getAttribute('data-score'));

    let m = "";
    if (status === "excellent") {
        m = "هدية رائعة! نتيجتك ممتازة وتستحقين المكافأة!";
    } else if (status === "good") {
        m = "شنطة هدايا! أداء جميل جداً، استمري في التقدم!";
    } else {
        m = (score === 0) ? "للأسف نتيجتك (صفر).. إنتي ساقطة في الاختبار ده! ❌" : "للأسف نتيجتك ضعيفة.. إنتي (ساقطة) المرة دي، محتاجة مذاكرة بجد! ✍️";
    }

    // تحديث النص في الصفحة بدلاً من الـ Alert المزعج
    if (hint) {
        hint.innerHTML = m;
        hint.style.cursor = "default"; // تغيير شكل الماوس لأنه تم الفتح بالفعل
    }
}

function createCelebration(type) {
    // إيقاف أي احتفال سابق وتنظيف الشاشة
    if (currentCelebrationInterval) clearInterval(currentCelebrationInterval);
    if (currentCelebrationTimeout) clearTimeout(currentCelebrationTimeout);
    document.querySelectorAll('.celebration').forEach(el => el.remove());

    // تحديد الأيقونات بناءً على نوع الاحتفال
    let iconShapes;
    if (type === 'full') {
        iconShapes = [iconsSVG.gift, iconsSVG.trophy, iconsSVG.trophy, iconsSVG.balloon, iconsSVG.balloon, iconsSVG.balloon, iconsSVG.percent100, iconsSVG.percent100, iconsSVG.percent100, iconsSVG.percent100, iconsSVG.percent100, iconsSVG.sparkle, iconsSVG.sparkle];
    } else if (type === 'half') {
        iconShapes = [iconsSVG.bag, iconsSVG.pen, iconsSVG.paper, iconsSVG.notebook, iconsSVG.idea, iconsSVG.sparkle];
    } else {
        // حالة الرسوب (ساقط/شباشب)
        iconShapes = [iconsSVG.envelope, iconsSVG.slipper, iconsSVG.slipper, iconsSVG.failedText, iconsSVG.failedText];
        const score = parseInt(document.getElementById('gift-box').getAttribute('data-score') || 0);
        if (score === 0) iconShapes.push(iconsSVG.zeroText, iconsSVG.zeroText, iconsSVG.zeroText);
    }

    const colors = ['#f472b6', '#a78bfa', '#00d2d3', '#ff3f34', '#ffc107', '#7c3aed', '#22c55e', '#3b82f6', '#f97316', '#db2777'];
    
    // دالة لإنشاء أيقونة واحدة وتسقيطها
    const spawnIcon = () => {
        const c = document.createElement('div');
        c.className = 'celebration';
        c.innerHTML = iconShapes[Math.floor(Math.random() * iconShapes.length)];
        c.style.color = colors[Math.floor(Math.random() * colors.length)];
        c.style.left = Math.random() * 95 + '%';
        c.style.animationDuration = (Math.random() * 2 + 2) + 's'; // سرعة السقوط (بين 2 إلى 4 ثواني)
        c.style.animationDelay = '0s';
        
        // تحديد الحجم: كبير جداً للهدايا، متوسط للشنط، وصغير للظرف (الرسوب)
        if (type === 'full') {
            c.style.fontSize = (Math.random() * 30 + 60) + 'px'; // 60-90 بكسل للتفوق
        } else if (type === 'half') {
            c.style.fontSize = (Math.random() * 15 + 30) + 'px'; // 30-45 بكسل للجيد
        } else {
            c.style.fontSize = (Math.random() * 10 + 15) + 'px'; // 15-25 بكسل للرسوب (رقيق جداً)
        }

        c.style.setProperty('--drift', (Math.random() * 200 - 100) + 'px');
        document.body.appendChild(c);
        
        // إزالة العنصر بعد انتهاء الأنيميشن لعدم إثقال الصفحة
        setTimeout(() => c.remove(), 4000);
    };

    // إطلاق دفعة أولى ضخمة جداً (100 أيقونة فوراً) لتحقيق الكثافة الابتدائية على مدار ثانية
    for(let i = 0; i < 100; i++) setTimeout(spawnIcon, Math.random() * 1000); 

    // استمرار النزول بكثافة عالية (إطلاق 6 أيقونات دفعة واحدة كل 150 ملي ثانية)
    currentCelebrationInterval = setInterval(() => {
        for(let i = 0; i < 6; i++) spawnIcon();
    }, 150);

    // إيقاف توليد الأيقونات الجديدة بعد 30 ثانية
    currentCelebrationTimeout = setTimeout(() => {
        clearInterval(currentCelebrationInterval);
        currentCelebrationInterval = null; // مسح المرجع
        currentCelebrationTimeout = null; // مسح المرجع
    }, 30000); // يستمر التوليد لمدة 30 ثانية
}
