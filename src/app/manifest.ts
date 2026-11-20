import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tekfinity — Premium Mobile Accessories",
    short_name: "Tekfinity",
    description: "Premium phone cases, chargers, power banks, smartwatches and electronics accessories — Pakistan.",
    start_url: "/",
    display: "standalone",
    background_color: "#090B10",
    theme_color: "#090B10",
    icons: [
      { src: "/techfinity-logo.png", sizes: "2172x724", type: "image/png", purpose: "any" },
    ],
  };
}
