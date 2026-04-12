/**
 * SAGE – speech output: prefer server gTTS (good Hindi), else browser SpeechSynthesis with voice pick.
 */

let _sageBackendVoiceOk = false;
/** @type {{ whisper_available?: boolean } | null} */
let _sageLastHealth = null;

async function sageRefreshVoiceBackend() {
    try {
        const r = await fetch(sageApiPath('/api/health'));
        if (!r.ok) throw new Error('health');
        _sageLastHealth = await r.json();
        _sageBackendVoiceOk = true;
    } catch {
        _sageLastHealth = null;
        _sageBackendVoiceOk = false;
    }
    return _sageBackendVoiceOk;
}

function sageIsVoiceBackendOk() {
    return _sageBackendVoiceOk;
}

/** True if API reports OpenAI Whisper is installed (server-side STT). */
function sageWhisperAvailable() {
    return !!(_sageLastHealth && _sageLastHealth.whisper_available === true);
}

async function sagePlayGtts(text, lang) {
    const l = lang === 'hi' ? 'hi' : 'en';
    const r = await fetch(`${sageApiPath('/api/tts')}?lang=${encodeURIComponent(l)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });
    if (!r.ok) throw new Error('gTTS failed');
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    try {
        await audio.play();
        await new Promise((resolve, reject) => {
            audio.addEventListener('ended', resolve, { once: true });
            audio.addEventListener('error', reject, { once: true });
        });
    } finally {
        URL.revokeObjectURL(url);
    }
}

function sagePickVoice(synthesis, lang) {
    const voices = synthesis.getVoices();
    if (!voices || !voices.length) return null;
    if (lang === 'hi') {
        const hi =
            voices.find((v) => v.lang && v.lang.toLowerCase() === 'hi-in') ||
            voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('hi')) ||
            voices.find((v) => /hindi|हिन्दी|हिंदी/i.test(v.name || ''));
        return hi || null;
    }
    const en =
        voices.find((v) => v.lang && v.lang.toLowerCase() === 'en-in') ||
        voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en')) ||
        null;
    return en;
}

function sageWhenVoicesReady(synthesis, fn) {
    const run = () => fn(synthesis.getVoices());
    const voices = synthesis.getVoices();
    if (voices && voices.length) {
        run();
        return;
    }
    const done = () => {
        synthesis.removeEventListener('voiceschanged', done);
        run();
    };
    synthesis.addEventListener('voiceschanged', done);
    setTimeout(() => {
        synthesis.removeEventListener('voiceschanged', done);
        run();
    }, 500);
}

/**
 * Hindi: try gTTS first whenever backend is up (browser hi-IN is often missing or silent).
 */
async function sageSpeakWithFallback(text, lang, synthesis) {
    const trimmed = (text || '').trim();
    if (!trimmed) return;

    await sageRefreshVoiceBackend();

    const preferGtts = _sageBackendVoiceOk && (lang === 'hi' || window.SAGE_USE_GTTS !== false);
    if (preferGtts) {
        try {
            await sagePlayGtts(trimmed, lang);
            return;
        } catch (e) {
            console.warn('gTTS failed, using browser speech', e);
        }
    }

    if (!synthesis) return;

    sageWhenVoicesReady(synthesis, () => {
        const utterance = new SpeechSynthesisUtterance(trimmed);
        utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = lang === 'hi' ? 0.88 : 0.9;
        const v = sagePickVoice(synthesis, lang);
        if (v) utterance.voice = v;
        synthesis.cancel();
        synthesis.speak(utterance);
    });
}
