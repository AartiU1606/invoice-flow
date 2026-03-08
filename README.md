# InvoiceFlow

A modern, dark-themed invoice generator built with **Vite**, **Supabase**, and **html2pdf.js**.

## Features

- Create professional PDF invoices with live preview
- Authentication via email/password and Google OAuth (Supabase Auth)
- Invoice history with Supabase database storage
- PDF upload to Supabase Storage
- Dark glassmorphism UI with smooth animations

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project

### Installation

```bash
npm install
```

### Environment Variables

Copy the example and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Deployment (Vercel)

1. Import this repo on [vercel.com/new](https://vercel.com/new)
2. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Deploy — Vercel auto-detects Vite and uses the `vercel.json` config

## Tech Stack

| Layer | Technology |
|-------|------------|
| Build | Vite |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| PDF | html2pdf.js |
| Icons | Lucide |
| Styling | Vanilla CSS (glassmorphism) |
