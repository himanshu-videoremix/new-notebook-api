'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const router = useRouter();

  const handleOpenNotebook = () => {
    // Use window.location for more reliable navigation
    window.location.href = '/notebook';
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#1A1B1E] border-b border-[#2B2D31] z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 text-white"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6.2C4 5.07989 4 4.51984 4.21799 4.09202C4.40973 3.71569 4.71569 3.40973 5.09202 3.21799C5.51984 3 6.07989 3 7.2 3H16.8C17.9201 3 18.4802 3 18.908 3.21799C19.2843 3.40973 19.5903 3.71569 19.782 4.09202C20 4.51984 20 5.07989 20 6.2V21L12 17L4 21V6.2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xl font-semibold text-white">
                SmartNotebook
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="bg-gradient-to-r from-blue-500 to-teal-500 text-white border-transparent hover:opacity-90 transition-all duration-300"
              onClick={handleOpenNotebook}
            >
              Open Notebook
            </Button>
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                className="text-white border-[#2B2D31] hover:bg-[#2B2D31]"
              >
                Dashboard
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="text-white hover:bg-[#2B2D31]">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}