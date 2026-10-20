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

A responsive React/Next.js and TypeScript booking interface, a host dashboard, API routes, and PostgreSQL persistence with Prisma. Booking is protected against double-booking, availability checks Google Calendar busy times when configured, and Gemini can generate a short confirmation. Times are displayed in Skopje local time.

## AI tools used

OpenAI Codex assisted with application design and implementation. The app also integrates the Google Gemini API to generate booking confirmations at runtime when configured.

## What I would improve with more time

Add host authentication and authorization (the demo dashboard and management endpoints are currently unprotected), email confirmations, rate limiting and spam prevention, and broader automated tests against a dedicated PostgreSQL test database.
