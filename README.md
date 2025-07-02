# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

---

```markdown
# 🎯 PhisKit Frontend – Phishing Simulation & Training Dashboard (React)

This is the **React-based frontend** for the **PhisKit** phishing simulation and awareness training platform. It provides a responsive, admin-focused dashboard for managing phishing campaigns, clients, email templates, sending profiles, landing pages, quizzes, and post-click analytics.

The backend (`Phishkit-backend`) is built with **Node.js**, **Express**, and **MongoDB**, and integrates with **GoPhish** to automate campaign launches and track real-world phishing data.

---

## 🚀 Key Features

- 🔐 Admin login & JWT-based auth integration
- 📬 Full UI for creating & launching phishing campaigns
- 🧑‍💼 Client-specific views and analytics
- ✉️ Template builder with HTML, plaintext, attachments, and tracking pixel
- 🖼️ Landing page selection with redirection/training flow
- 📊 Campaign results with table view + chart toggle
- 📑 Awareness quiz creation, launch, and results tracking
- 📁 File uploads for template attachments
- 🧭 Sidebar navigation (Dashboard, Templates, Clients, Campaigns, Settings)

> This project is optimized for internal teams conducting simulated phishing campaigns and training users on real-world threats.

---

## 🧱 Tech Stack

- **Frontend:** React, Vite, Bootstrap 5, Axios
- **State Management:** useState, useEffect (lightweight local state)
- **Backend (connected):** Node.js + Express (`Phishkit-backend`)
- **Auth:** JWT (token stored in localStorage)
- **Charts & Tables:** Recharts, MUI Tables, Pagination
- **File Handling:** Upload to backend via Multer

---

## 📁 Folder Structure


Phishkit-frontend/
├── src/
│   ├── pages/              # Main views (Dashboard, Campaigns, Templates, etc.)
│   ├── components/         # Reusable UI elements
│   ├── services/           # API request helpers
│   ├── utils/              # Auth helpers, formatters
│   ├── App.jsx             # Main app with routing
│   ├── app.routes.jsx      # Route definitions
│   └── index.js
├── public/
├── .env.example
├── vite.config.js
├── package.json
└── README.md


---

## 🔐 Authentication

- Admin users log in via `/login`
- JWT token is stored in `localStorage` and sent with every API call via Axios interceptors
- Backend will verify access and return `401` if invalid

---

## 🌐 Backend Connection

This app connects to:

```

[http://localhost:5000/api](http://localhost:5000/api)

````

Make sure your `Phishkit-backend` is running and `.env` contains:

```env
VITE_API_URL=http://localhost:5000/api
````

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Krutik090/Phishkit-frontend.git
cd Phishkit-frontend
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Set environment variables

```bash
cp .env.example .env
```

Update the API base URL as needed.

---

### 4. Run the app

```bash
npm run dev
```

Open in browser:

```
http://localhost:3000
```

---

## 🧪 Available Features

* ✅ Client Management (create, view, analyze)
* ✅ Campaign Launch & Listing (with status, date, click/open)
* ✅ Email Template Editor (HTML/plaintext, file upload)
* ✅ Sending Profile Manager (SMTP, GoPhish integration)
* ✅ Landing Page Selector
* ✅ Quiz Creation, Launch, Tracking
* ✅ Dashboard Analytics (campaign + client stats)
* ✅ Toggle between table view & chart view
* ✅ Download results as CSV

---

## 🧠 Awareness & Training Workflow

Users who click on phishing emails can be redirected to a hosted **training quiz** page, generated automatically via backend.

The React app includes quiz creation UI and admin-side result tracking.

---

## 🛠 Scripts

```bash
npm run dev       # Run development server
npm run build     # Build for production
npm run preview   # Preview production build
```

---


### 📄 License & Confidentiality Notice (Detailed)

⚠️ **Confidential & Proprietary Information**

This project and its source code are the **exclusive intellectual property** of **Krutik Thakar**. It is intended strictly for **internal, authorized use only** and contains sensitive logic, integrations, and structures that are **not to be disclosed** or reused without **explicit written consent** from the owner.

Unauthorized access, use, reproduction, modification, distribution, or deployment — in whole or in part — is **strictly prohibited** and may result in legal action under applicable intellectual property and cybersecurity laws.

By accessing or using this repository, you agree to the following:

* You are authorized to view or collaborate on this project.
* You will **not** share or distribute any part of this codebase publicly.
* You will **not** reuse any of its contents in other projects, whether private or public, without permission.
* You will handle all data, logic, and credentials related to this system with the highest degree of confidentiality.

If you have questions about usage rights or wish to request access or licensing, please contact:

**Krutik Thakar**
📧 [GitHub Profile](https://github.com/Krutik090)

---

