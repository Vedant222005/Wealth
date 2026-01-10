# Welth - Personal Finance Management App

A modern personal finance management application built with Next.js, featuring transaction tracking, budget management, and automated email alerts.

## Features

- **Transaction Management**: Add, edit, and categorize income and expenses
- **Receipt Scanning**: AI-powered receipt scanning using Google Gemini
   ### Receipt Scanner (Demo Mode)
   AI receipt scanning is mocked for demos and interviews to avoid API costs.
   The architecture supports real AI providers (Gemini/OpenAI) via API swap.

- **Budget Tracking**: Set monthly budgets and track spending
- **Automated Alerts**: Email notifications when budget usage exceeds 80%
- **Account Management**: Multiple account support with default account selection
- **Recurring Transactions**: Support for daily, weekly, monthly, and yearly recurring transactions
- **Dashboard Analytics**: Visual charts and spending insights
- **User Authentication**: Secure authentication with Clerk

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **UI Components**: Radix UI with Tailwind CSS
- **Email**: Resend for transactional emails
- **AI**: Google Gemini for receipt scanning
- **Background Jobs**: Inngest for scheduled tasks
- **Security**: Arcjet for rate limiting and protection

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (create `.env` file):
   ```
   DATABASE_URL="your_postgresql_connection_string"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   RESEND_API_KEY="your_resend_api_key"
   GEMINI_API_KEY="your_google_gemini_api_key"
   INNGEST_EVENT_KEY="your_inngest_event_key"
   INNGEST_SIGNING_KEY="your_inngest_signing_key"
   ARCJET_KEY="your_arcjet_key"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - Reusable UI components
- `/actions` - Server actions for data operations
- `/lib` - Utility functions and configurations
- `/prisma` - Database schema and migrations
- `/emails` - Email templates
- `/hooks` - Custom React hooks

## Deployment

The app is optimized for deployment on Vercel. Make sure to set up all environment variables in your deployment platform.
