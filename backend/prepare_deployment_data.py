from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent

CLEAN_DATA = BASE_DIR / "data" / "processed" / "online_retail_clean.csv"
CUSTOMER_DATA = BASE_DIR / "data" / "processed" / "customer_prediction_data.csv"
SEGMENT_DATA = BASE_DIR / "data" / "processed" / "customer_segments.csv"

OUTPUT_DIR = BASE_DIR / "data" / "processed" / "deployment"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

print("Loading cleaned transaction data...")
df = pd.read_csv(CLEAN_DATA)

df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"], errors="coerce")

# --------------------------------------------------
# 1. MONTHLY REVENUE
# --------------------------------------------------

monthly = (
    df.dropna(subset=["InvoiceDate"])
      .set_index("InvoiceDate")
      .resample("ME")["Revenue"]
      .sum()
      .reset_index()
)

monthly["month"] = monthly["InvoiceDate"].dt.strftime("%Y-%m")
monthly = monthly[["month", "Revenue"]]
monthly.columns = ["month", "revenue"]

monthly.to_csv(
    OUTPUT_DIR / "monthly_revenue.csv",
    index=False
)

print("✓ monthly_revenue.csv")


# --------------------------------------------------
# 2. COUNTRY REVENUE
# --------------------------------------------------

country = (
    df.groupby("Country", dropna=False)
      .agg(
          revenue=("Revenue", "sum"),
          quantity=("Quantity", "sum"),
          transactions=("Invoice", "nunique")
      )
      .reset_index()
      .sort_values("revenue", ascending=False)
)

country.columns = [
    "country",
    "revenue",
    "quantity",
    "transactions"
]

country.to_csv(
    OUTPUT_DIR / "country_revenue.csv",
    index=False
)

print("✓ country_revenue.csv")


# --------------------------------------------------
# 3. PRODUCT SUMMARY
# --------------------------------------------------

product = (
    df.groupby("Description", dropna=False)
      .agg(
          revenue=("Revenue", "sum"),
          quantity=("Quantity", "sum"),
          transactions=("Invoice", "nunique"),
          avg_price=("Price", "mean")
      )
      .reset_index()
      .sort_values("revenue", ascending=False)
)

product.columns = [
    "product",
    "revenue",
    "quantity",
    "transactions",
    "avg_price"
]

product.to_csv(
    OUTPUT_DIR / "product_summary.csv",
    index=False
)

print("✓ product_summary.csv")


# --------------------------------------------------
# 4. CUSTOMER SUMMARY
# --------------------------------------------------

customer = pd.read_csv(CUSTOMER_DATA)
segments = pd.read_csv(SEGMENT_DATA)

# Normalize customer ID column names
if "Customer ID" in customer.columns:
    customer = customer.rename(columns={"Customer ID": "customer_id"})

if "Customer ID" in segments.columns:
    segments = segments.rename(columns={"Customer ID": "customer_id"})

# Make sure IDs have the same type
customer["customer_id"] = pd.to_numeric(
    customer["customer_id"],
    errors="coerce"
)

segments["customer_id"] = pd.to_numeric(
    segments["customer_id"],
    errors="coerce"
)

# Keep the useful segmentation information
segment_cols = [
    col for col in [
        "customer_id",
        "segment",
        "Recency",
        "Frequency",
        "Monetary"
    ]
    if col in segments.columns
]

segments_small = segments[segment_cols].drop_duplicates(
    subset=["customer_id"]
)

customer_summary = customer.merge(
    segments_small,
    on="customer_id",
    how="left",
    suffixes=("", "_segment")
)

# Remove duplicate segmentation columns if they exist
for col in ["Recency_segment", "Frequency_segment", "Monetary_segment"]:
    if col in customer_summary.columns:
        customer_summary = customer_summary.drop(columns=[col])

customer_summary.to_csv(
    OUTPUT_DIR / "customer_summary.csv",
    index=False
)

print("✓ customer_summary.csv")


# --------------------------------------------------
# 5. COPY CUSTOMER SEGMENTS
# --------------------------------------------------

segments.to_csv(
    OUTPUT_DIR / "customer_segments.csv",
    index=False
)

print("✓ customer_segments.csv")


# --------------------------------------------------
# SUMMARY
# --------------------------------------------------

print("\n" + "=" * 60)
print("DEPLOYMENT DATA CREATED")
print("=" * 60)

for file in sorted(OUTPUT_DIR.glob("*.csv")):
    size_kb = file.stat().st_size / 1024
    print(f"{file.name:<30} {size_kb:>10.1f} KB")

print("=" * 60)
print(f"Output directory: {OUTPUT_DIR}")
