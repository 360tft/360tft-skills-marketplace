import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const alt = "AI Football - The AI Agent Marketplace for Football";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  const logoData = readFileSync(
    join(process.cwd(), "public", "logo-512.png")
  );
  const base64 = logoData.toString("base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "48px",
          }}
        >
          <img
            src={`data:image/png;base64,${base64}`}
            width={280}
            height={280}
            alt=""
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.1,
              }}
            >
              AI Football
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#16a34a",
                marginTop: 12,
                fontWeight: 500,
              }}
            >
              The AI Agent Marketplace for Football
            </div>
            <div
              style={{
                fontSize: 20,
                color: "#737373",
                marginTop: 16,
              }}
            >
              MCP tools, APIs, and skills for coaches, referees, and scouts
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
