<div align="center">
  <h1>RUMI</h1>
  <p><strong>Smart Lifestyle & Compatibility-Based Flatmate Matching Platform</strong></p>

  ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
  ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
  ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
</div>

## 🚀 Overview

RUMI is a Smart Lifestyle and Compatibility based Flatmate matching platform. Whether you're offering a room or searching for one, RUMI connects you with the right people through a robust custom compatibility algorithm, intuitive swipe discovery, and AI-powered assistance.

Deployed reliably on **Vercel** (Frontend) and **Render** (Backend).

## ✨ Core Features

* **Lifestyle Compatibility System**: Custom algorithm matching users based on deep lifestyle habits and preferences.
* **Swipe-Based Discovery**: Intuitive, high-performance UI for exploring rooms and potential roommates.
* **Mutual-Consent Real-Time Chat**: Secure Socket.IO chat infrastructure that unlocks strictly *only* after mutual request acceptance.
* **Intelligent AI Assistant**: Built-in chatbot powered by RAG, Pinecone vector database, and the Google Gemini API.
* **Dynamic Room Management**: End-to-end flow for creating, discovering, and offering room listings.
* **Enterprise-Grade Security**: Robust JWT authentication and Role-Based Access Control (RBAC).
* **Secure REST APIs**: Highly scalable Node.js/Express.js backend with Cloudinary for optimized media management.

## 🛠️ Tech Stack

### Frontend
* **React.js** - UI Architecture
* **Vite** - Build Tooling
* **Vercel** - Production Deployment

### Backend
* **Node.js & Express.js** - Core API Server
* **Socket.IO** - Real-time WebSocket infrastructure
* **Render** - Production Deployment

### Database & AI Services
* **MongoDB** - Primary Database
* **Pinecone** - Vector Database (RAG)
* **Google Gemini API** - LLM Integration
* **Cloudinary** - Media Storage

## 📂 Project Structure

```text
rumi/
├── backend/                # Node.js + Express API
│   ├── controllers/        # Route logic & request handling
│   ├── models/             # Mongoose database schemas
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic & 3rd party APIs (Gemini, Pinecone)
│   ├── sockets/            # Socket.IO real-time handlers
│   └── app.js              # Express app & middleware setup
└── frontend/               # React.js + Vite Application
    ├── src/
    │   ├── assets/         # Static assets and SVGs
    │   ├── components/     # Reusable UI components & layouts
    │   ├── pages/          # Main application screens
    │   ├── services/       # Axios API clients & Socket service
    │   └── App.jsx         # Root component & Routing
    ├── .env.production     # Production environment config
    └── vite.config.js      # Vite & proxy configuration
```

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rumi.git
   cd rumi
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file based on environment requirements
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file (VITE_API_URL=http://localhost:9090)
   npm run dev
   ```

## 🔮 Future Improvements

* **In-App Video Verification**: KYC and video intro integration for enhanced safety.
* **Automated Rent Splitting**: Integrated payment gateways for shared expenses.
* **Advanced RAG Capabilities**: Expanding the AI assistant to handle lease agreements and neighborhood insights.
* **Push Notifications**: PWA and native notification support for real-time match alerts.

## 📄 License & Intellectual Property

**© 2026 RUMI**. All rights reserved. 
This project is proprietary. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without explicit permission.
