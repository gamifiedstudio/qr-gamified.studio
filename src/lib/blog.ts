import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  updatedDate?: string;
  author?: string;
  tags: string[];
  readTime: number;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
  wordCount: number;
}

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        title: data.title ?? "",
        description: data.description ?? "",
        date: data.date ?? "",
        updatedDate: data.updatedDate ?? undefined,
        author: data.author ?? undefined,
        tags: data.tags ?? [],
        readTime: data.readTime ?? 6,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    date: data.date ?? "",
    updatedDate: data.updatedDate ?? undefined,
    author: data.author ?? undefined,
    tags: data.tags ?? [],
    readTime: data.readTime ?? 6,
    content,
    wordCount: content.split(/\s+/).filter(Boolean).length,
  };
}
