export function DashboardSkeleton() {
  return (
    <div className="mb-8 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="h-10 w-32 bg-gray-200 rounded" />
        <div className="flex items-center gap-4">
          <div className="h-10 w-20 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}