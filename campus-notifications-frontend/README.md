# Campus Notifications — React Frontend

> Material UI · Dark Theme · Priority Inbox UI

## Tech Stack
- **React 18** (Create React App)
- **Material UI v5** — dark theme
- **Axios** — API calls to Spring Boot backend
- **Space Mono + DM Sans** — Google Fonts

## Quick Start

```bash
npm install
npm start     # http://localhost:3000
```

Configure `.env` if backend is not on port 8080:
```
REACT_APP_API_URL=http://localhost:8080
```

## Features
- Priority Inbox (top N, ranked)
- Stats bar (Placement / Result / Event counts)
- Type filter + Top N selector
- Server health indicator
- Auto-refresh (30s)
- Setup modal for registration & auth

## Build
```bash
npm run build
```
