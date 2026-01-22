# Restorae Admin

Next.js admin dashboard for managing the Restorae wellness app.

## Features

- 📊 Dashboard with key metrics
- 📝 Content Management (breathing, grounding, reset exercises, etc.)
- 👥 User Management
- 💳 Subscription Management
- 🔔 Push Notification Console
- 💬 Feedback & Support Inbox
- 📈 Analytics

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   - http://localhost:3001

## Project Structure

```
src/
├── app/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Redirect to dashboard
│   └── dashboard/
│       ├── layout.tsx     # Dashboard layout with sidebar
│       ├── page.tsx       # Dashboard home
│       ├── content/       # Content CMS
│       ├── users/         # User management
│       ├── subscriptions/ # Subscription management
│       ├── notifications/ # Push notifications
│       ├── feedback/      # Feedback inbox
│       ├── analytics/     # Analytics
│       └── settings/      # System settings
├── components/
│   ├── Providers.tsx      # React Query + Auth providers
│   ├── Sidebar.tsx        # Navigation sidebar
│   └── Header.tsx         # Top header
└── lib/
    └── api.ts             # API client
```

## Tech Stack

- Next.js 14 (App Router)
- React Query for data fetching
- Tailwind CSS for styling
- Heroicons for icons
