import type { MetadataRoute } from "next";

const site =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site}/`, lastModified: now, changeFrequency: "monthly" },
    { url: `${site}/login`, lastModified: now, changeFrequency: "yearly" },
    { url: `${site}/signup`, lastModified: now, changeFrequency: "yearly" },
    { url: `${site}/privacy`, lastModified: now, changeFrequency: "yearly" },
    { url: `${site}/terms`, lastModified: now, changeFrequency: "yearly" },
  ];
}
