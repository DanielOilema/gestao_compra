import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.com.oilema.protheusconnect",
  appName: "Protheus Connect",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#f8f9fb",
      showSpinner: false,
    },
  },
};

export default config;
