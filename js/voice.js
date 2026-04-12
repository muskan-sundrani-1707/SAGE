/**
 * SAGE - Voice Assistant
 * - Server: OpenAI Whisper (record → upload) when API is up and Whisper is installed.
 * - Fallback: Web Speech API recognition + speechSynthesis / gTTS.
 */

let recognition = null;
let mediaRecorder = null;
let recordedChunks = [];
let recordingStream = null;
let isRecording = false;

function getAssistantResponse(spokenText) {
    const responses = ASSISTANT_RESPONSES[currentLanguage];
    const raw = spokenText.trim();
    const lower = raw.toLowerCase();
    const keys = Object.keys(responses)
        .filter((k) => k !== 'default')
        .sort((a, b) => String(b).length - String(a).length);
    for (const key of keys) {
        const response = responses[key];
        if (raw.includes(key) || lower.includes(String(key).toLowerCase())) {
            return response;
        }
    }
    return responses.default;
}

function pickRecorderMimeType() {
    const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
    ];
    for (const m of candidates) {
        if (MediaRecorder.isTypeSupported(m)) return m;
    }
    return '';
}

function stopBrowserRecognition() {
    if (!recognition) return;
    try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
    } catch {
        /* ignore */
    }
    recognition = null;
}

async function transcribeBlob(blob) {
    const hint = currentLanguage === 'hi' ? 'hi' : 'en';
    const fd = new FormData();
    fd.append('file', blob, 'speech.webm');
    const url = `${sageApiPath('/api/voice/transcribe')}?language=${encodeURIComponent(hint)}`;
    const r = await fetch(url, { method: 'POST', body: fd });
    if (!r.ok) {
        const err = await r.text();
        throw new Error(err || 'transcribe failed');
    }
    return r.json();
}

function startBrowserRecognition(micButton, speechText, responseText) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        speechText.textContent =
            currentLanguage === 'hi'
                ? 'आपके ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं। Chrome आज़माएँ या बैकएंड पर Whisper इंस्टॉल करें।'
                : 'Speech recognition is not supported. Try Chrome/Edge, or install Whisper on the backend.';
        micButton.disabled = true;
        return;
    }

    stopBrowserRecognition();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => {
        micButton.classList.add('listening');
        const label = micButton.querySelector('.mic-label');
        if (label) label.textContent = currentLanguage === 'hi' ? 'सुन रहा हूँ...' : 'Listening...';
    };

    recognition.onend = () => {
        micButton.classList.remove('listening');
        const label = micButton.querySelector('.mic-label');
        if (label) label.textContent = currentLanguage === 'hi' ? 'बोलने के लिए टैप करें' : 'Tap to Speak';
    };

    recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        speechText.textContent = finalTranscript || interimTranscript || speechText.textContent;
        if (finalTranscript) {
            responseText.textContent = getAssistantResponse(finalTranscript);
        }
    };

    recognition.onerror = (event) => {
        if (event.error !== 'aborted') {
            speechText.textContent = currentLanguage === 'hi' ? 'कृपया दोबारा कोशिश करें' : 'Please try again.';
        }
    };

    speechText.textContent = '';
    responseText.textContent = '';
    try {
        recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.start();
    } catch (e) {
        console.error(e);
        speechText.textContent =
            currentLanguage === 'hi'
                ? 'माइक शुरू नहीं हो सका। दोबारा टैप करें।'
                : 'Could not start microphone. Tap again.';
    }
}

async function toggleWhisperRecording(micButton, speechText, responseText) {
    const label = micButton.querySelector('.mic-label');
    if (!isRecording) {
        stopBrowserRecognition();
        speechText.textContent = '';
        responseText.textContent = '';
        try {
            recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
            speechText.textContent =
                currentLanguage === 'hi'
                    ? 'माइक्रोफ़ोन की अनुमति दें, या ब्राउज़र स्पीच आज़माएँ।'
                    : 'Please allow microphone access, or use browser speech mode.';
            return;
        }
        const mimeType = pickRecorderMimeType();
        const options = mimeType ? { mimeType } : {};
        try {
            mediaRecorder = new MediaRecorder(recordingStream, options);
        } catch {
            recordingStream.getTracks().forEach((t) => t.stop());
            recordingStream = null;
            speechText.textContent =
                currentLanguage === 'hi'
                    ? 'इस ब्राउज़र में रिकॉर्डिंग सपोर्ट नहीं।'
                    : 'Recording is not supported in this browser.';
            return;
        }
        recordedChunks = [];
        mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size) recordedChunks.push(e.data);
        };
        mediaRecorder.onstop = async () => {
            recordingStream.getTracks().forEach((t) => t.stop());
            recordingStream = null;
            micButton.classList.remove('listening');
            if (label) label.textContent = currentLanguage === 'hi' ? 'बोलने के लिए टैप करें' : 'Tap to Speak';
            isRecording = false;
            const blobType = mediaRecorder.mimeType || mimeType || 'audio/webm';
            const blob = new Blob(recordedChunks, { type: blobType });
            if (!blob.size) {
                speechText.textContent = currentLanguage === 'hi' ? 'कोई आवाज़ रिकॉर्ड नहीं हुई' : 'No audio captured.';
                return;
            }
            speechText.textContent = currentLanguage === 'hi' ? 'पहचान हो रही है...' : 'Transcribing...';
            try {
                const data = await transcribeBlob(blob);
                const txt = (data.text || '').trim();
                speechText.textContent = txt || (currentLanguage === 'hi' ? '(खाली)' : '(empty)');
                if (txt) {
                    responseText.textContent = getAssistantResponse(txt);
                }
            } catch (e) {
                console.error(e);
                speechText.textContent =
                    currentLanguage === 'hi'
                        ? 'आवाज़ पहचान नहीं हो सकी। क्या Whisper और ffmpeg लगे हैं? या ब्राउज़र मोड आज़माएँ।'
                        : 'Transcription failed. Install Whisper + ffmpeg on the server, or use browser speech (turn off server STT in config).';
            }
        };
        mediaRecorder.start(200);
        isRecording = true;
        micButton.classList.add('listening');
        if (label) label.textContent = currentLanguage === 'hi' ? 'रोकने के लिए फिर टैप करें' : 'Tap again to stop';
    } else {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            try {
                mediaRecorder.requestData();
            } catch {
                /* ignore */
            }
            mediaRecorder.stop();
        }
    }
}

function initVoiceAssistant() {
    const micButton = document.getElementById('micButton');
    const speechText = document.getElementById('speechText');
    const responseText = document.getElementById('responseText');
    const speakResponseBtn = document.getElementById('speakResponseBtn');
    const synthesis = window.speechSynthesis;

    if (!micButton || !speechText || !responseText || !speakResponseBtn) return;

    sageRefreshVoiceBackend();

    micButton.addEventListener('click', async () => {
        await sageRefreshVoiceBackend();
        const whisperOk = sageIsVoiceBackendOk() && sageWhisperAvailable();
        const useWhisper = whisperOk && window.SAGE_USE_WHISPER !== false;
        if (useWhisper) {
            await toggleWhisperRecording(micButton, speechText, responseText);
            return;
        }
        startBrowserRecognition(micButton, speechText, responseText);
    });

    speakResponseBtn.addEventListener('click', async () => {
        const text = responseText.textContent;
        if (!text) return;
        const lang = currentLanguage === 'hi' ? 'hi' : 'en';
        await sageSpeakWithFallback(text, lang, synthesis);
    });
}
