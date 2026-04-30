export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero skeleton */}
      <div className="bg-navy py-14 md:py-20 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="h-3 w-24 bg-white/10 rounded mb-6 animate-pulse" />
          <div className="h-10 w-80 bg-white/10 rounded mb-4 animate-pulse" />
          <div className="h-6 w-[560px] bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Grid skeleton */}
      <section className="py-14 md:py-20 px-4 md:px-8 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border-2 border-gray-200 p-7 flex flex-col gap-4"
              >
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-44 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-2 flex-grow">
                  <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
