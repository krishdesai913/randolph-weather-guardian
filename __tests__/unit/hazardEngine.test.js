const {
  RISK,
  evaluateHazard,
  evaluateAllHazards,
  buildAlertMessage,
} = require("../../src/lib/hazardEngine");
const hazards = require("../../src/data/hazards.json");

const rainfallHazard = hazards.find((h) => h.id === "sussex-tpke-rt10");
const nwsHazard = hazards.find((h) => h.id === "franklin-rd-denville-border");

describe("evaluateHazard - rainfall_rate trigger", () => {
  test("returns DANGER when rainfall meets the confirmed threshold (1 in/hr)", () => {
    const risk = evaluateHazard(rainfallHazard, { rainfallRateInPerHr: 1.0 });
    expect(risk).toBe(RISK.DANGER);
  });

  test("returns DANGER when rainfall exceeds the threshold", () => {
    const risk = evaluateHazard(rainfallHazard, { rainfallRateInPerHr: 2.4 });
    expect(risk).toBe(RISK.DANGER);
  });

  test("returns WATCH when rainfall is building toward the threshold", () => {
    const risk = evaluateHazard(rainfallHazard, { rainfallRateInPerHr: 0.75 });
    expect(risk).toBe(RISK.WATCH);
  });

  test("returns CLEAR when rainfall is well below the threshold", () => {
    const risk = evaluateHazard(rainfallHazard, { rainfallRateInPerHr: 0.1 });
    expect(risk).toBe(RISK.CLEAR);
  });

  test("returns CLEAR when there is no rainfall data", () => {
    const risk = evaluateHazard(rainfallHazard, {});
    expect(risk).toBe(RISK.CLEAR);
  });
});

describe("evaluateHazard - nws_flood_alert trigger (Franklin Road)", () => {
  test("returns DANGER when the hazard's zone has an active NWS flood alert", () => {
    const risk = evaluateHazard(nwsHazard, { activeNwsFloodZones: ["NJZ014"] });
    expect(risk).toBe(RISK.DANGER);
  });

  test("returns CLEAR when no flood alert is active for the zone", () => {
    const risk = evaluateHazard(nwsHazard, { activeNwsFloodZones: [] });
    expect(risk).toBe(RISK.CLEAR);
  });

  test("returns CLEAR when a different zone has an alert", () => {
    const risk = evaluateHazard(nwsHazard, { activeNwsFloodZones: ["NJZ099"] });
    expect(risk).toBe(RISK.CLEAR);
  });
});

describe("evaluateHazard - winter trigger", () => {
  test("returns DANGER when temp is at/below freezing and precipitating", () => {
    const risk = evaluateHazard(
      rainfallHazard,
      { tempF: 30, isPrecipitating: true },
      "winter"
    );
    expect(risk).toBe(RISK.DANGER);
  });

  test("returns CLEAR when temp is below freezing but not precipitating", () => {
    const risk = evaluateHazard(
      rainfallHazard,
      { tempF: 28, isPrecipitating: false },
      "winter"
    );
    expect(risk).toBe(RISK.CLEAR);
  });

  test("returns WATCH when temp is just above freezing", () => {
    const risk = evaluateHazard(
      rainfallHazard,
      { tempF: 34, isPrecipitating: true },
      "winter"
    );
    expect(risk).toBe(RISK.WATCH);
  });
});

describe("evaluateHazard - edge cases", () => {
  test("returns CLEAR for a null hazard", () => {
    expect(evaluateHazard(null, { rainfallRateInPerHr: 5 })).toBe(RISK.CLEAR);
  });

  test("returns CLEAR for null conditions", () => {
    expect(evaluateHazard(rainfallHazard, null)).toBe(RISK.CLEAR);
  });
});

describe("evaluateAllHazards", () => {
  test("evaluates every hazard in the database and preserves order", () => {
    const results = evaluateAllHazards(hazards, {
      rainfallRateInPerHr: 1.5,
      activeNwsFloodZones: [],
    });
    expect(results).toHaveLength(hazards.length);
    expect(results[0].hazard.id).toBe(hazards[0].id);
    // Both Rt 10 spots share the 1 in/hr threshold, so both should be DANGER.
    expect(results[0].risk).toBe(RISK.DANGER);
    expect(results[1].risk).toBe(RISK.DANGER);
  });
});

describe("buildAlertMessage", () => {
  test("returns null when risk is not DANGER", () => {
    expect(buildAlertMessage(rainfallHazard, RISK.CLEAR)).toBeNull();
    expect(buildAlertMessage(rainfallHazard, RISK.WATCH)).toBeNull();
  });

  test("returns a plain-language alert with a suggested alternate when DANGER", () => {
    const msg = buildAlertMessage(rainfallHazard, RISK.DANGER);
    expect(msg).not.toBeNull();
    expect(msg.title).toBe("Flood warning");
    expect(msg.body).toBe(rainfallHazard.alertText);
    expect(msg.suggestedAlternate).toBe("Center Grove Road");
  });
});
