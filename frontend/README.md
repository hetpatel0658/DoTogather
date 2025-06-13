# DoTogather Frontend

React/TypeScript frontend for DoTogather task management application.

## Features

- Modern React with TypeScript
- Responsive design with Tailwind CSS
- Real-time task updates
- User authentication
- Task management interface
- Gamification elements
- Dark/Light theme support

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Build Tool**: Vite
- **State Management**: React Context/Hooks
- **HTTP Client**: Fetch API
- **Real-time**: Socket.IO Client

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your backend URL
```

3. Start the development server:
```bash
npm run dev
```

The app will run on http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:5000)
- `VITE_SOCKET_URL` - Socket.IO server URL

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── context/       # React context providers
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── styles/        # Global styles
```