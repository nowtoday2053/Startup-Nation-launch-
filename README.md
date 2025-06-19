# 🚀 Startup Nation

> **The knowledge market for startup founders** — A premium community platform combining Product Hunt, Twitter, and Reddit with an ultra-luxe Apple/Framer aesthetic.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/startup-nation)

## ✨ Features

### Core Platform
- **📱 Modern Feed** - Infinite scroll timeline with resources, strategies, and founder stories
- **🎯 Smart Filtering** - Filter by content type (Resources/Strategies/Stories) and tags
- **🗳️ Voting System** - Community-driven content curation with upvoting
- **💬 Rich Discussions** - Threaded comments with nested replies
- **🔍 Advanced Search** - Semantic search across all content

### Social Features
- **👥 User Profiles** - Customizable profiles with posts, upvotes, and activity
- **🤝 Following System** - Follow interesting builders and get personalized feeds
- **💬 Real-time Chat** - DMs and group channels with typing indicators
- **🔔 Smart Notifications** - Real-time updates on votes, comments, and follows

### Content Management
- **📝 Rich Submission Flow** - Wizard for adding resources, strategies, or stories
- **🏷️ Tag System** - Organize content with searchable tags
- **🎖️ Moderation Tools** - Admin panel for content and user management
- **📊 Analytics Dashboard** - Track engagement and community growth

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom luxe palette
- **UI Components**: shadcn/ui + Radix UI primitives
- **Icons**: Lucide React
- **Authentication**: NextAuth.js (GitHub + Email providers)
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Upstash Redis for chat and notifications
- **Animations**: Framer Motion
- **Deployment**: Vercel with automatic CI/CD

## 🎨 Design System

### Color Palette
- **Jet Black**: `#050505` - Deep backgrounds
- **Onyx**: `#0d0d0d` - Card backgrounds  
- **Deep Charcoal**: `#1a1a1a` - Secondary backgrounds
- **Silver Grey**: `#c8c8c8` - Text and borders
- **Diamond White**: `#fdfdfd` - Primary text
- **Royal Blue**: `#1968ff` - Accent and CTAs

### Typography
- **UI Font**: Inter (system fallback)
- **Display Font**: SF Pro Display / Poppins
- **Weights**: 300, 400, 500, 600, 700

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Upstash Redis instance (optional for chat)
- GitHub OAuth app

### 1. Clone & Install
```bash
git clone https://github.com/your-username/startup-nation
cd startup-nation
pnpm install
```

### 2. Environment Setup
Copy `env.example` to `.env.local` and configure:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/saas_exchange"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"  
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Upstash Redis (optional)
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

### 3. Database Setup
```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Optional: Open Prisma Studio
pnpm db:studio
```

### 4. Development
```bash
pnpm dev
```

Visit `http://localhost:3000` to see your app! 🎉

## 🗄️ Database Schema

```mermaid
erDiagram
    User ||--o{ Post : creates
    User ||--o{ Comment : writes
    User ||--o{ Vote : casts
    User ||--o{ Follow : follows
    Post ||--o{ Comment : has
    Post ||--o{ Vote : receives
    Comment ||--o{ Vote : receives
    
    User {
        string id PK
        string email UK
        string username UK
        string name
        string image
        string bio
        enum role
        datetime createdAt
    }
    
    Post {
        string id PK
        string title
        string content
        string url
        enum type
        string[] tags
        string slug UK
        int voteCount
        int commentCount
        string authorId FK
        datetime createdAt
    }
    
    Comment {
        string id PK
        string content
        string postId FK
        string authorId FK
        string parentId FK
        int voteCount
        datetime createdAt
    }
```

## 📁 Project Structure

```
startup-nation/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth pages group
│   ├── api/               # API routes
│   ├── feed/              # Main feed page
│   ├── submit/            # Content submission
│   ├── chat/              # Real-time messaging
│   ├── p/[slug]/          # Post detail pages
│   └── u/[username]/      # User profiles
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   └── ...                # Custom components
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client
│   ├── redis.ts           # Upstash Redis
│   └── utils.ts           # Helper functions
├── prisma/                # Database schema
└── types/                 # TypeScript definitions
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically ✨

### Environment Variables for Production
```env
DATABASE_URL="your-production-db-url"
NEXTAUTH_URL="https://yoursite.com"
NEXTAUTH_SECRET="production-secret"
GITHUB_CLIENT_ID="production-github-id"
GITHUB_CLIENT_SECRET="production-github-secret"
UPSTASH_REDIS_REST_URL="production-redis-url"
UPSTASH_REDIS_REST_TOKEN="production-redis-token"
```

### Database Migration
```bash
# For production deployment
pnpm db:migrate
```

## 🔧 Development

### Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm format       # Format with Prettier
pnpm type-check   # TypeScript type checking
pnpm db:studio    # Open Prisma Studio
pnpm db:reset     # Reset database
```

### Git Hooks
Pre-commit hooks automatically:
- Run ESLint and fix issues
- Format code with Prettier
- Type check TypeScript

## 🎯 Roadmap

### Phase 1: Core Platform ✅
- [x] User authentication
- [x] Post creation and voting
- [x] Comment system
- [x] User profiles

### Phase 2: Enhanced Features 🚧
- [ ] Real-time chat system
- [ ] Advanced search with filters
- [ ] Email notifications
- [ ] Mobile app (React Native)

### Phase 3: Community Growth 📋
- [ ] Gamification system
- [ ] Expert badges and verification
- [ ] Content recommendation engine
- [ ] Analytics dashboard

### Phase 4: Business Features 📋
- [ ] Premium subscriptions
- [ ] Sponsored content
- [ ] Job board integration
- [ ] Event hosting

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Vercel** for seamless deployment
- **Prisma** for the excellent database toolkit
- **NextAuth.js** for authentication
- **Tailwind CSS** for the utility-first styling

---

<div align="center">
  <p>Built with ❤️ by the Startup Nation team</p>
  <p>
    <a href="https://twitter.com/startupnation">Twitter</a> •
    <a href="https://github.com/your-username/startup-nation">GitHub</a> •
    <a href="https://startupnation.com">Website</a>
  </p>
</div> 