import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function createUserProfile(userId: string, email: string, name: string, role: string) {
  try {
    const supabase = await createSupabaseServiceClient();
    
    // Validate role
    const validRole = role === 'CLIENT' ? 'CLIENT' : 'FREELANCER';
    
    // Create user profile in our Prisma database first
    try {
      const user = await prisma.user.create({
        data: {
          supabaseId: userId,
          email: email.toLowerCase(),
          name: name,
          role: validRole,
          status: 'ACTIVE', // For OAuth users, they're already verified
        },
      });
      
      console.log('User profile created successfully in database:', userId, user.id);
    } catch (dbError: unknown) {
      // If user already exists, that's okay - might be a duplicate call
      if ((dbError as { code?: string }).code === 'P2002') {
        console.log('User already exists in database, skipping creation:', userId);
        return { success: true };
      } else {
        console.error('Failed to create user in database:', dbError);
        throw new Error('Failed to create user profile in database');
      }
    }

    // Update user metadata to include profile completion
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        name,
        role: validRole,
        profile_created: true,
        created_at: new Date().toISOString(),
      }
    });

    if (error) {
      console.error('Failed to update user metadata:', error);
      // Don't fail the entire process if metadata update fails
    }

    console.log('User profile created successfully:', userId);
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error; // Re-throw to be handled by caller
  } finally {
    await prisma.$disconnect();
  }
}