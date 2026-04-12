/**
 * SAGE - Scam Checker
 * Keyword-based scam detection
 */

function initScamChecker() {
    const scamInput = document.getElementById('scamInput');
    const checkBtn = document.getElementById('checkScamBtn');
    const resultDiv = document.getElementById('scamResult');

    if (!scamInput || !checkBtn || !resultDiv) return;

    checkBtn.addEventListener('click', () => {
        const text = scamInput.value.trim().toLowerCase();
        if (!text) {
            resultDiv.textContent = currentLanguage === 'hi' ? 'कृपया संदेश पेस्ट करें' : 'Please paste a message to check.';
            resultDiv.className = 'scam-result visible';
            return;
        }

        let scamScore = 0;
        const foundKeywords = [];
        for (const keyword of SCAM_KEYWORDS) {
            if (text.includes(keyword)) {
                scamScore++;
                foundKeywords.push(keyword);
            }
        }

        if (text.includes('!!!') || (text.match(/[A-Z]/g) || []).length > text.length * 0.3) {
            scamScore += 2;
        }
        if (text.includes('http') || text.includes('bit.ly') || text.includes('tinyurl')) {
            scamScore += 1;
        }

        const isScam = scamScore >= 2 || foundKeywords.length >= 2;

        resultDiv.classList.remove('safe', 'warning');
        resultDiv.classList.add('visible', isScam ? 'warning' : 'safe');
        if (isScam) {
            resultDiv.textContent = currentLanguage === 'hi'
                ? 'चेतावनी: संभावित स्कैम! इस संदेश पर भरोसा न करें।'
                : 'Warning: Possible Scam';
        } else {
            resultDiv.textContent = currentLanguage === 'hi'
                ? 'यह संदेश सुरक्षित लगता है'
                : 'This message appears safe';
        }
    });
}
