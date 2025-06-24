'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { registrationSchema, loginSchema, type RegistrationFormData, type LoginFormData } from '@/lib/validators/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function registrationAction(formData: RegistrationFormData) {
  try {
    const validatedData = registrationSchema.parse(formData);
    const { email, password, name, role } = validatedData;

    const supabase = await createSupabaseServerClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return {
        success: false,
        error: authError.message === 'User already registered' 
          ? 'An account with this email already exists. Please try logging in instead.'
          : authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create account. Please try again.',
      };
    }

    try {
      const userRole = role === 'CLIENT' ? 'CLIENT' : 'FREELANCER';
      
      await prisma.user.create({
        data: {
          id: authData.user.id,
          email: email.toLowerCase(),
          name,
          role: userRole,
          supabaseId: authData.user.id,
          status: 'PENDING_VERIFICATION',
        },
      });

      return {
        success: true,
        message: 'Account created successfully. Please check your email to verify your account.',
      };
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return {
        success: false,
        error: 'Failed to create user profile. Please try again.',
      };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function loginAction(formData: LoginFormData) {
  try {
    const validatedData = loginSchema.parse(formData);
    const { email, password } = validatedData;

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please check your credentials and try again.'
          : error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Login failed. Please try again.',
      };
    }

    try {
      const user = await prisma.user.findUnique({
        where: { supabaseId: data.user.id },
      });

      if (!user) {
        return {
          success: false,
          error: 'User profile not found. Please contact support.',
        };
      }

      if (user.status === 'SUSPENDED') {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Your account has been suspended. Please contact support.',
        };
      }

      if (user.status === 'PENDING_VERIFICATION') {
        return {
          success: false,
          error: 'Please verify your email address before logging in.',
        };
      }

      revalidatePath('/', 'layout');
      return {
        success: true,
        redirectTo: user.role === 'CLIENT' ? '/dashboard/client' : '/dashboard/freelancer',
      };
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      return {
        success: false,
        error: 'Failed to retrieve user information. Please try again.',
      };
    }
  } catch (error) {
    console.error('Login action error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function logoutAction() {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: 'Failed to log out. Please try again.',
      };
    }

    revalidatePath('/', 'layout');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Logout action error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during logout.',
    };
  }
}

export async function forgotPasswordAction(email: string) {
  try {
    if (!email || !email.includes('@')) {
      return {
        success: false,
        error: 'Please enter a valid email address.',
      };
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: 'Failed to send password reset email. Please try again.',
      };
    }

    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
    };
  } catch (error) {
    console.error('Forgot password action error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}