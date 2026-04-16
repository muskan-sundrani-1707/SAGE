"""Survey feature encoding without ColumnTransformer (stable joblib across sklearn versions)."""

from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import StandardScaler


class SurveyFeatureEncoder(BaseEstimator, TransformerMixin):
    """One-hot categoricals + scaled numerics → dense matrix for RandomForest."""

    _numeric = ("age", "confidence_level", "task_completion_time")
    _categorical = ("education_level", "smartphone_usage")

    def fit(self, X, y=None):
        X = pd.DataFrame(X)
        med = X[list(self._numeric)].median()
        self.numeric_medians_ = med
        Xn = X[list(self._numeric)].fillna(med)
        self.scaler_ = StandardScaler().fit(Xn.values.astype(float))
        cat = X[list(self._categorical)].fillna("unknown").astype(str)
        dummies = pd.get_dummies(cat)
        self.dummy_columns_ = dummies.columns.tolist()
        return self

    def transform(self, X):
        X = pd.DataFrame(X)
        Xn = X[list(self._numeric)].fillna(self.numeric_medians_).values.astype(float)
        Xn = self.scaler_.transform(Xn)
        cat = X[list(self._categorical)].fillna("unknown").astype(str)
        dummies = pd.get_dummies(cat)
        dummies = dummies.reindex(columns=self.dummy_columns_, fill_value=0)
        return np.hstack([Xn, dummies.values.astype(float)])
