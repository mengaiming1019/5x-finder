# 5X Finder — AI-Powered Fintech Stock Picking Model

A 10-factor stock picking model that identifies the most promising Fintech stocks with 5x growth potential, powered by AI analysis.

## Features

- 📊 **10-Factor Scoring** — 5 quantitative + 5 qualitative factors
- 🤖 **AI Analysis** — GPT-powered investment thesis generation
- 📰 **Live News** — Real-time stock news feed
- 🎯 **Customizable Weights** — Adjust factor importance with sliders
- 📈 **Interactive Charts** — Radar charts, bar charts, pie charts
- 📱 **Responsive Design** — Works on mobile and desktop

## Tech Stack

- Next.js 16 + TypeScript
- Prisma ORM + PostgreSQL (Vercel Postgres/Neon)
- Tailwind CSS + shadcn/ui
- Recharts for data visualization
- OpenAI API for AI analysis

## Deploy to Vercel

1. Push this repo to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Create a **Postgres** database in Vercel Storage
4. Add environment variable: `OPENAI_API_KEY`
5. Deploy!
6. Run `npx prisma db seed` to populate stock data

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Auto-set by Vercel Postgres |
| `OPENAI_API_KEY` | Your OpenAI API key for AI analysis |

## License

MIT
