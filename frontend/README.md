# BookHub Frontend

A React + TypeScript + Vite frontend application for the BookHub library management system.

## Features

- User authentication (login/register)
- Book management (CRUD operations)
- Responsive design with modern UI
- TypeScript for type safety
- Redux Toolkit for state management

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see backend README)

## Environment Setup

The application supports both local development and production environments through environment variables.

### Local Development

For local development, the application automatically uses the Vite proxy configuration to forward API requests to the backend server running on `http://localhost:5000`.

If you need to override the API URL, create a `.env` file in the frontend directory:

```bash
# .env
VITE_API_BASE_URL=http://localhost:5000
```

### Production

For production deployment, set the `VITE_API_BASE_URL` environment variable to your production backend URL:

```bash
VITE_API_BASE_URL=https://your-production-backend.com
```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

## Development

The development server runs on `http://localhost:3000` and automatically proxies API requests to the backend server on `http://localhost:5000`.

### Project Structure

```
src/
├── api/           # API configuration and functions
├── components/    # Reusable React components
├── pages/         # Page components
├── store/         # Redux store and slices
├── types/         # TypeScript type definitions
└── ...
```

### API Configuration

The API configuration is handled in `src/api/axiosConfig.ts`:

- Automatically detects development vs production environment
- Uses Vite proxy in development (`/api` → `http://localhost:5000`)
- Uses environment variable `VITE_API_BASE_URL` in production
- Includes authentication token handling
- Handles 401 errors with automatic logout

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
