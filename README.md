# MeetSlot

MeetSlot is a lightweight appointment-booking app for a single host. Visitors can browse availability, book a slot, and receive a friendly confirmation. The host can publish and manage slots from `/dashboard`.

## Run locally

You need Node.js and a PostgreSQL database.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and `NEXT_PUBLIC_APP_URL` (`http://localhost:3000` for local development).
3. Generate Prisma Client: `npm run db:generate`
4. Apply database migrations: `npx prisma migrate deploy`
5. Optionally add sample slots: `npm run db:seed`
6. Start the app: `npm run dev`, then open `http://localhost:3000`.

Google Calendar conflict checks and Gemini-generated confirmation messages are optional. Configure the corresponding `GOOGLE_*` variables or `GEMINI_API_KEY` in `.env`; without a Gemini key, the app uses a built-in confirmation message.

## What I built

A responsive React/Next.js and TypeScript booking interface, a host dashboard, API routes, and PostgreSQL persistence with Prisma. A guest chooses a date and time, enters their details, books it, sees a confirmation, and can download a calendar invite. The host can publish and manage times from the dashboard. API handlers, service logic, shared validation, and database access are kept in separate modules.

## Design choices and extra ideas

- The challenge assumes one host and no accounts, so the booking flow has no sign-in. The host dashboard is kept separate at `/dashboard`.
- Times are stored as UTC instants and displayed in `Europe/Skopje`, including daylight-saving changes.
- Double bookings are prevented with a conditional database update. Google Calendar checks use busy intervals only, so event names and descriptions are not exposed; if Calendar cannot be checked, the app does not offer unverified availability.
- Extra touches include a host summary dashboard, booking cancellation, downloadable `.ics` invites, and a friendly template fallback if Gemini is unavailable.

## AI tools used

OpenAI Codex was used to iterate on the interface and help implement and refine the React components, API routes, and documentation. Google Gemini is a separate, optional runtime feature: after a successful booking it can write a short confirmation message. If no Gemini key is configured or the request fails, a built-in message keeps the booking flow working.

## What I would improve with more time

The main trade-off is that the demo dashboard and management endpoints are unprotected; add host authentication and authorization before real use. With more time, I would also add email confirmations, rate limiting and spam prevention, and broader automated tests against a dedicated PostgreSQL test database.
