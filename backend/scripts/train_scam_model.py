#!/usr/bin/env python3
"""
Train TF-IDF + Logistic Regression on UCI SMS Spam (spam.csv) from Kaggle.
Optional: merge phishing-email dataset CSV for multi-source training.

Place files:
  backend/data/spam.csv          (required) — Kaggle: uciml/sms-spam-collection-dataset
  backend/data/phishing_emails.csv (optional) — Kaggle: naserabdullahalam/phishing-email-dataset
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.config import MODELS_DIR, PHISHING_CSV, SCAM_PIPELINE_PATH, SPAM_CSV  # noqa: E402


def _normalize_spam_df(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path, encoding="latin-1", on_bad_lines="skip")
    df.columns = [c.strip().lower() for c in df.columns]
    text_col = None
    label_col = None
    for c in df.columns:
        if c in ("v2", "message", "text", "sms", "body"):
            text_col = c
        if c in ("v1", "label", "category", "class", "spam"):
            label_col = c
    if text_col is None or label_col is None:
        if len(df.columns) >= 2:
            label_col, text_col = df.columns[0], df.columns[1]
        else:
            raise ValueError(f"Could not detect text/label columns in {path}. Columns: {list(df.columns)}")
    out = pd.DataFrame(
        {
            "text": df[text_col].astype(str).str.strip(),
            "label_raw": df[label_col].astype(str).str.strip().str.lower(),
        }
    )
    # Map to spam / ham
    spam_like = {"spam", "1", "true", "phishing", "phish", "yes", "malicious"}
    ham_like = {"ham", "0", "false", "legit", "legitimate", "benign", "no", "safe"}
    def to_binary(x: str) -> Optional[str]:
        if x in spam_like:
            return "spam"
        if x in ham_like:
            return "ham"
        return None

    out["label"] = out["label_raw"].map(to_binary)
    out = out.dropna(subset=["label"])
    out = out[out["text"].str.len() > 0]
    return out[["text", "label"]]


def load_training_frames(spam_path: Path, phishing_path: Optional[Path]) -> pd.DataFrame:
    frames = [_normalize_spam_df(spam_path)]
    if phishing_path and phishing_path.is_file():
        frames.append(_normalize_spam_df(phishing_path))
    return pd.concat(frames, ignore_index=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train scam classifier (TF-IDF + Logistic Regression)")
    parser.add_argument("--spam", type=Path, default=SPAM_CSV, help="Path to spam.csv")
    parser.add_argument("--phishing", type=Path, default=PHISHING_CSV, help="Optional phishing CSV")
    parser.add_argument("--no-phishing", action="store_true", help="Ignore phishing CSV even if present")
    args = parser.parse_args()

    if not args.spam.is_file():
        print(f"Missing {args.spam}. Download from Kaggle: uciml/sms-spam-collection-dataset → spam.csv")
        sys.exit(1)

    ph_path = None if args.no_phishing else args.phishing
    df = load_training_frames(args.spam, ph_path)
    X = df["text"]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    max_features=50000,
                    ngram_range=(1, 2),
                    min_df=2,
                    max_df=0.95,
                    sublinear_tf=True,
                ),
            ),
            (
                "clf",
                LogisticRegression(
                    max_iter=2000,
                    class_weight="balanced",
                    solver="liblinear",
                ),
            ),
        ]
    )
    pipeline.fit(X_train, y_train)
    pred = pipeline.predict(X_test)
    print(classification_report(y_test, pred))

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, SCAM_PIPELINE_PATH)
    print(f"Saved pipeline to {SCAM_PIPELINE_PATH}")


if __name__ == "__main__":
    main()
