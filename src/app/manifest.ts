import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Heirloom — Family Cookbook",
    short_name: "Heirloom",
    description:
      "A shared digital cookbook where families preserve, organize, and pass down recipes.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAF6EF",
    theme_color: "#C66B3D",
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
