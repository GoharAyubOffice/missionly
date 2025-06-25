-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = supabase_id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = supabase_id::text);

CREATE POLICY "Public profiles viewable by all authenticated users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage all users" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Bounties table policies
CREATE POLICY "Anyone can view published bounties" ON bounties
  FOR SELECT USING (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED'));

CREATE POLICY "Clients can view their own bounties" ON bounties
  FOR SELECT USING (client_id IN (
    SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
  ));

CREATE POLICY "Clients can create bounties" ON bounties
  FOR INSERT WITH CHECK (client_id IN (
    SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
  ));

CREATE POLICY "Clients can update their bounties" ON bounties
  FOR UPDATE USING (client_id IN (
    SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
  ));

CREATE POLICY "Clients can delete their bounties" ON bounties
  FOR DELETE USING (client_id IN (
    SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
  ));

CREATE POLICY "Assigned freelancers can view their bounties" ON bounties
  FOR SELECT USING (assignee_id IN (
    SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
  ));

-- Applications table policies
CREATE POLICY "Bounty owners can view applications" ON applications
  FOR SELECT USING (
    bounty_id IN (
      SELECT id FROM bounties WHERE client_id IN (
        SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Applicants can view their own applications" ON applications
  FOR SELECT USING (
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

CREATE POLICY "Applicants can update their applications" ON applications
  FOR UPDATE USING (
    applicant_id IN (
      SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Bounty owners can update application status" ON applications
  FOR UPDATE USING (
    bounty_id IN (
      SELECT id FROM bounties WHERE client_id IN (
        SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
      )
    )
  );

-- Submissions table policies
CREATE POLICY "Bounty participants can view submissions" ON submissions
  FOR SELECT USING (
    bounty_id IN (
      SELECT id FROM bounties 
      WHERE client_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text)
         OR assignee_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text)
    )
  );

CREATE POLICY "Assigned freelancers can create submissions" ON submissions
  FOR INSERT WITH CHECK (
    submitter_id IN (
      SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
    )
    AND
    bounty_id IN (
      SELECT id FROM bounties 
      WHERE assignee_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text)
    )
  );

CREATE POLICY "Submitters can update their submissions" ON submissions
  FOR UPDATE USING (
    submitter_id IN (
      SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
    )
  );

-- Payments table policies
CREATE POLICY "Users can view their payment history" ON payments
  FOR SELECT USING (
    sender_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text)
    OR
    receiver_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text)
  );

CREATE POLICY "Senders can create payments" ON payments
  FOR INSERT WITH CHECK (
    sender_id IN (
      SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
    )
  );

-- Reviews table policies
CREATE POLICY "Public reviews are viewable by all" ON reviews
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Bounty participants can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    reviewer_id IN (
      SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
    )
    AND
    bounty_id IN (
      SELECT id FROM bounties 
      WHERE client_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text)
         OR assignee_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text)
    )
  );

-- Message threads table policies
CREATE POLICY "Thread participants can view threads" ON message_threads
  FOR SELECT USING (
    client_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text)
    OR
    freelancer_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text)
  );

CREATE POLICY "Bounty participants can create threads" ON message_threads
  FOR INSERT WITH CHECK (
    (client_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text))
    OR
    (freelancer_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text))
  );

-- Messages table policies
CREATE POLICY "Thread participants can view messages" ON messages
  FOR SELECT USING (
    thread_id IN (
      SELECT id FROM message_threads 
      WHERE client_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text)
         OR freelancer_id IN (SELECT id FROM users WHERE supabase_id::text = auth.uid()::text)
    )
  );

CREATE POLICY "Thread participants can send messages" ON messages
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

CREATE POLICY "Senders can update their messages" ON messages
  FOR UPDATE USING (
    sender_id IN (
      SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
    )
  );

-- Push subscriptions table policies
CREATE POLICY "Users can manage their push subscriptions" ON push_subscriptions
  FOR ALL USING (
    user_id IN (
      SELECT id FROM users WHERE supabase_id::text = auth.uid()::text
    )
  );

-- Admin and service role bypass policies
CREATE POLICY "Admins can manage all data" ON users
  FOR ALL USING (
    auth.uid()::text IN (
      SELECT supabase_id::text FROM users WHERE role = 'ADMIN'
    )
  );

CREATE POLICY "Service role can manage all data" ON bounties
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all data" ON applications
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all data" ON submissions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all data" ON payments
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all data" ON reviews
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all data" ON message_threads
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all data" ON messages
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all data" ON push_subscriptions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');