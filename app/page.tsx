'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/notebook');
  }, [router]);
  
  return (
    null // Return null since we're redirecting
  );
}