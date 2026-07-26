# InterviewLab API

InterviewLab is a REST API for organizing mock technical interviews. It
supports user authentication, candidate management, interview scheduling and
completion, and structured feedback.

## Live API

- API: https://interview-lab-api.onrender.com
- Swagger UI: https://interview-lab-api.onrender.com/api/docs
- OpenAPI JSON: https://interview-lab-api.onrender.com/api/docs-json

The API runs on a free Render web service, so the first request after a period
of inactivity may take longer while the service starts.

## Assumptions

- Users can register and log in with an email address and password.
- Every candidate belongs to the user who created it.
- A user can create multiple candidates.
- A candidate can have a current role and a target role.
- A user can create multiple interview sessions for the same candidate.
- Every interview is associated with exactly one candidate.
- An interview starts in the `SCHEDULED` state and can be marked as
  `COMPLETED`.
- Feedback can only be recorded after an interview is completed.
- An interview has at most one consolidated feedback record.
- Users can only access candidates, interviews, and feedback belonging to
  their own account.
- Authentication uses a JWT bearer token. Refresh tokens, email verification,
  and password recovery are outside the current MVP.

## Architecture

The backend is a modular monolith built with NestJS and TypeScript. This keeps
deployment and local development simple while maintaining clear domain
boundaries.

```mermaid
flowchart LR
    Client["React frontend"]
    API["NestJS REST API"]
    Auth["Auth module"]
    Candidates["Candidates module"]
    Interviews["Interviews module"]
    Feedback["Feedback module"]
    Database["Database module / Knex"]
    PostgreSQL[("PostgreSQL")]

    Client -->|"HTTPS / JSON / JWT"| API
    API --> Auth
    API --> Candidates
    API --> Interviews
    API --> Feedback
    Auth --> Database
    Candidates --> Database
    Interviews --> Database
    Feedback --> Database
    Database --> PostgreSQL
```

Each feature follows the same request flow:

```text
Controller → Service → Repository → Knex → PostgreSQL
```

- **Controllers** define HTTP endpoints and pass validated input to services.
- **DTOs** and the global Nest validation pipe validate and transform incoming
  requests.
- **Services** contain business rules, ownership checks, and response mapping.
- **Repositories** contain database queries and return database records.
- **Knex migrations** version and reproduce the PostgreSQL schema.
- **JWT guards** protect private endpoints and identify the current user.
- **Swagger/OpenAPI** documents the HTTP contract.

The API is stateless. Application state is stored in PostgreSQL, so additional
API instances could be added later without moving in-memory session data.

## Database schema

```mermaid
erDiagram
    USERS ||--o{ CANDIDATES : creates
    USERS ||--o{ INTERVIEWS : creates
    CANDIDATES ||--o{ INTERVIEWS : participates_in
    INTERVIEWS ||--o| FEEDBACK : receives

    USERS {
        uuid id PK
        varchar name
        varchar email UK
        varchar password_hash
        timestamptz created_at
        timestamptz updated_at
    }

    CANDIDATES {
        uuid id PK
        uuid created_by FK
        varchar first_name
        varchar last_name
        varchar email
        varchar current_role
        varchar target_role
        text resume_url
        text notes
        timestamptz created_at
        timestamptz updated_at
    }

    INTERVIEWS {
        uuid id PK
        uuid created_by FK
        uuid candidate_id FK
        varchar title
        timestamptz scheduled_at
        integer duration_minutes
        varchar type
        varchar status
        varchar difficulty
        text_array technologies
        text notes
        timestamptz completed_at
        timestamptz created_at
        timestamptz updated_at
    }

    FEEDBACK {
        uuid id PK
        uuid interview_id FK,UK
        smallint overall_score
        smallint technical_score
        smallint communication_score
        smallint problem_solving_score
        text strengths
        text improvement_areas
        varchar recommendation
        text additional_notes
        timestamptz created_at
        timestamptz updated_at
    }
```

### `users`

