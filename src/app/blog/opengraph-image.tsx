import { ImageResponse } from "next/og";

export const alt = "QR Gamified Studio Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
          backgroundSize: "40px 40px",
        }}
      />

      {/* Inner card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#161616",
          borderRadius: 32,
          padding: "48px 72px",
          width: 1060,
          height: 510,
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Dot grid inside card */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Brand name */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                color: "#e5e5e5",
                fontSize: 18,
                fontWeight: 500,
                letterSpacing: "0.15em",
                textTransform: "uppercase" as const,
                opacity: 0.7,
              }}
            >
              QR Gamified Studio
            </span>
            <span style={{ color: "#555555", fontSize: 18 }}>·</span>
            <span
              style={{
                color: "#e5e5e5",
                fontSize: 18,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                opacity: 0.5,
              }}
            >
              Blog
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              color: "#f5f5f5",
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.15,
              textAlign: "center" as const,
              maxWidth: 800,
              letterSpacing: "-0.01em",
            }}
          >
            QR Code Guides & Insights
          </div>

          {/* Tagline */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#e5e5e5",
              }}
            />
            <span style={{ color: "#e5e5e5", fontSize: 16, opacity: 0.4 }}>
              qr.gamified.studio
            </span>
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
