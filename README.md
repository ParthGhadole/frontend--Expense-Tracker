# Expense Tracker - Frontend

React + TypeScript frontend with Tailwind CSS and shadcn/ui components.

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Backend URL

The API is configured to connect to `http://localhost:8000/api` by default.

If your backend runs on a different URL, update it in `src/lib/api.ts`:

```typescript
const API_BASE_URL = 'http://your-backend-url/api'
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### 4. Build for Production

```bash
npm run build
```

## Features

### Pages

1. **Login/Register** - User authentication
2. **Dashboard** - Financial summary with charts
3. **Transactions** - Add, edit, delete, and filter transactions
4. **Categories** - Manage custom categories
5. **Export** - Download transactions as CSV

### UI Components

Custom components based on shadcn/ui:
- Button, Input, Select
- Card, Table, Dialog
- Tabs, Alert, Label

### Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Axios** - HTTP client

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── Layout.tsx    # Main app layout
├── context/
│   └── AuthContext.tsx  # Authentication state
├── lib/
│   ├── api.ts        # API client
│   └── utils.ts      # Utility functions
├── pages/
│   ├── Auth.tsx      # Login/Register
│   ├── Dashboard.tsx # Summary & charts
│   ├── Transactions.tsx
│   ├── Categories.tsx
│   └── Export.tsx
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Usage

1. **Register** a new account or **login** with existing credentials
2. **Add transactions** from the Transactions page
3. **View your summary** on the Dashboard
4. **Create custom categories** in Categories page
5. **Export data** to CSV from the Export page

