# HealthyHabits Tracker - Frontend

Modern habit tracking application built with React, Redux, and Tailwind CSS.

## Tech Stack

- **React 19** - UI library
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **Framer Motion** - Animations
- **Clerk** - Authentication
- **Recharts** - Data visualization
- **Axios** - API calls

## Features

- 🎨 Beautiful wellness-focused design
- 🌓 Dark mode support
- 📱 Fully responsive
- 🔐 Secure authentication with Clerk
- 📊 Interactive charts and analytics
- ✨ Smooth animations
- 🎯 Habit tracking and streaks
- 🤖 AI-powered recommendations
- 🏆 Community challenges

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
