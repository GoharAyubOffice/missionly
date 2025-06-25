# Supabase Migrations

This directory contains SQL migration files for setting up your Supabase database schema.

## Migration Files

### 001_initial_schema.sql
- Creates all database tables with proper relationships
- Defines custom ENUM types for status fields
- Sets up foreign key constraints
- Creates the core schema structure

### 002_indexes_and_triggers.sql
- Creates performance indexes for all tables
- Sets up automatic timestamp triggers
- Creates full-text search indexes
- Implements reputation calculation triggers
- Sets up message thread timestamp updates

### 003_rls_policies.sql
- Enables Row Level Security (RLS) on all tables
- Creates comprehensive security policies
- Implements role-based access control
- Sets up user isolation and data protection

### 004_storage_policies.sql
- Configures storage bucket access policies
- Sets up file upload permissions
- Implements user-specific file access
- Creates public/private file handling

### 005_seed_data.sql
- Contains helpful utility functions
- Includes search and statistics functions
- Optional test data (commented out)
- Sets up function permissions

## How to Apply Migrations

### Method 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Run each migration file in order:**
   - Copy the content of each file
   - Paste into SQL Editor
   - Click "Run" to execute
   - Verify success before proceeding to next file

### Method 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Initialize Supabase locally (if not done)
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Method 3: Manual SQL Execution

You can also run these directly against your PostgreSQL database using any SQL client.

## Verification

After running all migrations, verify your setup:

1. **Check Tables:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **Check RLS Status:**
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

3. **Check Indexes:**
   ```sql
   SELECT indexname, tablename 
   FROM pg_indexes 
   WHERE schemaname = 'public';
   ```

4. **Test Functions:**
   ```sql
   SELECT get_bounty_stats();
   ```

## Important Notes

- **Run migrations in order** (001, 002, 003, 004, 005)
- **Do not skip migrations** - they build upon each other
- **Test each migration** before proceeding to the next
- **Backup your database** before applying to production
- **Review policies** to ensure they match your security requirements

## Customization

You can modify these migrations to fit your specific needs:

- Add additional fields to tables
- Modify RLS policies for your use case
- Add custom indexes for your query patterns
- Include your own seed data in 005_seed_data.sql

## Troubleshooting

If you encounter errors:

1. **Check dependencies:** Ensure previous migrations ran successfully
2. **Review syntax:** Verify SQL syntax is correct for your PostgreSQL version
3. **Check permissions:** Ensure you have sufficient database privileges
4. **Review logs:** Check Supabase logs for detailed error messages

## Next Steps

After applying migrations:

1. **Update your environment variables** with Supabase credentials
2. **Test your application** with the new database
3. **Set up storage buckets** in Supabase dashboard
4. **Configure authentication** settings
5. **Test all features** to ensure proper connectivity