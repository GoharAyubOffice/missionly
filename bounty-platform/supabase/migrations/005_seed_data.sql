-- Seed data for initial setup and testing

-- Insert sample admin user (optional - for testing)
-- Note: This user should be created through your app's registration process
-- This is just for reference structure

-- Sample bounty categories and skills for reference
-- You can insert these as reference data or use them in your application

-- Common skills array for reference
-- These can be used in your frontend skill selection components
/*
Common Development Skills:
- JavaScript
- TypeScript
- React
- Next.js
- Node.js
- Python
- Java
- PHP
- Go
- Rust
- SQL
- MongoDB
- PostgreSQL
- AWS
- Docker
- Kubernetes
- Git
- REST APIs
- GraphQL
- Machine Learning
- Data Science

Common Marketing Skills:
- Social Media Marketing
- Content Marketing
- SEO
- PPC Advertising
- Email Marketing
- Influencer Marketing
- Brand Strategy
- Digital Marketing
- Growth Hacking
- Analytics
- Conversion Optimization
- A/B Testing
- Copywriting
- Video Marketing
- Affiliate Marketing
*/

-- Insert some example data for testing (optional)
-- Uncomment if you want some test data

/*
-- Example users (these should be created through your registration system)
INSERT INTO users (id, email, name, role, status, supabase_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@bountyplatform.com', 'Admin User', 'ADMIN', 'ACTIVE', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440002', 'client@example.com', 'John Client', 'CLIENT', 'ACTIVE', '550e8400-e29b-41d4-a716-446655440002'),
  ('550e8400-e29b-41d4-a716-446655440003', 'freelancer@example.com', 'Jane Freelancer', 'FREELANCER', 'ACTIVE', '550e8400-e29b-41d4-a716-446655440003');

-- Example bounty
INSERT INTO bounties (id, title, description, requirements, skills, budget, status, client_id) VALUES (
  '550e8400-e29b-41d4-a716-446655440010',
  'Build a React Dashboard',
  'Need a modern dashboard built with React and TypeScript. Should include charts, data tables, and responsive design.',
  ARRAY['Must use React 18+', 'TypeScript required', 'Responsive design', 'Clean code'],
  ARRAY['React', 'TypeScript', 'CSS', 'JavaScript'],
  1500.00,
  'OPEN',
  '550e8400-e29b-41d4-a716-446655440002'
);
*/

-- Create helper functions for application use

-- Function to get user by supabase ID
CREATE OR REPLACE FUNCTION get_user_by_supabase_id(supabase_user_id UUID)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  name VARCHAR,
  role user_role,
  status user_status,
  reputation DECIMAL,
  total_earned DECIMAL,
  total_spent DECIMAL
) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.status,
    u.reputation,
    u.total_earned,
    u.total_spent
  FROM users u
  WHERE u.supabase_id = supabase_user_id;
END;
$$;

-- Function to get bounty statistics
CREATE OR REPLACE FUNCTION get_bounty_stats()
RETURNS TABLE (
  total_bounties BIGINT,
  open_bounties BIGINT,
  completed_bounties BIGINT,
  total_value DECIMAL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_bounties,
    COUNT(*) FILTER (WHERE status = 'OPEN') as open_bounties,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_bounties,
    COALESCE(SUM(budget), 0) as total_value
  FROM bounties;
END;
$$;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  bounties_created BIGINT,
  bounties_completed BIGINT,
  applications_sent BIGINT,
  avg_rating DECIMAL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM bounties WHERE client_id = user_uuid) as bounties_created,
    (SELECT COUNT(*) FROM bounties WHERE assignee_id = user_uuid AND status = 'COMPLETED') as bounties_completed,
    (SELECT COUNT(*) FROM applications WHERE applicant_id = user_uuid) as applications_sent,
    (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviewee_id = user_uuid) as avg_rating;
END;
$$;

-- Function to search bounties with full-text search
CREATE OR REPLACE FUNCTION search_bounties(
  search_term TEXT DEFAULT '',
  bounty_status bounty_status[] DEFAULT ARRAY['OPEN']::bounty_status[],
  min_budget DECIMAL DEFAULT 0,
  max_budget DECIMAL DEFAULT 999999,
  required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  budget DECIMAL,
  status bounty_status,
  created_at TIMESTAMP WITH TIME ZONE,
  client_name VARCHAR,
  skills_match INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.description,
    b.budget,
    b.status,
    b.created_at,
    u.name as client_name,
    CASE 
      WHEN cardinality(required_skills) = 0 THEN 0
      ELSE (
        SELECT COUNT(*)::INTEGER 
        FROM unnest(b.skills) as skill 
        WHERE skill = ANY(required_skills)
      )
    END as skills_match
  FROM bounties b
  JOIN users u ON b.client_id = u.id
  WHERE 
    (search_term = '' OR to_tsvector('english', b.title || ' ' || b.description) @@ plainto_tsquery('english', search_term))
    AND b.status = ANY(bounty_status)
    AND b.budget >= min_budget
    AND b.budget <= max_budget
    AND (
      cardinality(required_skills) = 0 
      OR b.skills && required_skills
    )
  ORDER BY 
    CASE WHEN search_term = '' THEN b.created_at ELSE ts_rank(to_tsvector('english', b.title || ' ' || b.description), plainto_tsquery('english', search_term)) END DESC,
    skills_match DESC,
    b.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_by_supabase_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_bounty_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_bounties(TEXT, bounty_status[], DECIMAL, DECIMAL, TEXT[], INTEGER, INTEGER) TO authenticated;