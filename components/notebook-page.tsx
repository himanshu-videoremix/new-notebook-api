'use client';

import { useState, Suspense } from 'react';
import { Header } from '@/components/header';
import { NotebookSkeleton } from '@/components/notebook-skeleton';
import { NotebookInterface } from '@/components/notebook-interface';

export function NotebookPage() {
  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white">
      <Header />
      <Suspense fallback={<NotebookSkeleton />}>
        <main className="pt-16">
          <NotebookInterface />
        </main>
      </Suspense>
    </div>
  );
}