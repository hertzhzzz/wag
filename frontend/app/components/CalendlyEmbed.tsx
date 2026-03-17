"use client";
import { useEffect } from "react";

export default function CalendlyEmbed() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <p className="text-sm font-semibold tracking-widest text-[#F59E0B] uppercase mb-3">Book a Call</p>
        <h2 className="text-3xl font-serif text-[#0F2D5E] mb-4">Schedule Your Free Discovery Call</h2>
        <p className="text-gray-600 mb-8">Pick a time that works for you. 30 minutes, no obligation.</p>
        <div
          className="calendly-inline-widget"
          data-url="https://calendly.com/mark-winningadventure/"
          style={{ minWidth: "320px", height: "700px" }}
        />
      </div>
    </div>
  );
}
