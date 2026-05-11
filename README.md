# AI UI Builder SaaS

An AI-powered platform that enables students, freshers, and beginner frontend developers to create production-ready user interfaces through natural language descriptions, visual customization, and AI-assisted design.

## 🎯 Project Status

**Current Phase:** Authentication System Complete ✅  
**Progress:** 5/106 tasks completed (4.7%)  
**Next Phase:** Core Type Definitions & State Management

### ✅ Completed Features

- ✅ Next.js 14 project setup with TypeScript and App Router
- ✅ PostgreSQL database with Prisma ORM
- ✅ Complete authentication system (Email, Google, GitHub)
- ✅ Authentication UI pages (sign-in, sign-up, error handling)
- ✅ Database migrations and schema
- ✅ Comprehensive documentation

### 🚧 In Development

- Core type definitions (UI Schema, API types)
- State management with Zustand
- AI Prompt Engine
- Canvas workspace
- Component library

## 🚀 Features (Planned)

- 🤖 **AI Prompt-to-UI Generation** - Describe UIs in natural language
- ✏️ **Editable Prompt Layer** - Iteratively refine generated UIs
- 🎨 **Drag-and-Drop Canvas** - Visual component manipulation
- 📱 **Responsive Preview** - Multi-device preview system
- 🎯 **Grid & Spacing Controls** - Visual layout alignment
- 📦 **Component Library** - ~20 pre-built components
- 💾 **Code Export** - HTML, React, and Tailwind CSS export
- 💡 **AI Suggestions** - Design improvement recommendations
- 🎨 **Design Tokens** - Consistent styling system
- 👤 **Authentication** - Email, Google, and GitHub login ✅

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18+, Tailwind CSS 3.4+
- **State Management**: Zustand 4.x
- **Drag & Drop**: @dnd-kit/core
- **Animation**: Framer Motion 11.x
- **Code Editor**: Monaco Editor
- **Database**: PostgreSQL 15+ with Prisma 5.x ORM
- **Authentication**: NextAuth.js 4.x ✅
- **Caching**: Redis (Upstash)
- **AI Services**: OpenAI GPT-4 OR Anthropic Claude 3 Sonnet
- **Deployment**: Vercel

## 📚 Documentation

### Setup Guides
- **[QUICK_START.md](QUICK_START.md)** - Get started in 15 minutes
- **[ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md)** - Complete environment setup
- **[DATABASE_SETUP_COMPLETE.md](DATABASE_SETUP_COMPLETE.md)** - Database configuration

### Deployment
- **[VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)** - Full deployment guide
- **[VERCEL_QUICK_DEPLOY.md](VERCEL_QUICK_DEPLOY.md)** - Quick deployment (15 min)
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Verification checklist

### OAuth Setup
- **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)** - Google OAuth configuration
- **[GOOGLE_OAUTH_QUICK_GUIDE.md](GOOGLE_OAUTH_QUICK_GUIDE.md)** - Quick reference

### Project Status
- **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Detailed progress report
- **[.kiro/specs/ai-ui-builder-saas/](/.kiro/specs/ai-ui-builder-saas/)** - Complete specifications

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+ (local or Supabase)
- Redis (Upstash for caching)
- Google OAuth credentials
- GitHub OAuth credentials
- OpenAI or Anthropic API key

### Quick Setup (15 minutes)

1. **Clone the repository:**
```bash
git clone https://github.com/mihir2452005/AI-UI-Builder.git
cd AI-UI-Builder
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Follow **[QUICK_START.md](QUICK_START.md)** for detailed setup instructions.

4. **Set up the database:**

**Local PostgreSQL:**
```bash
# Run the setup script
.\setup-db.ps1

