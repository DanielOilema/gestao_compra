import type { CSSProperties } from "react";

/**
 * Desktop sidebar uses the same tokens as the top bar (`bg-secondary`).
 * Applied only on the desktop sidebar so the mobile sheet keeps its current palette.
 */
export const desktopSidebarTheme = {
  "--sidebar-background": "201 17% 33%",
  "--sidebar-foreground": "0 0% 100%",
  "--sidebar-accent": "201 17% 40%",
  "--sidebar-accent-foreground": "0 0% 100%",
  "--sidebar-border": "201 17% 26%",
  "--sidebar-primary": "28 92% 54%",
  "--sidebar-primary-foreground": "0 0% 100%",
  "--sidebar-ring": "28 92% 54%",
} as CSSProperties;
