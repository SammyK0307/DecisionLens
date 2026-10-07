# DecisionLens

DecisionLens is an end-to-end retail intelligence platform that transforms transactional retail data into actionable business insights.

## Features

- Revenue and market analysis
- Product performance analysis
- RFM-based customer segmentation
- Customer purchase prediction
- Interactive React dashboard
- FastAPI analytics and ML API

## Machine Learning

### Customer Segmentation

Customer behavior is analyzed using:

- Recency
- Frequency
- Monetary Value

RFM features are log-transformed and standardized before K-Means clustering.

The project identifies four business-oriented customer segments:

1. High-Value Customers
2. Recent / Developing
3. At Risk
4. Inactive

### Predictive Analytics

The system predicts whether an existing customer is likely to make a purchase within the next 30 days.

Features include:

- Recency
- Frequency
- Monetary
- Total Quantity
- Unique Products
- Active Days

Models evaluated include:

- Logistic Regression
- Random Forest
- XGBoost

## Tech Stack

### Data Science
Python, Pandas, NumPy, Scikit-learn, XGBoost, Jupyter

### Backend
FastAPI, Uvicorn, Joblib

### Frontend
React, Vite, Tailwind CSS, Recharts, Axios

## Architecture

```text
Retail Dataset
      |
      v
Data Cleaning & EDA
      |
      +------------------+
      |                  |
      v                  v
Customer            Predictive
Segmentation        Analytics
      |                  |
      +--------+---------+
               |
               v
        FastAPI Backend
               |
               v
        React Dashboard
