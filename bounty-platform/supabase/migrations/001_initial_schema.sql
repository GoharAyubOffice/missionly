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