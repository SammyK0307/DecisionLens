import streamlit as st
import pandas as pd
import plotly.express as px
import joblib
from pathlib import Path

# Project root directory
BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data" / "processed"
MODEL_DIR = BASE_DIR / "models"

# ---------------------------------------------------------
# Page configuration
# ---------------------------------------------------------

st.set_page_config(
    page_title="DecisionLens",
    page_icon="📊",
    layout="wide"
)


# ---------------------------------------------------------
# Load data
# ---------------------------------------------------------

@st.cache_data
def load_data():
    df = pd.read_csv(DATA_DIR / "online_retail_clean.csv")
    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])
    return df


@st.cache_data
def load_segments():
    return pd.read_csv(
        DATA_DIR / "customer_segments.csv"
    )


@st.cache_resource
def load_model():
    return joblib.load(
        MODEL_DIR / "customer_purchase_predictor.joblib"
    )


df = load_data()
segments = load_segments()
model = load_model()


# ---------------------------------------------------------
# Title
# ---------------------------------------------------------

st.title("📊 DecisionLens")
st.markdown(
    "### Retail Intelligence & Customer Analytics Platform"
)

st.caption(
    "Explore revenue, products, customers, segments and "
    "purchase propensity from historical retail data."
)


# ---------------------------------------------------------
# KPI metrics
# ---------------------------------------------------------

total_revenue = df["Revenue"].sum()
total_quantity = df["Quantity"].sum()
unique_customers = df["Customer ID"].nunique()
unique_countries = df["Country"].nunique()

col1, col2, col3, col4 = st.columns(4)

col1.metric(
    "Total Revenue",
    f"£{total_revenue:,.0f}"
)

col2.metric(
    "Units Sold",
    f"{total_quantity:,.0f}"
)

col3.metric(
    "Customers",
    f"{unique_customers:,}"
)

col4.metric(
    "Countries",
    f"{unique_countries}"
)


st.divider()


# ---------------------------------------------------------
# Revenue Trend
# ---------------------------------------------------------

monthly_revenue = (
    df
    .set_index("InvoiceDate")
    .resample("ME")["Revenue"]
    .sum()
    .reset_index()
)

fig_revenue = px.line(
    monthly_revenue,
    x="InvoiceDate",
    y="Revenue",
    title="Monthly Revenue Trend",
    markers=True
)

st.plotly_chart(
    fig_revenue,
    use_container_width=True
)


# ---------------------------------------------------------
# Country + Product
# ---------------------------------------------------------

col1, col2 = st.columns(2)

country_revenue = (
    df.groupby("Country")["Revenue"]
    .sum()
    .sort_values(ascending=False)
    .head(10)
    .reset_index()
)

fig_country = px.bar(
    country_revenue,
    x="Revenue",
    y="Country",
    orientation="h",
    title="Top 10 Countries by Revenue"
)

col1.plotly_chart(
    fig_country,
    use_container_width=True
)


product_revenue = (
    df.groupby("Description")["Revenue"]
    .sum()
    .sort_values(ascending=False)
    .head(10)
    .reset_index()
)

fig_product = px.bar(
    product_revenue,
    x="Revenue",
    y="Description",
    orientation="h",
    title="Top 10 Products by Revenue"
)

col2.plotly_chart(
    fig_product,
    use_container_width=True
)


st.divider()


# ---------------------------------------------------------
# Customer Segments
# ---------------------------------------------------------

st.subheader("👥 Customer Intelligence")

segment_counts = (
    segments["Segment"]
    .value_counts()
    .reset_index()
)

segment_counts.columns = [
    "Segment",
    "Customers"
]

fig_segments = px.pie(
    segment_counts,
    names="Segment",
    values="Customers",
    title="Customer Segment Distribution"
)

st.plotly_chart(
    fig_segments,
    use_container_width=True
)


st.dataframe(
    segments.head(20),
    use_container_width=True
)

# ---------------------------------------------------------
# Predictive Intelligence
# ---------------------------------------------------------

st.divider()

st.subheader("🔮 Predictive Intelligence")

st.markdown(
    "Estimate the likelihood that a customer will make a "
    "purchase within the next 30 days."
)

col1, col2, col3 = st.columns(3)

with col1:
    recency = st.number_input(
        "Recency (days)",
        min_value=1,
        max_value=1000,
        value=30
    )

    frequency = st.number_input(
        "Frequency (invoices)",
        min_value=1,
        max_value=500,
        value=8
    )

with col2:
    monetary = st.number_input(
        "Monetary Value (£)",
        min_value=1.0,
        max_value=200000.0,
        value=2500.0,
        step=100.0
    )

    total_quantity = st.number_input(
        "Total Quantity",
        min_value=1,
        max_value=1000000,
        value=500
    )

with col3:
    unique_products = st.number_input(
        "Unique Products",
        min_value=1,
        max_value=500,
        value=20
    )

    active_days = st.number_input(
        "Active Days",
        min_value=1,
        max_value=500,
        value=10
    )


if st.button("🔮 Predict Purchase Probability"):

    input_data = pd.DataFrame({
        "Recency": [recency],
        "Frequency": [frequency],
        "Monetary": [monetary],
        "TotalQuantity": [total_quantity],
        "UniqueProducts": [unique_products],
        "ActiveDays": [active_days]
    })

    probability = model.predict_proba(input_data)[0][1]

    prediction = (
        "Likely to purchase"
        if probability >= 0.5
        else "Unlikely to purchase"
    )

    st.markdown("### Prediction")

    col1, col2 = st.columns(2)

    col1.metric(
        "Purchase Probability",
        f"{probability * 100:.1f}%"
    )

    col2.metric(
        "Prediction",
        prediction
    )

    st.progress(float(probability))

    if probability >= 0.5:
        st.success(
            "This customer shows a high likelihood of purchasing "
            "within the next 30 days."
        )
    else:
        st.warning(
            "This customer shows a lower likelihood of purchasing "
            "within the next 30 days."
        )