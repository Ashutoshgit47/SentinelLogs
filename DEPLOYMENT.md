# 🚀 SentinelLog - Local Setup Guide

Get SentinelLog running on your local machine in minutes.

---

## 📋 Prerequisites

1. **Git** - [Download here](https://git-scm.com/downloads)
2. **Node.js** - v18 or higher ([Download here](https://nodejs.org/))

---

## � Step 1: Clone the Repository

```bash
git clone https://github.com/Ashutoshgit47/SentinelLogs.git
```

Navigate into the project folder:

```bash
cd SentinelLogs
```

---

## 📦 Step 2: Install Dependencies

```bash
npm install
```

---

## ▶️ Step 3: Run Locally

Start the development server:

```bash
npm run dev
```

The app will be available at:
```
http://localhost:5173
```

> 💡 The terminal will show the exact URL. Click it or copy-paste into your browser.

---

## � Troubleshooting

### Port Already in Use
If port 5173 is busy, Vite will automatically use the next available port.

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules
npm install
```

### Node Version Issues
Ensure you're using Node.js v18 or higher:
```bash
node --version
```

---

## 🎉 Done!

Your SentinelLog is now running locally. Happy logging! 🚀
