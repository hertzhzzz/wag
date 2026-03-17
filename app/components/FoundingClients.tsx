import Link from 'next/link'

export default function FoundingClients() {
  return (
    <section id="founding-clients" className="py-20 bg-[#0F2D5E]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-sm font-semibold tracking-widest text-[#F59E0B] uppercase mb-6">
          Limited Availability
        </p>
        <h2 className="text-4xl font-serif text-white mb-6 leading-tight">
          We Are Onboarding Our First<br />
          <span className="text-[#F59E0B]">10 Australian Founding Clients</span>
        </h2>
        <p className="text-blue-200 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
          As a founding client, you get direct access to Andy Liu personally on every step of your sourcing journey — from supplier shortlisting through to your first factory visit.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/10 p-6 text-left">
            <p className="text-white font-semibold mb-2">Direct Founder Access</p>
            <p className="text-blue-100 text-sm">Andy Liu personally oversees every founding client trip — not delegated to junior staff.</p>
          </div>
          <div className="bg-white/10 p-6 text-left">
            <p className="text-white font-semibold mb-2">Priority Scheduling</p>
            <p className="text-blue-100 text-sm">Founding clients get first access to our supplier network and preferred trip dates.</p>
          </div>
          <div className="bg-white/10 p-6 text-left">
            <p className="text-white font-semibold mb-2">Shape the Service</p>
            <p className="text-blue-100 text-sm">Your feedback directly influences how we build Winning Adventure Global — your needs come first.</p>
          </div>
        </div>
        <Link
          href="/enquiry"
          className="inline-block bg-[#F59E0B] text-[#0F2D5E] px-10 py-4 font-bold hover:bg-[#d97706] transition-colors"
        >
          Apply as a Founding Client
        </Link>
      </div>
    </section>
  )
}
