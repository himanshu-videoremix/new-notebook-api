'use client';

export default function NotebookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white no-horizontal-scroll">
      {children}
    </div>
  );
}