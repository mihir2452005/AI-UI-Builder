# AI UI Builder SaaS

An AI-powered platform that enables students, freshers, and beginner frontend developers to create production-ready user interfaces through natural language descriptions, visual customization, and AI-assisted design.

## Features

- 🤖 **AI Prompt-to-UI Generation** - Describe UIs in natural language
- ✏️ **Editable Prompt Layer** - Iteratively refine generated UIs
- 🎨 **Drag-and-Drop Canvas** - Visual component manipulation
- 📱 **Responsive Preview** - Multi-device preview system
- 🎯 **Grid & Spacing Controls** - Visual layout alignment
- 📦 **Component Library** - Pre-built components
- 💾 **Code Export** - HTML, React, and Tailwind CSS export
- 💡 **AI Suggestions** - Design improvement recommendations
- 🎨 **Design Tokens** - Consistent styling system
- 👤 **Authentication** - Email, Google, and GitHub login

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18+, Tailwind CSS 3.4+
- **State Management**: Zustand 4.x
- **Drag & Drop**: @dnd-kit/core
- **Animation**: Framer Motion 11.x
- **Code Editor**: Monaco Editor
- **Database**: PostgreSQL 15+ with Prisma 5.x ORM
- **Authentication**: NextAuth.js 4.x
- **Caching**: Redis (Upstash)
- **AI Services**: Centralized AI provider (OpenAI OR Anthropic) configured by platform owner
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for local database)
- Redis (optional, for caching)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-ui-builder-saas
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration values.

4. Set up the database:

**Option A: Automated Setup (Recommended)**
```bash
npm run db:setup
```

This will:
- Start PostgreSQL in Docker
- Create the database schema
- Run initial migrations
- Generate Prisma Client

**Option B: Manual Setup**
```bash
# Start PostgreSQL container
docker-compose up -d

# Run migrations
npm run db:migrate

# Generate Prisma Client
npm run db:generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Database Management

- `npm run db:setup` - Automated database setup (Docker + migrations)
- `npm run db:migrate` - Create and apply new migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:generate` - Generate Prisma Client
- `npm run db:reset` - Reset database (WARNING: deletes all data)

For more details, see [prisma/MIGRATION_GUIDE.md](prisma/MIGRATION_GUIDE.md).

## Project Structure

```
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── canvas/         # Canvas workspace
│   ├── editor/         # Editor layout
│   ├── properties/     # Properties panel
│   ├── library/        # Component library
│   ├── prompt/         # Prompt editor
│   ├── preview/        # Responsive preview
│   ├── export/         # Code export
│   ├── suggestions/    # AI suggestions
│   ├── tokens/         # Design tokens
│   └── ui/             # Shared UI components
├── lib/                # Utilities and services
│   ├── ai/            # AI prompt engine
│   ├── services/      # External services
│   ├── utils/         # Utility functions
│   ├── db/            # Database utilities
│   ├── auth/          # Authentication
│   ├── export/        # Code export engine
│   └── validation/    # Zod schemas
├── stores/            # Zustand state management
├── types/             # TypeScript type definitions
└── prisma/            # Database schema
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Database Scripts

- `npm run db:setup` - Automated database setup (Docker + migrations)
- `npm run db:migrate` - Create and apply new migrations
- `npm run db:migrate:deploy` - Apply migrations in production
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:generate` - Generate Prisma Client
- `npm run db:reset` - Reset database (WARNING: deletes all data)

## License

MIT
