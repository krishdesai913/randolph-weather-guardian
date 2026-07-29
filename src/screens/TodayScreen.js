import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { summarizeToday } from "../lib/plainLanguage";

export default function TodayScreen({ conditions, forecast, hazardResults, textScale = 1 }) {
  const dangerCount = hazardResults.filter((h) => h.risk === "danger").length;
  const summary = summarizeToday({
    tempF: conditions?.tempF,
    condition: conditions?.condition,
    activeAlertCount: dangerCount,
  });

  return (
    <ScrollView style={styles.container} testID="today-screen">
      <Text style={[styles.location, { fontSize: 13 * textScale }]}>Randolph, NJ</Text>
      <Text style={[styles.temp, { fontSize: 40 * textScale }]} testID="today-temp">
        {conditions?.tempF != null ? `${Math.round(conditions.tempF)}\u00B0F` : "--"}
      </Text>
      <Text style={[styles.summary, { fontSize: 15 * textScale }]} testID="today-summary">
        {summary}
      </Text>

      <View
        style={[styles.banner, dangerCount > 0 ? styles.bannerDanger : styles.bannerSuccess]}
        testID="hazard-status-banner"
      >
        <Text style={dangerCount > 0 ? styles.bannerTextDanger : styles.bannerTextSuccess}>
          {dangerCount > 0
            ? `${dangerCount} hazard spot${dangerCount > 1 ? "s" : ""} flagged right now`
            : "All known hazard spots clear"}
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Next few days</Text>
      <View style={styles.forecastRow}>
        {(forecast || []).slice(0, 3).map((day, i) => (
          <View key={i} style={styles.forecastDay} testID={`forecast-day-${i}`}>
            <Text style={styles.forecastDayLabel}>{day.time}</Text>
            <Text style={styles.forecastTemp}>{Math.round(day.tempF)}\u00B0</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFFFFF" },
  location: { color: "#5F5E5A", marginBottom: 4 },
  temp: { fontWeight: "600", color: "#111111" },
  summary: { color: "#5F5E5A", marginBottom: 20 },
  banner: { borderRadius: 8, padding: 12, marginBottom: 16 },
  bannerSuccess: { backgroundColor: "#EAF3DE" },
  bannerDanger: { backgroundColor: "#FCEBEB" },
  bannerTextSuccess: { color: "#27500A", fontWeight: "600", fontSize: 13 },
  bannerTextDanger: { color: "#791F1F", fontWeight: "600", fontSize: 13 },
  sectionLabel: { fontSize: 13, color: "#888780", marginBottom: 8 },
  forecastRow: { flexDirection: "row", justifyContent: "space-between" },
  forecastDay: { alignItems: "center" },
  forecastDayLabel: { fontSize: 13, color: "#5F5E5A", marginBottom: 4 },
  forecastTemp: { fontSize: 13, color: "#111111" },
});
