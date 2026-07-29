import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

export default function AccessibilityScreen({ settings, onChange }) {
  const rows = [
    { key: "largerText", label: "Larger text" },
    { key: "highContrast", label: "High contrast mode" },
    { key: "voiceReadout", label: "Read alerts aloud" },
    { key: "neighborReminders", label: "Check-on-neighbor reminders" },
  ];

  return (
    <View style={styles.container} testID="accessibility-screen">
      <Text style={styles.title}>Accessibility</Text>
      {rows.map((row) => (
        <View style={styles.row} key={row.key} testID={`setting-row-${row.key}`}>
          <Text style={styles.rowLabel}>{row.label}</Text>
          <Switch
            value={!!settings[row.key]}
            onValueChange={(val) => onChange(row.key, val)}
            testID={`setting-switch-${row.key}`}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFFFFF" },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 16, color: "#111111" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#D3D1C7",
  },
  rowLabel: { fontSize: 14, color: "#111111" },
});
