import io
import math
from typing import Any

import numpy as np
import pandas as pd
from fastapi import HTTPException
from sklearn.ensemble import IsolationForest, RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    recall_score,
)
from sklearn.model_selection import GroupShuffleSplit, train_test_split

from .services import MAX_CSV_BYTES, MAX_CSV_COLUMNS, MAX_CSV_ROWS, analyze_csv

MODEL_LIMITATION = (
    "Exploratory analysis of user-provided data only. NASA provenance, units, labels, "
    "run independence, and operational validity are not established."
)
MAX_MODEL_ROWS = 20_000
MAX_MODEL_FEATURES = 50


def _read_frame(csv_text: str) -> pd.DataFrame:
    if len(csv_text.encode("utf-8")) > MAX_CSV_BYTES:
        raise HTTPException(status_code=413, detail="CSV exceeds the 10 MB limit.")
    analyze_csv(csv_text)
    try:
        frame = pd.read_csv(io.StringIO(csv_text))
    except (pd.errors.ParserError, UnicodeDecodeError, ValueError) as error:
        raise HTTPException(status_code=422, detail=f"Could not parse CSV: {error}") from error
    if len(frame) > MAX_CSV_ROWS or len(frame.columns) > MAX_CSV_COLUMNS:
        raise HTTPException(status_code=413, detail="CSV exceeds the supported row or column limit.")
    if len(frame) > MAX_MODEL_ROWS:
        raise HTTPException(status_code=413, detail=f"Model input is limited to {MAX_MODEL_ROWS:,} rows.")
    return frame


def _numeric_features(
    frame: pd.DataFrame,
    excluded: set[str],
) -> tuple[pd.DataFrame, list[str]]:
    features: dict[str, pd.Series] = {}
    for column in frame.columns:
        if column in excluded:
            continue
        values = pd.to_numeric(frame[column], errors="coerce")
        non_empty = frame[column].notna().sum()
        valid = values.notna().sum()
        if valid >= 2 and valid >= non_empty * 0.8:
            features[column] = values
    if not features:
        raise HTTPException(
            status_code=422,
            detail="At least one numeric feature column is required in addition to the selected target.",
        )
    if len(features) > MAX_MODEL_FEATURES:
        raise HTTPException(
            status_code=413,
            detail=f"Model input is limited to {MAX_MODEL_FEATURES} numeric feature columns.",
        )
    result = pd.DataFrame(features).replace([np.inf, -np.inf], np.nan)
    result = result.fillna(result.median()).fillna(0)
    return result, list(features)


