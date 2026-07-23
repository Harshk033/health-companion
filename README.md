# 🩺 SwasthyaSeva (स्वास्थ्य सेवा) - Rural Health Companion

SwasthyaSeva is a lightweight, offline-first health companion web application engineered specifically for rural and low-resource healthcare settings.

---

## 🌟 METHOD 1: Run WITHOUT Node.js or React (Pure Vanilla JavaScript) ⚡
*(No Node.js, No React, No npm install required! Works directly in any web browser or VS Code).*

### 📋 Prerequisites
- **VS Code** (or any text editor / web browser)
- **Optional**: VS Code Extension: **Live Server** (by Ritwick Dey) for auto-reloading upon editing.

---

### 📦 Step 1: Extract the Zip File
1. Download `swasthyaseva-vanilla.zip`.
2. Extract the zip file to any folder on your computer (e.g. `Desktop/swasthyaseva-vanilla`).

---

### 💻 Step 2: Open & Run in VS Code
1. Open **Visual Studio Code**.
2. Click **File** > **Open Folder...** and select the extracted `swasthyaseva-vanilla` folder.
3. Open `index.html`.
4. **Option A (Direct in Browser)**: Right-click `index.html` in VS Code file explorer and click **Copy Path**, then paste into Chrome/Edge/Firefox address bar. Or double-click `index.html` directly from your file manager!
5. **Option B (VS Code Live Server)**: Right-click inside `index.html` and click **"Open with Live Server"**.

That's it! The app will run instantly in your browser with full interactivity, charts, local alarms, symptom triage, and local database storage without needing Node.js or React!

---

## 🚀 METHOD 2: Run with Node.js & React (Full-Stack Dev Server)

### 📋 Prerequisites
- **Node.js**: Version 18.x or higher ([Download Node.js](https://nodejs.org/))
- **npm** (bundled with Node.js)

### 📦 Steps
1. Extract `swasthyaseva-app.zip`.
2. Open folder in VS Code.
3. Open terminal (`` Ctrl + ` ``) and run:
   ```bash
   npm install
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000/` in your web browser.

---

## 🛠️ Project Files (Vanilla JS Edition)
```text
swasthyaseva-vanilla/
├── index.html        # Main HTML layout with Tailwind CSS CDN & Chart.js
├── app.js            # Pure Vanilla JavaScript logic, triage engine, & localStorage
└── README.md         # Instructions & Documentation
```

---

## 📄 Disclaimer
This application is designed for educational and supportive clinical decision triage in rural healthcare settings. It is not a replacement for professional medical diagnosis or hospital treatment.

