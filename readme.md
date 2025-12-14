# SentinelLog 🛡️

**Privacy‑First, Browser‑Based Security Log Analysis**

SentinelLog is a **frontend‑only, privacy‑preserving SIEM‑lite** tool that analyzes security logs **entirely in your browser**. No servers. No uploads. No data leaks. Built for security professionals, students, and privacy‑conscious environments.

> 🔒 **Your logs never leave your machine.** All parsing, detection, and visualization happen in browser memory.

---

## 🚀 Live Demo

🌐 https\://sentinallogs.pages.dev/

---

## ✨ Key Features

### 🔐 Privacy by Design

- 100% client‑side processing (no backend)
- Files are never uploaded or stored
- Optional IP enrichment only sends IPs to AbuseIPDB
- Session‑only memory (one‑click reset)

### 📁 Multi‑Format Log Support

- Windows Event Logs (CSV, XML)
- Linux auth & syslog files
- Apache / Nginx / IIS access logs
- JSON & NDJSON application logs
- Generic CSV exports

### 🚨 Built‑In Threat Detection

- Brute‑force login attempts
- Password spraying attacks
- Privilege escalation indicators
- Web scanning & reconnaissance
- MITRE ATT&CK mapping included

### 🌐 IP Reputation (Optional)

- AbuseIPDB integration
- Demo mode (no API key required)
- Real‑time threat context

### 📊 Reporting & Export

- JSON & CSV exports
- Print‑friendly PDF reports
- Shareable investigation output

### 🎨 Modern SOC‑Style UI

- Dark theme optimized for long sessions
- Search, filter, and severity badges
- Responsive (desktop, tablet, mobile)

---

## 🧠 How SentinelLog Works

```
┌──────────────┐   ┌──────────────┐   ┌───────────────┐
│   Log File   │→  │   Parser     │→  │ Threat Rules  │
│ (Your Disk)  │   │ (In Browser) │   │ (In Memory)   │
└──────────────┘   └──────────────┘   └───────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │  UI & Export │
                      └──────────────┘
                              │
                              ▼ (Optional)
                      ┌──────────────┐
                      │  AbuseIPDB   │
                      │  (IP only)   │
                      └──────────────┘
```

---

## 🎯 Use Cases

- 🔍 Quick incident triage
- 🏠 Home lab investigations
- 🎓 Learning log analysis & detection logic
- 🔐 Privacy‑restricted environments
- 📑 Generating security reports

---

## 🧾 Supported Log Types

### Windows

- Security Event Log (CSV / XML export)
- System & Application logs
- Windows Firewall events

### Linux

- `/var/log/auth.log`
- `/var/log/syslog`
- `/var/log/secure`

### Web Servers

- Apache (Combined Log Format)
- Nginx access logs
- IIS W3C logs

### Applications

- JSON & NDJSON logs
- Custom CSV exports

---

## 🚨 Detection Rules (Examples)

| Rule                 | Description                         | MITRE ATT&CK |
| -------------------- | ----------------------------------- | ------------ |
| Brute Force          | Multiple failed logins from same IP | T1110        |
| Password Spraying    | Same user targeted from many IPs    | T1110.003    |
| Privilege Escalation | Admin/root activity detected        | T1078        |
| Web Scanning         | Excessive 404/401 responses         | T1595        |

> ⚠️ SentinelLog uses **rule‑based detection**, not ML. Results are meant for **triage**, not final attribution.

---

## ⚠️ Limitations

- **Max file size:** \~10 MB
- **.evtx files are not supported** (export to CSV/XML first)
- Large files may slow down your browser
- Some Windows events do not include IP addresses

---

## 🛠️ Tech Stack

- **React + TypeScript**
- **Vite** for fast builds
- **Client‑side parsing only**
- **Zero backend / zero database**

---

## 🚀 Getting Started

### Development

```bash
git clone https://github.com/Ashutoshgit47/SentinelLogs.git
cd SentinelLogs
npm install
npm run dev
```

### Production Build

```bash
npm run build
# Deploy the dist/ folder to any static host
```

---

## 📂 Project Structure

```
SentinelLog/
├── src/
│   ├── components/
│   ├── parserEngine.ts
│   ├── App.tsx
│   └── index.css
├── public/
├── index.html
└── package.json
```

---

## 🤝 Contributing

Contributions are welcome!

- Fork the repo
- Create a feature branch
- Submit a pull request

---

## 👨‍💻 Author

**Ashutosh Gautam**\
GitHub: [https://github.com/Ashutoshgit47](https://github.com/Ashutoshgit47)

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

> ⭐ If you find SentinelLog useful, consider giving the project a star!

