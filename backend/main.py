from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
DEPLOYMENT_DIR = BASE_DIR / "data" / "processed" / "deployment"
MODEL_PATH = BASE_DIR / "models" / "customer_purchase_predictor.joblib"


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="DecisionLens API",
    description="Retail intelligence and customer analytics API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# LOAD DEPLOYMENT DATA
# ============================================================

monthly_revenue = pd.read_csv(
    DEPLOYMENT_DIR / "monthly_revenue.csv"
)

country_revenue = pd.read_csv(
    DEPLOYMENT_DIR / "country_revenue.csv"
)

product_summary = pd.read_csv(
    DEPLOYMENT_DIR / "product_summary.csv"
)

customer_summary = pd.read_csv(
    DEPLOYMENT_DIR / "customer_summary.csv"
)

customer_segments = pd.read_csv(
    DEPLOYMENT_DIR / "customer_segments.csv"
)

# Load ML model
model = joblib.load(MODEL_PATH)


# ============================================================
# COLUMN NORMALIZATION
# ============================================================

def normalize_columns(df):
    """Convert column names to lowercase snake-style names."""
    df = df.copy()

    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )

    return df


monthly_revenue = normalize_columns(monthly_revenue)
country_revenue = normalize_columns(country_revenue)
product_summary = normalize_columns(product_summary)
customer_summary = normalize_columns(customer_summary)
customer_segments = normalize_columns(customer_segments)


# ============================================================
# CUSTOMER COLUMN COMPATIBILITY
# ============================================================

# Different notebook versions may produce slightly different
# capitalization/naming. Normalize important columns here.

rename_map = {
    "customer_id": "customer_id",
    "recency": "recency",
    "frequency": "frequency",
    "monetary": "monetary",
    "total_quantity": "total_quantity",
    "unique_products": "unique_products",
    "active_days": "active_days",
    "segment": "segment",
}

customer_summary = customer_summary.rename(
    columns={
        col: rename_map[col]
        for col in customer_summary.columns
        if col in rename_map
    }
)

customer_segments = customer_segments.rename(
    columns={
        col: rename_map[col]
        for col in customer_segments.columns
        if col in rename_map
    }
)


# Make customer IDs numeric where possible
if "customer_id" in customer_summary.columns:
    customer_summary["customer_id"] = pd.to_numeric(
        customer_summary["customer_id"],
        errors="coerce"
    )

if "customer_id" in customer_segments.columns:
    customer_segments["customer_id"] = pd.to_numeric(
        customer_segments["customer_id"],
        errors="coerce"
    )


# ============================================================
# HELPER
# ============================================================

def clean_records(df):
    """Replace NaN/inf values before returning JSON."""
    result = df.replace([np.inf, -np.inf], np.nan)
    result = result.where(pd.notnull(result), None)
    return result.to_dict(orient="records")


# ============================================================
# HEALTH
# ============================================================

@app.get("/")
def root():
    return {
        "name": "DecisionLens API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "data_source": "deployment datasets",
        "model_loaded": model is not None,
    }


# ============================================================
# KPI ENDPOINT
# ============================================================

@app.get("/api/kpis")
def get_kpis():

    total_revenue = float(
        country_revenue["revenue"].sum()
    )

    units_sold = float(
        country_revenue["quantity"].sum()
    )

    customers = int(
    customer_segments["customer_id"]
    .dropna()
    .nunique()
)

    countries = int(
        country_revenue["country"]
        .dropna()
        .nunique()
    )

    return {
        "total_revenue": total_revenue,
        "units_sold": units_sold,
        "total_quantity": units_sold,
        "customers": customers,
        "countries": countries,
    }


# ============================================================
# REVENUE
# ============================================================

@app.get("/api/revenue/monthly")
def get_monthly_revenue():

    data = monthly_revenue.copy()

    data = data.sort_values("month")

    return clean_records(data)


@app.get("/api/revenue/countries")
def get_country_revenue(
    limit: int = Query(10, ge=1, le=200)
):

    data = (
        country_revenue
        .sort_values("revenue", ascending=False)
        .head(limit)
    )

    return clean_records(data)


# ============================================================
# PRODUCTS
# ============================================================

@app.get("/api/products/top")
def get_top_products(
    limit: int = Query(10, ge=1, le=500),
    sort: str = Query("revenue")
):

    data = product_summary.copy()

    if sort not in data.columns:
        sort = "revenue"

    data = (
        data
        .sort_values(sort, ascending=False)
        .head(limit)
    )

    return clean_records(data)


# ============================================================
# CUSTOMERS
# ============================================================

@app.get("/api/customers/top")
def get_top_customers(
    limit: int = Query(10, ge=1, le=500),
    sort: str = Query("monetary")
):

    data = customer_summary.copy()

    if sort not in data.columns:
        sort = "monetary"

    data = (
        data
        .sort_values(sort, ascending=False)
        .head(limit)
    )

    return clean_records(data)


@app.get("/api/customers/{customer_id}")
def get_customer(customer_id: int):

    matches = customer_summary[
        customer_summary["customer_id"] == customer_id
    ]

    if matches.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Customer {customer_id} not found"
        )

    row = matches.iloc[0].to_dict()

    cleaned = {}

    for key, value in row.items():

        if pd.isna(value):
            cleaned[key] = None

        elif isinstance(value, (np.integer,)):
            cleaned[key] = int(value)

        elif isinstance(value, (np.floating,)):
            cleaned[key] = float(value)

        else:
            cleaned[key] = value

    return cleaned


# ============================================================
# CUSTOMER SEGMENTATION
# ============================================================

