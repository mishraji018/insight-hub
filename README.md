# Insight Hub - Predictive Analytics Dashboard

Insight Hub is a production-grade predictive dashboard built with Django, React, and Machine Learning. It provides real-time sales forecasting, anomaly detection, and automated reporting.

## 🏗 Architecture

```text
                                  +-------------------+
                                  |      Nginx        |
                                  |  (Reverse Proxy)  |
                                  +---------+---------+
                                            |
                      +---------------------+---------------------+
                      |                                           |
            +---------v---------+                       +---------v---------+
            |      React        |                       |      Django       |
            |     Frontend      |                       |  (Gunicorn/ASGI)  |
            +-------------------+                       +---------+---------+
                                                                  |
                                            +----------+----------+---------+
                                            |          |          |         |
                                     +------v---+  +---v------+ +--v--------v--+
                                     | Postgres |  |  Redis   | | Celery Worker|
                                     |  (DB)    |  | (Broker) | |    (Jobs)    |
                                     +----------+  +----------+ +--------------+
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js (for frontend development)

### Development Setup
1. Clone the repository and navigate to the project root.
2. Initialize environment:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Run with Makefile:
   ```bash
   make dev
   ```
   *Access the dashboard at http://localhost*

## 🛠 Project shortcuts (Makefile)
- `make dev`: Start the full stack using Docker Compose.
- `make test`: Run backend tests.
- `make migrate`: Apply database migrations.
- `make build-frontend`: Build the React production bundle.

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG`  | Toggle debug mode | `False` |
| `SECRET_KEY` | Django secret key | `required` |
| `DB_NAME` | Postgres database name | `insight_db` |
| `DB_USER` | Postgres user | `insight_user` |
| `DB_PASSWORD` | Postgres password | `required` |
| `CELERY_BROKER_URL` | Redis URL for Celery | `redis://redis:6379/0` |

## 📡 API Reference

| Endpoint | Method | Description | Role |
|----------|--------|-------------|------|
| `/api/token/` | POST | Obtain JWT token | Public |
| `/api/upload-csv/` | POST | Upload sales data for ETL | Executive |
| `/api/analytics-summary/` | GET | Dashboard summary metrics | Analyst/Exec |
| `/api/predict-sales/` | POST | Trigger ML inference | Analyst/Exec |
| `/api/reports/pdf/` | GET | Export PDF report | analyst/Exec |

## ⚡ Real-Time
Websocket endpoint: `ws://localhost/ws/dashboard/?token=<JWT_TOKEN>`
