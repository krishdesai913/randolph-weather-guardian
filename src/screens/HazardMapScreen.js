import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const RISK_STYLES = {
  danger: { bg: "#FCEBEB", text: "#791F1F", label: "Flooded now \u2014 avoid" },
  watch: { bg: "#FAEEDA", text: "#633806", label: "Watch \u2014 conditions building" },
  clear: { bg: "#EAF3DE", text: "#27500A", label: "Clear" },
};

export default function HazardMapScreen({ hazardResults }) {
  return (
    <View style={styles.container} testID="hazard-map-screen">
      <Text style={styles.title}>Hazard spots</Text>
      <FlatList
        data={hazardResults}
        keyExtractor={(item) => item.hazard.id}
        renderItem={({ item }) => {
          const style = RISK_STYLES[item.risk] || RISK_STYLES.clear;
          return (
            <View
              style={[styles.card, { backgroundColor: style.bg }]}
              testID={`hazard-card-${item.hazard.id}`}
            >
              <Text style={[styles.cardName, { color: style.text }]}>{item.hazard.name}</Text>
              <Text style={[styles.cardStatus, { color: style.text }]}>{style.label}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFFFFF" },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 14, color: "#111111" },
  card: { borderRadius: 8, padding: 13, marginBottom: 10 },
  cardName: { fontSize: 13, fontWeight: "600" },
  cardStatus: { fontSize: 12, marginTop: 3 },
});
