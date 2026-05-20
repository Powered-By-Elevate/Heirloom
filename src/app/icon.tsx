import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 140,
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
