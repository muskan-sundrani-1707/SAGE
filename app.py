"""
SAGE - Smart Assistance for Guided Education
Main Flask Application (v2) — User + Admin portals
"""

from flask import (Flask, render_template, request, jsonify,
                   session, redirect, url_for, abort)
from werkzeug.security import generate_password_hash, check_password_hash
from database import (init_db, log_interaction, save_user_profile,
                      get_user_profile, get_stats, get_admin_stats,
                      create_user, get_registered_user, update_last_login,
                      log_session_start, log_session_end)
import os, pickle, re
from functools import wraps

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'sage-secret-key-2025-change-me')

ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'sage@admin123'   

# ──────────────────────────────────────────────────────────────
#  ML Models
# ──────────────────────────────────────────────────────────────
scam_model = scam_vectorizer = difficulty_model = None

def load_models():
    global scam_model, scam_vectorizer, difficulty_model
    for attr, fname in [('scam_model','models/scam_model.pkl'),
                        ('scam_vectorizer','models/scam_vectorizer.pkl'),
                        ('difficulty_model','models/difficulty_model.pkl')]:
        try:
            with open(fname,'rb') as f:
                globals()[attr] = pickle.load(f)
            print(f"✅ {fname} loaded.")
        except FileNotFoundError:
            print(f"⚠️  {fname} not found — using fallback.")

SCAM_KEYWORDS = [
    'urgent','verify','suspended','blocked','click here','congratulations',
    'winner','prize','free gift','lottery','claim now','act now','expires',
    'otp','bank account','transfer','refund','income tax','nigerian','prince',
    'inheritance','cash reward','unusual activity','confirm your identity',
    'kyc','pan card','aadhaar update','password reset',
    'your account has been','verify your account','limited time','you have won'
]

def keyword_scam_detect(text):
    tl = text.lower()
    score, found = 0, []
    for kw in SCAM_KEYWORDS:
        if kw in tl:
            score += 1
            found.append(kw)
    if '!!!' in text or len(re.findall(r'[A-Z]',text)) > len(text)*.3:
        score += 2
    if re.search(r'http|bit\.ly|tinyurl|t\.me', tl):
        score += 1
    is_scam = score >= 2 or len(found) >= 2
    return {'is_scam': is_scam, 'confidence': min(100, score*15+(30 if found else 0)),
            'keywords_found': found[:5], 'method':'keyword'}

def ml_scam_detect(text):
    if scam_vectorizer and scam_model:
        vec   = scam_vectorizer.transform([text])
        pred  = scam_model.predict(vec)[0]
        proba = scam_model.predict_proba(vec)[0]
        return {'is_scam': bool(pred==1), 'confidence': int(max(proba)*100),
                'keywords_found': [], 'method':'ml'}
    return keyword_scam_detect(text)

def predict_difficulty(age, education, smartphone_use, confidence_score):
    if difficulty_model:
        try:
            edu = {'none':0,'primary':1,'secondary':2,'graduate':3}
            use = {'never':0,'rarely':1,'sometimes':2,'daily':3}
            pred = difficulty_model.predict([[age, edu.get(education.lower(),1),
                                              use.get(smartphone_use.lower(),1),
                                              confidence_score]])[0]
            return {0:'Low Assistance',1:'Medium Assistance',2:'High Assistance'}.get(int(pred),'Medium Assistance')
        except Exception:
            pass
    # rule-based fallback
    s  = (3 if age>=70 else 2 if age>=60 else 1)
    s += {'none':3,'primary':2,'secondary':1,'graduate':0}.get(education.lower(),1)
    s += {'never':3,'rarely':2,'sometimes':1,'daily':0}.get(smartphone_use.lower(),1)
    s += (2 if confidence_score<=3 else 1 if confidence_score<=6 else 0)
    return 'High Assistance' if s>=7 else 'Medium Assistance' if s>=4 else 'Low Assistance'

# ──────────────────────────────────────────────────────────────
#  Decorators
# ──────────────────────────────────────────────────────────────
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('user_logged_in'):
            return redirect(url_for('user_login'))
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated

# ──────────────────────────────────────────────────────────────
#  PUBLIC ROUTES
# ──────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return redirect(url_for('user_login'))

