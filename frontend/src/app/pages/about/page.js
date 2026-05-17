"use client";

import { useState, useEffect, useRef } from "react";

const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a",
];

export default function page() {
  const [eggVisible, setEggVisible] = useState(false);
  const seqRef = useRef([]);
  const timerRef = useRef(null);

  // Global keydown listener — no focus needed
  useEffect(() => {
    function handleKey(e) {
      const next = [...seqRef.current, e.key].slice(-KONAMI.length);
      seqRef.current = next;
      if (next.join(",") === KONAMI.join(",")) {
        seqRef.current = [];
        setEggVisible(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setEggVisible(false), 5000);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="min-h-screen px-5 py-16 md:py-28 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-mustard)] font-mono mb-3">
          About
        </p>
        <h1 className="text-4xl md:text-6xl font-bold leading-none tracking-tight text-[var(--color-moon)]">
          Vision<span className="text-[var(--color-ocean-light)]">Park</span>
        </h1>
      </div>

      {/* Mission */}
      <div className="glass-card px-7 py-6 mb-6 rounded-xl border-l-2 border-l-[var(--color-ocean)]">
        <p className="text-[var(--color-moon)] text-sm leading-relaxed">
          VisionPark is a space for building thoughtful digital tools — focused on clarity, 
          purposeful design, and software that actually makes sense to use. We build from the ground up  
          to the highest standards. We drill down into the details. We test left and right to ensure 
          flawless navigation. And we always ensure plan B is as good as plan A.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[
          {
            color: "var(--color-ocean)",
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.001 3.001 0 00-.765 1.956v.252a2 2 0 01-2 2h-1a2 2 0 01-2-2v-.252a3 3 0 00-.765-1.956l-.347-.347z" />
            ),
            title: "Intentional Design",
            body: "Every interface decision is deliberate. No clutter, no confusion — just tools that feel natural from day one.",
          },
          {
            color: "var(--color-mustard-dark)",
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            ),
            title: "Built to Last",
            body: "Clean architecture, honest tradeoffs, and code that can be maintained without regret six months later.",
          },
          {
            color: "var(--color-cherry-dark)",
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            ),
            title: "Privacy First",
            body: "Your data is yours. We collect only what's necessary and never sell or share without explicit consent.",
          },
          {
            color: "var(--color-vinyl-light)",
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            ),
            title: "Open by Default",
            body: "Transparency in how things work. If we build it, we're happy to explain why and how.",
          },
        ].map(({ color, icon, title, body }) => (
          <div key={title} className="glass-card px-6 py-5 rounded-xl">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center mb-4"
              style={{ backgroundColor: color }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {icon}
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-moon)] text-sm mb-1.5">{title}</h3>
            <p className="text-[var(--color-moon-dark)] text-xs leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      {/* Barely-there hint */}
      <p className="text-center font-mono text-[9px] tracking-[0.4em] text-[var(--color-slate-light)] opacity-20 select-none mt-20">
        ↑ ↑ ↓ ↓
      </p>

      {/* Easter egg popup */}
      <div
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
          eggVisible ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div
          className=" bg-slate rounded-xl px-6 py-5 w-64 text-center"
          style={{ border: "1px solid var(--color-ocean)", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
        >
          <p className="text-xl mb-2">👾</p>
          <p className="text-[var(--color-slate-light)] text-[9px] font-mono uppercase tracking-[0.25em] mb-2">
            nice one.
          </p>
          <h3 className="text-sm font-bold text-[var(--color-moon)] mb-0.5">wyllg</h3>
          <p className="text-[var(--color-slate-light)] text-[11px] mb-4">the person behind all this</p>
          <a
            href="https://github.com/wyllg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[11px] font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--color-ocean)" }}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            github.com/wyllg
          </a>
        </div>
      </div>

    </div>
  );
}