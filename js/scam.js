/**
 * SAGE - Scam Checker
 * Primary: TF-IDF + Logistic Regression via backend (/api/scam/check).
 * Fallback: keyword heuristics when the API is offline or the model is not trained.
 */

async function sageFetchHealth() {
    try {
        const r = await fetch(sageApiPath('/api/health'), { method: 'GET' });
        return r.ok;
    } catch {
        return false;
    }
}

function scamKeywordFallback(text) {
    const t = text.trim().toLowerCase();
    let scamScore = 0;
    const foundKeywords = [];
    for (const keyword of SCAM_KEYWORDS) {
        if (t.includes(keyword)) {
            scamScore++;
            foundKeywords.push(keyword);
        }
    }
    if (t.includes('!!!') || (t.match(/[A-Z]/g) || []).length > t.length * 0.3) {
        scamScore += 2;
    }
    if (t.includes('http') || t.includes('bit.ly') || t.includes('tinyurl')) {
        scamScore += 1;
    }
    return scamScore >= 2 || foundKeywords.length >= 2;
}

function initScamChecker() {
    const scamInput = document.getElementById('scamInput');
    const checkBtn = document.getElementById('checkScamBtn');
    const resultDiv = document.getElementById('scamResult');

    if (!scamInput || !checkBtn || !resultDiv) return;

    checkBtn.addEventListener('click', async () => {
        const raw = scamInput.value.trim();
        if (!raw) {
            resultDiv.textContent = currentLanguage === 'hi' ? 'कृपया संदेश पेस्ट करें' : 'Please paste a message to check.';
            resultDiv.className = 'scam-result visible';
            return;
        }

        let usedMl = false;
        let isScam = false;
        let detailEn = '';
        let detailHi = '';

        const healthy = await sageFetchHealth();
        if (healthy) {
            try {
                const r = await fetch(sageApiPath('/api/scam/check'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: raw }),
                });
                if (r.ok) {
                    const data = await r.json();
                    usedMl = true;
                    isScam = data.label === 'spam';
                    const p = typeof data.spam_probability === 'number' ? Math.round(data.spam_probability * 100) : null;
                    detailEn = p != null ? ` (ML: ${p}% spam likelihood)` : ' (ML)';
                    detailHi = p != null ? ` (एमएल: ${p}% स्पैम संभावना)` : ' (एमएल)';
                }
            } catch {
                /* fall through to keyword */
            }
        }

        if (!usedMl) {
            isScam = scamKeywordFallback(raw);
            detailEn = ' (keyword fallback — train the backend model for full accuracy)';
            detailHi = ' (कीवर्ड फ़ॉलबैक — पूर्ण सटीकता के लिए बैकएंड मॉडल ट्रेन करें)';
        }

        resultDiv.classList.remove('safe', 'warning');
        resultDiv.classList.add('visible', isScam ? 'warning' : 'safe');
        if (isScam) {
            resultDiv.textContent =
                (currentLanguage === 'hi'
                    ? 'चेतावनी: संभावित स्कैम! इस संदेश पर भरोसा न करें।'
                    : 'Warning: Possible scam — do not trust this message.') + (currentLanguage === 'hi' ? detailHi : detailEn);
        } else {
            resultDiv.textContent =
                (currentLanguage === 'hi' ? 'यह संदेश सुरक्षित लगता है' : 'This message appears safe') +
                (currentLanguage === 'hi' ? detailHi : detailEn);
        }
    });
}
