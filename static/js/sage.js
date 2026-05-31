/**
 * SAGE – Frontend JavaScript
 * Connects all UI interactions to the Flask backend API
 */

/* ────────────────────────────────────────────
   STATE
──────────────────────────────────────────── */
let lang = 'en';
let userId = 'user_' + Math.random().toString(36).slice(2, 8);

/* ────────────────────────────────────────────
   LEARNING CONTENT (full data for modal)
──────────────────────────────────────────── */
const LEARN_DATA = {
  smartphone: {
    en: {
      title: '📱 Smartphone Basics',
      body: `
        <ol>
          <li><strong>Unlock:</strong> Swipe up or enter your PIN/pattern.</li>
          <li><strong>Home screen:</strong> Tap any app icon to open it.</li>
          <li><strong>Back button:</strong> Returns you to the previous screen (or swipe right).</li>
          <li><strong>Volume:</strong> Use the physical buttons on the side of your phone.</li>
          <li><strong>Charging:</strong> Plug the cable into the small port at the bottom of your phone.</li>
          <li><strong>Torch/Flashlight:</strong> Swipe down from the top → tap the torch icon.</li>
          <li><strong>Wi-Fi:</strong> Settings → Wi-Fi → Select your home network → Enter password.</li>
        </ol>
        <div class="warn-box">💡 Tip: If your phone is slow, try restarting it (hold the side button → "Restart").</div>`
    },
    hi: {
      title: '📱 स्मार्टफोन मूल बातें',
      body: `
        <ol>
          <li><strong>अनलॉक:</strong> ऊपर स्वाइप करें या PIN/पैटर्न दर्ज करें।</li>
          <li><strong>होम स्क्रीन:</strong> किसी भी ऐप आइकन पर टैप करके खोलें।</li>
          <li><strong>बैक बटन:</strong> पिछली स्क्रीन पर लौटता है।</li>
          <li><strong>वॉल्यूम:</strong> फोन के किनारे पर भौतिक बटन का उपयोग करें।</li>
          <li><strong>चार्जिंग:</strong> केबल को फोन के नीचे छोटे पोर्ट में लगाएं।</li>
          <li><strong>टॉर्च:</strong> ऊपर से नीचे स्वाइप करें → टॉर्च आइकन पर टैप करें।</li>
        </ol>
        <div class="warn-box">💡 टिप: फोन धीमा हो तो रीस्टार्ट करें (साइड बटन दबाएं → "Restart")।</div>`
    }
  },
  whatsapp: {
    en: {
      title: '💬 WhatsApp & Video Calls',
      body: `
        <ol>
          <li><strong>Install:</strong> Open Play Store (Android) or App Store (iPhone) → Search "WhatsApp" → Install (it's free).</li>
          <li><strong>Register:</strong> Open WhatsApp → Enter your phone number → Enter the OTP (one-time password) sent to your phone.</li>
          <li><strong>Add a contact:</strong> Save the person's number in your phone contacts first — they will appear in WhatsApp automatically.</li>
          <li><strong>Send a message:</strong> Tap on a contact → Type your message → Press the green send button.</li>
          <li><strong>Voice call:</strong> Open a chat → Tap the phone icon (top right).</li>
          <li><strong>Video call:</strong> Open a chat → Tap the video camera icon (top right).</li>
          <li><strong>Share a photo:</strong> In a chat → Tap the 📎 (clip) icon → Gallery → Select photo → Send.</li>
        </ol>
        <div class="warn-box">⚠️ You need internet (Wi-Fi or mobile data) for WhatsApp to work. WhatsApp calls are FREE when on Wi-Fi.</div>`
    },
    hi: {
      title: '💬 WhatsApp और वीडियो कॉल',
      body: `
        <ol>
          <li><strong>इंस्टॉल:</strong> Play Store खोलें → "WhatsApp" खोजें → Install करें (यह मुफ़्त है)।</li>
          <li><strong>रजिस्टर:</strong> WhatsApp खोलें → अपना फोन नंबर डालें → OTP डालें।</li>
          <li><strong>संपर्क जोड़ें:</strong> पहले फोन में नंबर सेव करें — वे WhatsApp में अपने आप दिखेंगे।</li>
          <li><strong>मैसेज:</strong> किसी संपर्क पर टैप करें → मैसेज टाइप करें → हरे बटन से भेजें।</li>
          <li><strong>वॉयस कॉल:</strong> चैट खोलें → ऊपर दाईं ओर फोन आइकन पर टैप करें।</li>
          <li><strong>वीडियो कॉल:</strong> चैट खोलें → ऊपर दाईं ओर वीडियो आइकन पर टैप करें।</li>
        </ol>
        <div class="warn-box">⚠️ WhatsApp के लिए इंटरनेट (Wi-Fi या मोबाइल डेटा) जरूरी है। Wi-Fi पर WhatsApp कॉल मुफ़्त हैं।</div>`
    }
  },
  upi: {
    en: {
      title: '💳 UPI Payments',
      body: `
        <ol>
          <li><strong>Download Google Pay or PhonePe</strong> from Play Store / App Store.</li>
          <li><strong>Link your bank account:</strong> Open the app → Add bank account → Enter your debit card's last 6 digits and expiry date → Set a UPI PIN.</li>
          <li><strong>Your UPI ID:</strong> Usually your mobile number followed by @bankname (e.g. 9876543210@sbi).</li>
          <li><strong>To pay:</strong> Tap "Pay" → Enter recipient's UPI ID or phone number → Enter amount → Review recipient name carefully → Confirm with your UPI PIN.</li>
          <li><strong>To receive money:</strong> Share your UPI ID or QR code — no PIN needed to receive.</li>
        </ol>
        <div class="warn-box">🚨 NEVER share your UPI PIN with anyone. Banks NEVER ask for your PIN. If anyone asks for it, it is a scam.</div>`
    },
    hi: {
      title: '💳 UPI भुगतान',
      body: `
        <ol>
          <li>Play Store से <strong>Google Pay या PhonePe</strong> डाउनलोड करें।</li>
          <li><strong>बैंक खाता लिंक:</strong> ऐप खोलें → बैंक खाता जोड़ें → डेबिट कार्ड के अंतिम 6 अंक और expiry date डालें → UPI PIN सेट करें।</li>
          <li><strong>आपकी UPI ID:</strong> आमतौर पर मोबाइल नंबर@बैंकनाम (जैसे 9876543210@sbi)।</li>
          <li><strong>पैसे भेजें:</strong> "Pay" टैप करें → UPI ID या फोन नंबर डालें → राशि डालें → प्राप्तकर्ता का नाम जाँचें → UPI PIN से पुष्टि करें।</li>
        </ol>
        <div class="warn-box">🚨 अपना UPI PIN कभी किसी के साथ साझा न करें। यह स्कैम है।</div>`
    }
  },
  safety: {
    en: {
      title: '🛡 Online Safety',
      body: `
        <ol>
          <li><strong>NEVER share:</strong> Your OTP, PIN, password, Aadhaar photo, PAN card photo, or bank account details with anyone — even someone claiming to be from your bank or government.</li>
          <li><strong>Verify calls:</strong> If someone says they're from a bank, hang up and call the official number printed on your debit card or bank passbook.</li>
          <li><strong>Suspicious links:</strong> Don't tap links sent via SMS or WhatsApp that look like "bit.ly/..." or "tinyurl.com/..." — these can be traps.</li>
          <li><strong>Too good to be true:</strong> Prize money, lottery wins, income tax refunds, and "urgent" account suspension notices are almost always scams.</li>
          <li><strong>Report a scam:</strong> Call <strong>1930</strong> (National Cyber Crime Helpline) or visit cybercrime.gov.in.</li>
          <li><strong>Forward suspicious SMS</strong> to <strong>7726</strong> (TRAI spam reporting).</li>
        </ol>
        <div class="warn-box">🆘 If you have already shared details and fear fraud, call your bank's customer care immediately and block your account.</div>`
    },
    hi: {
      title: '🛡 ऑनलाइन सुरक्षा',
      body: `
        <ol>
          <li><strong>कभी साझा न करें:</strong> OTP, PIN, पासवर्ड, आधार फोटो, बैंक विवरण।</li>
          <li><strong>कॉल जाँचें:</strong> बैंक का दावा करने वाले को फोन काटें और कार्ड पर छपे नंबर से वापस कॉल करें।</li>
          <li><strong>संदिग्ध लिंक:</strong> SMS या WhatsApp पर आए अजीब लिंक पर टैप न करें।</li>
          <li><strong>बहुत अच्छा लगे तो:</strong> इनाम, लॉटरी, टैक्स रिफंड — ये लगभग हमेशा स्कैम हैं।</li>
          <li><strong>स्कैम की रिपोर्ट:</strong> <strong>1930</strong> पर कॉल करें या cybercrime.gov.in पर जाएं।</li>
        </ol>
        <div class="warn-box">🆘 अगर आपने पहले ही विवरण साझा कर दिए हैं, तुरंत बैंक को कॉल करें।</div>`
    }
  },
  government: {
    en: {
      title: '🏛 Government Services',
      body: `
        <ol>
          <li><strong>DigiLocker (digilocker.gov.in):</strong> Store and access your Aadhaar, PAN card, driving licence, and certificates digitally. Register with your Aadhaar number.</li>
          <li><strong>UMANG App:</strong> One app for 1200+ government services — PF, ration, pension, Aadhaar services, and more.</li>
          <li><strong>mAadhaar:</strong> Download and use your Aadhaar digitally from your phone.</li>
          <li><strong>PM-KISAN:</strong> Check farmer scheme benefits and payment status.</li>
          <li><strong>PMGDISHA:</strong> Free government-run digital literacy training (pmgdisha.in).</li>
          <li><strong>CoWIN:</strong> Access vaccination certificates at cowin.gov.in.</li>
        </ol>
        <div class="warn-box">⚠️ Official government websites end in .gov.in — be careful of fake .com or .org lookalike websites.</div>`
    },
    hi: {
      title: '🏛 सरकारी सेवाएं',
      body: `
        <ol>
          <li><strong>DigiLocker:</strong> आधार, पैन, ड्राइविंग लाइसेंस डिजिटल रूप से रखें।</li>
          <li><strong>UMANG ऐप:</strong> 1200+ सरकारी सेवाओं के लिए एक ऐप।</li>
          <li><strong>mAadhaar:</strong> फोन से आधार डाउनलोड करें।</li>
          <li><strong>PMGDISHA:</strong> मुफ्त डिजिटल साक्षरता प्रशिक्षण (pmgdisha.in)।</li>
        </ol>
        <div class="warn-box">⚠️ सरकारी वेबसाइटें .gov.in पर समाप्त होती हैं — नकली .com साइटों से सावधान रहें।</div>`
    }
  },
  health: {
    en: {
      title: '🏥 Health Apps',
      body: `
        <ol>
          <li><strong>Aarogya Setu:</strong> Government health tracking app. Useful for COVID information and vaccination status.</li>
          <li><strong>eSanjeevani:</strong> Free government telemedicine — consult doctors online from home (esanjeevaniopd.in).</li>
          <li><strong>Practo:</strong> Book doctor appointments, view medical records, and get online consultations.</li>
          <li><strong>ABHA Health ID:</strong> Create your Ayushman Bharat Health Account to store health records digitally (abdm.gov.in).</li>
          <li><strong>Emergency:</strong> Dial 112 for police/ambulance. Dial 108 for ambulance in most states.</li>
        </ol>
        <div class="warn-box">💊 Always consult a real doctor for medical advice. Health apps are for information and appointment booking only.</div>`
    },
    hi: {
      title: '🏥 स्वास्थ्य ऐप',
      body: `
        <ol>
          <li><strong>आरोग्य सेतु:</strong> सरकारी स्वास्थ्य ट्रैकिंग ऐप।</li>
          <li><strong>eSanjeevani:</strong> घर से ऑनलाइन डॉक्टर से परामर्श (मुफ्त)।</li>
          <li><strong>ABHA हेल्थ ID:</strong> स्वास्थ्य रिकॉर्ड डिजिटल रूप से संग्रहीत करें।</li>
          <li><strong>आपातकाल:</strong> 112 पर कॉल करें (पुलिस/एम्बुलेंस)।</li>
        </ol>
        <div class="warn-box">💊 चिकित्सा सलाह के लिए हमेशा असली डॉक्टर से परामर्श करें।</div>`
    }
  }
};

