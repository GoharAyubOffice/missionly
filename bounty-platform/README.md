# Bounty Platform

A performance-based marketing bounty platform where businesses post measurable goals (app installs, website conversions, product sales, lead generation) with guaranteed payments, and marketers compete to deliver real business results.

## 🚀 Tech Stack Overview

### **Frontend Framework**
- **Next.js 15.3.4** - App Router with React 19
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion 12.19.1** - Advanced animations and interactions

### **Database & Data Layer**
- **PostgreSQL** - Primary database (via Supabase or local)
- **Prisma 6.10.1** - Type-safe ORM with code generation
- **Upstash Redis** - Caching and session management
- **Supabase** - Database hosting, real-time subscriptions, and storage

### **Authentication & Authorization**
- **Supabase Auth** - User authentication with SSR support
- **Multi-role system** - Admin, Moderator, Client, Freelancer roles
- **Row Level Security (RLS)** - Database-level security policies

### **Payment Processing**
- **Stripe Connect** - Marketplace payments and multi-party transactions
- **Escrow System** - Automated milestone-based payment releases
- **Multi-currency Support** - Global payment processing

### **Real-time Communication**
- **Supabase Realtime** - Live updates and subscriptions
- **Web Push API** - Browser notifications
- **Message Threading** - Project-based communication system

### **State Management & Forms**
- **Zustand** - Lightweight state management
- **React Hook Form 7.58.1** - Performant form handling
- **TanStack Query 5.81.2** - Server state management and caching
- **Zod 3.25.67** - Schema validation

### **Email & Notifications**
- **Resend** - Transactional email service
- **Web Push** - Browser push notifications
- **Real-time messaging** - In-app notification system

### **Monitoring & Analytics**
- **Sentry** - Error tracking and performance monitoring
- **Vercel Analytics** - Web analytics and insights
- **Vercel Speed Insights** - Core Web Vitals monitoring

### **Development & Testing**
- **Jest** - Unit testing framework
- **Testing Library** - Component testing utilities
- **ESLint** - Code linting and quality
- **TypeScript** - Static type checking
- **Cross-env** - Environment variable management

### **Deployment & Infrastructure**
- **Vercel** - Hosting platform with edge functions
- **Prisma Migrations** - Database schema management
- **Next.js Build Optimization** - Bundle analysis and optimization
- **Next Sitemap** - SEO sitemap generation

## 📊 Core Features

### **User Management**
- Dual registration flows (Businesses vs Marketers)
- Profile completion tracking
- Reputation and rating systems
- Stripe Connect account integration

### **Bounty System**
- Complex bounty creation with requirements
- Skill-based matching
- Priority levels and featured listings
- Application and submission workflows

### **Payment & Escrow**
- Secure escrow with milestone releases
- Multi-currency support
- Processing fee management
- Automatic payment routing

### **Communication**
- Project-specific message threads
- File attachment support
- Real-time messaging
- Push notification preferences

### **Quality Assurance**
- Review and rating system
- Application status tracking
- Submission approval workflows
- Dispute resolution system

## 🏗️ Database Schema

The platform uses a comprehensive PostgreSQL schema with the following core entities:

- **Users** - Multi-role user system with Supabase integration
- **Bounties** - Project listings with status tracking
- **Applications** - Freelancer proposals and bids
- **Submissions** - Work deliverables and revisions
- **Payments** - Escrow and payment processing
- **Reviews** - Bidirectional rating system
- **Messages** - Real-time communication
- **Push Subscriptions** - Browser notification management

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Supabase account
- Stripe account
- Redis instance (Upstash)

### Environment Variables Required
```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Email
RESEND_API_KEY=

# Monitoring
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
```

### Available Scripts
```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build           # Production build
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Run database migrations
npm run db:studio      # Open Prisma Studio

# Quality Assurance
npm run lint           # Run ESLint
npm run lint:fix       # Fix linting issues
npm run type-check     # TypeScript type checking
npm run test           # Run tests
npm run test:coverage  # Run tests with coverage

# Analysis
npm run analyze        # Bundle analyzer
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bounty-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🏛️ Architecture Highlights

- **App Router** - Next.js 14+ app directory structure
- **Server Components** - React Server Components for optimal performance
- **Edge Runtime** - Optimized for Vercel edge deployment
- **Type Safety** - End-to-end TypeScript with Prisma
- **Security** - Row Level Security, input validation, and secure headers
- **Performance** - Image optimization, bundle splitting, and caching
- **Scalability** - Horizontal scaling with Redis and edge distribution

## 📈 Performance Optimizations

- **Bundle Analysis** - Automated bundle size monitoring
- **Image Optimization** - Next.js Image component with WebP/AVIF
- **Code Splitting** - Dynamic imports and route-based splitting
- **Caching Strategy** - Redis caching with TTL management
- **CDN Integration** - Static asset delivery optimization
- **Database Optimization** - Prisma query optimization and connection pooling

This platform is built for scale, security, and performance, leveraging modern web technologies to deliver a robust bounty marketplace experience.