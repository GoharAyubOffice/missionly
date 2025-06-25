-- Create indexes for performance optimization

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_supabase_id ON users(supabase_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_stripe_account ON users(stripe_account_id);

-- Bounties table indexes
CREATE INDEX idx_bounties_status ON bounties(status);
CREATE INDEX idx_bounties_client_id ON bounties(client_id);
CREATE INDEX idx_bounties_assignee_id ON bounties(assignee_id);
CREATE INDEX idx_bounties_created_at ON bounties(created_at DESC);
CREATE INDEX idx_bounties_featured ON bounties(featured, created_at DESC);
CREATE INDEX idx_bounties_status_created ON bounties(status, created_at DESC);
CREATE INDEX idx_bounties_budget ON bounties(budget);
CREATE INDEX idx_bounties_deadline ON bounties(deadline);
CREATE INDEX idx_bounties_priority ON bounties(priority);

-- Applications table indexes
CREATE INDEX idx_applications_bounty_id ON applications(bounty_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

-- Submissions table indexes
CREATE INDEX idx_submissions_bounty_id ON submissions(bounty_id);
CREATE INDEX idx_submissions_submitter_id ON submissions(submitter_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

-- Payments table indexes
CREATE INDEX idx_payments_bounty_id ON payments(bounty_id);
CREATE INDEX idx_payments_sender_id ON payments(sender_id);
CREATE INDEX idx_payments_receiver_id ON payments(receiver_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_id ON payments(stripe_payment_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Reviews table indexes
CREATE INDEX idx_reviews_bounty_id ON reviews(bounty_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Message threads table indexes
CREATE INDEX idx_message_threads_bounty_id ON message_threads(bounty_id);
CREATE INDEX idx_message_threads_client_id ON message_threads(client_id);
CREATE INDEX idx_message_threads_freelancer_id ON message_threads(freelancer_id);
CREATE INDEX idx_message_threads_last_message_at ON message_threads(last_message_at DESC);

-- Messages table indexes
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_read_at ON messages(read_at);

-- Push subscriptions table indexes
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Full-text search indexes
CREATE INDEX idx_bounties_search ON bounties USING GIN(
  to_tsvector('english', title || ' ' || description)
);

-- Composite indexes for common queries
CREATE INDEX idx_bounties_status_featured ON bounties(status, featured, created_at DESC);
CREATE INDEX idx_bounties_client_status ON bounties(client_id, status);
CREATE INDEX idx_applications_bounty_status ON applications(bounty_id, status);
CREATE INDEX idx_payments_bounty_status ON payments(bounty_id, status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables with updated_at column
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bounties_updated_at 
  BEFORE UPDATE ON bounties 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
  BEFORE UPDATE ON applications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at 
  BEFORE UPDATE ON submissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_threads_updated_at 
  BEFORE UPDATE ON message_threads 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at 
  BEFORE UPDATE ON push_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update message thread timestamp
CREATE OR REPLACE FUNCTION update_message_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE message_threads 
    SET last_message_at = NOW()
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update thread timestamp when new message is added
CREATE TRIGGER update_thread_on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_message_thread_timestamp();

-- Create function to update user reputation based on reviews
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
    -- Update reputation for the reviewee
    UPDATE users 
    SET reputation = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews 
        WHERE reviewee_id = NEW.reviewee_id
    )
    WHERE id = NEW.reviewee_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update reputation when new review is added
CREATE TRIGGER update_reputation_on_review
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_user_reputation();