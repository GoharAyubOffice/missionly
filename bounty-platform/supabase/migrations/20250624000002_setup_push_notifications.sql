-- Create notification logs table for tracking push notifications
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  successful_sends INTEGER DEFAULT 0,
  total_subscriptions INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notification logs
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at DESC);

-- Enable RLS on notification logs
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy for notification logs (users can only see their own logs)
CREATE POLICY "Users can view their own notification logs" ON notification_logs
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE supabase_id = auth.uid()::text
        )
    );

-- Function to send push notification via Edge Function
CREATE OR REPLACE FUNCTION send_push_notification_trigger()
RETURNS TRIGGER AS $$
DECLARE
    recipient_id TEXT;
    sender_name TEXT;
    notification_title TEXT;
    notification_body TEXT;
    notification_url TEXT;
    thread_data RECORD;
    bounty_data RECORD;
BEGIN
    -- Handle message notifications
    IF TG_TABLE_NAME = 'messages' AND TG_OP = 'INSERT' THEN
        -- Get thread and bounty information
        SELECT 
            mt.client_id,
            mt.freelancer_id,
            b.title as bounty_title,
            c.name as client_name,
            f.name as freelancer_name
        INTO thread_data
        FROM message_threads mt
        JOIN bounties b ON mt.bounty_id = b.id
        LEFT JOIN users c ON mt.client_id = c.id
        LEFT JOIN users f ON mt.freelancer_id = f.id
        WHERE mt.id = NEW.thread_id;

        -- Determine recipient (the person who didn't send the message)
        IF NEW.sender_id = thread_data.client_id THEN
            recipient_id := thread_data.freelancer_id;
            sender_name := COALESCE(thread_data.client_name, 'Client');
        ELSE
            recipient_id := thread_data.client_id;
            sender_name := COALESCE(thread_data.freelancer_name, 'Freelancer');
        END IF;

        -- Skip system messages
        IF NEW.type = 'SYSTEM' THEN
            RETURN NEW;
        END IF;

        -- Prepare notification content
        notification_title := 'New message in ' || thread_data.bounty_title;
        notification_body := sender_name || ': ' || 
            CASE 
                WHEN LENGTH(NEW.content) > 100 THEN SUBSTR(NEW.content, 1, 100) || '...'
                ELSE NEW.content 
            END;
        notification_url := '/messages/' || NEW.thread_id;

        -- Call Edge Function to send notification
        PERFORM
            net.http_post(
                url := 'https://' || current_setting('app.supabase_url') || '/functions/v1/send-push-notification',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer ' || current_setting('app.service_role_key')
                ),
                body := jsonb_build_object(
                    'userId', recipient_id,
                    'type', 'message',
                    'payload', jsonb_build_object(
                        'title', notification_title,
                        'body', notification_body,
                        'icon', '/icon-192x192.png',
                        'tag', 'message-' || NEW.thread_id,
                        'url', notification_url,
                        'data', jsonb_build_object(
                            'type', 'message',
                            'threadId', NEW.thread_id,
                            'senderId', NEW.sender_id,
                            'messageId', NEW.id
                        ),
                        'actions', jsonb_build_array(
                            jsonb_build_object('action', 'view', 'title', 'View Message'),
                            jsonb_build_object('action', 'dismiss', 'title', 'Dismiss')
                        ),
                        'requireInteraction', false
                    )
                )
            );

    -- Handle bounty notifications
    ELSIF TG_TABLE_NAME = 'applications' AND TG_OP = 'INSERT' THEN
        -- Get bounty and client information
        SELECT 
            b.title,
            b.client_id,
            u.name as applicant_name
        INTO bounty_data
        FROM bounties b
        JOIN users u ON u.id = NEW.applicant_id
        WHERE b.id = NEW.bounty_id;

        notification_title := 'New application for ' || bounty_data.title;
        notification_body := COALESCE(bounty_data.applicant_name, 'Someone') || ' has applied to your bounty';
        notification_url := '/bounties/' || NEW.bounty_id;

        -- Send to bounty client
        PERFORM
            net.http_post(
                url := 'https://' || current_setting('app.supabase_url') || '/functions/v1/send-push-notification',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer ' || current_setting('app.service_role_key')
                ),
                body := jsonb_build_object(
                    'userId', bounty_data.client_id,
                    'type', 'bounty',
                    'payload', jsonb_build_object(
                        'title', notification_title,
                        'body', notification_body,
                        'icon', '/icon-192x192.png',
                        'tag', 'application-' || NEW.id,
                        'url', notification_url,
                        'data', jsonb_build_object(
                            'type', 'application',
                            'bountyId', NEW.bounty_id,
                            'applicationId', NEW.id,
                            'applicantId', NEW.applicant_id
                        ),
                        'actions', jsonb_build_array(
                            jsonb_build_object('action', 'view', 'title', 'View Application'),
                            jsonb_build_object('action', 'dismiss', 'title', 'Dismiss')
                        )
                    )
                )
            );

    -- Handle bounty status changes
    ELSIF TG_TABLE_NAME = 'bounties' AND TG_OP = 'UPDATE' THEN
        -- Only notify on specific status changes
        IF OLD.status != NEW.status THEN
            -- Get relevant user information
            SELECT title INTO bounty_data FROM bounties WHERE id = NEW.id;

            CASE NEW.status
                WHEN 'IN_PROGRESS' THEN
                    -- Notify freelancer that bounty has been assigned
                    IF NEW.assignee_id IS NOT NULL THEN
                        notification_title := 'Bounty assigned: ' || NEW.title;
                        notification_body := 'You have been assigned to work on this bounty';
                        notification_url := '/bounties/' || NEW.id;

                        PERFORM
                            net.http_post(
                                url := 'https://' || current_setting('app.supabase_url') || '/functions/v1/send-push-notification',
                                headers := jsonb_build_object(
                                    'Content-Type', 'application/json',
                                    'Authorization', 'Bearer ' || current_setting('app.service_role_key')
                                ),
                                body := jsonb_build_object(
                                    'userId', NEW.assignee_id,
                                    'type', 'bounty',
                                    'payload', jsonb_build_object(
                                        'title', notification_title,
                                        'body', notification_body,
                                        'icon', '/icon-192x192.png',
                                        'tag', 'bounty-assigned-' || NEW.id,
                                        'url', notification_url,
                                        'data', jsonb_build_object(
                                            'type', 'bounty_assigned',
                                            'bountyId', NEW.id
                                        )
                                    )
                                )
                            );
                    END IF;

                WHEN 'COMPLETED' THEN
                    -- Notify both client and freelancer
                    notification_title := 'Bounty completed: ' || NEW.title;
                    notification_body := 'The bounty has been marked as completed';
                    notification_url := '/bounties/' || NEW.id;

                    -- Notify client
                    PERFORM
                        net.http_post(
                            url := 'https://' || current_setting('app.supabase_url') || '/functions/v1/send-push-notification',
                            headers := jsonb_build_object(
                                'Content-Type', 'application/json',
                                'Authorization', 'Bearer ' || current_setting('app.service_role_key')
                            ),
                            body := jsonb_build_object(
                                'userId', NEW.client_id,
                                'type', 'bounty',
                                'payload', jsonb_build_object(
                                    'title', notification_title,
                                    'body', notification_body,
                                    'icon', '/icon-192x192.png',
                                    'tag', 'bounty-completed-' || NEW.id,
                                    'url', notification_url,
                                    'data', jsonb_build_object(
                                        'type', 'bounty_completed',
                                        'bountyId', NEW.id
                                    )
                                )
                            )
                        );

                    -- Notify freelancer if assigned
                    IF NEW.assignee_id IS NOT NULL THEN
                        PERFORM
                            net.http_post(
                                url := 'https://' || current_setting('app.supabase_url') || '/functions/v1/send-push-notification',
                                headers := jsonb_build_object(
                                    'Content-Type', 'application/json',
                                    'Authorization', 'Bearer ' || current_setting('app.service_role_key')
                                ),
                                body := jsonb_build_object(
                                    'userId', NEW.assignee_id,
                                    'type', 'bounty',
                                    'payload', jsonb_build_object(
                                        'title', notification_title,
                                        'body', notification_body,
                                        'icon', '/icon-192x192.png',
                                        'tag', 'bounty-completed-' || NEW.id,
                                        'url', notification_url,
                                        'data', jsonb_build_object(
                                            'type', 'bounty_completed',
                                            'bountyId', NEW.id
                                        )
                                    )
                                )
                            );
                    END IF;
            END CASE;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for push notifications

-- Message notifications
DROP TRIGGER IF EXISTS trigger_message_push_notification ON messages;
CREATE TRIGGER trigger_message_push_notification
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION send_push_notification_trigger();

-- Application notifications
DROP TRIGGER IF EXISTS trigger_application_push_notification ON applications;
CREATE TRIGGER trigger_application_push_notification
    AFTER INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION send_push_notification_trigger();

-- Bounty status change notifications
DROP TRIGGER IF EXISTS trigger_bounty_status_push_notification ON bounties;
CREATE TRIGGER trigger_bounty_status_push_notification
    AFTER UPDATE ON bounties
    FOR EACH ROW
    EXECUTE FUNCTION send_push_notification_trigger();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA net TO postgres, service_role;