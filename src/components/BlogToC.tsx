"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { TocHeading } from "@/lib/toc";
import { ChevronDown, AlignLeft } from "lucide-react";

interface BlogToCProps {
  headings: TocHeading[];
  variant: "sidebar" | "inline";
}

export function BlogToC({ headings, variant }: BlogToCProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20px 0px -65% 0px", threshold: 0 },
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const links = (
    <ul className="space-y-0.5">
      {headings.map(({ id, text, level }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            onClick={() => variant === "inline" && setIsOpen(false)}
            className={cn(
              "block text-[13px] leading-snug py-1 border-l-2 transition-all duration-150",
              level === 3 ? "pl-4" : "pl-2",
              activeId === id
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
            )}
          >
            <span className="line-clamp-2">{text}</span>
          </a>
        </li>
      ))}
    </ul>
  );

  if (variant === "sidebar") {
    return (
      <nav aria-label="Table of contents" className="max-h-[calc(100vh-8rem)] overflow-y-auto">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          On this page
        </p>
        {links}
      </nav>
    );
  }

  // inline — collapsible accordion
  return (
    <nav
      aria-label="Table of contents"
      className="mb-8 border border-border rounded-xl overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2 text-foreground">
          <AlignLeft className="size-4 text-muted-foreground" />
          On this page
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen && <div className="px-4 py-3 bg-background">{links}</div>}
    </nav>
  );
}
