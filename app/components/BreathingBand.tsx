import Image from 'next/image'

// ponytail: one component, two instances on the homepage. No 'use client' — static.
export default function BreathingBand({
  stat,
  statement,
  source,
  image,
}: {
  stat: string
  statement: string
  source?: string
  image?: string
}) {
  return (
    <section className="relative bg-navy py-16 md:py-20 px-8 md:px-20 overflow-hidden">
      {image && (
        <>
          <Image src={image} alt="" fill sizes="100vw" className="object-cover opacity-25 z-0" />
          {/* navy stays solid on the left (number/text stay legible), image breathes through on the right */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-navy via-navy/95 to-navy/60" />
        </>
      )}
      <div className="relative z-10 max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center gap-5 md:gap-14">
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
