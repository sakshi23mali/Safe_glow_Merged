# SafeGlow

AI-assisted skincare safety analysis with personalized product recommendations.

## Project structure

- `client/`: frontend (Expo / React Native) feature modules
- `server/`: backend (Node.js / Express) API

## Prerequisites

- Node.js (LTS recommended)
- MongoDB (local or hosted)

## Setup

### 1) Frontend environment

Create a `.env` in the project root:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 2) Backend environment

Copy `server/.env.example` to `server/.env` and fill in values:

```bash
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/safeglow
JWT_SECRET=replace-with-strong-secret
CLIENT_ORIGINS=http://localhost:19006,http://localhost:8081
GOOGLE_CSE_KEY=your_google_api_key
GOOGLE_CSE_CX=your_search_engine_id
```

## Run locally

The easiest way to start both servers is to use the unified dev command from the project root:

```bash
npm install
npm run dev
```

This will concurrently start:
- **Backend**: Express server on port 4000 with nodemon
- **Frontend**: Expo/Metro bundler on port 8081

Alternatively, you can run them separately:

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
npm install
npm run start
```

## Features

- **Skin Type Analysis**: Quiz-based skin type identification.
- **Product Safety Analysis**: Scans product descriptions for potentially irritating ingredients based on your skin type.
- **Personalized Recommendations**: Fetches real-world products using Google Custom Search API.
- **Resilient Search**: Automatically falls back to high-quality mock data if API limits are reached or keys are invalid.

## API documentation

OpenAPI spec: `server/openapi.json`

## Testing

Backend tests:

```bash
cd server
npm test
```
