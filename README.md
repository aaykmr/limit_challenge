## Solution Summary (Approach, Tradeoffs, Runbook)

### Approach

- Implemented a full-stack submission tracker with a Django REST backend (`/api/submissions`, `/api/submissions/<id>`, `/api/brokers`) and a Next.js frontend for list/detail workflows.
- Added session-based authentication endpoints (`/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`) and integrated auth state in the frontend via React Query hooks.
- Built a Tailwind-first login/signup experience with a compact tabbed auth card and route guard behavior for protected submissions pages.
- Wired backend filtering/pagination and frontend query-state handling.
- Added deployment-ready configuration for EC2-oriented workflows (service restarts, CI checks, and environment-driven secrets).

### Tradeoffs

- **SQLite for simplicity:** Fast local setup and easy EC2 bootstrapping, but not ideal for high-concurrency production workloads.
- **Session auth over token auth:** Simpler for same-origin app flows and CSRF-aware Django defaults, but requires careful domain/cookie config in multi-domain deployments.
- **Single-instance deployment target:** Lower operational overhead, but lower resilience/scalability compared to a multi-service cloud architecture.

### How To Run

1. **Backend**
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   # create backend/.env with DJANGO_SECRET_KEY=<your-secret>
   python manage.py migrate
   python manage.py seed_submissions  # optional
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   # create frontend/.env.local with NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   npm run dev
   ```

3. **Use the app**
   - Open `http://localhost:3000/login`
   - Authenticate, then continue to `http://localhost:3000/submissions`

# Submission Tracker Take-home Challenge

This repository hosts the boilerplate for the Submission Tracker assignment. It includes a Django +
Django REST Framework backend and a Next.js frontend scaffold so candidates can focus on API
design, relational data modelling, and product-focused UI work.

## Challenge Overview

Operations managers need a workspace to review broker-submitted opportunities. Build a lightweight
tool that lets them browse incoming submissions, filter by business context, and inspect full
details per record. Deliver a polished frontend experience backed by clean APIs.

### Goals

- **Backend:** Model the domain, expose list and detail endpoints, and support realistic filtering.
- **Frontend (higher weight):** Craft an intuitive list and detail experience with filters that map
  to query parameters. Focus on UX clarity, organization, and maintainability.

## Data Model

Required entities (already defined in `submissions/models.py`):

- `Broker`: name, contact email
- `Company`: legal name, industry, headquarters city
- `TeamMember`: internal owner for a submission
- `Submission`: links to company, broker, owner with status, priority, and summary
- `Contact`: primary contacts for a submission
- `Document`: references to supporting files
- `Note`: threaded context for collaboration

Seed data (~25 submissions with dozens of related contacts, documents, and notes) is available via
`python manage.py seed_submissions`. Re-run with `--force` to rebuild the dataset.

## API Requirements

- `GET /api/submissions/`
  - Returns paginated submissions with company, broker, owner, counts of related documents/notes,
    and the latest note preview.
  - Supports filters via query params. `status` is wired up; extend filters for `brokerId` and
    `companySearch` (plus optional extras like `createdFrom`, `createdTo`, `hasDocuments`, `hasNotes`).
- `GET /api/submissions/<id>/`
  - Returns the full submission plus related contacts, documents, and notes.
- `GET /api/brokers/`
  - Returns brokers for the frontend dropdown.

Viewsets, serializers, and base filters are in place but intentionally minimal so you can refine
the query behavior and filtering logic.

## Frontend Workspace Overview

The Next.js 16 + React 19 app in `frontend/` is pre-wired for this challenge. Material UI handles
layout, axios powers HTTP requests, and `@tanstack/react-query` is ready for data fetching. The list
and detail routes under `/submissions` are scaffolded so you can focus on API consumption and UX
polish.

### What is pre-built?

- Global providers supply Material UI theming and a shared React Query client.
- `/submissions` hosts the list view with filter inputs and hints about required query params.
- `/submissions/[id]` hosts the detail shell and links back to the list.
- Custom hooks in `lib/hooks` define how to fetch submissions and brokers. Each hook is disabled by
  default (`enabled: false`) so no network requests fire until you enable them.

### What you need to implement

- Wire the filter state to query parameters and React Query `queryFn`s.
- Render table/card layouts for the submission list along with loading, empty, and error states.
- Build the detail page sections for summary data, contacts, documents, and notes.
- Enable the queries and handle pagination or other UX you want to highlight.

## Project Structure

- `backend/`: Django project with REST API, seed command, and submission models.
- `frontend/`: Next.js app described above.
- `INTERVIEWER_NOTES.md`: Context for reviewers/interviewers.

## Environment Variables

- Frontend requests default to `http://localhost:8000/api`. Override this by creating
  `frontend/.env.local` and setting `NEXT_PUBLIC_API_BASE_URL`.

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_submissions  # optional but recommended
# add --force to rebuild the generated sample data
python manage.py runserver 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # create if you want a custom API base
# NEXT_PUBLIC_API_BASE_URL defaults to http://localhost:8000/api
npm run dev
```

Visit `http://localhost:3000/submissions` to start building.

## Development Workflow

1. Start the Django server on port 8000 (`python manage.py runserver`).
2. Start the Next.js dev server on port 3000 (`npm run dev`).
3. Iterate on backend filters, serializers, and viewsets, then refresh the frontend to see updated
   data.
4. When ready, add README notes summarizing your approach, tradeoffs, and any stretch goals.

## Submission Instructions

- Provide a short README update summarizing approach, tradeoffs, and how to run the solution.
- Record and share a brief screen capture (max 2 minutes) demonstrating the frontend working end-to-end with the backend.
- Call out any stretch goals implemented.
- Automated tests are optional, but including targeted backend or frontend tests is a strong signal.

## Evaluation Rubric

- **Frontend (45%)** – UX clarity, filter UX tied to query params, state/data management, handling
  of loading/empty/error cases, and overall polish.
- **Backend (30%)** – API design, serialization choices, filtering implementation, and attention to
  relational data handling.
- **Code Quality (15%)** – Structure, naming, documentation/readability, testing where it adds
  value.
- **Product Thinking (10%)** – Workflow clarity, assumptions noted, and thoughtful UX details.

## Optional Bonus

Authentication, deployment, or extra tooling are not required but welcome if scope allows.
