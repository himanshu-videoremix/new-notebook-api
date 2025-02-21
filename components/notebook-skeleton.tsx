export function NotebookSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-pulse">
      <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-800 rounded-lg" />
            <div className="h-8 w-48 bg-gray-800 rounded" />
          </div>
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-10 h-10 bg-gray-800 rounded" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[400px] bg-gray-800 rounded-lg" />
          <div className="h-[400px] bg-gray-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}