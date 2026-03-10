# TNC Blue Carbon Cost Tool

A web application for modeling and analyzing the costs of blue carbon conservation and restoration projects. Built as a monorepo with a NestJS API, Next.js client, AdminJS backoffice panel, and shared TypeScript packages.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone and Install](#1-clone-and-install)
  - [2. Environment Variables](#2-environment-variables)
  - [3. Start the Database](#3-start-the-database)
  - [4. Run Services for Development](#4-run-services-for-development)
  - [5. Seed the Database](#5-seed-the-database)
- [Running with Docker Compose](#running-with-docker-compose)
- [Building for Production](#building-for-production)
- [Testing](#testing)
  - [API Integration Tests](#api-integration-tests)
  - [Client Unit Tests](#client-unit-tests)
  - [End-to-End Tests](#end-to-end-tests)
- [Data Management (DVC)](#data-management-dvc)
- [Infrastructure and Deployment](#infrastructure-and-deployment)
- [Methodology Sources](#methodology-sources)

---

## Project Structure

```
.
├── api/              # NestJS REST API (port 4000)
├── client/           # Next.js 15 frontend (port 3000)
├── backoffice/       # AdminJS admin panel (port 1000)
├── shared/           # Shared TypeScript: entities, contracts, DTOs, schemas, config
├── data/             # Jupyter notebooks, Excel ingestion files, DVC-tracked datasets
├── e2e/              # Playwright end-to-end tests
├── nginx/            # Local dev reverse proxy config
├── infrastructure/   # Terraform (AWS) infrastructure as code
├── .github/          # GitHub Actions CI/CD workflows
└── docker-compose.yml
```

### Key packages

| Package | Tech Stack | Description |
|---------|-----------|-------------|
| `api` | NestJS, TypeORM, ts-rest | Backend API with JWT auth, Excel import, project computation |
| `client` | Next.js 15, NextAuth, Mapbox GL, ts-rest | End-user facing frontend |
| `backoffice` | AdminJS, Express | Admin panel for managing data, users, and importing Excel files |
| `shared` | TypeORM entities, Zod schemas, ts-rest contracts | Shared code consumed by api, client, backoffice, and e2e |
| `data` | Python 3.12, Jupyter, DVC | Data science workspace for notebooks and dataset management |
| `e2e` | Playwright | Browser-based end-to-end test suite |

---

## Prerequisites

- **Node.js v22.11.0** — use [nvm](https://github.com/nvm-sh/nvm):
  ```bash
  nvm use   # reads .nvmrc automatically
  ```
- **pnpm** (v10.12.1) — enabled via [corepack](https://nodejs.org/api/corepack.html):
  ```bash
  corepack enable pnpm
  ```
- **Docker** and **Docker Compose** — for the database, MinIO (S3-compatible storage), and optional full-stack development

---

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd tnc-blue-carbon-cost-tool
pnpm install
```

This installs dependencies for all workspaces (`api`, `client`, `backoffice`, `shared`, `e2e`, `data`).

### 2. Environment Variables

The project uses two sets of environment variables:

#### Backend (API + Backoffice): `shared/config/.env`

This file is pre-configured with development defaults and is already tracked in the repo. Review and adjust if needed:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `blc-dev` | Database name |
| `DB_USERNAME` | `blue-carbon-cost` | Database user |
| `DB_PASSWORD` | `blue-carbon-cost` | Database password |
| `API_URL` | `http://localhost:4000` | API base URL |
| `ACCESS_TOKEN_SECRET` | `your_access_token_secret` | JWT signing secret |
| `ACCESS_TOKEN_EXPIRES_IN` | `3600s` | JWT token TTL |
| `ACCOUNT_CONFIRMATION_TOKEN_SECRET` | (set) | Sign-up confirmation token secret |
| `RESET_PASSWORD_TOKEN_SECRET` | (set) | Password reset token secret |
| `EMAIL_CONFIRMATION_TOKEN_SECRET` | (set) | Email update confirmation secret |
| `AWS_SES_ACCESS_KEY_ID` | (set) | AWS SES credentials for sending emails |
| `AWS_SES_ACCESS_KEY_SECRET` | (set) | AWS SES credentials for sending emails |
| `AWS_SES_DOMAIN` | (set) | SES sender domain |
| `AWS_REGION` | `eu-west-3` | AWS region |
| `BACKOFFICE_SESSION_COOKIE_NAME` | `backoffice` | Admin panel cookie name |
| `BACKOFFICE_SESSION_COOKIE_SECRET` | (set) | Admin panel cookie signing secret |
| `S3_ENDPOINT` | `http://localhost:9000` | MinIO/S3 endpoint |
| `S3_ACCESS_KEY_ID` | `testtest` | MinIO access key |
| `S3_SECRET_ACCESS_KEY` | `testtest` | MinIO secret key |
| `S3_BUCKET_NAME` | `test` | S3 bucket name |

#### Client (Next.js): `client/.env.development`

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXTAUTH_URL` | `http://localhost:$PORT` | NextAuth callback URL |
| `NEXTAUTH_SECRET` | (set) | NextAuth signing secret |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | API URL used by the browser |
| `NEXT_PUBLIC_MAPBOX_API_TOKEN` | (empty) | Mapbox GL JS token — **you must set this** for maps to work |
| `NEXT_PUBLIC_FEATURE_FLAGS` | (empty) | Comma-separated feature flags (e.g. `edit-project`, prefix `!` to disable) |
| `BASIC_AUTH_ENABLED` | (empty) | Set to `true` to enable HTTP Basic Auth |
| `BASIC_AUTH_USER` | (empty) | Basic Auth username |
| `BASIC_AUTH_PASSWORD` | (empty) | Basic Auth password |

### 3. Start the Database

The project uses **PostgreSQL 16 with PostGIS 3.4**. The easiest way to run it is via Docker Compose:

```bash
docker compose up database -d
```

This starts PostgreSQL on port `5432` with:
- User: `blue-carbon-cost`
- Password: `blue-carbon-cost`
- Database: `blc`

> **Note:** The API uses TypeORM with `synchronize: true` in development, so the database schema is automatically created and updated from entity definitions — no manual migrations needed.

You'll also need **MinIO** for S3-compatible file storage:

```bash
docker compose up minio -d
```

MinIO runs on port `9000` (API) and `9001` (web console). Credentials: `testtest` / `testtest`.

### 4. Run Services for Development

Open separate terminals for each service, or use a process manager:

```bash
# API (NestJS) — port 4000
pnpm api:dev

# Client (Next.js with Turbopack) — port 3000
pnpm client:dev

# Backoffice (AdminJS) — port 1000
pnpm --filter backoffice run start:dev
```

> **Note:** `pnpm api:dev` automatically starts the MinIO container via Docker Compose.

Once all services are running:
- **Client:** http://localhost:3000
- **API:** http://localhost:4000
- **Backoffice:** http://localhost:1000

#### Optional: Nginx reverse proxy

To access all services through a single origin (port 80), also start the nginx container:

```bash
docker compose up nginx -d
```

This proxies:
- `http://localhost/` → client (port 3000)
- `http://localhost/api/` → API (port 4000)
- `http://localhost/admin/` → backoffice (port 1000)

The nginx container expects services to be running on the host (not in Docker), as it uses `host.docker.internal`.

### 5. Seed the Database

The database is seeded by importing an Excel workbook through the backoffice admin panel:

1. Start the API and backoffice services
2. Open the backoffice at http://localhost:1000
3. Upload the Excel file located at `data/excel/Carbon-Cost Data Upload.xlsm`

This populates all reference data tables (countries, cost inputs, carbon inputs, model assumptions, etc.) using the mapping defined in `shared/excel_to_db_map.json`.

---

## Running with Docker Compose

To run the entire stack in Docker (useful for integration testing or demo purposes):

```bash
docker compose up
```

This starts all services: `api`, `client`, `backoffice`, `database`, `minio`, and `nginx`.

> **Note:** For active development, running services directly on the host (as described above) is recommended for faster iteration with hot reload.

---

## Building for Production

### Build commands

```bash
pnpm api:build       # Runs: nest build → api/dist/
pnpm client:build    # Runs: next build
```

### Docker images

Each service has a `Dockerfile` that builds a production image:

```bash
# API
docker build -f api/Dockerfile -t bcct-api .

# Client (NEXT_PUBLIC_* vars are baked in at build time)
docker build -f client/Dockerfile -t bcct-client \
  --build-arg NEXT_PUBLIC_API_URL=https://your-api.example.com \
  --build-arg NEXTAUTH_SECRET=your-secret \
  --build-arg NEXTAUTH_URL=https://your-domain.com/auth/api \
  --build-arg NEXT_PUBLIC_MAPBOX_API_TOKEN=your-token \
  .

# Backoffice
docker build -f backoffice/Dockerfile -t bcct-backoffice .
```

All Dockerfiles use `node:22.11.0-alpine` as the base image and expect the build context to be the repository root (so that `shared/` is accessible).

### Production start commands

```bash
pnpm api:prod          # NODE_ENV=production nest start
pnpm client:prod       # next start
pnpm backoffice:prod   # tsx index.ts
```

---

## Testing

### API Integration Tests

Uses **Jest** with `ts-jest` and `jest-cucumber` for BDD-style tests. Tests run against a live PostgreSQL database and MinIO instance.

```bash
# From repo root:
pnpm --filter api test

# From api/ directory:
cd api && pnpm test
```

The test script automatically manages MinIO via Docker Compose. Requires PostgreSQL to be running. Test config is in `shared/config/.env.test`.

### Client Unit Tests

Uses **Vitest** with `@testing-library/react` and `jsdom`.

```bash
pnpm client:test
```

### End-to-End Tests

Uses **Playwright** (Chromium only). Tests are in `e2e/tests/`.

```bash
cd e2e

# Full run (starts database + MinIO automatically):
pnpm test

# Interactive UI mode:
pnpm test:ui

# Watch mode:
pnpm test:watch

# Generate test code interactively:
pnpm codegen
```

Test suites cover: authentication flows (sign-in, sign-up, email update, password update, account deletion), custom project CRUD, and project overview.

---

## Data Management (DVC)

The `data/` directory uses [DVC](https://dvc.org) to track large data files, with remote storage on Google Drive.

```bash
# Install DVC (Python required):
cd data
pip install dvc dvc-gdrive
# or with uv:
uv sync

# Pull datasets from remote:
dvc pull

# Push local changes:
dvc push
```

The `data/excel/` directory contains the Excel workbooks that serve as the source of truth for the domain data model. The `data/notebooks/` directory contains Jupyter notebooks for data exploration and prototype calculations.

---

## Infrastructure and Deployment

The application is deployed on **AWS** using **Elastic Beanstalk** (multi-container Docker), provisioned with **Terraform**, and deployed via **GitHub Actions**.

### Environments

| Branch | Environment | Domain |
|--------|------------|--------|
| `dev` | Development | `dev.<project>.dev-vizzuality.com` |
| `staging` | Staging | `staging.bcct.naturebase.org` |
| `main` | Production | `bcct.naturebase.org` |

### CI/CD Workflows (`.github/workflows/`)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `deploy.yml` | Push to `main`, `staging`, `dev` or manual dispatch | Builds Docker images, pushes to ECR, deploys to Elastic Beanstalk |
| `api-tests.yml` | Push affecting `api/**` or `shared/**` | Runs API integration tests (Jest) |
| `client-tests.yml` | Push affecting `client/**` or `shared/**` | Runs client unit tests (Vitest) |
| `e2e-tests.yml` | Push affecting `e2e/**`, `api/**`, `client/**` | Runs Playwright e2e tests |
| `release-candidate.yml` | Workflow call | Fast-forward merges dev→staging, tags, generates changelog |

### Deployment Pipeline

1. **Change detection:** `dorny/paths-filter` determines which services changed (skips unchanged on dev)
2. **Build:** Docker images are built and pushed to **AWS ECR** with `<git-sha>` and `<environment>` tags
3. **Deploy:** A `docker-compose.yml` is generated referencing the ECR images, zipped with the nginx config, and deployed to **Elastic Beanstalk** via `einaregilsson/beanstalk-deploy`

### AWS Resources (managed by Terraform)

- **VPC** with 2 public subnets
- **ECR** repositories for client, API, and admin images
- **Elastic Beanstalk** multi-container Docker environments
- **RDS** PostgreSQL instances with Secrets Manager
- **S3** buckets for application assets
- **SES** for transactional email
- **ACM** certificates for HTTPS
- **IAM** pipeline user for CI/CD

All secrets and environment variables are automatically provisioned from Terraform into GitHub Actions environments.

For detailed infrastructure documentation, see [`infrastructure/INFRASTRUCTURE.md`](infrastructure/INFRASTRUCTURE.md).

---

## Methodology Sources

### Configuration

Configuration is managed in:

```
api/src/modules/methodology/methodology.config.ts
```

This file contains all the entities that appear in the methodology sources table. There are two types of relationships:

### 1-to-N (`1n`)

Entities in which each row can be related to **one and only one** source.

#### How to Add a New Entity with a 1n Relationship to `ModelComponentSource`

1. Define the `@ManyToOne` and `@OneToMany` TypeORM relationships between your entity and `ModelComponentSource` (use string-based references instead of anonymous functions for AdminJS compatibility).
2. Add the new entity to the configuration file:
   ```
   api/src/modules/methodology/methodology.config.ts
   ```

### Many-to-Many (`m2m`)

Entities in which rows can have multiple columns, each related to different sources.

#### How to Add a New Entity with an `m2m` Relationship to `ModelComponentSource`

1. Import and add the following actions to an AdminJS resource options:

    ```typescript
    properties: {
        sources: {
            isVisible: { show: true, edit: true, list: true, filter: false },
            components: {
                list: Components.Many2ManySources,
                show: Components.Many2ManySources,
                edit: Components.Many2ManySources,
            },
        }
    },
    actions: {
        fetchRelatedSourcesAction: {
            actionType: 'record',
            isVisible: false,
            handler: fetchRelatedSourcesActionHandler,
        },
        addSourceAction: {
            actionType: 'record',
            isVisible: false,
            handler: addSourceActionHandler,
        },
        deleteSourceAction: {
            actionType: 'record',
            isVisible: false,
            handler: deleteSourceActionHandler,
        },
        fetchAvailableSourceTypesAction: {
            actionType: 'record',
            isVisible: false,
            handler: fetchAvailableSourceTypesActionHandler,
        }
    }
    ```

2. Add the new entity to the configuration file:
   ```
   api/src/modules/methodology/methodology.config.ts
   ```

### Notes

- Always ensure AdminJS compatibility by using **string-based** references in TypeORM relationships.
- Field ordering on AdminJS does not work as expected, rely on `listProperties`, `showProperties`, and `editProperties` to order fields in the different views.
