import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function createUserProfile(userId: string, email: string, name: string, role: string) {
  try {
    const supabase = await createSupabaseServiceClient();
    
    // Create user profile in Supabase users table (if it exists)
    // For now, we'll just use Supabase Auth metadata and storage
    
    // Update user metadata to include profile completion
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        name,
        role,
        profile_created: true,
        created_at: new Date().toISOString(),
      }
    });

    if (error) {
      console.error('Failed to update user metadata:', error);
      return { success: false, error: error.message };
    }

    console.log('User profile created successfully:', userId);
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: 'Failed to create user profile' };
  }
}