# Restorae Admin - Setup Instructions

## Prerequisites

✅ Node.js 18+ installed
✅ Backend API running on http://localhost:3000

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Admin dashboard: http://localhost:3001

## Login

Currently, the admin uses token-based authentication. You'll need to:

1. Get a JWT token from the backend API
2. Store it in localStorage with key `adminToken`

Example:
```javascript
// In browser console on http://localhost:3001
localStorage.setItem('adminToken', 'your-jwt-token-here');
```

## Features

### Dashboard (/)
- Overview stats
- Daily/Monthly active users
- Subscription metrics
- Recent feedback

### Content (/content)
- Manage all content types
- Filter by type
- Create/Edit/Delete content
- Publish/Unpublish
- Multi-language support

### Users (/users)
- Search users
- View user details
- Enable/Disable accounts
- Export user data (GDPR)

### Subscriptions (/subscriptions)
- View all subscriptions
- Grant premium access
- Monitor trials
- Conversion metrics

### Notifications (/notifications)
- Send push notifications
- Target specific segments
- Schedule campaigns

### Feedback (/feedback)
- Support inbox
- Bug reports
- Feature requests
- Mark as resolved

### Analytics (/analytics)
- Retention metrics
- Mood trends
- Engagement stats

### Settings (/settings)
- Feature flags
- System configuration
- Legal content

## Development

### API Client

API calls are handled in `src/lib/api.ts`:
- Automatically adds auth headers
- Handles 401 redirects
- Base URL from environment variable

### Adding New Pages

1. Create page in `src/app/dashboard/[pagename]/page.tsx`
2. Add route to sidebar in `src/components/Sidebar.tsx`
3. Use React Query for data fetching

### Styling

- Tailwind CSS for styling
- Brand colors defined in `tailwind.config.js`
- Heroicons for icons

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000)
- `NEXTAUTH_URL` - Admin URL (default: http://localhost:3001)
- `NEXTAUTH_SECRET` - NextAuth secret key

## Build for Production

```bash
npm run build
npm start
```