Stores registered accounts. Email addresses are unique, and passwords are
stored only as Argon2 hashes.

### `candidates`

Stores candidate information and ownership through `created_by`.

- `(created_by, email)` is unique, so different users may store the same
  candidate email while one user cannot create it twice.
- `(created_by, last_name, first_name)` supports owner-scoped alphabetical
  candidate lists.

### `interviews`

Stores scheduled and completed interview sessions.

- `type`: `CODING`, `SYSTEM_DESIGN`, `BEHAVIORAL`, `FULL_STACK`, `BACKEND`, or
  `FRONTEND`
- `status`: `SCHEDULED`, `COMPLETED`, or `CANCELLED`
- `difficulty`: `JUNIOR`, `MID`, `SENIOR`, `EXPERT`, or `NULL`
- `technologies` is a PostgreSQL `text[]`.
- `(created_by, scheduled_at)` supports a user's interview list.
- `(candidate_id, scheduled_at)` supports candidate interview history.
- Deleting a candidate with interview history is restricted.

### `feedback`

Stores one structured feedback record per completed interview.

- The unique constraint on `interview_id` enforces the one-to-one
  relationship.
- Scores are integers between 1 and 10.
- Recommendation is `STRONG_HIRE`, `HIRE`, `MIXED`, `NO_HIRE`, or
  `STRONG_NO_HIRE`.
- Feedback is deleted when its interview is deleted.

## Local setup

### Requirements

- Node.js 24
- npm
- Docker with Docker Compose

If `nvm` is installed:

```bash
nvm use
```

The repository's `.nvmrc` selects Node.js 24.

### Install dependencies

```bash
npm ci
```

Installing dependencies also configures the Husky Git hooks.

### Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

For the included Docker Compose database, use:

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://interview_lab:interview_lab_dev@localhost:5432/interview_lab
JWT_SECRET=replace-this-with-a-random-secret-of-at-least-32-characters
CORS_ORIGINS=http://localhost:5173
```

Generate a suitable local JWT secret with:

```bash
openssl rand -base64 48
```

The optional `TEST_DATABASE_URL` is only required for tests that connect to a
separate PostgreSQL test database.

`CORS_ORIGINS` accepts a comma-separated list. To allow both local development
and the deployed frontend:

```dotenv
CORS_ORIGINS=http://localhost:5173,https://interview-lab-web.onrender.com
```

### Start PostgreSQL and pgAdmin

```bash
docker compose up -d postgres pgadmin
docker compose ps
```

Services:

| Service    | Address               | Credentials                                                                     |
| ---------- | --------------------- | ------------------------------------------------------------------------------- |
| PostgreSQL | `localhost:5432`      | Database/user/password: `interview_lab` / `interview_lab` / `interview_lab_dev` |
| pgAdmin    | http://localhost:5050 | `admin@interviewlab.com` / `admin`                                              |

To register PostgreSQL in pgAdmin, use:

```text
Host: postgres
Port: 5432
Maintenance database: interview_lab
Username: interview_lab
Password: interview_lab_dev
```

`postgres` is the Docker Compose service name. Use `localhost` instead when a
database client runs directly on the host machine.

### Run database migrations

```bash
npm run migration:latest
npm run migration:status
```

To roll back the latest migration batch:

```bash
npm run migration:rollback
```

### Start the API

Start development watch mode:

```bash
npm run start:dev
```

The local endpoints are:

- API: http://localhost:3000
- Swagger UI: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/docs-json

## Code quality

Format the project:

```bash
npm run format
```

Check formatting without modifying files:

```bash
npm run format:check
```

Run ESLint and apply safe fixes:

```bash
npm run lint
```

Run the non-mutating CI lint check:

```bash
npm run lint:check
```

Build the application:

```bash
npm run build
```

Run the fast service-level unit tests:

```bash
npm test
npm run test:cov
```

### Run end-to-end tests locally

The end-to-end test uses a real PostgreSQL database. Keep it separate from the
development database because the test deletes its data before and after the
test run.

First, make sure the Docker PostgreSQL service is running:

```bash
docker compose up -d postgres
```

Create the test database inside the running PostgreSQL container:

```bash
docker compose exec postgres createdb \
  -U interview_lab \
  interview_lab_test
