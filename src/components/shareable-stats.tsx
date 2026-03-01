"use client";

import { useRef, useState } from "react";

interface Stats {
  configured: boolean;
  overview: {
    totalKeys: number;
    activeKeys: number;
    uniqueDevelopers: number;
    callsToday: number;
  };
  tierBreakdown: Record<string, number>;
  productBreakdown: Record<string, number>;
  topToolsToday: Record<string, number>;
  dailyUsage: Record<string, number>;
}

interface ShareableStatsProps {
  stats: Stats;
  toolCount: number;
}

const PRODUCT_LABELS: Record<string, string> = {
  all: "All Products",
  footballgpt: "FootballGPT",
  refereegpt: "RefereeGPT",
  cruisegpt: "CruiseGPT",
  coachreflect: "CoachReflect",
  playerreflection: "PlayerReflection",
};

const TIER_COLOURS: Record<string, string> = {
  free: "#737373",
  pro: "#16a34a",
  builder: "#e5a11c",
  scale: "#3b82f6",
  enterprise: "#f59e0b",
  unlimited: "#a855f7",
  developer: "#e5a11c",
};

function getDateLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function get7DayTotal(dailyUsage: Record<string, number>): number {
  return Object.values(dailyUsage).reduce((sum, v) => sum + v, 0);
}

function getProductCount(productBreakdown: Record<string, number>): number {
  return Object.keys(productBreakdown).filter((k) => k !== "all").length;
}

