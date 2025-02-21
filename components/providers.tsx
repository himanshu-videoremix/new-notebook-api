'use client';

import { ReactNode, useEffect, useState, Suspense, useCallback } from 'react';
import { ThemeProvider } from 'next-themes';
import { useRouter } from 'next/navigation';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const handleRetry = useCallback(() => {
    // Attempt to refresh the page
    router.refresh();
  }, [router]);

  useEffect(() => {
    const handleOnline = () => {
      handleRetry();
    };

    const handleOffline = () => {
      console.warn('Network connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }, [handleRetry]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Suspense key={Date.now()} fallback={
        <div className="min-h-screen bg-[#1A1B1E] flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      }>{children}</Suspense>
    </ThemeProvider>
  );
}