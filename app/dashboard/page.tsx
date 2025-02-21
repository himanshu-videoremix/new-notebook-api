'use client';

import { Suspense, useEffect } from 'react';
import { DashboardContent } from '@/components/dashboard-content';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { Header } from '@/components/header';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.message.includes('Failed to fetch RSC payload')) {
        toast({
          title: "Connection error",
          description: "Reconnecting to server...",
          variant: "destructive"
        });
        
        // Attempt to refresh the page after a short delay
        setTimeout(() => {
          router.refresh();
        }, 2000);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [router, toast]);

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="pt-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent mb-12">
            Welcome to SmartNotebook
          </h1>

          <Suspense fallback={<DashboardSkeleton />} key={Date.now()}>
            <DashboardContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}