export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="bg-navy py-14 md:py-20 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="h-4 w-32 bg-gray-700/30 rounded mb-4 animate-pulse" />
          <div className="h-6 w-24 bg-amber/20 rounded animate-pulse mb-4" />
          <div className="h-10 w-3/4 bg-gray-700/30 rounded animate-pulse mb-4" />
          <div className="h-6 w-1/2 bg-gray-700/20 rounded animate-pulse mb-6" />
          <div className="flex gap-4">
            <div className="h-4 w-20 bg-gray-700/20 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-700/20 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-700/20 rounded animate-pulse" />
          </div>
        </div>
      </section>

      {/* Two-column skeleton */}
      <section className="py-14 md:py-20 px-4 md:px-8 bg-gray-50">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-6 w-1/3 bg-gray-300 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-1/4 bg-gray-300 rounded animate-pulse mt-6" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* The Results card skeleton */}
            <div className="bg-amber/10 border border-amber/30 p-7">
              <div className="h-3 w-20 bg-amber/30 rounded animate-pulse mb-4" />
              <div className="h-8 w-24 bg-gray-300 rounded animate-pulse mb-4" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Quote card skeleton */}
            <div className="bg-navy p-7">
              <div className="h-16 w-full bg-gray-600/30 rounded animate-pulse mb-4" />
              <div className="h-3 w-24 bg-gray-600/20 rounded animate-pulse" />
            </div>

            {/* How WAG Helped skeleton */}
            <div className="border-2 border-navy p-7">
              <div className="h-3 w-24 bg-gray-300 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA skeleton */}
            <div className="h-12 bg-gray-300 rounded animate-pulse" />
          </div>
        </div>
      </section>

      {/* More industries skeleton */}
      <section className="py-14 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border-2 border-gray-200 p-7">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}