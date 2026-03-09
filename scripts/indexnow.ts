/**
 * Submit all site URLs to IndexNow.
 * Run after deploy: bun run indexnow
 *
 * IndexNow notifies Bing, Yandex, and (indirectly) other engines instantly.
 * Google picks it up via Bing's shared IndexNow pool.
 *
 * Docs: https://www.indexnow.org/documentation
 */

import fs from "fs";
import path from "path";

const BASE_URL = "https://qr.gamified.studio";
const KEY = "501b5d6fd657e151255067efc76115c9";
const HOST = "qr.gamified.studio";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

function getBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

function buildUrlList(): string[] {
  const slugs = getBlogSlugs();

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

  // Static pages
  const staticPages = [
    "/vcard/bulk",
    "/docs/mcp",
    "/policies/privacy",
    "/policies/tos",
  ];

  return [
    BASE_URL,
    `${BASE_URL}/blog`,
    ...slugs.map((slug) => `${BASE_URL}/blog/${slug}`),
    ...qrTypes.map((type) => `${BASE_URL}/${type}`),
    ...staticPages.map((page) => `${BASE_URL}${page}`),
  ];
}

async function submit(urls: string[]) {
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: `${BASE_URL}/${KEY}.txt`,
    urlList: urls,
  };

  console.log(`Submitting ${urls.length} URLs to IndexNow...`);

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    console.log(`Done. Status: ${res.status}`);
    console.log("URLs submitted:");
    for (const url of urls) console.log(`  ${url}`);
  } else {
    const text = await res.text();
    console.error(`Failed: ${res.status} ${res.statusText}`);
    console.error(text);
    process.exit(1);
  }
}

const urls = buildUrlList();
await submit(urls);
