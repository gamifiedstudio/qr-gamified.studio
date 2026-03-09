import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://qr.gamified.studio";
  const posts = getAllPosts();

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedDate ?? post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const mostRecentPostDate = posts[0]
    ? new Date(posts[0].updatedDate ?? posts[0].date)
    : new Date();

  // QR type pages
  const qrTypes = [
    "url",
    "vcard",
    "wifi",
    "email",
    "phone",
    "sms",
    "event",
    "mecard",
    "text",
    "x-profile",
  ];

  const qrTypeEntries: MetadataRoute.Sitemap = qrTypes.map((type) => ({
    url: `${baseUrl}/${type}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/vcard/bulk`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/docs/mcp`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/policies/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/policies/tos`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: mostRecentPostDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...blogEntries,
    ...qrTypeEntries,
    ...staticPages,
  ];
}