def train_random_forest(
    csv_text: str,
    target_column: str,
    problem_type: str,
    group_column: str | None,
    test_size: float,
) -> dict[str, Any]:
    frame = _read_frame(csv_text)
    if target_column not in frame.columns:
        raise HTTPException(status_code=422, detail="Selected target column was not found.")
    if group_column and group_column not in frame.columns:
        raise HTTPException(status_code=422, detail="Selected group column was not found.")
    if group_column == target_column:
        raise HTTPException(status_code=422, detail="Target and group columns must be different.")
    if frame[target_column].isna().any():
        raise HTTPException(status_code=422, detail="Target column contains missing values.")
    if len(frame) < 10:
        raise HTTPException(status_code=422, detail="At least 10 rows are required for an exploratory train/test split.")

    features, feature_names = _numeric_features(frame, {target_column, group_column or ""})
    if problem_type == "classification":
        target = frame[target_column].astype(str)
        class_counts = target.value_counts()
        if len(class_counts) < 2 or class_counts.min() < 2:
            raise HTTPException(status_code=422, detail="Classification requires at least two classes with two or more rows each.")
    elif problem_type == "regression":
        target = pd.to_numeric(frame[target_column], errors="coerce")
        if target.isna().any() or not np.isfinite(target.to_numpy(dtype=float)).all():
            raise HTTPException(status_code=422, detail="Regression target must contain finite numeric values without missing values.")
    else:
        raise HTTPException(status_code=422, detail="Choose classification or regression.")

    all_indices = np.arange(len(frame))
    if group_column:
        groups = frame[group_column]
        if groups.isna().any() or groups.nunique() < 2:
            raise HTTPException(status_code=422, detail="Group split requires at least two non-empty groups.")
        splitter = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=42)
        train_indices, test_indices = next(splitter.split(features, target, groups))
        if len(train_indices) < 2 or len(test_indices) < 2:
            raise HTTPException(status_code=422, detail="The selected groups do not create a usable train/test split.")
        if problem_type == "classification" and set(target.iloc[train_indices]) != set(target):
            raise HTTPException(status_code=422, detail="Training groups do not contain every target class; choose different groups.")
    else:
        stratify = target if problem_type == "classification" else None
        try:
            train_indices, test_indices = train_test_split(
                all_indices,
                test_size=test_size,
                random_state=42,
                stratify=stratify,
            )
        except ValueError as error:
            raise HTTPException(status_code=422, detail=f"Cannot create train/test split: {error}") from error

    x_train = features.iloc[train_indices]
    x_test = features.iloc[test_indices]
    y_train = target.iloc[train_indices]
    y_test = target.iloc[test_indices]
    if problem_type == "classification":
        model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            class_weight="balanced_subsample",
            n_jobs=1,
        )
        model.fit(x_train, y_train)
        prediction = model.predict(x_test)
        labels = sorted(target.unique().tolist())
        metrics = {
            "accuracy": float(accuracy_score(y_test, prediction)),
            "precision_weighted": float(precision_score(y_test, prediction, average="weighted", zero_division=0)),
            "recall_weighted": float(recall_score(y_test, prediction, average="weighted", zero_division=0)),
            "f1_weighted": float(f1_score(y_test, prediction, average="weighted", zero_division=0)),
            "confusion_matrix": {
                "labels": labels,
                "values": confusion_matrix(y_test, prediction, labels=labels).tolist(),
            },
        }
    else:
        model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=1)
        model.fit(x_train, y_train)
        prediction = model.predict(x_test)
        rmse = math.sqrt(mean_squared_error(y_test, prediction))
        metrics = {
            "mae": float(mean_absolute_error(y_test, prediction)),
            "rmse": float(rmse),
        }

    importance = sorted(
        [
            {"feature": feature, "importance": float(value)}
            for feature, value in zip(feature_names, model.feature_importances_)
        ],
        key=lambda item: -item["importance"],
    )
    return {
        "model": "RandomForestClassifier" if problem_type == "classification" else "RandomForestRegressor",
        "target_column": target_column,
        "problem_type": problem_type,
        "feature_columns": feature_names,
        "split_method": "GroupShuffleSplit" if group_column else "stratified random split" if problem_type == "classification" else "random split",
        "group_column": group_column,
        "train_rows": len(train_indices),
        "test_rows": len(test_indices),
        "metrics": metrics,
        "feature_importance": importance,
        "limitation": MODEL_LIMITATION,
    }


def detect_anomalies(csv_text: str, contamination: float) -> dict[str, Any]:
    frame = _read_frame(csv_text)
    if len(frame) < 10:
        raise HTTPException(status_code=422, detail="At least 10 rows are required for anomaly detection.")
    features, feature_names = _numeric_features(frame, set())
    model = IsolationForest(
        contamination=contamination,
        random_state=42,
        n_estimators=100,
        n_jobs=1,
    )
    labels = model.fit_predict(features)
    scores = model.decision_function(features)
    anomalies = [
        {"data_row": int(index + 1), "anomaly_score": float(scores[index])}
        for index, label in enumerate(labels)
        if label == -1
    ]
    anomalies.sort(key=lambda item: item["anomaly_score"])
    return {
        "model": "IsolationForest",
        "feature_columns": feature_names,
        "row_count": len(frame),
        "anomaly_count": len(anomalies),
        "anomalies": anomalies,
        "limitation": MODEL_LIMITATION,
    }
