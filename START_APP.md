# DevSocial Startup Guide 🚀

The application has been split into a **Next.js Frontend** and an **Express Backend**. Follow these steps to get everything running.

## 1. Prerequisites

- Node.js (v18+)
- MongoDB (running locally or a Cloud URI)
- `.env.local` in the root (for frontend)
- `.env` in the `/backend` directory (for backend)

## 2. Environment Setup

### Backend (`/backend/.env`)

Ensure you have these variables set:

```env
PORT=4000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GEMINI_API_KEY=...
```

### Frontend (`/.env.local`)

Ensure you have these variables set:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## 3. Installation

From the **root directory**, install both sets of dependencies:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install
cd ..
```

## 4. Running the App

You can now start both services with a single command from the root:

```bash
npm run dev
```

This will run:

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000/api`

## 5. Troubleshooting

- **Auth Errors**: Ensure `NEXTAUTH_SECRET` matches in both `.env` files if shared, or that the frontend is correctly passing the JWT.
- **API Connectivity**: Check that `NEXT_PUBLIC_API_BASE_URL` exactly matches the backend port.
- **Missing Deps**: If you get a "module not found", run `npm install` in both the root and `/backend` again.
