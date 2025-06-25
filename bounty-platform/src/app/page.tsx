import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/app/actions/user';
import LandingPage from '@/components/LandingPage';

export default async function Home() {
  try {
    // Check if user is authenticated
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // User is not authenticated, show landing page
      return <LandingPage />;
    }

    // User is authenticated, get their profile using the action
    const userResult = await getCurrentUser();
    
    if (!userResult.success || !userResult.data) {
      // User exists in Supabase but not in our database, redirect to register
      redirect('/register');
    }

    const dbUser = userResult.data;

    if (!dbUser.name || dbUser.status === 'PENDING_VERIFICATION') {
      // User needs to complete onboarding
      redirect('/onboarding');
    }

    // User is fully set up, redirect to appropriate dashboard
    if (dbUser.role === 'CLIENT') {
      redirect('/dashboard/client');
    } else if (dbUser.role === 'FREELANCER') {
      redirect('/dashboard/freelancer');
    } else {
      redirect('/bounties');
    }
  } catch (error) {
    console.error('Error in home page:', error);
    // On error, show landing page
    return <LandingPage />;
  }
}
