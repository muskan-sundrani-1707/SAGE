#!/usr/bin/env python3
"""
Train Random Forest on your Google Form export (CSV).

Expected columns (flexible names, case-insensitive):
  - age
  - education_level
  - smartphone_usage (Yes/No)
  - confidence_level (1–5)
  - task_completion_time (numeric)

Optional target: outcome / at_risk / support_needed (0/1). If absent, proxy:
  at_risk = 1 when confidence_level <= 2 OR smartphone_usage is No.

Export CSV → backend/data/survey_responses.csv
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd
import sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.config import MODELS_DIR, SURVEY_CSV, SURVEY_ENCODERS_PATH, SURVEY_MODEL_PATH  # noqa: E402
from app.survey_preprocessing import SurveyFeatureEncoder  # noqa: E402


def _norm_col(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.strip().lower()).strip("_")


def _coerce_binary_target(val) -> Optional[float]:
    if pd.isna(val):
        return None
    s = str(val).strip().lower()
    if s in ("1", "true", "yes", "high", "at_risk", "risk", "needs_help"):
        return 1.0
    if s in ("0", "false", "no", "low", "ok", "safe"):
        return 0.0
    try:
        v = float(s)
        return 1.0 if v >= 1 else 0.0
    except ValueError:
        return None


def load_survey(path: Path) -> tuple[pd.DataFrame, pd.Series, str]:
    df = pd.read_csv(path, on_bad_lines="skip")
    df.columns = [_norm_col(c) for c in df.columns]

    aliases = {
        "age": ["age", "age_years"],
        "education_level": ["education_level", "education", "qualification"],
        "smartphone_usage": ["smartphone_usage", "smartphone", "uses_smartphone", "phone_usage"],
        "confidence_level": ["confidence_level", "confidence", "digital_confidence"],
        "task_completion_time": [
            "task_completion_time",
            "task_time",
            "completion_time",
            "time_taken",
            "task_completion_seconds",
        ],
        "target": ["outcome", "at_risk", "support_needed", "risk", "label", "needs_help"],
    }
    resolved: dict[str, str] = {}
    for canon, options in aliases.items():
        for opt in options:
            if opt in df.columns:
                resolved[canon] = opt
                break

    required = ["age", "education_level", "smartphone_usage", "confidence_level", "task_completion_time"]
    missing = [k for k in required if k not in resolved]
    if missing:
        raise ValueError(
            f"Missing columns in {path}. Need mappings for: {missing}. Found: {list(df.columns)}"
        )

    X = pd.DataFrame(
        {
            "age": pd.to_numeric(df[resolved["age"]], errors="coerce"),
            "education_level": df[resolved["education_level"]].astype(str).str.strip(),
            "smartphone_usage": df[resolved["smartphone_usage"]].astype(str).str.strip(),
            "confidence_level": pd.to_numeric(df[resolved["confidence_level"]], errors="coerce"),
            "task_completion_time": pd.to_numeric(df[resolved["task_completion_time"]], errors="coerce"),
        }
    )

    target_key = resolved.get("target")
    if target_key:
        y_series = df[target_key].map(_coerce_binary_target)
        valid = y_series.notna() & X["age"].notna() & X["confidence_level"].notna() & X["task_completion_time"].notna()
        X = X.loc[valid].copy()
        y = y_series.loc[valid].astype(int)
        mode = "from_column"
    else:
        valid = X["age"].notna() & X["confidence_level"].notna() & X["task_completion_time"].notna()
        X = X.loc[valid].copy()
        su = X["smartphone_usage"].str.lower()
        no_phone = su.isin(["no", "n", "0", "false", "नहीं"])
        y = ((X["confidence_level"] <= 2) | no_phone).astype(int)
        mode = "proxy_at_risk"

    X = X.fillna({"education_level": "unknown"})
    return X, y, mode


def build_pipeline() -> Pipeline:
    return Pipeline(
        [
            ("prep", SurveyFeatureEncoder()),
            (
                "clf",
                RandomForestClassifier(
                    n_estimators=200,
                    max_depth=12,
                    min_samples_leaf=2,
                    class_weight="balanced",
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Train survey Random Forest")
    parser.add_argument("--csv", type=Path, default=SURVEY_CSV)
    args = parser.parse_args()

    if not args.csv.is_file():
        print(f"Missing {args.csv}. Export your Google Form as CSV into backend/data/.")
        sys.exit(1)

    X, y, target_mode = load_survey(args.csv)
    feature_cols = ["age", "education_level", "smartphone_usage", "confidence_level", "task_completion_time"]
    X = X[feature_cols]

    if len(X) < 10:
        print("Warning: very few rows; model may not generalize. Collect more form responses.")

    strat = y if y.nunique() > 1 else None
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=strat)

    pipe = build_pipeline()
    pipe.fit(X_train, y_train)
    pred = pipe.predict(X_test)
    print(classification_report(y_test, pred, zero_division=0))
    print(f"Target mode: {target_mode}")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipe, SURVEY_MODEL_PATH)
    joblib.dump(
        {
            "target_mode": target_mode,
            "feature_cols": feature_cols,
            "sklearn_version": sklearn.__version__,
        },
        SURVEY_ENCODERS_PATH,
    )
    print(f"Saved survey model to {SURVEY_MODEL_PATH}")


if __name__ == "__main__":
    main()
