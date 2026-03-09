import { getAllPosts } from "@/lib/blog";
import { BlogGrid } from "@/components/BlogGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | QR Gamified Studio",
  description:
    "Tips, guides, and insights on QR codes — from vCards and WiFi sharing to events and bulk generation.",
  alternates: { canonical: "https://qr.gamified.studio/blog" },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-28 pb-8 px-5 max-w-5xl mx-auto w-full text-center">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground leading-tight mb-3">
          QR Code Guides & Insights
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
          Practical tips on generating, customizing, and using QR codes for everything from contact
          sharing to event check-ins.
        </p>
      </section>

      <BlogGrid posts={posts} postCount={posts.length} />
    </div>
  );
}
