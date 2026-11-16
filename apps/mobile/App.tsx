import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import { BRAND } from "@erp/brand";

/** Écran d'accueil provisoire : les écrans direction et chauffeur viendront ici. */
export default function App() {
  return (
    <View style={styles.container}>
      <View style={[styles.logo, { backgroundColor: BRAND.primaryColor }]} />
      <Text style={styles.title}>{BRAND.name}</Text>
      <Text style={styles.subtitle}>{BRAND.tagline}</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: 24 },
  logo: { width: 56, height: 56, borderRadius: 14, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "700", color: "#0f172a" },
  subtitle: { marginTop: 6, fontSize: 15, color: "#64748b", textAlign: "center" },
});
