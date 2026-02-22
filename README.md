# 💅 Nail Studio Booking App

A simple appointment booking website for a nail technician, with an admin panel for managing bookings and blocking unavailable time.

---

## Features

- **Public booking page** (`/book`) — clients select a service, date, and available 30-min time slot, then enter their details
- **Email notification** — admin receives an email on every new booking (via Nodemailer / SMTP)
- **Admin dashboard** (`/admin`) — view upcoming bookings, filter by date, cancel bookings, block entire days or custom time ranges
- **Double-booking prevention** — handled inside a Prisma transaction

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | SQLite via Prisma |
| Styling | Tailwind CSS |
| Email | Nodemailer (SMTP) |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite file path, e.g. `file:./dev.db` |
| `ADMIN_PASSWORD` | Password to log into `/admin` |
| `TIMEZONE` | IANA timezone for slot generation & emails (e.g. `America/New_York`) |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (587 for STARTTLS, 465 for SSL) |
| `SMTP_USER` | SMTP username / email |
| `SMTP_PASS` | SMTP password or app password |
| `FROM_EMAIL` | "From" address in notification emails |
| `ADMIN_EMAIL` | Where booking notification emails are sent |

> **Gmail tip:** Use an [App Password](https://support.google.com/accounts/answer/185833) with `smtp.gmail.com:587`.

### 3. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 4. Seed sample services

```bash
npx prisma db seed
```

This creates three services: Classic Manicure (45 min, $30), Gel Manicure (60 min, $45), Acrylic Full Set (90 min, $65).

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Pages

| URL | Description |
|---|---|
| `/book` | Public booking page (redirected from `/`) |
| `/admin/login` | Admin login (password from `ADMIN_PASSWORD` env var) |
| `/admin` | Admin dashboard — bookings & blocked slots |

---

## Working hours & slots

- **Hours:** 9:00 AM – 5:00 PM in the configured `TIMEZONE`
- **Granularity:** 30-minute slots
- **Last slot:** depends on service duration (e.g. a 90-min service can start no later than 3:30 PM)

---

## Project Structure

```
src/
  app/
    book/
      page.tsx          # Server component — loads services
      BookingForm.tsx    # Client component — interactive booking flow
    api/slots/
      route.ts          # GET /api/slots?serviceId=&date= — returns available slots
    admin/
      page.tsx          # Admin dashboard (server component)
      login/page.tsx    # Login form
      BlockSlotForm.tsx # Client component — add blocked slot
  actions/
    booking.ts          # createBooking server action
    admin.ts            # login/logout/cancelBooking/addBlock/deleteBlock
  lib/
    prisma.ts           # Prisma client singleton
    email.ts            # Nodemailer send helper
    slots.ts            # Slot generation + availability filtering
  middleware.ts         # Edge middleware — protects /admin/*
prisma/
  schema.prisma         # DB schema (Service, Booking, BlockedSlot)
  seed.ts               # Seeds 3 sample services
```
