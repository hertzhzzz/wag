// ponytail: one component, two instances on the homepage. No 'use client' — static.
export default function BreathingBand({
  stat,
  statement,
  source,
}: {
  stat: string
  statement: string
  source?: string
}) {
  return (
    <section className="bg-navy py-16 md:py-20 px-8 md:px-20">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center gap-5 md:gap-14">
        <span className="font-serif text-[clamp(3.5rem,9vw,6.5rem)] font-bold text-amber leading-[0.9] flex-shrink-0">
          {stat}
        </span>
        <div className="md:border-l md:border-white/15 md:pl-14">
          <p className="text-lg md:text-2xl text-white font-light leading-snug max-w-[620px]">
            {statement}
          </p>
          {source && <p className="text-xs text-white/40 mt-3 tracking-wide">{source}</p>}
        </div>
      </div>
    </section>
  )
}
