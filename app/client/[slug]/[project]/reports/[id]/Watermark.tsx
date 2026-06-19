"use client"

export function Watermark({ clientName }: { clientName: string }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 select-none"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 120px,
            rgba(15, 45, 94, 0.5) 120px,
            rgba(15, 45, 94, 0.5) 122px
          )`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-navy/5 text-8xl font-bold rotate-[-30deg] whitespace-nowrap tracking-widest">
          {clientName}
        </p>
      </div>
    </div>
  )
}
