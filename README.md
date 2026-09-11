# Viora

AI-assisted multilingual clinical intake platform with adaptive interview questions for real patient problems.

## Overview

Viora is a clinician-in-the-loop patient intake system built for modern outpatient workflows. It captures voice or text symptoms, asks adaptive follow-up questions based on the reported complaint, redacts sensitive patient data, and converts the interaction into a structured SOAP case sheet for doctor review.

**Developed by:** [Yashveer Tak](https://github.com/yashveer05tak)  
**Project:** Smart India Hackathon 2026, Problem Statement 26047

## Highlights

- Multilingual intake across English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, and Gujarati
- Voice-to-text input with browser speech recognition
- Adaptive AI interview flow that changes question patterns based on the symptom profile
- Clean dark theme and light theme switching for accessibility and clinician usability
- PII redaction for phone numbers, Aadhaar numbers, and email addresses
- SOAP case generation with AI-assisted structure and deterministic fallback logic
- Emergency triage support for red-flag clinical scenarios
- Doctor verification dashboard with sign-off, history, and PDF export workflows
- MongoDB and MySQL support with local fallback stores for demos and testing

## Tech stack

- Frontend: React 18, Vite, Lucide React, Web Speech API
- Backend: Node.js, Express, JWT, bcrypt, Multer, PDFKit
- Data: MongoDB and MySQL with local fallback stores
- AI: Google Generative AI with deterministic clinical fallback parsing

## Project structure

- `backend/` — Express API, auth, case logic, and clinical processing
- `frontend/` — Vite + React frontend
- `tests/` — verification scripts

## Prerequisites

- Node.js 18+
- npm 9+
- Optional: MongoDB and MySQL locally for database-backed mode

## Local setup

### 1. Clone the project

```bash
git clone https://github.com/yashveer05tak/viora.git
cd viora
```

### 2. Configure the backend

Create a `backend/.env` file:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret
MONGO_URI=mongodb://localhost:27017/viora_db
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=viora_db
GEMINI_API_KEY=
```

### 3. Start the backend

```bash
cd backend
npm install
npm start
```

The health endpoint is available at:

```text
http://localhost:5000/api/health
```

### 4. Start the frontend

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

### 5. Production build

```bash
cd frontend
npm run build
npm run preview
```

The production bundle is generated in `frontend/dist`.

## Demo accounts

- Doctor: `doctor@viora.org` / `doctor123`
- Patient: `patient@viora.org` / `patient123`

## Testing

From the project root:

```bash
node tests/test_viora.js
```

This suite covers:

- PII sanitization and redaction
- SOAP structuring logic
- red-flag emergency triage
- case persistence
- doctor verification workflow

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check service health |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate and get JWT |
| GET | `/api/auth/me` | Get current profile |
| POST | `/api/case/structure` | Create a SOAP case |
| GET | `/api/case/all` | List case sheets |
| PUT | `/api/case/:id/verify` | Verify a case |
| GET | `/api/case/:id/pdf` | Export PDF |

## Privacy and safety

Viora is a prototype and does not replace professional medical judgment. Always keep production secrets out of source control, use HTTPS in deployment, and review generated clinical content before using it in patient care.

## License

No license has been specified for this repository yet.
