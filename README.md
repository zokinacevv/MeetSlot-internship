# MeetSlot

MeetSlot is a lightweight, single-host appointment scheduler built as a TeamLift internship challenge. Hosts publish available times, visitors book one, and a simple dashboard manages the schedule.

## Features

- Public calendar, availability, booking form, confirmation screen, responsive UI
- Server-side Zod validation and consistent JSON API responses
- PostgreSQL persistence with Prisma and a rerunnable sample-slot seed
- UTC storage with `Europe/Skopje` display and daylight-saving validation
- Overlap protection under a PostgreSQL advisory transaction lock
- Atomic conditional update to prevent double bookings
- Host dashboard with live statistics, slot creation, deletion, and booking cancellation
- Google Calendar conflict checking that hides or blocks busy times without exposing event details
- Gemini-powered confirmation copy with a safe template fallback

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS, PostgreSQL/Supabase, Prisma, Zod, date-fns, and Lucide.

## Local setup

1. Clone the repository and run `npm install`.
2. Copy `.env.example` to `.env` and populate `DATABASE_URL`. `DIRECT_URL` is optional and only useful if your tooling needs a direct Supabase connection.
3. Run `npm run db:generate`.
4. Apply the schema with `npm run db:migrate -- --name init` (or `npx prisma migrate deploy` for the checked-in migration).
5. Add sample future slots with `npm run db:seed`.
6. Start the app with `npm run dev` and open `http://localhost:3000`.

Required environment variables: `DATABASE_URL` and `NEXT_PUBLIC_APP_URL`. `GEMINI_API_KEY` and `GEMINI_MODEL` are optional; without the API key, confirmations use the built-in template. The default Gemini model is `gemini-3.8-flash`.

### Google Calendar conflict checking

MeetSlot can prevent Calendar conflicts without exposing event details. Create a Google Cloud OAuth web client, enable the Google Calendar API, authorize it with the read-only Calendar scope, and configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, and optionally `GOOGLE_CALENDAR_ID` (`primary` by default). When configured, slots overlapping a busy Calendar event are hidden from public availability; creating or booking a conflicting slot returns a conflict instead. Google Calendar is checked again immediately before booking.

The backend uses `events.list` with an explicit UTC time range and expands recurring events. A Calendar API failure returns a 503 rather than risking an unverified booking. [Google Calendar events API documentation](https://developers.google.com/calendar/api/v3/reference/events/list) and [OAuth web-server flow](https://developers.google.com/identity/protocols/oauth2/web-server).

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET / POST | `/api/slots` | Public availability / create host slot |
| DELETE | `/api/slots/:id` | Delete an available slot |
| POST | `/api/bookings` | Atomically book a slot |
| POST | `/api/bookings/:id/cancel` | Cancel and release a future slot |
| GET | `/api/dashboard/slots` | Slots plus guest details for the demo dashboard |
| POST | `/api/ai/confirmation` | Optional confirmation message |

Every endpoint returns `{ success, data }` or `{ success: false, error }`.

## Tests

Run `npm test` for validation checks. The PostgreSQL concurrency suite runs only when `DATABASE_URL` points to a dedicated migrated test database; it sends two simultaneous service booking requests and verifies exactly one succeeds. Never point it at production: it clears test rows. Run `npm run typecheck` and `npm run build` before deployment.

## Deploying

Create a Supabase PostgreSQL project, set the environment variables in Vercel, run `npx prisma migrate deploy` against the production database, and deploy the Next.js project. Do not seed automatically during deployment.

## Limitations and next steps

`/dashboard` and management APIs deliberately have no authentication for this demo; the dashboard exposes guest information and must be protected before any real deployment. Production should add host authentication/authorization, rate limiting and spam prevention, email verification and confirmations, multiple hosts, recurring availability, and broader test coverage.

## AI-assisted development

Codex was used to accelerate project scaffolding, UI development, and the initial API implementation. The database constraints and booking logic are implemented in the source; commands should be run with a configured PostgreSQL database to complete integration verification.
