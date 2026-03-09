import React from "react";
import { cn } from "@/lib/utils";
import { getPost, getAllPosts } from "@/lib/blog";
import { extractHeadings, slugify } from "@/lib/toc";
import { BlogToC } from "@/components/BlogToC";
import { BlogTag } from "@/components/BlogTag";
import { CodeBlock } from "@/components/CodeBlock";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";
import { notFound } from "next/navigation";
import { Clock, Calendar, Tag, ChevronsRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

const BASE_URL = "https://qr.gamified.studio";
const AUTHOR_NAME = "So";
const AUTHOR_URL = "https://github.com/Sokanon";
const SITE_NAME = "QR Gamified Studio";

// ─── Static generation ──────────────────────────────────────────────────────

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const ogImageUrl = `${BASE_URL}/blog/${slug}/opengraph-image`;

  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.description,
    authors: [{ name: post.author ?? AUTHOR_NAME, url: AUTHOR_URL }],
    alternates: { canonical: `${BASE_URL}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updatedDate ?? post.date,
      authors: [AUTHOR_URL],
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [{ url: ogImageUrl, alt: post.title }],
    },
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function nodeToText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(nodeToText).join("");
  if (React.isValidElement(children)) {
    return nodeToText((children.props as { children?: React.ReactNode }).children);
  }
  return "";
}

// ─── rehype-pretty-code config ──────────────────────────────────────────────

const prettyCodeOptions: PrettyCodeOptions = {
  theme: { dark: "github-dark", light: "github-light" },
  keepBackground: false,
};

// ─── MDX components ─────────────────────────────────────────────────────────

const mdxComponents = {
  // ── Headings (auto-generate IDs for ToC linking) ──────────────────────────
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(nodeToText(children));
    return (
      <h2
        id={id}
        className="text-2xl font-semibold text-foreground mb-3 leading-snug scroll-mt-24 mt-10"
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(nodeToText(children));
    return (
      <h3
        id={id}
        className="text-lg font-semibold text-foreground mt-7 mb-2 leading-snug scroll-mt-24"
        {...props}
      >
        {children}
      </h3>
    );
  },

  // ── Text ──────────────────────────────────────────────────────────────────
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-foreground leading-[1.75] mb-4 text-[15px]" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc ml-6 mb-4 space-y-1.5 text-[15px]" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal ml-6 mb-4 space-y-1.5 text-[15px]" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-foreground leading-[1.7]" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-foreground" {...props}>
      {children}
    </strong>
  ),

  // ── Links (external opens in new tab) ─────────────────────────────────────
  a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = href && (href.startsWith("http") || href.startsWith("//"));
    return (
      <a
        href={href}
        className="text-primary underline underline-offset-2 hover:text-muted-foreground transition-colors"
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },

  // ── Blockquote ────────────────────────────────────────────────────────────
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className="border-l-4 border-primary bg-primary/5 pl-4 pr-3 py-3 my-5 rounded-r-lg italic text-muted-foreground text-[15px]"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // ── Tables ────────────────────────────────────────────────────────────────
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-6 rounded-xl border border-border">
      <table className="w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-primary text-primary-foreground" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider first:rounded-tl-xl last:rounded-tr-xl"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="px-4 py-3 border-b border-border text-foreground text-[13px] leading-relaxed"
      {...props}
    >
      {children}
    </td>
  ),
  tr: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="even:bg-muted/30 hover:bg-muted/50 transition-colors" {...props}>
      {children}
    </tr>
  ),

  // ── Code blocks ───────────────────────────────────────────────────────────
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <CodeBlock {...props}>{children}</CodeBlock>
  ),
  code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    // Fenced code blocks (inside <pre>) — has a language class from rehype-pretty-code
    if (className?.startsWith("language-")) {
      return (
        <code className={cn("font-mono text-[13px]", className)} {...props}>
          {children}
        </code>
      );
    }
    // Inline code
    return (
      <code
        className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[13px]"
        {...props}
      >
        {children}
      </code>
    );
  },

  // ── Horizontal rule ───────────────────────────────────────────────────────
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="border-border my-8" {...props} />
  ),
};

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const related = allPosts
    .filter((p) => p.slug !== slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 2);
  const headings = extractHeadings(post.content);

  const authorName = post.author ?? AUTHOR_NAME;
  const ogImageUrl = `${BASE_URL}/blog/${slug}/opengraph-image`;

  // ── JSON-LD schemas ─────────────────────────────────────────────────────

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${BASE_URL}/blog/${slug}` },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updatedDate ?? post.date,
    image: { "@type": "ImageObject", url: ogImageUrl, width: 1200, height: 630 },
    url: `${BASE_URL}/blog/${slug}`,
    inLanguage: "en",
    keywords: post.tags.join(", "),
    wordCount: post.wordCount,
    articleSection: post.tags[0] ?? "Blog",
    author: {
      "@type": "Person",
      name: authorName,
      url: AUTHOR_URL,
      sameAs: AUTHOR_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/favicon.svg`,
      },
    },
  };

  // Pattern 1: ## heading + **Quick answer:**
  const faqQAMatches = [...post.content.matchAll(/^##\s+(.+)\n+\*\*Quick answer:\*\*\s+(.+)/gm)];
  const faqQAItems = faqQAMatches.map(([, question, answer]) => ({
    "@type": "Question" as const,
    name: question.trim(),
    acceptedAnswer: { "@type": "Answer" as const, text: answer.trim() },
  }));

  // Pattern 2: ### Q: question + answer text
  const faqQMatches = [
    ...post.content.matchAll(/###\s+Q:\s+(.+)\n+([\s\S]+?)(?=\n###|\n##|$)/g),
  ];
  const faqQItems = faqQMatches.map(([, question, answer]) => ({
    "@type": "Question" as const,
    name: question.trim(),
    acceptedAnswer: {
      "@type": "Answer" as const,
      text: answer.replace(/\*\*/g, "").trim().slice(0, 500),
    },
  }));

  const allFaqItems = [...faqQAItems, ...faqQItems];
  const faqSchema =
    allFaqItems.length > 0
      ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: allFaqItems }
      : null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <main className="pt-28 pb-16 px-5 w-full flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Article header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {post.readTime} min read
              </span>
              {post.tags.slice(0, 3).map((tag) => (
                <BlogTag key={tag} tag={tag} className="text-xs" />
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold text-foreground leading-tight mb-4 max-w-3xl">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {post.description}
            </p>
          </div>

          {/* Divider */}
          <div className="mb-10 h-px bg-border" />

          {/* 3-col layout: [ToC — xl+] | [article] | [sidebar — lg+] */}
          <div className="flex gap-10 items-start">
            {/* Left ToC — xl+ */}
            <aside className="hidden xl:block w-48 shrink-0 sticky top-28 self-start">
              <BlogToC headings={headings} variant="sidebar" />
            </aside>

            {/* Main article */}
            <article className="min-w-0 flex-1">
              {/* Inline collapsible ToC — mobile & tablet */}
              <div className="xl:hidden">
                <BlogToC headings={headings} variant="inline" />
              </div>

              <MDXRemote
                source={post.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
                  },
                }}
              />
            </article>

            {/* Right sidebar — lg+ */}
            <aside className="hidden lg:flex flex-col gap-3 w-64 shrink-0 sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
              {post.tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Tag className="size-3" />
                    Topics
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <BlogTag key={tag} tag={tag} className="text-xs" />
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-16">
              <div className="h-px bg-border mb-8" />
              <h2 className="text-xl font-semibold text-foreground mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {related.map((rp) => (
                  <Link
                    key={rp.slug}
                    href={`/blog/${rp.slug}`}
                    className="group bg-card border border-border rounded-2xl p-5 hover:border-muted-foreground/40 hover:shadow-md transition-all"
                  >
                    <h3 className="text-sm font-semibold text-card-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-3">
                      {rp.title}
                    </h3>
                    <span className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                      Read article
                      <ChevronsRight className="size-3" strokeWidth={2.5} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
