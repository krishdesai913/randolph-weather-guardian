/**
 * Integration test: confirms real hazard data + the evaluation engine
 * produce correct, rendered output on the Hazard Map screen - i.e. the
 * full pipeline (data -> logic -> UI), not just one function in isolation.
 */
import React from "react";
import { render, screen } from "@testing-library/react-native";

import hazards from "../../src/data/hazards.json";
import { evaluateAllHazards } from "../../src/lib/hazardEngine";
import HazardMapScreen from "../../src/screens/HazardMapScreen";

describe("Hazard data -> engine -> HazardMapScreen integration", () => {
  test("flags the Sussex Turnpike spot as danger during heavy rain, and shows it in the UI", () => {
    const hazardResults = evaluateAllHazards(hazards, {
      rainfallRateInPerHr: 1.2,
      activeNwsFloodZones: [],
    });

    render(<HazardMapScreen hazardResults={hazardResults} />);

    const sussexCard = screen.getByTestId("hazard-card-sussex-tpke-rt10");
    expect(sussexCard).toBeTruthy();
    expect(screen.getByText("Flooded now \u2014 avoid")).toBeTruthy();
  });

  test("shows all spots as clear when there is no rain and no active NWS flood alerts", () => {
    const hazardResults = evaluateAllHazards(hazards, {
      rainfallRateInPerHr: 0,
      activeNwsFloodZones: [],
    });

    render(<HazardMapScreen hazardResults={hazardResults} />);

    // All three confirmed hazard spots should read "Clear".
    const clearLabels = screen.getAllByText("Clear");
    expect(clearLabels).toHaveLength(hazards.length);
  });

  test("flags Franklin Road specifically when its NWS zone has an active flood alert", () => {
    const hazardResults = evaluateAllHazards(hazards, {
      rainfallRateInPerHr: 0,
      activeNwsFloodZones: ["NJZ014"],
    });

    render(<HazardMapScreen hazardResults={hazardResults} />);

    const franklinCard = screen.getByTestId("hazard-card-franklin-rd-denville-border");
    expect(franklinCard).toBeTruthy();

    // The two Route 10 spots (rainfall-based) should remain clear since there's no rain.
    const clearLabels = screen.getAllByText("Clear");
    expect(clearLabels).toHaveLength(2);
  });
});
