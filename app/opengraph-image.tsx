import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Alon — branded client portals for freelancers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Token values from app/globals.css. Satori has no CSS variables, so the
// palette is restated here — keep these in step with the :root block.
const ink = "#10231F";
const paper = "#FAFBF9";
const tide = "#0E6B5C";
const driftline = "#5C6F6B";

// Same path as components/tideline.tsx, so the signature matches the site.
const TIDELINE =
  "M0 6 C 10 1, 20 1, 30 6 S 50 11, 60 6 S 80 1, 90 6 S 110 11, 120 6 S 140 1, 150 6 S 170 11, 180 6 S 200 1, 210 6 S 230 11, 240 6";

export default async function Image() {
  const display = await readFile(
    join(process.cwd(), "assets", "bricolage-grotesque-700.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: paper,
          color: ink,
          padding: "0 96px",
          fontFamily: "Bricolage Grotesque",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, color: tide }}>alon</div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 40,
            fontSize: 76,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          <span>Every client gets a portal.</span>
          <span>You get your evenings back.</span>
        </div>
        <svg
          width="360"
          height="18"
          viewBox="0 0 240 12"
          fill="none"
          preserveAspectRatio="none"
          style={{ marginTop: 36 }}
        >
          <path
            d={TIDELINE}
            stroke={tide}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <div style={{ display: "flex", marginTop: 36, fontSize: 28, color: driftline }}>
          Status, files, messages and payment requests — in your branding.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Bricolage Grotesque",
          data: display,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
