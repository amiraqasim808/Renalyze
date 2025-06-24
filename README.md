# 🩺 Renalyze – AI-Powered Kidney Diagnosis Platform

**Renalyze** is a full-stack AI healthcare platform developed as a graduation project. It empowers users to diagnose kidney conditions through scan analysis, access medical content, and engage in a supportive health community — all through a mobile app. The admin dashboard allows for powerful content and user management.

---

## ✨ Features Overview

### 📱 Mobile Application

- 🧠 **AI Kidney Diagnosis** – Upload kidney scans to detect:
  - Kidney **Stones**
  - **Tumors**
  - **Cysts**
  - or a **Healthy Kidney**
- 📄 **Downloadable PDF Reports** – Save and share diagnosis results.
- 🕘 **Medical History** – View and track past scan results.
- 🧮 **eGFR Calculator** – Estimate kidney function using age, gender & creatinine level.
- 📰 **Health Articles** – Read admin-curated content on kidney health.
- 🧑‍⚕️ **Doctor Directory** – Find top specialists with contact info, location & reviews.
- 💬 **Community Forum** – Share experiences, ask questions & support others.

### 🧑‍💼 Admin Dashboard

- 🔐 **Secure Authentication** – JWT-based login for administrators.
- 📊 **Analytics Dashboard** – View stats: user count, articles, doctors, and posts.
- 🧑‍⚖️ **User Management** – Block, warn, or monitor users flagged via reports.
- 📰 **Content Management** – Create, edit, or delete health articles.
- 🧑‍⚕️ **Doctor Management** – Manage doctor listings and details.
- 📧 **Mass Emailing** – Send announcements to all users.

---

## 🛠 Tech Stack

| Layer        | Tools / Libraries                             |
|--------------|-----------------------------------------------|
| **Frontend** | *(Not included here – built with Flutter/React Native)* |
| **Backend**  | Node.js, Express.js, MongoDB                  |
| **Auth**     | JWT, bcryptjs                                 |
| **Image Upload** | Multer, Cloudinary                      |
| **Emailing** | Nodemailer                                    |
| **PDF**      | PDFKit                                        |
| **Validation** | Joi                                        |
| **Payment Integration** | Stripe                            |
| **Scheduling** | node-cron                                  |

---

## ⚙️ Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-username/renalyze.git
cd renalyze
npm install
2. Setup Environment Variables
Create a .env file in the root with:

env
Copy
Edit
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

NODE_ENV=development
3. Run the App
bash
Copy
Edit
# Development
npm run dev

# Production
npm start