# ──────────────────────────────────────────────────────────────
#  USER PORTAL
# ──────────────────────────────────────────────────────────────
@app.route('/user/login', methods=['GET','POST'])
def user_login():
    if session.get('user_logged_in'):
        return redirect(url_for('user_dashboard'))
    error = None
    if request.method == 'POST':
        username = request.form.get('username','').strip()
        password = request.form.get('password','')
        user = get_registered_user(username)
        if user and check_password_hash(user['password'], password):
            session['user_logged_in'] = True
            session['username']       = username
            session['display_name']   = user['display_name'] or username
            session['user_db_id']     = user['id']
            session_id = log_session_start(username, request.remote_addr)
            session['session_db_id']  = session_id
            update_last_login(username)
            return redirect(url_for('user_dashboard'))
        error = 'Invalid username or password.'
    return render_template('user_login.html', error=error)

@app.route('/user/register', methods=['GET','POST'])
def user_register():
    error = success = None
    if request.method == 'POST':
        username     = request.form.get('username','').strip()
        password     = request.form.get('password','')
        display_name = request.form.get('display_name','').strip()
        email        = request.form.get('email','').strip()
        if len(username) < 3:
            error = 'Username must be at least 3 characters.'
        elif len(password) < 6:
            error = 'Password must be at least 6 characters.'
        else:
            pw_hash = generate_password_hash(password)
            ok = create_user(username, pw_hash, display_name, email)
            if ok:
                success = 'Account created! You can now log in.'
            else:
                error = 'Username already taken. Try another.'
    return render_template('user_login.html', error=error, success=success, show_register=True)

@app.route('/user/logout')
def user_logout():
    if session.get('session_db_id'):
        log_session_end(session['session_db_id'])
    session.clear()
    return redirect(url_for('user_login'))

@app.route('/user/dashboard')
@login_required
def user_dashboard():
    profile = get_user_profile(session['username'])
    return render_template('user_dashboard.html',
                           display_name=session.get('display_name',''),
                           username=session.get('username',''),
                           profile=profile)

# ──────────────────────────────────────────────────────────────
#  ADMIN PORTAL
# ──────────────────────────────────────────────────────────────
@app.route('/admin/login', methods=['GET','POST'])
def admin_login():
    if session.get('admin_logged_in'):
        return redirect(url_for('admin_dashboard'))
    error = None
    if request.method == 'POST':
        u = request.form.get('username','')
        p = request.form.get('password','')
        if u == ADMIN_USERNAME and p == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            session['admin_name']      = 'Admin'
            return redirect(url_for('admin_dashboard'))
        error = 'Invalid admin credentials.'
    return render_template('admin_login.html', error=error)

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    session.pop('admin_name', None)
    return redirect(url_for('admin_login'))

@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    data = get_admin_stats()
    return render_template('admin_dashboard.html', data=data)

# Admin API — returns JSON for live refresh
@app.route('/admin/api/stats')
@admin_required
def admin_api_stats():
    return jsonify(get_admin_stats())

# ──────────────────────────────────────────────────────────────
#  SAGE FEATURE APIs (used by user_dashboard.html)
# ──────────────────────────────────────────────────────────────
@app.route('/api/scam-check', methods=['POST'])
@login_required
def scam_check():
    data = request.get_json()
    text = data.get('text','').strip()
    if not text:
        return jsonify({'error':'No text provided'}), 400
    if len(text) > 5000:
        return jsonify({'error':'Text too long'}), 400
    result  = ml_scam_detect(text)
    user_id = session.get('username','anonymous')
    log_interaction(user_id, 'scam_check', text[:200], str(result['is_scam']))
    return jsonify(result)

