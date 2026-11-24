import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

function toDataUri(relPath: string): string {
  const buffer = readFileSync(join(process.cwd(), "public", relPath));
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export default function Image() {
  const logo = toDataUri("icon-mark-256.png");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#1a0d0a",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: -120,
            top: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(200,16,46,0.35)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: -120,
            bottom: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(245,197,24,0.18)",
            filter: "blur(40px)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <img src={logo} alt="" width={88} height={75} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 68, fontWeight: 700 }}>
                <span style={{ color: "#f6ece0" }}>OX</span>
                <span style={{ color: "#c8102e", marginLeft: 18 }}>BOWL</span>
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  color: "#c9b8a8",
                  letterSpacing: 10,
                  marginTop: 4,
                }}
              >
                RESTO &amp; GRILL
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 44,
              fontSize: 32,
              color: "#f6ece0",
              fontWeight: 600,
              textAlign: "center",
              maxWidth: 760,
            }}
          >
            Crispy sa Unang Kagat, Sulit Hanggang Huling Subo
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 32,
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                background: "#c8102e",
                color: "#ffffff",
                fontSize: 22,
                fontWeight: 700,
                padding: "12px 26px",
                borderRadius: 999,
              }}
            >
              Order Online
            </div>
            <div
              style={{
                display: "flex",
                color: "#f5c518",
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              Pickup &amp; Delivery
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
