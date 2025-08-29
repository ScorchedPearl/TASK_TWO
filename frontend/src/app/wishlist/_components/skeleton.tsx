export default function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
          <div className="w-full h-48 bg-gray-700"></div>
          <div className="p-4">
            <div className="h-6 w-3/4 bg-gray-700 rounded mb-3"></div>
            <div className="h-8 w-1/2 bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}