@app.route('/api/voice-query', methods=['POST'])
@login_required
def voice_query():
    data = request.get_json()
    text = data.get('text','').strip().lower()
    lang = data.get('lang','en')

    responses_en = {
        'video call': "To make a video call on WhatsApp: Open WhatsApp, select a contact, and tap the video camera icon at the top right. Make sure you allow camera and microphone access when asked.",
        'upi':        "UPI (Unified Payments Interface) lets you send money using apps like Google Pay or PhonePe. Link your bank account, create a UPI ID, and use it to pay anyone instantly.",
        'whatsapp':   "WhatsApp is a free messaging app. Download it from Play Store or App Store, register with your phone number, and you can message, call, or video call your contacts.",
        'scam':       "Be very careful! Never share your OTP, PIN, or bank details with anyone — not even someone claiming to be from a bank. Banks NEVER ask for these details over phone or message.",
        'password':   "Keep your passwords secret. Use a mix of letters, numbers, and symbols. Never use the same password for multiple apps.",
        'internet':   "To connect to the internet, turn on Wi-Fi in your phone settings and select your home Wi-Fi network. Or enable mobile data from settings.",
        'google pay': "Open Google Pay, tap 'Pay' or 'Send', enter the UPI ID or phone number of who you want to pay, enter the amount, and confirm with your PIN.",
        'aadhaar':    "Your Aadhaar card is a 12-digit unique identity number. You can download a digital copy from uidai.gov.in or using the mAadhaar app.",
        'how to':     "I can help you with WhatsApp, UPI payments, video calls, internet safety, and more. What would you like to learn about?",
    }
    responses_hi = {
        'video call': "व्हाट्सएप पर वीडियो कॉल के लिए: व्हाट्सएप खोलें, संपर्क चुनें, और ऊपर दाईं ओर वीडियो कैमरा आइकन पर टैप करें।",
        'upi':        "UPI आपको Google Pay या PhonePe जैसे ऐप से बैंक से पैसे भेजने की सुविधा देता है। बैंक खाता लिंक करें और UPI ID बनाएं।",
        'whatsapp':   "व्हाट्सएप एक मुफ्त मैसेजिंग ऐप है। प्ले स्टोर से डाउनलोड करें, फोन नंबर से रजिस्टर करें।",
        'scam':       "सावधान! अपना OTP, PIN या बैंक विवरण किसी के साथ साझा न करें। बैंक कभी फोन पर यह नहीं माँगते।",
        'password':   "अपना पासवर्ड गुप्त रखें। अक्षर, संख्या और प्रतीक मिलाकर मजबूत पासवर्ड बनाएं।",
    }

    responses     = responses_hi if lang == 'hi' else responses_en
    response_text = next((v for k,v in responses.items() if k in text), None)
    if not response_text:
        response_text = (
            "मैं मदद के लिए यहाँ हूँ! पूछें: 'WhatsApp', 'UPI', 'वीडियो कॉल', या 'स्कैम' के बारे में।"
            if lang == 'hi' else
            "I'm here to help! Try asking about: WhatsApp, UPI payments, video calls, internet safety, or passwords."
        )

    log_interaction(session.get('username','anon'), 'voice_query', text[:200], response_text[:200])
    return jsonify({'response': response_text})

@app.route('/api/assess-difficulty', methods=['POST'])
@login_required
def assess_difficulty():
    data = request.get_json()
    try:
        age    = int(data.get('age', 60))
        edu    = data.get('education','secondary')
        use    = data.get('smartphone_use','sometimes')
        conf   = int(data.get('confidence', 5))
        lang   = data.get('lang','en')
    except (ValueError, TypeError):
        return jsonify({'error':'Invalid input'}), 400

    level = predict_difficulty(age, edu, use, conf)

    advice_map = {
        'Low Assistance':    {'en':"Great! You're comfortable with technology. We'll provide quick tips and advanced features.",'hi':"बहुत अच्छा! आप तकनीक में कुशल हैं।"},
        'Medium Assistance': {'en':"We'll guide you step by step with clear instructions for each digital task.",'hi':"हम आपको हर डिजिटल कार्य के लिए चरण दर चरण मार्गदर्शन करेंगे।"},
        'High Assistance':   {'en':"No worries! We'll start from the basics and go at your pace with full voice support.",'hi':"चिंता न करें! हम बुनियादी बातों से शुरू करेंगे।"},
    }

    save_user_profile(session.get('username','anon'), age, edu, use, conf, level)
    log_interaction(session.get('username','anon'), 'assess', f"age={age},edu={edu}", level)

    return jsonify({
        'level':  level,
        'advice': advice_map[level].get(lang, advice_map[level]['en']),
        'icon':   {'Low Assistance':'🟢','Medium Assistance':'🟡','High Assistance':'🔴'}[level]
    })

@app.route('/api/set-session', methods=['POST'])
def set_session():
    # This endpoint is kept for compatibility with the dashboard frontend.
    # It does not create a permanent session record by itself.
    return jsonify({'status':'ok'})

@app.route('/api/stats')
def stats():
    return jsonify(get_stats())

# ──────────────────────────────────────────────────────────────
if __name__ == '__main__':
    init_db()
    load_models()
    app.run(debug=True, port=5000)
