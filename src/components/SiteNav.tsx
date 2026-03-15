'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, Plug, Copy, Check, ExternalLink, BookOpen } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

function CopySnippet({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="group/copy flex items-center gap-1.5 w-full bg-muted px-3 py-2 text-left font-mono text-xs text-foreground transition-colors hover:bg-accent"
    >
      <span className="flex-1 truncate">{text}</span>
      {copied
        ? <Check className="size-3 shrink-0 text-green-500" />
        : <Copy className="size-3 shrink-0 text-muted-foreground group-hover/copy:text-foreground transition-colors" />}
    </button>
  );
}

function CliPopover() {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-1.5 border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer">
              <Terminal className="size-3" />
              CLI
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Command line tool</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-80">
        <PopoverHeader>
          <PopoverTitle className="flex items-center gap-2">
            <Terminal className="size-3.5 text-muted-foreground" />
            Command Line
          </PopoverTitle>
          <PopoverDescription>Generate QR codes from your terminal</PopoverDescription>
        </PopoverHeader>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Clone and run with Bun:</p>
          <CopySnippet text="bunx github:gamifiedstudio/qr-gamified.studio --help" />
          <p className="text-xs text-muted-foreground">Or run locally:</p>
          <CopySnippet text="bun run src/cli/index.ts --help" />
        </div>
        <div className="border-t border-border pt-2 mt-1">
          <p className="text-[11px] text-muted-foreground">
            Supports vCard, URL, WiFi, email, phone, SMS, events, and more. Use <code className="bg-muted px-1 text-foreground">--help</code> for all options.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function McpPopover() {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-1.5 border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer">
              <Plug className="size-3" />
              MCP
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">AI integration via Model Context Protocol</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-96">
        <PopoverHeader>
          <PopoverTitle className="flex items-center gap-2">
            <Plug className="size-3.5 text-muted-foreground" />
            MCP Server
          </PopoverTitle>
          <PopoverDescription>Connect AI assistants to generate QR codes</PopoverDescription>
        </PopoverHeader>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Add to Claude Desktop or any MCP client:</p>
          <CopySnippet text="https://qr.gamified.studio/mcp" />
          <div className="bg-muted p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
            <span className="text-foreground">{'{'}</span>{'\n'}
            {'  '}<span className="text-foreground">&quot;mcpServers&quot;</span>: {'{'}{'\n'}
            {'    '}<span className="text-foreground">&quot;qr-generator&quot;</span>: {'{'}{'\n'}
            {'      '}<span className="text-foreground">&quot;url&quot;</span>: <span className="text-green-500">&quot;https://qr.gamified.studio/mcp&quot;</span>{'\n'}
            {'    '}{'}'}{'\n'}
            {'  '}{'}'}{'\n'}
            <span className="text-foreground">{'}'}</span>
          </div>
        </div>
        <div className="border-t border-border pt-2 mt-1 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            11 tools &middot; No auth required
          </p>
          <Link
            href="/docs/mcp"
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Full docs
            <ExternalLink className="size-2.5" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const blogActive = pathname === '/blog' || pathname.startsWith('/blog/');

  return (
    <TooltipProvider>
      <nav className="flex items-center gap-2">
        <CliPopover />
        <McpPopover />
        <span className="h-4 w-px bg-border mx-1" aria-hidden="true" />
        <Link
          href="/blog"
          className={`inline-flex items-center gap-1.5 text-sm transition-colors ${
            blogActive
              ? 'text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="size-3.5" />
          Blog
        </Link>
      </nav>
    </TooltipProvider>
  );
}