/* ────────────────────────────────────────────
   INIT
──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSession();
  initA11y();
  initHeader();
  initAssess();
  initVoice();
  initScam();
  initLearn();
  loadStats();
});

/* ── SESSION ── */
function initSession() {
  fetch('/api/set-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  }).catch(() => {});
}

/* ── STATS ── */
function loadStats() {
  fetch('/api/stats')
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('statsText');
      if (el) {
        el.textContent = `👥 ${data.registered_users} users · 🛡 ${data.scam_checks} scam checks · 🎤 ${data.voice_queries} queries`;
      }
    }).catch(() => {
      const el = document.getElementById('statsText');
      if (el) el.textContent = 'SAGE – Helping seniors stay safe online';
    });
}

/* ── ACCESSIBILITY ── */
function initA11y() {
  const langBtn = document.getElementById('langBtn');
  const textBtn = document.getElementById('textSizeBtn');
  const narrationBtn = document.getElementById('narrationBtn');

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      lang = lang === 'en' ? 'hi' : 'en';
      applyLanguage();
      langBtn.textContent = lang === 'hi' ? '🌐 English' : '🌐 हिंदी';
    });
  }

  if (textBtn) {
    textBtn.addEventListener('click', () => {
      document.body.classList.toggle('large-text');
      textBtn.textContent = document.body.classList.contains('large-text')
        ? '🔤 Standard Text'
        : '🔤 Large Text';
    });
  }

  if (narrationBtn) {
    narrationBtn.addEventListener('click', () => {
      const hero = document.querySelector('.hero-h1');
      if (hero) speakText(hero.innerText);
    });
  }
}

