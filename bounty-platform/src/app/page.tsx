import LandingPage from '@/components/LandingPage';

export default async function Home() {
  // The middleware handles authentication and redirects
  // If we reach this page, the user is not authenticated
  return <LandingPage />;
}