```

This database only needs to be created once. If PostgreSQL reports that
`interview_lab_test` already exists, continue to the next command.

Run the end-to-end test with its connection URL:

```bash
TEST_DATABASE_URL=postgresql://interview_lab:interview_lab_dev@localhost:5432/interview_lab_test \
npm run test:e2e
```

The test runs the Knex migrations automatically. As a safety measure, it
refuses to use a database whose name does not end in `_test`.

To run the test serially, matching CI:

```bash
TEST_DATABASE_URL=postgresql://interview_lab:interview_lab_dev@localhost:5432/interview_lab_test \
npm run test:e2e -- --runInBand
```

The end-to-end journey covers registration, login, candidate and interview
creation, ownership isolation, interview completion, and feedback creation.
GitHub Actions creates an isolated PostgreSQL service automatically and runs
both test layers on every validation run.

## Git commits and Husky

`npm ci` runs the `prepare` script and installs the Husky pre-commit hook. A
normal commit is enough:

```bash
git add .
git commit -m "feat: describe the change"
```

Before the commit is created, Husky runs:

```text
npx --no-install lint-staged
```

For staged JavaScript and TypeScript files, lint-staged runs ESLint with fixes
and Prettier. It also formats staged JSON, CSS, SCSS, Markdown, and YAML files.
If a check fails, the commit is stopped so the problem can be corrected.

## Production Docker image

The multi-stage Dockerfile:

1. Installs all dependencies with Node.js 24.
2. Builds the NestJS application.
3. Removes development dependencies.
4. Copies only the compiled application and production dependencies into the
   runtime image.
5. Runs the process as the unprivileged `node` user.

Build the image:

```bash
docker build -t interview-lab-api:local .
```

Start PostgreSQL first:

```bash
docker compose up -d postgres
```

Run the production image on the Compose network:

```bash
docker run --rm \
  --name interview-lab-api-local \
  --network interview-lab-api_default \
  --publish 3000:3000 \
  --env NODE_ENV=production \
  --env PORT=3000 \
  --env DATABASE_URL=postgresql://interview_lab:interview_lab_dev@postgres:5432/interview_lab \
  --env JWT_SECRET=replace-this-with-a-random-secret-of-at-least-32-characters \
  --env CORS_ORIGINS=http://localhost:5173 \
  interview-lab-api:local
```

The database hostname is `postgres` because the API container joins the
Compose network.

Migrations are intentionally not executed when the container starts. Run them
explicitly as a deployment operation to prevent multiple application
instances from attempting the same migration concurrently.

## Deployment

```mermaid
flowchart LR
    Developer["Developer"]
    GitHub["GitHub"]
    Actions["GitHub Actions"]
    Render["Render Docker Web Service"]
    Neon[("Neon PostgreSQL")]

    Developer -->|"push / pull request"| GitHub
    GitHub --> Actions
    Actions -->|"format, lint, test, build, Docker build"| Actions
    Actions -->|"manual production migration"| Neon
    Actions -->|"Render deploy hook"| Render
    Render -->|"pooled TLS connection"| Neon
```

- **GitHub** hosts the public source repository.
- **GitHub Actions** runs reusable validation for pushes and pull requests.
- The manual `Deploy Production` workflow validates the selected revision,
  applies Knex migrations to Neon, and triggers Render through a secret deploy
  hook.
- **Render** builds the Dockerfile and hosts the NestJS API.
- **Neon** provides the managed production PostgreSQL database.
- Production secrets such as `DATABASE_URL` and the Render deploy hook are
  stored in GitHub or Render secret management and are never committed.

The backend repository is available at:

https://github.com/gustid/interview-lab-api
