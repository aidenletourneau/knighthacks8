# TriviaAI

Created for Knighthacks VIII

Small web game that generates trivia questions using Gemini and grades your performance. Created using Next.js, Tailwind, shadcn frontend, Postgres & Python backend.

## Setup

### Frontend

### 1. Create Node Modules Folder

Run in the `frontend/` directory:

```bash
npm install
```

### 2. Make a .env.local for Gemini API key

In the `frontend/` directory, create the file `.env.local`. Inside the file, add: `NEXT_PUBLIC_GENAI_API_KEY="your_api_key_here"`

### Backend

### 1. Setup Docker

**Make sure Docker Desktop is running**

Run in the root directory:

```bash
docker compose up --build -d backend
docker compose up
```

### 2. View PostgreSQL database in terminal (to see user information)

Run in the root directory:

```bash
docker exec -it kh8-postgres psql -U appuser -d appdb -c "SELECT * FROM users;"
```