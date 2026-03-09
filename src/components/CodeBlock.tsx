"use client";

import { useState, useRef } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    const text = preRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6">
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "absolute top-2.5 right-2.5 z-10 p-1.5 rounded-md border transition-colors cursor-pointer",
          copied
            ? "bg-green-500/10 border-green-500/30 text-green-500"
            : "bg-muted border-border text-muted-foreground hover:text-foreground",
        )}
        aria-label={copied ? "Copied" : "Copy code"}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
      <pre
        ref={preRef}
        className={cn(
          "overflow-x-auto rounded-xl border border-border p-4 text-sm leading-relaxed",
          "[&>code]:bg-transparent [&>code]:p-0 [&>code]:rounded-none",
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
