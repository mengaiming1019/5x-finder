#!/bin/bash
# Prepares the 5X Finder project for Vercel deployment
# Run this script, then upload the output folder to GitHub

set -e
echo "🚀 Preparing 5X Finder for Vercel deployment..."

DEPLOY_DIR="/home/z/my-project/deploy/5x-finder"
rm -rf /home/z/my-project/deploy
mkdir -p "$DEPLOY_DIR"

# Copy the entire project
rsync -a --exclude='node_modules' \
  --exclude='.next' \
  --exclude='db' \
  --exclude='deploy' \
  --exclude='dev.log' \
  --exclude='supervisor.py' \
  --exclude='supervisor.pid' \
  --exclude='supervisor.log' \
  --exclude='keep-alive.sh' \
  --exclude='prisma/schema.vercel.prisma' \
  --exclude='next.config.vercel.ts' \
  --exclude='test-screenshot.png' \
  --exclude='verified-screenshot.png' \
  --exclude='final-screenshot.png' \
  --exclude='weights-dialog.png' \
  --exclude='weights-dialog-fixed.png' \
  --exclude='privacy-fixed.png' \
  --exclude='fixed-page.png' \
  --exclude='final-working.png' \
  --exclude='VERCEL_DEPLOY.md' \
  /home/z/my-project/ "$DEPLOY_DIR/"

# Overwrite schema.prisma with the PostgreSQL version
cp /home/z/my-project/prisma/schema.vercel.prisma "$DEPLOY_DIR/prisma/schema.prisma"

# Overwrite next.config.ts with the Vercel version (no output: "standalone")
cp /home/z/my-project/next.config.vercel.ts "$DEPLOY_DIR/next.config.ts"

# Overwrite .env with Vercel example
cp /home/z/my-project/.env.vercel.example "$DEPLOY_DIR/.env.example"

# Remove the .env file (contains local SQLite path)
rm -f "$DEPLOY_DIR/.env"

# Create a proper .gitignore
cat > "$DEPLOY_DIR/.gitignore" << 'EOF'
node_modules/
.next/
.env
.env.local
*.db
*.log
skills/
EOF

# Create README.md
cat > "$DEPLOY_DIR/README.md" << 'EOF'
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
EOF

echo ""
echo "✅ Deployment package ready at: $DEPLOY_DIR"
echo ""
echo "Next steps:"
echo "  1. Download the 'deploy' folder from the sandbox"
echo "  2. Push it to a GitHub repository"
echo "  3. Import on vercel.com"
echo "  4. Add Vercel Postgres + OPENAI_API_KEY"
echo "  5. Deploy & seed!"
