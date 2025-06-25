# Supabase Cloud Setup Guide

This guide will help you set up Supabase cloud infrastructure for your bounty platform according to your project's implementation.

## 📋 Prerequisites

- A Supabase account (https://supabase.com)
- Access to your project's environment variables
- Basic knowledge of SQL and Supabase dashboard

## 🚀 Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Project name: `bounty-platform` (or your preferred name)
   - Database password: Generate a strong password (save it securely)
   - Region: Choose closest to your users
   - Pricing plan: Start with Free tier, upgrade as needed

3. **Wait for Project Setup**
   - This usually takes 2-3 minutes
   - You'll get a project dashboard with your unique project URL

## 🔧 Step 2: Configure Project Settings

### Database Configuration

1. **Go to Settings → Database**
   - Note your connection string
   - Enable connection pooling if you expect high traffic

2. **Go to Settings → API**
   - Copy your Project URL
   - Copy your Project API keys:
     - `anon` key (public)
     - `service_role` key (private - keep secure)

## 📊 Step 3: Set Up Database Schema

### Method 1: Using Supabase SQL Editor (Recommended)

1. **Go to SQL Editor in your Supabase dashboard**

2. **Run the following SQL migration script** (copy and paste):

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('ADMIN', 'MODERATOR', 'CLIENT', 'FREELANCER');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');
CREATE TYPE bounty_status AS ENUM ('DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE bounty_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE application_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE submission_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE payment_type AS ENUM ('BOUNTY_PAYMENT', 'ESCROW_RELEASE', 'REFUND');
CREATE TYPE message_type AS ENUM ('TEXT', 'FILE', 'IMAGE', 'SYSTEM');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar VARCHAR(255),
  bio TEXT,
  website VARCHAR(255),
  location VARCHAR(255),
  skills TEXT[] DEFAULT '{}',
  role user_role DEFAULT 'CLIENT',
  status user_status DEFAULT 'PENDING_VERIFICATION',
  reputation DECIMAL(3,2) DEFAULT 0.00,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Auth fields
  supabase_id UUID UNIQUE,
  
  -- Stripe fields
  stripe_account_id VARCHAR(255) UNIQUE
);

-- Create bounties table
CREATE TABLE bounties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  budget DECIMAL(10,2) NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  status bounty_status DEFAULT 'DRAFT',
  priority bounty_priority DEFAULT 'MEDIUM',
  featured BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Relations
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id)
);

-- Create applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cover_letter TEXT,
  proposed_budget DECIMAL(10,2),
  estimated_days INTEGER,
  attachments TEXT[] DEFAULT '{}',
  status application_status DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Relations
  bounty_id UUID NOT NULL REFERENCES bounties(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Constraints
  UNIQUE(bounty_id, applicant_id)
);

-- Create submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  notes TEXT,
  status submission_status DEFAULT 'DRAFT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Relations
  bounty_id UUID NOT NULL REFERENCES bounties(id) ON DELETE CASCADE,
  submitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  type payment_type NOT NULL,
  status payment_status DEFAULT 'PENDING',
  stripe_payment_id VARCHAR(255) UNIQUE,
  escrow_released BOOLEAN DEFAULT FALSE,
  processing_fee DECIMAL(10,2),
  net_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Relations
  bounty_id UUID NOT NULL REFERENCES bounties(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id)
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Relations
  bounty_id UUID NOT NULL REFERENCES bounties(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),
  
  -- Constraints
  UNIQUE(bounty_id, reviewer_id, reviewee_id)
);

