import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#C48A4A",
          color: "#FFFCF5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          fontSize: 130,
          fontWeight: 500,
          letterSpacing: "-0.02em",
        }}
      >
        T
      </div>
    ),
    { ...size },
  );
}
