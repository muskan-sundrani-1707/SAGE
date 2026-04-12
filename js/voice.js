/**
 * SAGE - Voice Assistant
 * Web Speech API integration
 */

let recognition = null;

function getAssistantResponse(spokenText) {
    const responses = ASSISTANT_RESPONSES[currentLanguage];
    for (const [key, response] of Object.entries(responses)) {
        if (key !== 'default' && spokenText.includes(key)) {
            return response;
        }
    }
    return responses.default;
}

function initVoiceAssistant() {
    const micButton = document.getElementById('micButton');
    const speechText = document.getElementById('speechText');
    const responseText = document.getElementById('responseText');
    const speakResponseBtn = document.getElementById('speakResponseBtn');
    const synthesis = window.speechSynthesis;

    if (!micButton || !speechText || !responseText || !speakResponseBtn) return;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        speechText.textContent = 'Speech recognition is not supported in your browser. Try Chrome or Edge.';
        micButton.disabled = true;
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => {
        micButton.classList.add('listening');
        micButton.querySelector('.mic-label').textContent = currentLanguage === 'hi' ? 'सुन रहा हूँ...' : 'Listening...';
    };

    recognition.onend = () => {
        micButton.classList.remove('listening');
        micButton.querySelector('.mic-label').textContent = currentLanguage === 'hi' ? 'बोलने के लिए टैप करें' : 'Tap to Speak';
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
            const response = getAssistantResponse(finalTranscript.toLowerCase());
            responseText.textContent = response;
        }
    };

    recognition.onerror = (event) => {
        if (event.error !== 'aborted') {
            speechText.textContent = currentLanguage === 'hi' ? 'कृपया दोबारा कोशिश करें' : 'Please try again.';
        }
    };

    micButton.addEventListener('click', () => {
        speechText.textContent = '';
        responseText.textContent = '';
        try {
            recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
            recognition.start();
        } catch (e) {
            console.error(e);
        }
    });

    speakResponseBtn.addEventListener('click', () => {
        const text = responseText.textContent;
        if (text && synthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
            utterance.rate = 0.9;
            synthesis.cancel();
            synthesis.speak(utterance);
        }
    });
}