-- Create message_threads table
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bounty_id UUID NOT NULL REFERENCES bounties(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(bounty_id, client_id, freelancer_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type message_type DEFAULT 'TEXT',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create push_subscriptions table
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_supabase_id ON users(supabase_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_bounties_status ON bounties(status);
CREATE INDEX idx_bounties_client_id ON bounties(client_id);
CREATE INDEX idx_bounties_assignee_id ON bounties(assignee_id);
CREATE INDEX idx_bounties_created_at ON bounties(created_at DESC);
CREATE INDEX idx_bounties_featured ON bounties(featured, created_at DESC);
CREATE INDEX idx_bounties_status_created ON bounties(status, created_at DESC);

CREATE INDEX idx_applications_bounty_id ON applications(bounty_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);

CREATE INDEX idx_submissions_bounty_id ON submissions(bounty_id);
CREATE INDEX idx_submissions_submitter_id ON submissions(submitter_id);
CREATE INDEX idx_submissions_status ON submissions(status);

CREATE INDEX idx_payments_bounty_id ON payments(bounty_id);
CREATE INDEX idx_payments_sender_id ON payments(sender_id);
CREATE INDEX idx_payments_receiver_id ON payments(receiver_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_reviews_bounty_id ON reviews(bounty_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);

CREATE INDEX idx_message_threads_bounty_id ON message_threads(bounty_id);
CREATE INDEX idx_message_threads_client_id ON message_threads(client_id);
CREATE INDEX idx_message_threads_freelancer_id ON message_threads(freelancer_id);

CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bounties_updated_at BEFORE UPDATE ON bounties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_threads_updated_at BEFORE UPDATE ON message_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

3. **Click "Run" to execute the migration**

### Method 2: Using Prisma Migration (Alternative)

If you prefer to use Prisma migrations:

1. **Update your DATABASE_URL** in `.env.local` to point to Supabase
2. **Run migration:**
   ```bash
   npm run db:push
   ```

## 🔐 Step 4: Configure Authentication

### Basic Auth Settings

1. **Go to Authentication → Settings**

2. **Configure Site URL:**
   ```
   http://localhost:3000  (for development)
   https://yourdomain.com (for production)
   ```

3. **Configure Redirect URLs:**
   - Add: `http://localhost:3000/auth/callback`
   - Add: `https://yourdomain.com/auth/callback`

4. **Enable Email Confirmations:**
   - Check "Enable email confirmations"
   - Set "Confirm email change" to ON

### Advanced Auth Settings

1. **Email Templates (Optional):**
   - Go to Authentication → Templates
   - Customize email templates to match your brand

2. **Auth Providers (Optional):**
   - Go to Authentication → Providers
   - Enable Google, GitHub, etc. if needed

## 🗄️ Step 5: Configure Row Level Security (RLS)

### Enable RLS on All Tables

In the SQL Editor, run:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
```

### Create RLS Policies

```sql
-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = supabase_id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = supabase_id::text);

CREATE POLICY "Public profiles viewable by all authenticated users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Bounties table policies
CREATE POLICY "Anyone can view published bounties" ON bounties
  FOR SELECT USING (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED'));

CREATE POLICY "Clients can manage their bounties" ON bounties
  FOR ALL USING (client_id IN (
    SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
  ));

CREATE POLICY "Assigned freelancers can view their bounties" ON bounties
  FOR SELECT USING (assignee_id IN (
    SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
  ));

-- Applications table policies
CREATE POLICY "Users can view applications on their bounties" ON applications
  FOR SELECT USING (
    bounty_id IN (
      SELECT id FROM bounties WHERE client_id IN (
        SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
      )
    )
    OR
    applicant_id IN (
      SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Freelancers can create applications" ON applications
  FOR INSERT WITH CHECK (
    applicant_id IN (
      SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
    )
  );

-- Messages table policies
CREATE POLICY "Users can view messages in their threads" ON messages
  FOR SELECT USING (
    thread_id IN (
      SELECT id FROM message_threads 
      WHERE client_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text)
         OR freelancer_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text)
    )
  );

CREATE POLICY "Users can send messages in their threads" ON messages
  FOR INSERT WITH CHECK (
    sender_id IN (
      SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
    )
    AND
    thread_id IN (
      SELECT id FROM message_threads 
      WHERE client_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text)
         OR freelancer_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text)
    )
  );

-- Add similar policies for other tables...
```

## 📁 Step 6: Set Up Storage

### Create Storage Buckets

1. **Go to Storage in Supabase dashboard**

2. **Create the following buckets:**

   **Avatars Bucket:**
   - Name: `avatars`
   - Public: Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg,image/png,image/gif,image/webp`

   **Uploads Bucket:**
   - Name: `uploads`
   - Public: Yes
   - File size limit: 10MB
   - Allowed MIME types: `image/*,application/pdf,text/plain`

### Configure Storage Policies

In SQL Editor, run:

```sql
-- Avatars bucket policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Uploads bucket policies
CREATE POLICY "Upload files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'uploads' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'uploads' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

## 🔧 Step 7: Configure Environment Variables

Create or update your `.env.local` file:

```bash
# Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Other existing environment variables...
```

Replace:
- `[YOUR-PASSWORD]`: Your database password
- `[YOUR-PROJECT-REF]`: Your project reference from Supabase URL
- `[YOUR-ANON-KEY]`: Your public anon key
- `[YOUR-SERVICE-ROLE-KEY]`: Your private service role key

## 🧪 Step 8: Test Your Setup

1. **Test Database Connection:**
   ```bash
   npm run db:generate
   ```

2. **Test Authentication:**
   - Start your development server: `npm run dev`
   - Try registering a new user
   - Check if user appears in Supabase Auth dashboard

3. **Test Storage:**
   - Try uploading a file through your app
   - Check if file appears in Supabase Storage

## 🚀 Step 9: Deploy to Production

### For Production Environment:

1. **Update Environment Variables:**
   - Use your production domain in `NEXT_PUBLIC_APP_URL`
   - Update redirect URLs in Supabase Auth settings

2. **Configure Domain (Optional):**
   - Go to Settings → API
   - Add your custom domain if needed

3. **Monitor Usage:**
   - Keep an eye on your database usage in the Supabase dashboard
   - Upgrade your plan if needed

## 🔍 Troubleshooting

### Common Issues:

1. **"relation does not exist" error:**
   - Make sure you ran all SQL migrations
   - Check if tables were created successfully

2. **Authentication not working:**
   - Verify your environment variables
   - Check Site URL and Redirect URLs in Auth settings

3. **File upload failing:**
   - Ensure storage buckets are created
   - Check storage policies are applied correctly

4. **RLS blocking queries:**
   - Verify RLS policies are correctly implemented
   - Check user authentication status

### Getting Help:

- Check Supabase documentation: https://supabase.com/docs
- Join Supabase Discord community
- Review your project's Supabase logs in the dashboard

## ✅ Final Checklist

- [ ] Supabase project created
- [ ] Database schema migrated
- [ ] Authentication configured
- [ ] RLS policies applied
- [ ] Storage buckets created
- [ ] Storage policies configured
- [ ] Environment variables updated
- [ ] Local testing completed
- [ ] Production deployment configured

Your Supabase setup is now complete! 🎉