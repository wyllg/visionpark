"use client";

import { useState } from "react";


const UPDATES = [
  {
    id: 1,
    date: "2025-05-15",
    version: "v0.4.0",
    tag: "feature",
    title: "Dashboard overhaul",
    body: "Rebuilt the main dashboard with a new glass-card layout, improved data density, and a fully responsive sidebar. Navigation now collapses gracefully on mobile.",
  },
  {
    id: 2,
    date: "2025-05-08",
    version: "v0.3.2",
    tag: "fix",
    title: "Scrollbar flicker on table load",
    body: "Fixed a flash-of-unstyled-scrollbar issue that appeared on first render in Safari and Firefox. Custom scrollbar styles are now applied reliably across all browsers.",
  },
  {
    id: 3,
    date: "2025-04-28",
    version: "v0.3.0",
    tag: "design",
    title: "New color system + noise texture",
    body: "Introduced the full VisionPark design token set — vinyl, slate, mustard, ocean, cherry, moon. Added a subtle noise SVG overlay to all backgrounds for depth.",
  },
  {
    id: 4,
    date: "2025-04-10",
    version: "v0.2.1",
    tag: "infra",
    title: "Edge runtime migration",
    body: "Moved all API routes to Next.js Edge Runtime. Cold starts dropped by ~70%. Deployed to Vercel's global edge network for lower latency worldwide.",
  },
  {
    id: 5,
    date: "2025-03-22",
    version: "v0.2.0",
    tag: "feature",
    title: "Status badges + activity feed",
    body: "Added glowing status badges (active, pending, exited) to entity cards. Introduced a live activity feed panel with real-time polling every 30 seconds.",
  },
  {
    id: 6,
    date: "2025-03-01",
    version: "v0.1.0",
    tag: "infra",
    title: "Initial creation",
    body: "VisionPark is initialized. Core pages, auth flow, and the first version of the data table are up. Everything is a work in progress — that's the point.",
  },
];

const TAG_STYLES = {
  feature: "bg-[rgba(62,120,123,0.2)] text-[var(--color-ocean-light)] border-[var(--color-ocean)]",
  fix:     "bg-[rgba(228,91,61,0.15)] text-[var(--color-cherry-light)] border-[var(--color-cherry)]",
  infra:   "bg-[rgba(41,43,43,0.5)] text-[var(--color-moon-dark)] border-[var(--color-slate-light)]",
  design:  "bg-[rgba(229,135,59,0.15)] text-[var(--color-mustard-light)] border-[var(--color-mustard)]",
};

const ALL_TAGS = ["all", "feature", "fix", "design", "infra"];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default function page() {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const visible = filter === "all"
    ? UPDATES
    : UPDATES.filter((u) => u.tag === filter);

  return (
    <div className="min-h-screen px-6 py-20 md:py-32 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-mustard)] font-mono mb-4">
          Changelog
        </p>
        <h1 className="text-5xl md:text-7xl font-bold leading-none tracking-tight text-[var(--color-moon)]">
          Updates
        </h1>
        <p className="mt-4 text-[var(--color-slate-light)] text-sm max-w-md">
          What's shipping, what's fixed, what's next. Updated as things land.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        {ALL_TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all duration-200 ${
              filter === t
                ? "bg-[var(--color-moon)] text-[var(--color-vinyl)] border-[var(--color-moon)]"
                : "bg-transparent text-[var(--color-slate-light)] border-[var(--color-slate)] hover:border-[var(--color-slate-light)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--color-slate)] hidden md:block" />

        <div className="flex flex-col gap-6">
          {visible.map((u) => (
            <div key={u.id} className="md:pl-8 relative">
              {/* Dot */}
              <div className="absolute left-0 top-5 w-3.5 h-3.5 rounded-full border-2 border-[var(--color-ocean)] bg-[var(--color-vinyl)] hidden md:block" />

              <div
                className="glass-card rounded-xl p-6 cursor-pointer hover:border-[rgba(103,175,178,0.3)] transition-all duration-200"
                onClick={() => setExpanded(expanded === u.id ? null : u.id)}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    {u.version && (
                      <span className="font-mono text-xs text-[var(--color-slate-light)]">
                        {u.version}
                      </span>
                    )}
                    <span
                      className={`badge border text-[10px] py-0.5 px-2.5 rounded-full uppercase tracking-widest font-bold ${TAG_STYLES[u.tag]}`}
                    >
                      {u.tag}
                    </span>
                  </div>
                  <time className="text-[var(--color-slate-light)] text-xs font-mono">
                    {formatDate(u.date)}
                  </time>
                </div>

                <h3 className="text-[var(--color-moon)] font-bold text-lg leading-snug mb-1">
                  {u.title}
                </h3>

                {/* Expandable body */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    expanded === u.id ? "max-h-40 mt-3" : "max-h-0"
                  }`}
                >
                  <p className="text-[var(--color-moon-dark)] text-sm leading-relaxed">
                    {u.body}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[var(--color-slate-light)] text-xs">
                  <span>{expanded === u.id ? "Less" : "Details"}</span>
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${expanded === u.id ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="text-[var(--color-slate-light)] text-sm text-center py-16">
            Nothing here yet.
          </p>
        )}
      </div>
    </div>
  );
}