@app.get("/api/segments")
def get_segments():

    data = customer_segments.copy()

    required = [
        "customer_id",
        "recency",
        "frequency",
        "monetary",
    ]

    missing = [
        col for col in required
        if col not in data.columns
    ]

    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"Missing segmentation columns: {missing}"
        )

    work = data[
        required + (
            ["segment"]
            if "segment" in data.columns
            else []
        )
    ].copy()

    work = work.dropna(
        subset=[
            "recency",
            "frequency",
            "monetary"
        ]
    )

    features = work[
        [
            "recency",
            "frequency",
            "monetary",
        ]
    ]

    scaler = StandardScaler()

    scaled = scaler.fit_transform(features)

    pca = PCA(
        n_components=2,
        random_state=42
    )

    coordinates = pca.fit_transform(scaled)

    work["x"] = coordinates[:, 0]
    work["y"] = coordinates[:, 1]

    if "segment" not in work.columns:
        work["segment"] = "Customer"

    output = work[
        [
            "customer_id",
            "x",
            "y",
            "segment",
        ]
    ]

    return clean_records(output)


@app.get("/api/segments")
def get_segments():

    data = customer_segments.copy()

    required = [
        "customer_id",
        "recency",
        "frequency",
        "monetary",
    ]

    missing = [
        col for col in required
        if col not in data.columns
    ]

    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"Missing segmentation columns: {missing}"
        )

    work = data[
        required + (
            ["segment"]
            if "segment" in data.columns
            else []
        )
    ].copy()

    work = work.dropna(
        subset=[
            "recency",
            "frequency",
            "monetary"
        ]
    )

    # --------------------------------------------------------
    # IMPORTANT:
    # Match the transformation used during K-Means training.
    # Original notebook used log1p(RFM) -> StandardScaler.
    # --------------------------------------------------------

    rfm = work[
        [
            "recency",
            "frequency",
            "monetary",
        ]
    ].astype(float)

    rfm_log = np.log1p(rfm)

    scaler = StandardScaler()
    rfm_scaled = scaler.fit_transform(rfm_log)

    # Same 2D projection approach for visualization
    pca = PCA(
        n_components=2,
        random_state=42
    )

    coordinates = pca.fit_transform(rfm_scaled)

    work["x"] = coordinates[:, 0]
    work["y"] = coordinates[:, 1]

    if "segment" not in work.columns:
        work["segment"] = "Customer"

    output = work[
        [
            "customer_id",
            "x",
            "y",
            "segment",
        ]
    ]

    return clean_records(output)

# ============================================================
# CUSTOMER SEGMENT PROFILE
# ============================================================

@app.get("/api/segments/profile")
def get_segment_profile():

    data = customer_segments.copy()

    required = [
        "segment",
        "customer_id",
        "recency",
        "frequency",
        "monetary",
    ]

    missing = [
        col
        for col in required
        if col not in data.columns
    ]

    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"Missing segmentation columns: {missing}"
        )

    profile = (
        data
        .groupby("segment")
        .agg(
            count=("customer_id", "count"),
            avg_recency=("recency", "mean"),
            avg_frequency=("frequency", "mean"),
            avg_monetary=("monetary", "mean"),
        )
        .reset_index()
    )

    total = profile["count"].sum()

    profile["pct"] = (
        profile["count"] / total * 100
    )

    profile = profile[
        [
            "segment",
            "count",
            "pct",
            "avg_recency",
            "avg_frequency",
            "avg_monetary",
        ]
    ]

    return clean_records(profile)

# ============================================================
# PREDICTIVE ANALYTICS
# ============================================================

FEATURES = [
    "recency",
    "frequency",
    "monetary",
    "total_quantity",
    "unique_products",
    "active_days",
]


def get_feature_importance():

    values = None

    # Tree-based models
    if hasattr(model, "feature_importances_"):
        values = model.feature_importances_

    # Logistic Regression
    elif hasattr(model, "coef_"):
        values = np.abs(model.coef_[0])

    if values is None:
        return []

    return [
        {
            "feature": feature,
            "importance": float(value),
        }
        for feature, value in zip(FEATURES, values)
    ]


@app.post("/api/predict/{customer_id}")
def predict_customer(customer_id: int):

    matches = customer_summary[
        customer_summary["customer_id"] == customer_id
    ]

    if matches.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Customer {customer_id} not found"
        )

    customer = matches.iloc[0]

    missing = [
        feature
        for feature in FEATURES
        if feature not in customer_summary.columns
    ]

    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"Missing prediction features: {missing}"
        )

    X = pd.DataFrame(
        [[
            customer[feature]
            for feature in FEATURES
        ]],
        columns=FEATURES,
    )

    X = X.apply(
        pd.to_numeric,
        errors="coerce"
    ).fillna(0)

    try:

        probability = float(
            model.predict_proba(X)[0][1]
        )

    except AttributeError:

        prediction = int(
            model.predict(X)[0]
        )

        probability = float(prediction)

    prediction_label = (
        "Likely to Purchase"
        if probability >= 0.5
        else "Unlikely to Purchase"
    )

    return {
        "customer_id": customer_id,
        "probability": probability,
        "percentage": probability * 100,
        "prediction": prediction_label,
        "feature_importance": get_feature_importance(),
    }


# ============================================================
# STARTUP MESSAGE
# ============================================================

print("=" * 60)
print("DecisionLens API")
print("=" * 60)
print(f"Deployment data: {DEPLOYMENT_DIR}")
print(f"Model: {MODEL_PATH}")
print("API ready")
print("=" * 60)