'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PrismaClient } from '@/generated/prisma';
import { type BusinessProfileData } from '@/components/forms/BusinessProfileForm';
import { type MarketerProfileData } from '@/components/forms/MarketerProfileForm';

const prisma = new PrismaClient();

export async function updateBusinessProfile(data: BusinessProfileData) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized. Please log in to update your profile.',
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    if (dbUser.role !== 'CLIENT') {
      return {
        success: false,
        error: 'This profile type is not valid for your account.',
      };
    }

    // Update user profile
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        name: data.companyName,
        bio: data.companyDescription,
        avatar: data.avatar,
        website: data.website,
        location: data.location,
        skills: data.projectTypes,
        status: 'ACTIVE', // Mark profile as complete
      },
    });

    // Store additional business-specific data in a separate table if needed
    // For now, we'll use the bio field for company description and skills for project types

    revalidatePath('/dashboard');
    revalidatePath('/onboarding');

    return {
      success: true,
      message: 'Business profile updated successfully.',
    };
  } catch (error) {
    console.error('Business profile update error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating your profile.',
    };
  }
}

export async function updateMarketerProfile(data: MarketerProfileData) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized. Please log in to update your profile.',
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    if (dbUser.role !== 'FREELANCER') {
      return {
        success: false,
        error: 'This profile type is not valid for your account.',
      };
    }

    // Update user profile
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        bio: data.bio,
        avatar: data.avatar,
        website: data.portfolio,
        location: data.location,
        skills: data.skills,
        status: 'ACTIVE', // Mark profile as complete
      },
    });

    // Store additional marketer-specific data
    // For now, we'll use existing fields creatively
    // In a production app, you might want a separate profile table

    revalidatePath('/dashboard');
    revalidatePath('/onboarding');

    return {
      success: true,
      message: 'Marketer profile updated successfully.',
    };
  } catch (error) {
    console.error('Marketer profile update error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating your profile.',
    };
  }
}

export async function autoSaveProfile(data: Partial<BusinessProfileData | MarketerProfileData>) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized.',
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User not found.',
      };
    }

    // Determine what fields to update based on the data structure
    const updateData: any = {};

    if ('companyName' in data && data.companyName) {
      updateData.name = data.companyName;
    }
    
    if ('companyDescription' in data && data.companyDescription) {
      updateData.bio = data.companyDescription;
    }
    
    if ('bio' in data && data.bio) {
      updateData.bio = data.bio;
    }
    
    if ('avatar' in data && data.avatar) {
      updateData.avatar = data.avatar;
    }
    
    if ('website' in data && data.website) {
      updateData.website = data.website;
    }
    
    if ('portfolio' in data && data.portfolio) {
      updateData.website = data.portfolio;
    }
    
    if ('location' in data && data.location) {
      updateData.location = data.location;
    }
    
    if ('skills' in data && data.skills && data.skills.length > 0) {
      updateData.skills = data.skills;
    }
    
    if ('projectTypes' in data && data.projectTypes && data.projectTypes.length > 0) {
      updateData.skills = data.projectTypes;
    }

    // Only update if there's actual data to save
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: updateData,
      });
    }

    return {
      success: true,
      message: 'Profile auto-saved.',
    };
  } catch (error) {
    console.error('Auto-save error:', error);
    return {
      success: false,
      error: 'Auto-save failed.',
    };
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized.',
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        website: true,
        location: true,
        skills: true,
        role: true,
        status: true,
        reputation: true,
        totalEarned: true,
        totalSpent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User profile not found.',
      };
    }

    return {
      success: true,
      user: dbUser,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred.',
    };
  }
}

export async function checkProfileCompletion() {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized.',
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: {
        role: true,
        status: true,
        bio: true,
        location: true,
        skills: true,
      },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User not found.',
      };
    }

    // Check if profile is complete based on role
    let isComplete = false;
    
    if (dbUser.status === 'ACTIVE') {
      isComplete = true;
    } else {
      // Basic completion check
      isComplete = !!(
        dbUser.bio &&
        dbUser.location &&
        dbUser.skills &&
        dbUser.skills.length > 0
      );
    }

    return {
      success: true,
      isComplete,
      role: dbUser.role,
      status: dbUser.status,
    };
  } catch (error) {
    console.error('Profile completion check error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred.',
    };
  }
}