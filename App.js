import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";

import hazards from "./src/data/hazards.json";
import { evaluateAllHazards } from "./src/lib/hazardEngine";
import { fetchCurrentConditions, fetchForecast, fetchActiveNwsFloodZones } from "./src/lib/weatherApi";

import TodayScreen from "./src/screens/TodayScreen";
import HazardMapScreen from "./src/screens/HazardMapScreen";
import AccessibilityScreen from "./src/screens/AccessibilityScreen";

// Approximate town-center coordinates for Randolph, NJ.
const RANDOLPH_LAT = 40.8462;
const RANDOLPH_LNG = -74.5827;

const TABS = [
  { key: "today", label: "Today" },
  { key: "map", label: "Hazard map" },
  { key: "settings", label: "Accessibility" },
];

export default function App() {
  const [tab, setTab] = useState("today");
  const [conditions, setConditions] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [activeFloodZones, setActiveFloodZones] = useState([]);
  const [settings, setSettings] = useState({
    largerText: false,
    highContrast: false,
    voiceReadout: true,
    neighborReminders: true,
  });

  const apiKey = process.env.OPENWEATHER_API_KEY;

  const loadData = useCallback(async () => {
    try {
      const [c, f, zones] = await Promise.all([
        fetchCurrentConditions(RANDOLPH_LAT, RANDOLPH_LNG, apiKey),
        fetchForecast(RANDOLPH_LAT, RANDOLPH_LNG, apiKey),
        fetchActiveNwsFloodZones(["NJZ014"]),
      ]);
      setConditions(c);
      setForecast(f);
      setActiveFloodZones(zones);
    } catch (err) {
      // Network/API failures shouldn't crash the app - surface a clear state instead.
      console.warn("Failed to load weather data:", err.message);
    }
  }, [apiKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hazardResults = evaluateAllHazards(
    hazards,
    {
      rainfallRateInPerHr: conditions?.rainfallRateInPerHr ?? 0,
      tempF: conditions?.tempF,
      isPrecipitating: conditions?.isPrecipitating ?? false,
      activeNwsFloodZones: activeFloodZones,
    },
    "summer"
  );

  const textScale = settings.largerText ? 1.25 : 1;

  function handleSettingChange(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} testID={`tab-${t.key}`}>
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "today" && (
        <TodayScreen
          conditions={conditions}
          forecast={forecast}
          hazardResults={hazardResults}
          textScale={textScale}
        />
      )}
      {tab === "map" && <HazardMapScreen hazardResults={hazardResults} />}
      {tab === "settings" && (
        <AccessibilityScreen settings={settings} onChange={handleSettingChange} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#D3D1C7",
  },
  tabLabel: { fontSize: 14, color: "#5F5E5A" },
  tabLabelActive: { color: "#1D9E75", fontWeight: "600" },
});
