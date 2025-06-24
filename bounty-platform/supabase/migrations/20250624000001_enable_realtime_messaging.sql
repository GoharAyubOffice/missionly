-- Enable realtime for messaging tables
ALTER PUBLICATION supabase_realtime ADD TABLE message_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable RLS (Row Level Security) on messaging tables
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_threads
-- Users can only see threads where they are either the client or freelancer
CREATE POLICY "Users can view their own message threads" ON message_threads
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT supabase_id FROM users WHERE id = client_id
            UNION
            SELECT supabase_id FROM users WHERE id = freelancer_id
        )
    );

-- Users can only create threads for bounties they're involved in
CREATE POLICY "Users can create message threads for their bounties" ON message_threads
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT u.supabase_id FROM users u
            JOIN bounties b ON (b.client_id = u.id OR b.assignee_id = u.id)
            WHERE b.id = bounty_id
        )
    );

-- Users can update threads they're part of (for lastMessageAt)
CREATE POLICY "Users can update their message threads" ON message_threads
    FOR UPDATE USING (
        auth.uid()::text IN (
            SELECT supabase_id FROM users WHERE id = client_id
            UNION
            SELECT supabase_id FROM users WHERE id = freelancer_id
        )
    );

-- RLS Policies for messages
-- Users can only see messages in threads they're part of
CREATE POLICY "Users can view messages in their threads" ON messages
    FOR SELECT USING (
        thread_id IN (
            SELECT id FROM message_threads WHERE
            auth.uid()::text IN (
                SELECT supabase_id FROM users WHERE id = client_id
                UNION
                SELECT supabase_id FROM users WHERE id = freelancer_id
            )
        )
    );

-- Users can only create messages in threads they're part of, and only as themselves
CREATE POLICY "Users can create messages in their threads" ON messages
    FOR INSERT WITH CHECK (
        thread_id IN (
            SELECT id FROM message_threads WHERE
            auth.uid()::text IN (
                SELECT supabase_id FROM users WHERE id = client_id
                UNION
                SELECT supabase_id FROM users WHERE id = freelancer_id
            )
        )
        AND sender_id IN (
            SELECT id FROM users WHERE supabase_id = auth.uid()::text
        )
    );

-- Users can update their own messages (for read status, etc.)
CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (
        sender_id IN (
            SELECT id FROM users WHERE supabase_id = auth.uid()::text
        )
    );

-- RLS Policies for push_subscriptions
-- Users can only manage their own push subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users WHERE supabase_id = auth.uid()::text
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_threads_client_id ON message_threads(client_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_freelancer_id ON message_threads(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_bounty_id ON message_threads(bounty_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_last_message_at ON message_threads(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);