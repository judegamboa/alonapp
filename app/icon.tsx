import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Token values from app/globals.css (satori has no CSS variables). One
// simplified crest of the tideline (components/tideline.tsx) — the full
// 8-bump wave collapses to mush at favicon sizes, so this keeps only the
// single curve that survives 16px.
const tide = "#0E6B5C";
const paper = "#FAFBF9";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: paper,
          borderRadius: 7,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M4 19 C 9 11, 16 11, 16 19 S 23 27, 28 19"
            stroke={tide}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
