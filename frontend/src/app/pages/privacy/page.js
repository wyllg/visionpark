"use client";

const LAST_UPDATED = "May 15, 2025";

const SECTIONS = [
  {
    id: "collect",
    title: "What we collect",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    ),
    content: [
      {
        heading: "Account information",
        text: "When you create an account, we store your email address and a hashed password. We never store plaintext credentials.",
      },
      {
        heading: "Usage data",
        text: "We log basic interaction events (page views, feature usage) to understand how VisionPark is being used. These logs are anonymized and aggregated.",
      },
      {
        heading: "Device & browser info",
        text: "We collect browser type, operating system, and viewport size to diagnose bugs and improve the experience across devices.",
      },
    ],
  },
  {
    id: "use",
    title: "How we use it",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.001 3.001 0 00-.765 1.956v.252a2 2 0 01-2 2h-1a2 2 0 01-2-2v-.252a3 3 0 00-.765-1.956l-.347-.347z" />
    ),
    content: [
      {
        heading: "To run the service",
        text: "Your data lets us authenticate you, remember preferences, and deliver the core functionality of VisionPark.",
      },
      {
        heading: "To improve the product",
        text: "Aggregated, anonymized analytics help us understand which features are useful and where people run into friction.",
      },
      {
        heading: "To contact you",
        text: "We may email you about significant changes to the service or your account. We don't send marketing emails unless you explicitly opt in.",
      },
    ],
  },
  {
    id: "share",
    title: "Who we share it with",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    ),
    content: [
      {
        heading: "We don't sell your data",
        text: "Full stop. Your personal information is never sold, rented, or traded to third parties for marketing or commercial purposes.",
      },
      {
        heading: "Infrastructure providers",
        text: "We use cloud providers (hosting, databases) who process data on our behalf under strict data processing agreements.",
      },
      {
        heading: "Legal requirements",
        text: "We may disclose information if required by law, court order, or to protect the safety of users or the public.",
      },
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
    content: [
      {
        heading: "Access & portability",
        text: "You can request a full export of your data at any time. We'll send it to you in a standard, machine-readable format.",
      },
      {
        heading: "Deletion",
        text: "You can delete your account and all associated data from your settings page. Deletion is permanent and takes effect within 30 days.",
      },
      {
        heading: "Correction",
        text: "If any information we hold about you is inaccurate, you have the right to have it corrected. Contact us and we'll sort it out.",
      },
    ],
  },
];

export default function page() {
  return (
    <div className="min-h-screen px-6 py-20 md:py-32 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-14">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-mustard)] font-mono mb-4">
          Legal
        </p>
        <h1 className="text-5xl md:text-7xl font-bold leading-none tracking-tight text-[var(--color-moon)]">
          Privacy
        </h1>
        <p className="mt-4 text-[var(--color-slate-light)] text-sm">
          Last updated{" "}
          <span className="text-[var(--color-moon-dark)]">{LAST_UPDATED}</span>
        </p>
      </div>

      {/* Intro card */}
      <div className="glass-card p-7 rounded-xl mb-10 border-l-2 border-l-[var(--color-ocean)]">
        <p className="text-[var(--color-moon)] text-base leading-relaxed">
          VisionPark is built on the principle that your data belongs to you. 
          This policy explains plainly what we collect, why, and what you can 
          do about it — without burying anything in legalese.
        </p>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-8">
        {SECTIONS.map((section, i) => (
          <section key={section.id} className="glass-card rounded-xl overflow-hidden">
            {/* Section header */}
            <div className="flex items-center gap-4 px-7 py-5 border-b border-[rgba(255,255,255,0.05)]">
              <div className="w-8 h-8 flex items-center justify-center text-[var(--color-ocean-light)] shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {section.icon}
                </svg>
              </div>
              <h2 className="font-bold text-[var(--color-moon)] text-lg">
                {section.title}
              </h2>
              <span className="ml-auto font-mono text-xs text-[var(--color-slate-light)]">
                0{i + 1}
              </span>
            </div>

            {/* Items */}
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {section.content.map((item) => (
                <div key={item.heading} className="px-7 py-5">
                  <h3 className="text-[var(--color-mustard-light)] text-xs font-bold uppercase tracking-widest mb-2">
                    {item.heading}
                  </h3>
                  <p className="text-[var(--color-moon-dark)] text-sm leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Contact footer */}
      <div className="mt-14 text-center">
        <p className="text-[var(--color-slate-light)] text-sm mb-3">
          Questions about this policy?
        </p>
        <a
          href="mailto:privacy@visionpark.app"
          className="inline-block text-[var(--color-ocean-light)] font-mono text-sm hover:text-[var(--color-moon)] transition-colors underline underline-offset-4"
        >
          privacy@visionpark.app
        </a>
      </div>
    </div>
  );
}