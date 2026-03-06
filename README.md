# HealthyHabits Tracker - Frontend

🥗 **Healthy Habits Tracker**
 Full-Stack Wellness App with AI Insights & Realtime Analytics

Frontend : https://healthy-habits-frontend.onrender.com
Backend :https://healthy-habits-be-1.onrender.com



 ✨ **Project Overview**

Production-ready **full-stack habit tracking app** with:
- **Daily habit logging** with realtime streaks
- **Mood correlation analytics** 
- **AI-powered habit recommendations** (GPT-4o-mini)
- **Email reminders** & **wellness score**
- **Responsive dashboard** with glassmorphism UI
- **Clerk authentication** + **Supabase realtime**

## 🎯 **Features**
✅ User Auth (Clerk JWT) - Sign up/Login/Protected routes
✅ Habit CRUD - Create/Edit/Delete habits with categories
✅ Daily Logging - Streak tracking + mood correlation
✅ AI Recommendations - GPT-4o-mini habit suggestions
✅ Realtime Dashboard - Wellness score, streaks, analytics
✅ Email Reminders - Automated daily habit notifications
✅ Mood Tracker - 5-level mood + habit impact analysis
✅ Responsive Design - Mobile-first glassmorphism UI
✅ Production Deploy - Vercel (FE) + Render (BE)
✅ 🎨 Beautiful wellness-focused design
✅ 🌓 Dark mode support
✅ 📱 Fully responsive
✅ 🔐 Secure authentication with Clerk
✅ 📊 Interactive charts and analytics
✅ ✨ Smooth animations
✅ 🤖 AI-powered recommendations
✅ 🏆 Community challenges


Modern habit tracking application built with React, Redux, and Tailwind CSS.

## Tech Stack

- **React 19** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **Framer Motion** - Animations
- **Clerk** - Authentication
- **Recharts** - Data visualization
- **Axios** - API calls


## Getting Started

### Development
npm start



## Project Structure

```
src/
├── components/       # Reusable components
│   ├── ui/          # Shadcn UI components
│   ├── Layout.jsx   # Main layout wrapper
│   └── ...
├── pages/           # Page components
│   ├── LandingPage.jsx
│   ├── Dashboard.jsx
│   ├── HabitsPage.jsx
│   ├── AnalyticsPage.jsx
│   ├── ChallengesPage.jsx
│   └── ProfilePage.jsx
├── store/           # Redux store
│   ├── store.js
│   └── habitsSlice.js
├── lib/            # Utilities
│   └── api.js      # API client
├── App.js          # Main app component
└── index.js        # Entry point
```

## Environment Variables

Required in `.env`:
- `REACT_APP_BACKEND_URL` - Backend API URL
- `REACT_APP_CLERK_PUBLISHABLE_KEY` - Clerk auth key

## Design System

- **Fonts**: Fraunces (serif), Manrope (sans-serif)
- **Colors**: Wellness theme with green and soft blues
- **Components**: Shadcn/UI based
- **Animations**: Framer Motion for smooth transitions
