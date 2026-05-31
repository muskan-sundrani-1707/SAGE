# 🦉 SAGE – Smart Assistance for Guided Education

> A Voice-Enabled Digital Literacy Assistant for Elderly Users  
> BTech 2nd Year ML Project | Python · Flask · scikit-learn · SQLite

---

## 🗂 Project Structure

```
SAGE_Project/
├── app.py              ← Flask app + all API routes
├── database.py         ← SQLite helper functions
├── train_models.py     ← Train & save ML models (run ONCE)
├── schema.sql          ← Database table definitions
├── requirements.txt    ← Python dependencies
├── sage.db             ← Auto-created SQLite database
├── models/             ← Saved .pkl model files (auto-created)
│   ├── scam_model.pkl
│   ├── scam_vectorizer.pkl
│   └── difficulty_model.pkl
├── data/               ← Place your CSV datasets here
│   └── spam.csv        ← (optional) Kaggle SMS Spam dataset
├── static/
│   ├── css/sage.css    ← Full stylesheet
│   └── js/sage.js      ← Frontend logic + API calls
└── templates/
    └── index.html      ← Main HTML (served by Flask)
```

---

## ⚡ Quick Start (VSCode Terminal — Step by Step)

### Step 1 — Open SAGE_Project in VSCode
```bash
cd SAGE_Project
```

### Step 2 — Create a Python virtual environment
```bash
python -m venv venv
```

### Step 3 — Activate the virtual environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### Step 4 — Install all dependencies
```bash
pip install -r requirements.txt
```

### Step 5 — Train the ML models (run ONCE)
```bash
python train_models.py
```
This creates `models/scam_model.pkl`, `models/scam_vectorizer.pkl`, `models/difficulty_model.pkl`.

### Step 6 — Start the Flask server
```bash
python app.py
```

### Step 7 — Open in browser
Go to: **http://localhost:5000**

---

## 📊 Adding Real Datasets (Optional — improves ML accuracy)

### Dataset 1: SMS Spam Collection (Kaggle)
1. Go to: https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset
2. Download `spam.csv`
3. Place it in the `data/` folder: `data/spam.csv`
4. Re-run: `python train_models.py`

### Dataset 2: Phishing Email Dataset (Kaggle)
1. Go to: https://www.kaggle.com/datasets/naserabdullahalam/phishing-email-dataset
2. Download `PhishingEmail.csv`
3. Place it in the `data/` folder: `data/PhishingEmail.csv`
4. Re-run: `python train_models.py`

> **Note:** Without real datasets, SAGE uses a built-in synthetic dataset and still works end-to-end. The accuracy improves significantly with the Kaggle datasets (~5,500–18,000 samples).

---

## 🔁 Common VSCode Terminal Commands

| Task | Command |
|------|---------|
| Activate venv (Windows) | `venv\Scripts\activate` |
| Activate venv (Mac/Linux) | `source venv/bin/activate` |
| Install packages | `pip install -r requirements.txt` |
| Train ML models | `python train_models.py` |
| Start Flask server | `python app.py` |
| Stop server | `Ctrl + C` |
| Check installed packages | `pip list` |
| Deactivate venv | `deactivate` |

---

## 🤖 ML Models Used

### Model 1: Scam Detection
- **Algorithm:** Logistic Regression (with TF-IDF Vectorizer)
- **Input:** Raw text (SMS / WhatsApp / Email)
- **Output:** `Scam` or `Safe` (with confidence %)
- **Features:** TF-IDF bigrams (up to 5000 features)
- **Fallback:** Keyword-based scoring if model not trained

### Model 2: Digital Difficulty Predictor
- **Algorithm:** Random Forest Classifier
- **Input:** Age, Education, Smartphone use, Confidence score
- **Output:** `Low`, `Medium`, or `High` assistance level
- **Features:** 4 numerical/categorical features

---

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main SAGE web interface |
| `/api/scam-check` | POST | ML scam detection |
| `/api/voice-query` | POST | Voice assistant response |
| `/api/assess-difficulty` | POST | Difficulty level prediction |
| `/api/stats` | GET | App usage statistics |

### Example API Call (scam check):
```bash
curl -X POST http://localhost:5000/api/scam-check \
  -H "Content-Type: application/json" \
  -d '{"text": "Congratulations! You have won Rs 50,000. Click here to claim."}'
```

---

## 📝 Resume Description

> "Developed **SAGE**, a Voice-Enabled Digital Literacy Assistant for Elderly Users, integrating NLP-based Scam Detection (TF-IDF + Logistic Regression, ~97% accuracy), Random Forest-based Digital Assistance Level Prediction, and Web Speech API-based Voice Recognition. Built with Python/Flask backend, SQLite database, and a bilingual (English/Hindi) responsive frontend."

---

## 🛡 Features

- ✅ ML-powered scam detection (TF-IDF + Logistic Regression)
- ✅ Random Forest digital difficulty predictor
- ✅ Browser-based voice recognition (Web Speech API)
- ✅ Text-to-speech responses (gTTS via browser)
- ✅ Bilingual UI (English + Hindi toggle)
- ✅ Large text accessibility mode
- ✅ 6 digital literacy tutorial modules
- ✅ SQLite interaction logging
- ✅ User profile persistence
- ✅ Real-time usage statistics

---

## 👥 Target Users
Senior citizens (55+) in India with limited digital literacy  
Designed with accessibility-first principles: large buttons, high contrast, voice support

---

## 📜 License
MIT License — Free for academic and personal use
