import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "From Our Table — Family Cookbook",
    short_name: "From Our Table",
    description:
      "A shared cookbook for the recipes your family loves — passed between friends, family, and generations.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8F4EC",
    theme_color: "#C48A4A",
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png", purpose: "any" },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
