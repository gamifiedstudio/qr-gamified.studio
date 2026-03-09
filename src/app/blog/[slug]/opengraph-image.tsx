import { ImageResponse } from "next/og";
import { getAllPosts, getPost } from "@/lib/blog";

export const alt = "QR Gamified Studio — Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  const title = post?.title ?? "QR Gamified Studio Insights";
  const tags = post?.tags ?? [];
  const accent = "#e5e5e5";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0f0f0f",
        position: "relative",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Accent left bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 5,
          height: "100%",
          background: `linear-gradient(180deg, ${accent}, #888888)`,
          opacity: 0.4,
        }}
      />

      {/* Decorative corner circles */}
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -60,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "#1a1a1a",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -40,
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "#1a1a1a",
          opacity: 0.4,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "56px 72px",
        }}
      >
        {/* Brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                color: "#e5e5e5",
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase" as const,
                opacity: 0.6,
              }}
            >
              QR Gamified Studio
            </span>
            <span style={{ color: "#555555", fontSize: 17, fontWeight: 700 }}>·</span>
            <span
              style={{
                color: accent,
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                opacity: 0.5,
              }}
            >
              Blog
            </span>
          </div>
        </div>

        {/* Tag badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {tags.map((t) => (
            <div
              key={t}
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#e5e5e5",
                padding: "7px 18px",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {t}
            </div>
          ))}
        </div>

        {/* Title */}
        <div
          style={{
            color: "#f5f5f5",
            fontSize: title.length > 60 ? 44 : 50,
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: 920,
            marginBottom: 40,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: accent,
                opacity: 0.5,
              }}
            />
            <span style={{ color: "#e5e5e5", fontSize: 16, opacity: 0.4 }}>
              Free QR Code Generator
            </span>
          </div>
          <span style={{ color: "#555555", fontSize: 16, letterSpacing: "0.05em" }}>
            qr.gamified.studio/blog
          </span>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
