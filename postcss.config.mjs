export const plugins = [
  import("autoprefixer"),
  ...(process.env.NODE_ENV === "production" ? [import("cssnano")] : []),
];
