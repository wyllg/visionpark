import { Mail } from 'lucide-react';

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <style>{`
        @keyframes vp-bot { 0%,100%{stroke:#e45b3d;opacity:.55} 33%{stroke:#e5873b;opacity:.75} 66%{stroke:#3e787b;opacity:.55} }
        @keyframes vp-top { 0%,100%{stroke:#eceed5} 33%{stroke:#e45b3d} 66%{stroke:#e5873b} }
        @keyframes vp-fl  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1px)} }
        .vp-b{animation:vp-bot 4s ease-in-out infinite}
        .vp-t{animation:vp-top 4s ease-in-out infinite;animation-delay:-2s}
        .vp-g{animation:vp-fl 4s ease-in-out infinite;transform-origin:12px 12px}
      `}</style>
      <g className="vp-g">
        <path className="vp-b" d="M12 10L4 15L12 20L20 15L12 10Z" stroke="#e45b3d" strokeWidth="1.5"/>
        <path className="vp-t" d="M12 4L4 9L12 14L20 9L12 4Z" stroke="#eceed5" strokeWidth="1.5"/>
      </g>
    </svg>
  );
}

const LINKS = [
  { label: "About",    href: "/pages/about" },
  { label: "Updates", href: "/pages/updates" },
];

const SOCIALS = [
  {
    label: "<3>",
    href: "https://youtu.be/wIz-a0qNDtE?si=_9e2S5EML8bJJa03",
    path: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-moon/[0.08] text-moon">
      <div className="mx-auto max-w-5xl px-6 py-5 flex flex-wrap items-center justify-between gap-4">

        {/* Logo + name */}
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <LogoMark />
          <span className="text-xs font-bold tracking-widest text-moon">VISIONPARK</span>
        </a>

        {/* Links + email + socials */}
        <div className="flex items-center gap-5 flex-wrap">

          {/* Nav links */}
          {LINKS.map(({ label, href }) => (
            <a key={label} href={href} target="_blank" className="text-xs text-moon/45 hover:text-moon transition-colors">
              {label}
            </a>
          ))}

          {/* Email (FIXED: Props moved inside the opening <a> tag) */}
          <a
            href="mailto:hello@visionpark.io"
            className="flex items-center gap-1.5 text-xs text-moon/45 hover:text-moon transition-colors"
          >
            <Mail className="w-3 h-3 text-cherry flex-shrink-0" />
            hello@visionpark.io
          </a>

          {SOCIALS.map(({ label, href, path }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-moon/10 text-moon/40 transition-all hover:border-mustard/40 hover:bg-mustard/[0.07] hover:text-mustard"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d={path} />
              </svg>
            </a>
          ))}

        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-5xl px-6 pb-4 flex flex-wrap items-center justify-between gap-2 border-t border-moon/[0.06] pt-4">
        <span className="text-[11px] text-moon/20">© 2026 VisionPark, Inc.</span>
        <div className="flex gap-4">
          {[
            { label: "Privacy",  href: "/pages/privacy" },
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" className="text-[11px] text-moon/20 hover:text-moon/55 transition-colors">
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}