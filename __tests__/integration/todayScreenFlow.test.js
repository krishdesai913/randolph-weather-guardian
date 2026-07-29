import React from "react";
import { render, screen } from "@testing-library/react-native";

import hazards from "../../src/data/hazards.json";
import { evaluateAllHazards } from "../../src/lib/hazardEngine";
import TodayScreen from "../../src/screens/TodayScreen";

describe("Conditions + hazards -> TodayScreen integration", () => {
  test("shows the plain-language hazard-count message when a spot is in danger", () => {
    const conditions = { tempF: 71, rainfallRateInPerHr: 1.5, isPrecipitating: true };
    const hazardResults = evaluateAllHazards(hazards, {
      rainfallRateInPerHr: conditions.rainfallRateInPerHr,
      activeNwsFloodZones: [],
    });

    render(
      <TodayScreen conditions={conditions} forecast={[]} hazardResults={hazardResults} />
    );

    expect(screen.getByTestId("today-temp")).toHaveTextContent("71\u00B0F");
    expect(screen.getByTestId("today-summary").props.children).toMatch(/hazard spot/);
  });

  test("shows the 'all clear' banner and neutral summary when nothing is flagged", () => {
    const conditions = { tempF: 72, rainfallRateInPerHr: 0, isPrecipitating: false };
    const hazardResults = evaluateAllHazards(hazards, {
      rainfallRateInPerHr: 0,
      activeNwsFloodZones: [],
    });

    render(
      <TodayScreen conditions={conditions} forecast={[]} hazardResults={hazardResults} />
    );

    expect(screen.getByText("All known hazard spots clear")).toBeTruthy();
  });

  test("applies the larger text scale to the temperature display", () => {
    const conditions = { tempF: 72 };
    const hazardResults = evaluateAllHazards(hazards, { rainfallRateInPerHr: 0 });

    render(
      <TodayScreen
        conditions={conditions}
        forecast={[]}
        hazardResults={hazardResults}
        textScale={1.25}
      />
    );

    const tempNode = screen.getByTestId("today-temp");
    const flattenedStyle = [].concat(tempNode.props.style).reduce((a, b) => ({ ...a, ...b }), {});
    expect(flattenedStyle.fontSize).toBe(50); // 40 * 1.25
  });
});
