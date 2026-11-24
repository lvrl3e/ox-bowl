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
  const chicken = toDataUri("menu/giant-chicken-leg-quarter.png");
  const pata = toDataUri("menu/crispy-pata.png");

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
            right: -80,
            bottom: -120,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "rgba(245,197,24,0.18)",
            filter: "blur(40px)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 64px",
            width: "58%",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <img src={logo} alt="" width={76} height={65} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 56, fontWeight: 700 }}>
                <span style={{ color: "#f6ece0" }}>OX</span>
                <span style={{ color: "#c8102e", marginLeft: 16 }}>BOWL</span>
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 18,
                  color: "#c9b8a8",
                  letterSpacing: 8,
                  marginTop: 2,
                }}
              >
                RESTO &amp; GRILL
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 40,
              fontSize: 32,
              color: "#f6ece0",
              fontWeight: 600,
              lineHeight: 1.3,
              maxWidth: 560,
            }}
          >
            Crispy sa Unang Kagat, Sulit Hanggang Huling Subo
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              alignItems: "center",
              gap: 14,
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

        <div
          style={{
            display: "flex",
            width: "42%",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              position: "absolute",
              right: 20,
              top: 50,
              width: 320,
              height: 320,
              borderRadius: 24,
              borderTop: "6px solid #c8102e",
              background: "#2c1711",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              padding: 16,
              overflow: "hidden",
            }}
          >
            <img src={chicken} alt="" width={288} height={288} />
          </div>
          <div
            style={{
              display: "flex",
              position: "absolute",
              right: 190,
              bottom: 30,
              width: 260,
              height: 260,
              borderRadius: 24,
              borderTop: "6px solid #f5c518",
              background: "#2c1711",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              padding: 14,
              overflow: "hidden",
            }}
          >
            <img src={pata} alt="" width={232} height={232} />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