async function downloadCard(element: HTMLElement, filename: string) {
  const { default: html2canvas } = await import("html2canvas-pro");
  const canvas = await html2canvas(element, {
    backgroundColor: "#0a0a0a",
    scale: 2,
    useCORS: true,
  });
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function DownloadButton({
  targetRef,
  filename,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
  filename: string;
}) {
  const [downloading, setDownloading] = useState(false);

  return (
    <button
      onClick={async () => {
        if (!targetRef.current) return;
        setDownloading(true);
        try {
          await downloadCard(targetRef.current, filename);
        } finally {
          setDownloading(false);
        }
      }}
      disabled={downloading}
      className="mt-3 text-xs px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors disabled:opacity-50"
    >
      {downloading ? "Generating..." : "Download PNG"}
    </button>
  );
}

function HeroCard({ stats, toolCount }: ShareableStatsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dateLabel = getDateLabel();
  const calls7d = get7DayTotal(stats.dailyUsage);
  const productCount = getProductCount(stats.productBreakdown);

  const metrics = [
    { value: toolCount, label: "Tools Live" },
    { value: stats.overview.uniqueDevelopers, label: "Developers" },
    { value: calls7d, label: "API Calls", sub: "(7 days)" },
    { value: productCount || 5, label: "Products" },
  ];

  return (
    <div>
      <div
        ref={ref}
        style={{
          width: 1200,
          height: 630,
          backgroundColor: "#0a0a0a",
          border: "1px solid #262626",
          borderRadius: 16,
          padding: 48,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-32.png"
              alt=""
              width={32}
              height={32}
              style={{ borderRadius: 6 }}
            />
            <span
              style={{ color: "#a3a3a3", fontSize: 16, fontWeight: 500 }}
            >
              AI Football by 360TFT
            </span>
          </div>
          <span style={{ color: "#525252", fontSize: 14 }}>{dateLabel}</span>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <h2
            style={{
              color: "#e5e5e5",
              fontSize: 32,
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            AI Football — By the Numbers
          </h2>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
          }}
        >
          {metrics.map((m) => (
            <div
              key={m.label}
              style={{
                backgroundColor: "#141414",
                border: "1px solid #262626",
                borderRadius: 12,
                padding: "28px 40px",
                textAlign: "center",
                minWidth: 200,
              }}
            >
              <div
                style={{
                  color: "#e5a11c",
                  fontSize: 48,
                  fontWeight: 700,
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {m.value.toLocaleString()}
              </div>
              <div style={{ color: "#a3a3a3", fontSize: 14 }}>
                {m.label}
              </div>
              {m.sub && (
                <div style={{ color: "#525252", fontSize: 12, marginTop: 2 }}>
                  {m.sub}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "right" }}>
          <span style={{ color: "#525252", fontSize: 13 }}>
            aifootball.co/developer
          </span>
        </div>
      </div>
      <DownloadButton targetRef={ref} filename="ai-football-hero-stats.png" />
    </div>
  );
}

function BreakdownCard({ stats, toolCount }: ShareableStatsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dateLabel = getDateLabel();

  const productEntries = Object.entries(stats.productBreakdown)
    .filter(([k]) => k !== "all")
    .sort((a, b) => b[1] - a[1]);
  const productMax = Math.max(...productEntries.map(([, v]) => v), 1);

  const tierEntries = Object.entries(stats.tierBreakdown).sort(
    (a, b) => b[1] - a[1]
  );
  const tierMax = Math.max(...tierEntries.map(([, v]) => v), 1);

  const topTools = Object.entries(stats.topToolsToday)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Suppress unused var lint — toolCount reserved for future use on this card
  void toolCount;

  return (
    <div>
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1080,
          backgroundColor: "#0a0a0a",
          border: "1px solid #262626",
          borderRadius: 16,
          padding: 48,
          display: "flex",
          flexDirection: "column",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-32.png"
            alt=""
            width={32}
            height={32}
            style={{ borderRadius: 6 }}
          />
          <span style={{ color: "#a3a3a3", fontSize: 16, fontWeight: 500 }}>
            AI Football by 360TFT
          </span>
        </div>

        {/* Title */}
        <h2
          style={{
            color: "#e5e5e5",
            fontSize: 28,
            fontWeight: 700,
            margin: "0 0 28px 0",
            letterSpacing: "-0.02em",
          }}
        >
          Platform Breakdown
        </h2>

        {/* By Product */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              color: "#525252",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            By Product
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {productEntries.map(([key, val]) => (
              <div key={key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: "#a3a3a3", fontSize: 14 }}>
                    {PRODUCT_LABELS[key] || key}
                  </span>
                  <span
                    style={{ color: "#e5e5e5", fontSize: 14, fontWeight: 600 }}
                  >
                    {val}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    backgroundColor: "#1a1a1a",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(val / productMax) * 100}%`,
                      backgroundColor: "#e5a11c",
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Tier */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              color: "#525252",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            By Tier
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tierEntries.map(([key, val]) => (
              <div key={key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: "#a3a3a3", fontSize: 14 }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <span
                    style={{ color: "#e5e5e5", fontSize: 14, fontWeight: 600 }}
                  >
                    {val}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    backgroundColor: "#1a1a1a",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(val / tierMax) * 100}%`,
                      backgroundColor: TIER_COLOURS[key] || "#e5a11c",
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tools Today */}
        {topTools.length > 0 && (
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: "#525252",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 12,
              }}
            >
              Top Tools Today
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              {topTools.map(([name, count], i) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      color: "#e5a11c",
                      fontSize: 14,
                      fontWeight: 700,
                      minWidth: 20,
                    }}
                  >
                    {i + 1}.
                  </span>
                  <span style={{ color: "#d4d4d4", fontSize: 14, flex: 1 }}>
                    {name}
                  </span>
                  <span
                    style={{
                      color: "#a3a3a3",
                      fontSize: 14,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "auto", paddingTop: 24 }}>
          <div style={{ color: "#525252", fontSize: 13, marginBottom: 4 }}>
            {dateLabel}
          </div>
          <div style={{ color: "#404040", fontSize: 12 }}>
            aifootball.co/developer
          </div>
        </div>
      </div>
      <DownloadButton
        targetRef={ref}
        filename="ai-football-breakdown-stats.png"
      />
    </div>
  );
}

export function ShareableStats({ stats, toolCount }: ShareableStatsProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">
        Shareable Stats
      </h2>
      <p className="text-xs text-[var(--muted-foreground)] mb-6">
        Screenshot or download these cards for social media
      </p>

      <div className="space-y-8">
        {/* Hero Card — 1200x630 landscape */}
        <div>
          <p className="text-xs text-[var(--muted)] mb-2">
            Hero Card (1200 x 630 — Twitter / LinkedIn)
          </p>
          <div className="overflow-x-auto">
            <HeroCard stats={stats} toolCount={toolCount} />
          </div>
        </div>

        {/* Breakdown Card — 1080x1080 square */}
        <div>
          <p className="text-xs text-[var(--muted)] mb-2">
            Breakdown Card (1080 x 1080 — Instagram / Twitter)
          </p>
          <div className="overflow-x-auto">
            <BreakdownCard stats={stats} toolCount={toolCount} />
          </div>
        </div>
      </div>
    </div>
  );
}
