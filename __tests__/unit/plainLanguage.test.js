const { summarizeToday, summarizeWindChill } = require("../../src/lib/plainLanguage");

describe("summarizeToday", () => {
  test("mentions hazard count when alerts are active", () => {
    const text = summarizeToday({ tempF: 68, activeAlertCount: 2 });
    expect(text).toMatch(/2 hazard spots are flagged/);
  });

  test("uses singular phrasing for exactly one active hazard", () => {
    const text = summarizeToday({ tempF: 68, activeAlertCount: 1 });
    expect(text).toMatch(/1 hazard spot is flagged/);
  });

  test("warns about heat when very hot and no hazards active", () => {
    const text = summarizeToday({ tempF: 95, activeAlertCount: 0 });
    expect(text).toMatch(/dangerously hot/);
  });

  test("warns about cold when very cold and no hazards active", () => {
    const text = summarizeToday({ tempF: 10, activeAlertCount: 0 });
    expect(text).toMatch(/dangerously cold/);
  });

  test("gives a neutral message for mild, hazard-free weather", () => {
    const text = summarizeToday({ tempF: 72, activeAlertCount: 0 });
    expect(text).toMatch(/good day to be outside/);
  });

  test("handles missing temperature gracefully", () => {
    const text = summarizeToday({ activeAlertCount: 0 });
    expect(text).toMatch(/isn't available/);
  });
});

describe("summarizeWindChill", () => {
  test("returns a frostbite warning for extreme cold", () => {
    expect(summarizeWindChill(-20)).toMatch(/Frostbite risk is high/);
  });

  test("returns a general cold warning for freezing wind chill", () => {
    expect(summarizeWindChill(-5)).toMatch(/Dangerously cold/);
  });

  test("returns a mild-cold note for chilly but not dangerous wind chill", () => {
    expect(summarizeWindChill(15)).toMatch(/warm coat/);
  });

  test("returns null when wind chill isn't a concern", () => {
    expect(summarizeWindChill(45)).toBeNull();
  });

  test("returns null when wind chill value is missing", () => {
    expect(summarizeWindChill(undefined)).toBeNull();
  });
});