function applyLanguage() {
  const attr = `data-${lang}`;
  document.querySelectorAll(`[${attr}]`).forEach(el => {
    const val = el.getAttribute(attr);
    if (val !== null) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.innerHTML = val;
      }
    }
  });
  // Update scam textarea placeholder
  const st = document.getElementById('scamInput');
  if (st) st.placeholder = st.getAttribute(`data-placeholder-${lang}`) || st.placeholder;
  // Update quick prompt chip query
}

/* ── HEADER / HAMBURGER ── */
function initHeader() {
  const nav = document.querySelector('.nav');
  const hamburger = document.getElementById('hamburger');
  const header = document.getElementById('siteHeader');

  if (nav && hamburger) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('.nav-a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 20
        ? '0 4px 24px rgba(26,127,110,.18)'
        : '0 4px 24px rgba(26,127,110,.10)';
    });
  }
}

/* ── ASSESS ── */
function initAssess() {
  const slider = document.getElementById('confSlider');
  const sliderVal = document.getElementById('sliderVal');
  slider.addEventListener('input', () => { sliderVal.textContent = slider.value; });

  document.getElementById('assessBtn').addEventListener('click', async () => {
    const btn = document.getElementById('assessBtn');
    btn.classList.add('loading');
    btn.innerHTML = '<span class="spinner"></span> Analysing…';

    const payload = {
      age: parseInt(document.getElementById('ageInput').value) || 60,
      education: document.getElementById('eduSelect').value,
      smartphone_use: document.getElementById('useSelect').value,
      confidence: parseInt(slider.value),
      lang
    };

    try {
      const res = await fetch('/api/assess-difficulty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      showAssessResult(data);
    } catch (e) {
      alert('Could not connect to SAGE server. Make sure Flask is running.');
    } finally {
      btn.classList.remove('loading');
      btn.innerHTML = '<span>🔍</span><span>Assess My Digital Level</span>';
    }
  });
}

function showAssessResult(data) {
  const wrap = document.getElementById('assessResult');
  document.getElementById('resultIcon').textContent = data.icon || '📊';
  document.getElementById('resultLevel').textContent = data.level || '';
  document.getElementById('resultAdvice').textContent = data.advice || '';
  wrap.hidden = false;
  wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── VOICE ASSISTANT ── */
let recognition = null;

function initVoice() {
  const micBtn  = document.getElementById('micBtn');
  const micRing = document.getElementById('micRing');
  const micHint = document.getElementById('micHint');
  const inputBox = document.getElementById('voiceInput');
  const responseBox = document.getElementById('voiceResponse');

  // Quick-prompt chips
  document.querySelectorAll('.qp-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute(lang === 'hi' ? 'data-q-hi' : 'data-q-en') || chip.getAttribute('data-q-en');
      inputBox.textContent = q;
      sendVoiceQuery(q);
    });
  });

  // Speak response
  document.getElementById('speakBtn').addEventListener('click', () => {
    speakText(responseBox.textContent);
  });

  // Clear
  document.getElementById('clearVoiceBtn').addEventListener('click', () => {
    inputBox.textContent = '…';
    responseBox.textContent = '…';
  });

  // Mic button
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    micHint.textContent = 'Speech not supported in this browser. Use the quick chips below.';
    micBtn.disabled = true;
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onstart = () => {
    micBtn.classList.add('listening');
    micRing.classList.add('listening');
    micHint.textContent = lang === 'hi' ? 'सुन रहा हूँ…' : 'Listening…';
  };

  recognition.onend = () => {
    micBtn.classList.remove('listening');
    micRing.classList.remove('listening');
    micHint.textContent = lang === 'hi' ? 'बोलने के लिए टैप करें' : 'Tap to speak';
  };

  recognition.onresult = (event) => {
    let finalT = '', interimT = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalT += t;
      else interimT += t;
    }
    const displayText = finalT || interimT;
    inputBox.textContent = displayText;
    if (finalT) sendVoiceQuery(finalT);
  };

  recognition.onerror = (e) => {
    if (e.error !== 'aborted') {
      inputBox.textContent = lang === 'hi' ? 'कृपया दोबारा कोशिश करें।' : 'Could not hear. Please try again.';
    }
  };

  micBtn.addEventListener('click', () => {
    inputBox.textContent = '…';
    responseBox.textContent = '…';
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    try { recognition.start(); } catch (e) { /* already started */ }
  });
}

