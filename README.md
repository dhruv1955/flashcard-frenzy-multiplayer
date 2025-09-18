Flashcard Frenzy — Multiplayer Flashcard Game
================================================

Tech stack
- Next.js App Router, React Server/Client Components
- Supabase (Auth, Realtime via `active_games`, `game_events`)
- MongoDB (questions, games, gameHistory)
- Tailwind CSS v4
- TypeScript + Zod

Quick start
1) Install deps
```bash
npm i
```
2) Create `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://awfajtuvkqmcxqpnyswe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZmFqdHV2a3FtY3hxcG55c3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTcxNzIsImV4cCI6MjA3Mzc5MzE3Mn0.GOGAFKmaJAJG6RwJrRXi9tQoH-aBtW-etjWV3eoPanE
MONGODB_URI=mongodb+srv://dhruvyadav042905_db_user:dgYjJgIqrm8FezMI@flashcard-frenzy.yjc06ib.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=flashcard_frenzy
```
3) Run dev server
```bash
npm run dev
```

Supabase setup
- Create tables `active_games` and `game_events` with columns:
  - active_games: id uuid PK, game_state jsonb, players uuid[], current_question_id uuid, scores jsonb, status text
  - game_events: id uuid PK, game_id uuid, player_id uuid, event_type text, data jsonb, timestamp timestamptz
- Configure RLS: allow service role to upsert/insert. Client should only subscribe.

Key directories
- `app/api/*`: API routes (games, questions, history, stats)
- `components/*`: UI components (Auth, GameRoom, Lobby, QuestionCard, Scoreboard, History)
- `lib/*`: database, auth, realtime utilities
- `types/*`: shared TypeScript models

Production tips
- Set `SUPABASE_SERVICE_ROLE_KEY` only on server (Vercel project env) and never expose it to the client.
- Add monitoring (e.g., Sentry) by instrumenting `app/error.tsx` and API error catches.
- Tune MongoDB indexes: `games.id`, `gameHistory.playerId`, `gameHistory.gameId`, `questions.id`, `questions.category`.
- Rate limit APIs at the edge or with a gateway. Current middleware sets security headers; integrate a provider like Upstash for quotas.

Deployment
- Vercel: push to GitHub, import project, set Environment Variables, and deploy.
- Ensure database/network egress is allowed for MongoDB and Supabase.

Scripts
- `npm run dev` — start dev server
- `npm run build` — build
- `npm start` — start production
