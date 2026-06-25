# 🎓 CampusFlow: AI × WhatsApp × Google Calendar Student Productivity Hub

CampusFlow is a state-of-the-art, modular student productivity platform designed specifically for B.Tech students. It helps students navigate their academic lives by digesting unstructured notice board circulars, organizing deadlines, creating active-recall study flashcards/quizzes, mapping schedules to Google Calendar, and broadcasting notifications to study groups via WhatsApp.

Built for the **CampusAI Hackathon 2025** sprint under the **Student Ecosystem** theme.

---

## 🚀 Key Features & Modules

### 1. ⚙️ Core Dashboard & Student Onboarding (Mandatory)
* **Unified Control Panel**: Clean, modern dark mode interface with glassmorphic cards. Displays today's events, pending academic deadlines, active subjects, and an **AI tip of the day**.
* **One-Click Demo Profiles**: Quick onboarding for judges to instantly test-run profiles.
* **Interactive Tasks CRUD**: Create assignments with options to schedule WhatsApp notifications (e.g. 24h/1h before) and toggle Google Calendar syncing.
* **Live Automations Monitor**: Real-time console showing outgoing n8n webhook payloads, timestamps, and status logs.

### 2. 🧠 AI Study Buddy (Feature Module 1)
* Paste lecture notes or coding guidelines.
* AI compiles **interactive flip flashcards** for active recall testing.
* AI generates a **graded Multiple Choice Quiz** with instant results feedback and scoring.

### 3. 📅 Smart Deadline Scheduler (Feature Module 2)
* Analyzes assignment titles and subjects relative to the deadline date.
* AI maps a **suggested daily study plan timeline** (e.g., Setup & Research → Implementation → Testing → Submission) to prevent late-night cramming.

### 4. 📢 Notice Summarizer (Feature Module 3 - BONUS)
* Paste unstructured university notices or placement drive memos.
* AI extracts key deadlines, target dates, and provides a **3-bullet TL;DR**.
* **Broadcast Hub**: One-click broadcast option triggers an n8n webhook loop to alert the entire study group via WhatsApp.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + Axios
* **Backend**: Node.js (Express) + Local JSON Database (SQLite-like db.json, C++-compiler-free for absolute portability)
* **AI Engine**: Google Gemini 1.5 Flash (Direct API endpoints) + Smart Simulation Fallback (runs fully offline or without API keys for bulletproof live pitches)
* **Automation**: n8n Cloud (Webhook Node → Google Calendar Node → Wait Node → Twilio Node)

---

## 📂 Project Structure

```
CampusFlow/
├── backend/
│   ├── .env                    # Server port, API keys & webhook URLs
│   ├── aiService.js            # Direct Gemini API integration & offline simulation fallbacks
│   ├── db.json                 # JSON database with seed data
│   ├── routes.js               # Auth, Tasks, AI, and Log API routers
│   ├── server.js               # Express application server bootstrap
│   └── package.json            # Backend package scripts & dependencies
├── frontend/
│   ├── index.html              # Viewport setup & Google Fonts link
│   ├── tailwind.config.js      # Dark-mode color systems and transitions
│   ├── vite.config.js          # API proxy routing configurations
│   ├── src/
│   │   ├── App.jsx             # Layout Router, state coordinator, and onboarding UI
│   │   ├── index.css           # Glassmorphism cards, glowing borders, card flip transitions
│   │   ├── main.jsx            # Entry point
│   │   └── components/
│   │       ├── Dashboard.jsx   # Control panel & Live n8n webhook logger
│   │       ├── StudyBuddy.jsx  # AI lecture notes revision cards & quiz generator
│   │       ├── DeadlineManager.jsx # CRUD list & AI daily preparation roadmap
│   │       └── NoticeSummarizer.jsx # TL;DR extractor & broadcast hub
├── n8n_workflows/
│   ├── workflow_deadline_reminder.json  # Workflow 1 Blueprint
│   └── workflow_notice_broadcast.json    # Workflow 2 Blueprint
└── package.json                # Root package.json coordinating concurrent starts
```

---

## 💻 Installation & Setup

### Prerequisite
Ensure [Node.js](https://nodejs.org) (v18+) is installed.

### 1. Install Dependencies
From the root directory, install all dependencies concurrently:
```bash
npm install
npm run install:all
```

### 2. Configure Environment Variables
Create or edit `backend/.env`:
```env
PORT=5000

# 1. (Optional) Paste Gemini Key. If empty, the app runs in full AI Simulation Mode.
GEMINI_API_KEY=your_gemini_api_key_here

# 2. (Optional) Paste n8n webhooks. If empty, the app simulates webhook hits.
N8N_DEADLINE_WEBHOOK_URL=https://primary.n8n.cloud/webhook/your-uuid-here
N8N_NOTICE_WEBHOOK_URL=https://primary.n8n.cloud/webhook/your-uuid-here
```

### 3. Import n8n Workflows
1. Log in to [n8n.cloud](https://n8n.cloud) (free tier).
2. Click **New Workflow**.
3. Import `n8n_workflows/workflow_deadline_reminder.json` (Open file, copy content, paste inside n8n canvas, or click top right menu -> Import from file).
4. Configure credentials for **Google Calendar** and **Twilio** (WhatsApp Sandbox).
5. Copy the n8n **Webhook Test URL** and paste it into your `backend/.env` file.
6. Repeat the process for `n8n_workflows/workflow_notice_broadcast.json`.

### 4. Run the Platform
Run the development servers for both frontend and backend concurrently with:
```bash
npm run dev
```
* Frontend runs on: **http://localhost:3000**
* Backend runs on: **http://localhost:5000**

---

## 💡 Live Demo Pitch Checklist (2 Minutes)

Judges love structured, flawless automation demos. Follow this script:

1. **Onboarding**: Click the quick-login profile for "Rohan Verma" (CSE student). Notice the beautiful glassmorphism dashboard, the AI tip, and the empty Automations Log.
2. **AI Study Buddy**: 
   * Navigate to *AI Study Buddy* tab.
   * Paste some Operating System notes (e.g. "*A semaphore is a synchronization tool S variable wait() decrements signal() increments*").
   * Generate: Show the **Flip Flashcards** (click to flip cards with 3D rotation) and the **MCQ Practice Quiz** (select options, submit to check grade).
3. **Smart Deadline**: 
   * Navigate to *Deadline Manager* tab.
   * Add a deadline named "*DBMS Assignment 2*", check "*Sync to Google Calendar*", click Save.
   * **The Automation Proof**: Open the *Dashboard* and show the **Live n8n Automations Log** showing the JSON payload sent to n8n! Open Google Calendar to show the event created automatically.
   * **AI Timeline**: Click *AI Plan* next to the task and watch the daily study plan timeline generate!
4. **Notice Broadcast (Bonus)**: 
   * Navigate to *Notice Summarizer* tab.
   * Paste a sample circular announcement text (e.g., placement drive or holiday circular).
   * Summarize: Watch the AI extract the event date and outline a clean **3-bullet point TL;DR**.
   * Click **Broadcast & Add to Calendar**: Show the log updating instantly, looping through phone numbers to trigger n8n alerts.
5. **Pitch Wrap**: Wrap up by explaining: *"If we had more time, we would build a WhatsApp incoming message listener to let students query their schedule by simply texting 'what is my schedule today?' to the chatbot."* (Judges reward forward thinking!).
