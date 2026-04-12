/**
 * SAGE - Accessibility
 * Language toggle, large text, voice narration
 */

function updateUIText() {
    const lang = currentLanguage;
    const attr = lang === 'hi' ? 'data-hi' : 'data-en';
    document.querySelectorAll(`[${attr}]`).forEach(el => {
        const text = el.getAttribute(attr);
        if (text) el.textContent = text;
    });
    const scamInput = document.getElementById('scamInput');
    if (scamInput) {
        scamInput.placeholder = scamInput.getAttribute(`data-placeholder-${lang}`) || scamInput.placeholder;
    }
}

function initAccessibility() {
    const languageToggle = document.getElementById('languageToggle');
    const largeTextToggle = document.getElementById('largeTextToggle');
    const voiceNarrationBtn = document.getElementById('voiceNarrationBtn');
    const synthesis = window.speechSynthesis;

    if (!languageToggle || !largeTextToggle || !voiceNarrationBtn) return;

    languageToggle.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
        updateUIText();
    });

    largeTextToggle.addEventListener('click', () => {
        isLargeText = !isLargeText;
        document.body.classList.toggle('large-text', isLargeText);
    });

    voiceNarrationBtn.addEventListener('click', () => {
        const heroTitle = document.querySelector('.hero-title')?.textContent;
        const heroSubtitle = document.querySelector('.section-subtitle')?.textContent;
        const text = [heroTitle, heroSubtitle].filter(Boolean).join('. ');
        if (text && synthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
            utterance.rate = 0.85;
            synthesis.cancel();
            synthesis.speak(utterance);
        }
    });

    updateUIText();
}