async function sendVoiceQuery(text) {
  const responseBox = document.getElementById('voiceResponse');
  responseBox.textContent = '⏳ Thinking…';
  try {
    const res = await fetch('/api/voice-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang })
    });
    const data = await res.json();
    responseBox.textContent = data.response || 'I could not understand. Please try again.';
  } catch (e) {
    responseBox.textContent = 'Could not reach SAGE server. Make sure Flask is running.';
  }
}

/* ── SCAM CHECKER ── */
function initScam() {
  const btn = document.getElementById('scamBtn');
  const clearBtn = document.getElementById('clearScamBtn');
  const input = document.getElementById('scamInput');

  btn.addEventListener('click', () => runScamCheck());

  clearBtn.addEventListener('click', () => {
    input.value = '';
    document.getElementById('scamResult').hidden = true;
  });

  // Example chips
  document.querySelectorAll('.ex-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.msg;
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      runScamCheck();
    });
  });

  // Enter to submit
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) runScamCheck();
  });
}

async function runScamCheck() {
  const input = document.getElementById('scamInput');
  const resultWrap = document.getElementById('scamResult');
  const verdict = document.getElementById('scamVerdict');
  const details = document.getElementById('scamDetails');
  const keywords = document.getElementById('scamKeywords');
  const btn = document.getElementById('scamBtn');

  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }

  btn.classList.add('loading');
  btn.innerHTML = '<span class="spinner"></span> Analysing…';

  try {
    const res = await fetch('/api/scam-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    displayScamResult(data, verdict, details, keywords, resultWrap);
  } catch (e) {
    verdict.className = 'scam-verdict';
    verdict.textContent = '⚠️ Could not connect to SAGE server.';
    resultWrap.hidden = false;
  } finally {
    btn.classList.remove('loading');
    btn.innerHTML = '<span>🔍</span><span>Analyse Message</span>';
  }
}

