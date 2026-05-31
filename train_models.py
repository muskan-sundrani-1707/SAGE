"""
SAGE - Model Training Script
Run this script ONCE to train and save the ML models.

Usage:
    python train_models.py

Datasets required (place in data/ folder):
    data/spam.csv   — Kaggle SMS Spam Collection (or PhishingEmail.csv)

If no dataset found, synthetic training data is generated so the app
still works end-to-end. Replace with real data for better accuracy.
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

os.makedirs('models', exist_ok=True)
os.makedirs('data', exist_ok=True)

print("=" * 60)
print("  SAGE - Model Training Script")
print("=" * 60)

# ──────────────────────────────────────────────────────────────
# MODEL 1: SCAM DETECTION
# ──────────────────────────────────────────────────────────────
print("\n[1/2] Training Scam Detection Model...")

SCAM_SAMPLES = [
    ("CONGRATULATIONS! You have WON a FREE iPhone! Click here to claim NOW: bit.ly/win123", 1),
    ("URGENT: Your bank account has been SUSPENDED. Verify your KYC immediately.", 1),
    ("You have won Rs 50,000 lottery! Send your bank account details to claim.", 1),
    ("Dear customer, your OTP is required to unlock your account. Reply with OTP.", 1),
    ("FREE GIFT for you! Limited time offer. Act now before it expires!!!", 1),
    ("Income Tax Refund of Rs 9,870 is pending. Click to claim: tinyurl.com/tax", 1),
    ("Your Aadhaar is blocked. Update it within 24 hours or face penalty.", 1),
    ("Unusual activity detected on your account. Verify identity immediately.", 1),
    ("Congratulations! You are selected for Rs 2 lakh cash reward. Call now.", 1),
    ("Nigerian Prince needs your help to transfer $10 million inheritance.", 1),
    ("Your PAN card is linked to illegal activities. Contact RBI immediately.", 1),
    ("Win prize money daily! Register now. Free gift for first 100 users!!!", 1),
    ("Account suspended due to non-verification. Click here to verify now.", 1),
    ("You've been selected! Transfer Rs 500 processing fee to claim Rs 1 lakh.", 1),
    ("LAST WARNING: Your SIM will be deactivated. Verify OTP sent to your number.", 1),
    ("Hey, are we still meeting for lunch tomorrow at 1pm?", 0),
    ("Your order has been shipped. Expected delivery: 3-5 business days.", 0),
    ("Reminder: Your doctor's appointment is scheduled for Monday at 10 AM.", 0),
    ("Happy Birthday! Wishing you a wonderful day ahead.", 0),
    ("Please call me when you get a chance, need to discuss the project.", 0),
    ("Your electricity bill of Rs 1,245 is due on 15th. Pay via official app.", 0),
    ("Class cancelled tomorrow due to holiday. No need to come.", 0),
    ("Meeting postponed to 4 PM today. Please update your calendar.", 0),
    ("Thank you for shopping with us. Your receipt is attached.", 0),
    ("Mom, don't forget to take your medicine in the evening.", 0),
    ("The package was delivered at your door. Please collect it.", 0),
    ("Your bus pass renewal is due next week. Visit the transport office.", 0),
    ("Rohit scored 95% in his exams! So proud of him!", 0),
    ("Please find attached the invoice for your reference.", 0),
    ("The library books are due for return by Friday.", 0),
]

# Try loading real dataset
df_scam = None
for fname in ['data/spam.csv', 'data/SMSSpamCollection', 'data/PhishingEmail.csv']:
    if os.path.exists(fname):
        try:
            if 'SMS' in fname:
                df_scam = pd.read_csv(fname, sep='\t', header=None, names=['label', 'text'])
                df_scam['label'] = df_scam['label'].map({'ham': 0, 'spam': 1})
            elif 'Phishing' in fname:
                df_scam = pd.read_csv(fname)
                df_scam = df_scam[['text_combined', 'label']].rename(columns={'text_combined': 'text'})
            else:
                df_scam = pd.read_csv(fname, encoding='latin-1')
                if 'v1' in df_scam.columns:
                    df_scam = df_scam[['v1', 'v2']].rename(columns={'v1': 'label', 'v2': 'text'})
                    df_scam['label'] = df_scam['label'].map({'ham': 0, 'spam': 1})
            df_scam = df_scam.dropna()
            print(f"   ✅ Loaded real dataset: {fname} ({len(df_scam)} samples)")
            break
        except Exception as e:
            print(f"   ⚠️  Could not load {fname}: {e}")

if df_scam is None or len(df_scam) < 50:
    print("   ℹ️  Using built-in synthetic dataset (add real data to data/ for better accuracy)")
    texts, labels = zip(*SCAM_SAMPLES)
    df_scam = pd.DataFrame({'text': texts, 'label': labels})

X = df_scam['text'].astype(str)
y = df_scam['label'].astype(int)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y if y.nunique() > 1 else None)

vectorizer = TfidfVectorizer(
    max_features=5000,
    ngram_range=(1, 2),
    stop_words='english',
    min_df=1
)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

model_scam = LogisticRegression(max_iter=1000, random_state=42)
model_scam.fit(X_train_vec, y_train)

y_pred = model_scam.predict(X_test_vec)
acc = accuracy_score(y_test, y_pred)

print(f"\n   📊 Scam Detection Results:")
print(f"   Accuracy : {acc:.2%}")
print(f"   Samples  : {len(X)} total, {len(X_train)} train, {len(X_test)} test")
if len(set(y_test)) > 1:
    print("\n" + classification_report(y_test, y_pred, target_names=['Safe', 'Scam'], zero_division=0))

with open('models/scam_model.pkl', 'wb') as f:
    pickle.dump(model_scam, f)
with open('models/scam_vectorizer.pkl', 'wb') as f:
    pickle.dump(vectorizer, f)
print("   ✅ Scam model saved to models/")

# ──────────────────────────────────────────────────────────────
# MODEL 2: DIGITAL DIFFICULTY PREDICTOR
# ──────────────────────────────────────────────────────────────
print("\n[2/2] Training Digital Difficulty Predictor...")

np.random.seed(42)
n = 300

ages = np.random.randint(45, 85, n)
educations = np.random.choice([0, 1, 2, 3], n, p=[0.15, 0.25, 0.35, 0.25])
smartphone_use = np.random.choice([0, 1, 2, 3], n, p=[0.2, 0.3, 0.3, 0.2])
confidence = np.random.randint(1, 11, n)

raw_score = (
    (ages - 45) / 10 * 1.5
    + (3 - educations) * 1.2
    + (3 - smartphone_use) * 1.0
    + (10 - confidence) * 0.5
    + np.random.normal(0, 0.5, n)
)

labels = np.where(raw_score < 4, 0, np.where(raw_score < 7, 1, 2))

X_diff = np.column_stack([ages, educations, smartphone_use, confidence])
y_diff = labels

X_tr, X_te, y_tr, y_te = train_test_split(X_diff, y_diff, test_size=0.2, random_state=42)

model_diff = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=6)
model_diff.fit(X_tr, y_tr)

y_pred_d = model_diff.predict(X_te)
acc_d = accuracy_score(y_te, y_pred_d)

print(f"\n   📊 Difficulty Predictor Results:")
print(f"   Accuracy : {acc_d:.2%}")
print(f"   Samples  : {n} total, {len(X_tr)} train, {len(X_te)} test")
print(f"   Classes  : Low({sum(labels==0)}), Medium({sum(labels==1)}), High({sum(labels==2)})")
print("\n" + classification_report(y_te, y_pred_d, target_names=['Low', 'Medium', 'High'], zero_division=0))

with open('models/difficulty_model.pkl', 'wb') as f:
    pickle.dump(model_diff, f)
print("   ✅ Difficulty model saved to models/")

print("\n" + "=" * 60)
print("  ✅ All models trained successfully!")
print("  Run: python app.py  to start the SAGE server.")
print("=" * 60 + "\n")
