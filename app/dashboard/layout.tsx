'use client';

import { Header } from '@/components/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white">
      <Header />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}