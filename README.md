# Codeverse Logic Arena

Code Sprint platform for **PROCOM 26** at FAST University.

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

Create `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

## Database Setup

1. Run `supabase/schema.sql` in Supabase SQL Editor
2. Set admin password (see `supabase/CHANGE_PASSWORD.md`)

## Tech Stack

- React + TypeScript + Vite
- Supabase
- Tailwind CSS

## Usage

- **Participants**: Enter team name at home page
- **Admins**: Login at `/admin` to control rounds

---

Built for PROCOM 26 Code Sprint
