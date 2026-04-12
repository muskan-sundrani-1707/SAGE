/**
 * SAGE - Accessibility
 * Language toggle, large text, voice narration (short intro on home)
 */

function updateUIText() {
    const lang = currentLanguage;
    const attr = lang === 'hi' ? 'data-hi' : 'data-en';
    document.querySelectorAll(`[${attr}]`).forEach((el) => {
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

    voiceNarrationBtn.addEventListener('click', async () => {
        const heroTitle = document.querySelector('#home .hero-title')?.textContent?.trim();
        const heroLine = document.querySelector('#home .illustration-text')?.textContent?.trim();
        const text = [heroTitle, heroLine].filter(Boolean).join('. ');
        if (!text) return;
        const lang = currentLanguage === 'hi' ? 'hi' : 'en';
        synthesis.cancel();
        await sageSpeakWithFallback(text, lang, synthesis);
    });

    updateUIText();
}
