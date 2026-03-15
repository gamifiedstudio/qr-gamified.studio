"use client";

import { cn } from "@/lib/utils";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { BlogPostMeta } from "@/lib/blog";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PostCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-background flex flex-col h-full transition-all duration-200 hover:bg-accent/30 hover:shadow-[inset_0_1px_8px_rgba(0,0,0,0.12)]"
    >
      <div className="p-5 flex flex-col gap-3 flex-1 transition-transform duration-200 group-hover:translate-x-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {formatDate(post.date)}
          </span>
          {post.tags.map((t) => (
            <span key={t} className="px-1.5 py-0.5 text-[10px] font-medium border border-border text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
        <h2 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {post.description}
        </p>
      </div>
      <div className="flex items-center justify-between px-5 py-2.5 border-t border-border transition-transform duration-200 group-hover:translate-x-1">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {post.readTime} min
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-primary transition-all duration-200 group-hover:gap-3">
          Read
          <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function BlogGridInner({ posts }: { posts: BlogPostMeta[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [active, setActive] = useState(searchParams.get("tag") ?? "All");

  const allTags = ["All", ...Array.from(new Set(posts.flatMap((p) => p.tags)))];
  const filtered = active === "All" ? posts : posts.filter((p) => p.tags.includes(active));

  function select(tag: string) {
    setActive(tag);
    const url = tag === "All" ? "/blog" : `/blog?tag=${encodeURIComponent(tag)}`;
    router.replace(url, { scroll: false });
  }

  // Build rows of 3 (xl), filling empty slots in the last row
  const rows: (BlogPostMeta | null)[][] = [];
  for (let i = 0; i < filtered.length; i += 3) {
    const row: (BlogPostMeta | null)[] = filtered.slice(i, i + 3);
    while (row.length < 3 && filtered.length > 1) row.push(null);
    rows.push(row);
  }

  return (
    <div className="grid flex-1 min-h-0 lg:grid-cols-[200px_1fr]">

      {/* ── Left: Tag navigation ── */}
      <nav className="border-b border-border lg:border-b-0 lg:border-r border-border shrink-0 lg:overflow-y-auto" aria-label="Blog tags">
        <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible">
          {allTags.map((tag, i) => (
            <button
              key={tag}
              onClick={() => select(tag)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 px-5 py-3 text-left text-sm transition-colors w-full cursor-pointer",
                i !== 0 && "max-lg:border-l lg:border-t border-border",
                active === tag
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <span className="font-medium">{tag}</span>
              {tag !== "All" && (
                <span className="text-xs text-muted-foreground/60 ml-auto hidden lg:inline">
                  {posts.filter((p) => p.tags.includes(tag)).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Right: Post grid ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h1 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            {active === "All" ? "All Articles" : active}
          </h1>
          <span className="text-xs text-muted-foreground/60">
            {filtered.length} {filtered.length === 1 ? "article" : "articles"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm p-6">No posts with this tag yet.</p>
        ) : filtered.length === 1 ? (
          /* Single post — full width, bordered */
          <div className="border-b border-border">
            <PostCard post={filtered[0]} />
          </div>
        ) : (
          /* Multiple posts — grid with rows */
          <div>
            {rows.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className={cn(
                  "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
                  rowIdx > 0 && "border-t border-border",
                )}
              >
                {row.map((post, colIdx) =>
                  post ? (
                    <div
                      key={post.slug}
                      className={cn(
                        colIdx < row.length - 1 && "md:border-r border-border",
                        // on md (2-col), only first gets right border
                        colIdx === 0 && "md:border-r",
                        colIdx === 1 && "md:border-r-0 xl:border-r",
                        // mobile: top border between stacked cards
                        colIdx > 0 && "max-md:border-t border-border",
                      )}
                    >
                      <PostCard post={post} />
                    </div>
                  ) : (
                    <div
                      key={`empty-${colIdx}`}
                      className={cn(
                        "hidden xl:block",
                        colIdx < row.length - 1 && "border-r border-border",
                      )}
                    />
                  ),
                )}
              </div>
            ))}
            {/* Bottom border on the grid */}
            <div className="border-b border-border" />
          </div>
        )}
      </div>
    </div>
  );
}

export function BlogGrid({ posts }: { posts: BlogPostMeta[] }) {
  return (
    <Suspense>
      <BlogGridInner posts={posts} />
    </Suspense>
  );
}
