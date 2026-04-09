import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pocket CFO",
    short_name: "Pocket CFO",
    description: "Evidence-native finance source ingest and operator review.",
    display: "standalone",
    background_color: "#0b1020",
    theme_color: "#0b1020",
    start_url: "/",
  };
}
