# MediKiosk

## AI-assisted multilingual clinical intake

MediKiosk is a clinician-in-the-loop patient intake platform for healthcare centers, hospital OPDs, and AYUSH clinics. It turns structured voice or touch input into privacy-aware SOAP case sheets, supports multiple Indian languages, and gives doctors a focused verification workspace.

**Developed by:** [Yashveer Tak](https://github.com/yashveer05tak)
**Project:** Smart India Hackathon 2026, Problem Statement 26047

## Live website

Run the frontend locally with the steps below. For a public deployment, host the `frontend/dist` output on any static hosting provider and configure the backend URL in `frontend/src/services/api.js`. The application is suitable for Vercel, Netlify, GitHub Pages with an API server, or any Node-compatible host.

## Highlights

- Multilingual patient intake across English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, and Gujarati.
- Voice-to-text intake using the browser Web Speech API, with touch-friendly controls.
- PII redaction for phone numbers, Aadhaar numbers, and email addresses before clinical processing.
- AI-assisted SOAP case sheet generation with deterministic fallback parsing.
- AYUSH assessment support for Prakriti, Agni, Koshtha, and Dosha markers.
- Doctor verification dashboard with edit, sign-off, history, and PDF export workflows.
- MongoDB and MySQL integrations with local in-memory fallbacks for demos and tests.

## Technology

- Frontend: React 18, Vite, Tailwind CSS CDN, Lucide React, Web Speech API
- Backend: Node.js, Express, JWT, bcrypt, PDFKit, Multer
- Data: MongoDB and MySQL with local in-memory fallback stores
- AI: Google Gemini integration with deterministic clinical NLP fallback

## Run locally on any system

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- MongoDB and MySQL are optional because local fallback stores are enabled

### 1. Get the project

```bash
git clone <your-repository-url>
cd Patient-Case-Taking-Software-main
```

On Windows PowerShell, macOS, and Linux, the remaining commands are the same.

### 2. Configure the backend

Create or edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret
MONGO_URI=mongodb://localhost:27017/medikiosk_db
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=medikiosk_db
GEMINI_API_KEY=
```

### 3. Install and start the backend

```bash
cd backend
npm install
npm start
```

The API health check is available at `http://localhost:5000/api/health`.

### 4. Install and start the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in a modern Chromium, Firefox, or Safari browser.

### 5. Production build

```bash
cd frontend
npm run build
npm run preview
```

The generated static site is written to `frontend/dist` and can be deployed to a static hosting provider. Keep the backend running separately and configure CORS and the API base URL for production.

## Demo accounts

- Doctor: `doctor@medikiosk.org` / `doctor123`
- Patient: `patient@medikiosk.org` / `patient123`

Use the quick demo buttons in the sign-in modal to fill these accounts automatically.

## Tests

From the project root, run:

```bash
node tests/test_medikiosk.js
```

The suite covers PII redaction, SOAP structuring, emergency triage, case persistence, and doctor sign-off.

## API overview

| Method | Endpoint | Purpose | Access |
| --- | --- | --- | --- |
| GET | `/api/health` | Service and database health | Public |
| POST | `/api/auth/register` | Create a patient or doctor account | Public |
| POST | `/api/auth/login` | Authenticate and issue a JWT | Public |
| GET | `/api/auth/me` | Read the current profile | Protected |
| POST | `/api/case/structure` | Sanitize input and create a SOAP case | Protected |
| GET | `/api/case/all` | List clinical case sheets | Protected |
| PUT | `/api/case/:id/verify` | Verify and sign off a case | Doctor / Admin |
| GET | `/api/case/:id/pdf` | Export a clinical PDF | Protected |

## Privacy and safety

MediKiosk is a software prototype and does not replace professional medical judgment. Keep production secrets outside source control, use HTTPS in deployment, and review all generated clinical content before it is used for care.

## License

No license has been specified for this repository yet.
