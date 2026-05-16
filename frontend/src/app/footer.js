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
  { label: "About",    href: "/about" },
  { label: "Updates", href: "/updates" },
];

const SOCIALS = [
  {
    label: "X",
    href: "https://x.com/visionpark",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.741-8.855L2.25 2.25h6.865l4.26 5.632 4.869-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "GitHub",
    href: "https://github.com/visionpark",
    path: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z",
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
            { label: "Privacy",  href: "/privacy" },
            { label: "Terms",    href: "/terms" },
            { label: "Security", href: "/security" },
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