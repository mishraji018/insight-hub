# 🌸 Insight Hub — Enterprise SaaS Analytics

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

**Insight Hub** is a premium, high-performance SaaS analytics dashboard designed for modern enterprises. Built with the latest Next.js 14 App Router, it offers a sophisticated user experience with glassmorphism UI, real-time data visualization, and an advanced multi-theme system.

---

## ✨ Features

- 🔐 **Secure Authentication** — NextAuth.js v5 with Email + OTP verification flow.
- 📊 **Real-time Analytics** — Advanced data visualization using Recharts with smooth gradients.
- 👤 **Profile Management** — Complete user profile control with bio, social links, and photo upload.
- 🎨 **Dynamic Theme System** — 6 curated themes (Cherry Blossom, Midnight, Ocean, Sunset, Forest, Royal).
- ✍️ **Typography Control** — Choose from 10 professional Google Fonts for your entire dashboard.
- 👥 **Team Directory** — Manage members, invite users, and track team performance.
- 💳 **Billing & Subscriptions** — Enterprise-ready billing drawer with subscription state management.
- 🔑 **Developer Portal** — Generate and revoke API keys for external integrations.
- 🔔 **Smart Notifications** — Real-time alerts and unified notification center.
- 📄 **Data Export** — Export your analytics reports as professional PDF or CSV files.
- 🌐 **Multi-language Support** — Dynamic i18n support including RTL for Arabic.
- 📱 **Fully Responsive** — Perfect experience across mobile, tablet, and desktop devices.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS (Glassmorphism) |
| **Auth** | NextAuth.js v5 (Auth.js) |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma |
| **Email** | Resend |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Validation** | Zod |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- A PostgreSQL database (Neon recommended)
- Resend API Key for emails

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mishraji018/insight-hub.git
   cd insight-hub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

   # Auth
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"

   # Email (Resend)
   RESEND_API_KEY="re_..."

   # App Globals
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Run migrations**:
   ```bash
   npx prisma db push
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```text
insight-hub/
├── app/               # Next.js 14 App Router
│   ├── (auth)/        # Authentication routes (Login, Register, OTP)
│   ├── (dashboard)/   # Main dashboard layout and pages
│   ├── api/           # Backend API routes
│   └── layout.tsx     # Root layout & providers
├── components/        # Reusable UI components
├── lib/               # Shared utilities (Prisma, Auth, Security)
├── prisma/            # Database schema & migrations
├── public/            # Static assets
├── styles/            # Global CSS & Tailwind config
└── types/             # TypeScript definitions
```

---

## 📦 Available Scripts

- `npm run dev` – Runs the app in development mode.
- `npm run build` – Builds the app for production.
- `npm run start` – Runs the built app in production mode.
- `npm run lint` – Runs ESLint to check for code quality.

---

## 🌐 Deployment

Insight Hub is optimized for deployment on **Vercel**.

1. Connect your GitHub repository to Vercel.
2. Add all environment variables from `.env.local`.
3. Vercel will automatically detect Next.js and deploy.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Pawan Kumar Mishra**
- GitHub: [@mishraji018](https://github.com/mishraji018)
- Portfolio: [pmishra.dev](https://pmishra.dev)

---
*Made with ❤️ by the Insight Hub Team*