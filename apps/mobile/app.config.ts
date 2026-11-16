import type { ExpoConfig } from "expo/config";

// Nom, identifiant et couleurs viennent du paquet partagé : on renomme l'app à un seul endroit.
import brand from "@erp/brand/brand.json";

const config: ExpoConfig = {
  name: brand.name,
  slug: brand.slug,
  scheme: brand.scheme,
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  ios: {
    bundleIdentifier: brand.appId,
    supportsTablet: true,
  },
  android: {
    package: brand.appId,
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
};

export default config;
