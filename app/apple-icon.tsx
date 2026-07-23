import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same crest as app/icon.tsx, scaled up — more pixels here, so the stroke
// can carry a touch more presence without losing legibility.
const tide = "#0E6B5C";
const paper = "#FAFBF9";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: paper,
        }}
      >
        <svg width="108" height="108" viewBox="0 0 32 32" fill="none">
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