# Or manually:
psql -U postgres
CREATE DATABASE ai_ui_builder;
\q
```

**Or use Supabase** (recommended for production) - see [ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md)

5. **Run migrations:**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

6. **Start development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Testing Authentication

1. Visit http://localhost:3000/auth/signin
2. Try signing in with:
   - Google OAuth
   - GitHub OAuth
   - Email/password (create account first)

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── auth/         # Authentication endpoints ✅
│   ├── auth/             # Auth pages (signin, signup) ✅
│   ├── layout.tsx        # Root layout ✅
│   └── page.tsx          # Home page ✅
├── components/            # React components
│   ├── canvas/           # Canvas workspace (planned)
│   ├── editor/           # Editor layout (planned)
│   ├── properties/       # Properties panel (planned)
│   ├── library/          # Component library (planned)
│   └── ui/               # Shared UI components (planned)
├── lib/                  # Utilities and services
│   ├── auth/            # Authentication logic ✅
│   ├── db/              # Database utilities ✅
│   ├── ai/              # AI prompt engine (planned)
│   └── export/          # Code export engine (planned)
├── stores/              # Zustand state management (planned)
├── types/               # TypeScript definitions ✅
├── prisma/              # Database schema ✅
│   ├── schema.prisma   # Prisma schema ✅
│   └── migrations/     # Database migrations ✅
└── .kiro/              # Spec files
    └── specs/          # Feature specifications
```

## 🔧 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Database
- `npx prisma generate` - Generate Prisma Client
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate reset` - Reset database (⚠️ deletes all data)

## 🔐 Environment Variables

Required environment variables (see [ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md)):

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# AI Provider (choose one)
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
# OR
# AI_PROVIDER="anthropic"
# ANTHROPIC_API_KEY="sk-ant-..."

# Redis Cache
REDIS_URL="https://...upstash.io"
REDIS_TOKEN="..."

# Vercel Blob Storage (optional)
BLOB_READ_WRITE_TOKEN="..."
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Set up production database (Supabase recommended)
4. Configure environment variables
5. Deploy!

See **[VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)** for detailed instructions.

### Quick Deploy (15 minutes)

Follow **[VERCEL_QUICK_DEPLOY.md](VERCEL_QUICK_DEPLOY.md)** for a fast deployment path.

## 📊 Development Roadmap

### Phase 1: Foundation ✅ (Complete)
- [x] Project setup
- [x] Database schema
- [x] Authentication system
- [x] Authentication UI
- [x] Documentation

### Phase 2: Core Types (In Progress)
- [ ] UI Schema TypeScript types
- [ ] API response types
- [ ] Validation schemas (Zod)

### Phase 3: State Management
- [ ] Canvas store (Zustand)
- [ ] Project store
- [ ] UI store

### Phase 4: AI Engine
- [ ] AI model integration
- [ ] Prompt engine
- [ ] Context-aware generation

### Phase 5: Canvas & Editor
- [ ] Component renderer
- [ ] Drag-and-drop system
- [ ] Properties panel
- [ ] Component library

### Phase 6: Code Export
- [ ] HTML export
- [ ] React export
- [ ] Tailwind export

### Phase 7: Advanced Features
- [ ] AI suggestions
- [ ] Design tokens
- [ ] Responsive preview

### Phase 8: Polish & Deploy
- [ ] Testing
- [ ] Performance optimization
- [ ] Production deployment

## 🤝 Contributing

This is currently a solo project in active development. Contributions will be welcome once the MVP is complete.

## 📝 License

MIT License - see LICENSE file for details

## 👤 Author

**Mihir Patel**
- GitHub: [@mihir2452005](https://github.com/mihir2452005)
- Email: mihir2452005@gmail.com

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Prisma for the excellent ORM
- NextAuth.js for authentication
- OpenAI/Anthropic for AI capabilities

---

**Status:** 🚧 In Active Development  
**Version:** 0.1.0 (MVP Phase 1 Complete)  
**Last Updated:** 2024

For detailed setup instructions, see [QUICK_START.md](QUICK_START.md) or [ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md).
