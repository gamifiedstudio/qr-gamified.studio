import Link from "next/link";
import { cn } from "@/lib/utils";

interface BlogTagProps {
  tag: string;
  className?: string;
}

export function BlogTag({ tag, className }: BlogTagProps) {
  return (
    <Link
      href={`/blog?tag=${encodeURIComponent(tag)}`}
      className={cn(
        "inline-block px-1.5 py-0.5 font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors",
        className,
      )}
    >
      {tag}
    </Link>
  );
}
