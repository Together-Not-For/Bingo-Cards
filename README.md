# 2026 Bingo Card Generator

A beautiful Next.js web application for creating custom, printable bingo cards for 2026.

## Features

- ✨ **Custom Items**: Add and remove items from your bingo card list
- 🎲 **Randomize**: Shuffle items to create different card layouts
- 🖨️ **Print Ready**: Generate printable bingo cards optimized for printing
- 🎯 **2026 Theme**: Specially designed for 2026 with a modern, beautiful UI
- 📱 **Responsive**: Works great on desktop and mobile devices
- 👥 **Bingo Pool Signup**: Join the bingo pool to participate in prizes

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

To enable the bingo pool signup feature, create a `.env.local` file in the root directory with your Neon database connection string:

```env
DATABASE_URL=postgresql://username:password@ep-xxxx-xxxx.region.aws.neon.tech/dbname?sslmode=require
```

You can find your connection string in the Neon dashboard under "Connection Details".

**Note**: In development mode, if `DATABASE_URL` is not set, signups will be logged to the console instead of being saved to the database.

### Database Setup

1. Create a Neon account at [neon.tech](https://neon.tech) and create a new project
2. Run the following SQL in your Neon SQL Editor to create the required table:

```sql
CREATE TABLE public.bingo_pool_signups (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Prevent duplicate phone numbers
CREATE UNIQUE INDEX idx_phone_number ON public.bingo_pool_signups(phone_number);

-- Optional: Add index for faster queries
CREATE INDEX idx_created_at ON public.bingo_pool_signups(created_at);
```

### Building for Production

```bash
npm run build
npm start
```

## How to Use

1. **Add Items**: Enter at least 24 items in the input field and click the "+" button
2. **Manage Items**: Remove items by clicking the trash icon, or clear all items
3. **Generate Card**: Once you have 24+ items, click "Generate Bingo Card"
4. **Preview**: See your bingo card preview on the right side
5. **Randomize**: Click "Randomize" to shuffle the items into a new layout
6. **Print**: Click "Print Card" to open a print-friendly version

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Radix UI** - Accessible component primitives
- **Neon** - Serverless PostgreSQL database
- **@neondatabase/serverless** - Neon serverless driver

## License

See LICENSE file for details.
