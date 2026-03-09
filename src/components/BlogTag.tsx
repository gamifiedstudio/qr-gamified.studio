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
        "inline-block px-2.5 py-0.5 font-medium rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors",
        className,
      )}
    >
      {tag}
    </Link>
  );
}
