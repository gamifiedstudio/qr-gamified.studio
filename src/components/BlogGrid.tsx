"use client";

import { BlogTag } from "@/components/BlogTag";
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

function BlogGridInner({ posts, postCount }: { posts: BlogPostMeta[]; postCount: number }) {
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

  return (
    <>
      {/* Tag filter pills */}
      <section className="px-5 max-w-5xl mx-auto w-full mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => select(tag)}
                className={cn(
                  "px-3 py-1 text-xs font-medium border rounded-full transition-colors cursor-pointer",
                  active === tag
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
          <span className="text-xs font-medium text-muted-foreground/60 shrink-0">
            {postCount} {postCount === 1 ? "article" : "articles"}
          </span>
        </div>
      </section>

      {/* Posts grid */}
      <section className="px-5 max-w-5xl mx-auto w-full pb-24 flex-1 min-h-[60vh]">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground">No posts with this tag yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:border-secondary hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              >
                <div className="p-6 flex flex-col gap-4 flex-1">
                  {/* Tags + date */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {post.tags.map((t) => (
                        <BlogTag key={t} tag={t} className="text-[11px]" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(post.date)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-base font-semibold text-card-foreground leading-snug group-hover:text-primary transition-colors line-clamp-3">
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                    {post.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-border">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {post.readTime} min read
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                    <span className="group-hover:-translate-x-1 transition-transform">
                      Read more
                    </span>
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export function BlogGrid({ posts, postCount }: { posts: BlogPostMeta[]; postCount: number }) {
  return (
    <Suspense>
      <BlogGridInner posts={posts} postCount={postCount} />
    </Suspense>
  );
}