function displayScamResult(data, verdict, details, keywords, wrap) {
  wrap.hidden = false;

  if (data.is_scam) {
    verdict.className = 'scam-verdict is-scam';
    verdict.innerHTML = lang === 'hi'
      ? '🚨 चेतावनी: यह स्कैम हो सकता है!'
      : '🚨 Warning: This looks like a SCAM!';
    details.innerHTML = lang === 'hi'
      ? `विश्वसनीयता: <strong>${data.confidence}%</strong> | विश्लेषण पद्धति: <strong>${data.method === 'ml' ? 'ML Model' : 'Keyword Analysis'}</strong><br>किसी भी लिंक पर क्लिक न करें। किसी के साथ विवरण साझा न करें। 1930 पर कॉल करें।`
      : `Confidence: <strong>${data.confidence}%</strong> &nbsp;|&nbsp; Method: <strong>${data.method === 'ml' ? 'ML Model (TF-IDF + Logistic Regression)' : 'Keyword Analysis'}</strong><br>Do NOT click any links. Do NOT share details. Call 1930 if in doubt.`;
  } else {
    verdict.className = 'scam-verdict is-safe';
    verdict.innerHTML = lang === 'hi'
      ? '✅ यह संदेश सुरक्षित लगता है।'
      : '✅ This message appears safe.';
    details.innerHTML = lang === 'hi'
      ? `विश्वसनीयता: <strong>${data.confidence}%</strong> | फिर भी सतर्क रहें। अगर संदेह हो, तो साझा न करें।`
      : `Confidence: <strong>${data.confidence}%</strong> &nbsp;|&nbsp; Stay cautious. When in doubt, don't share personal details.`;
  }

  if (data.keywords_found && data.keywords_found.length > 0) {
    keywords.innerHTML = `<strong>${lang === 'hi' ? 'संदिग्ध शब्द:' : 'Suspicious keywords detected:'}</strong><br>` +
      data.keywords_found.map(k => `<span class="kw-pill">${k}</span>`).join('');
    keywords.style.display = 'block';
  } else {
    keywords.style.display = 'none';
  }

  wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── LEARN MODAL ── */
function initLearn() {
  const modal = document.getElementById('learnModal');
  const heading = document.getElementById('modalHeading');
  const body = document.getElementById('modalBody');
  const closeBtn = document.getElementById('modalClose');
  const speakBtn = document.getElementById('modalSpeakBtn');

  document.querySelectorAll('.learn-card').forEach(card => {
    card.addEventListener('click', () => {
      const topic = card.dataset.topic;
      const content = LEARN_DATA[topic];
      if (!content) return;
      const data = content[lang] || content.en;
      heading.innerHTML = data.title;
      body.innerHTML = data.body;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
    window.speechSynthesis?.cancel();
  };

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  speakBtn.addEventListener('click', () => {
    speakText(body.innerText);
  });
}

/* ── SPEECH SYNTHESIS ── */
function speakText(text) {
  if (!window.speechSynthesis) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  utt.rate = 0.88;
  utt.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utt);
}
