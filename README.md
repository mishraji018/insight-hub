# Insight Hub - Production Deployment Guide

This guide describes how to deploy Insight Hub in a production-ready environment using Docker.

## Quick Start (Docker Compose)

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd insight-hub
   ```

2. **Configure Environment Variables**:
   Copy the example environment file and fill in the secrets:
   ```bash
   cp backend/.env.example backend/.env
   ```
   *Required variables*: `SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, `EMAIL_HOST_PASSWORD`, etc.

3. **Build and Start**:
   ```bash
   docker-compose up --build -d
   ```

4. **Run Migrations**:
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

5. **Create Superuser**:
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

## Architecture

- **Frontend**: React + Vite (Optimized production build).
- **Backend**: Django REST Framework + Gunicorn.
- **Proxy/Web Server**: Nginx (Handles static files and API/WS proxying).
- **Database**: PostgreSQL 15.
- **Cache/Broker**: Redis 7.
- **Task Queue**: Celery (Asynchronous emails, notifications, and auditing).
- **Scheduler**: Celery Beat (Weekly digests, OTP cleanup).

## CI/CD Pipeline

- **Test**: Automated tests run on every Pull Request to `main`.
- **Deploy**: On every push to `main`, Docker images are built, pushed to Docker Hub, and deployed to the production server via SSH.

## Production Checklist

- [ ] Change `SECRET_KEY`.
- [ ] Ensure `DEBUG=False`.
- [ ] Configure `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`.
- [ ] Set up a real SMTP server for emails.
- [ ] Configure SSL (Certbot/Let's Encrypt recommended for Nginx).
