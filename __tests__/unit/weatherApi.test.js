const {
  fetchCurrentConditions,
  fetchForecast,
  fetchActiveNwsFloodZones,
} = require("../../src/lib/weatherApi");

function mockFetch(responseBody, ok = true, status = 200) {
  return jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => responseBody,
  });
}

describe("fetchCurrentConditions", () => {
  test("converts OpenWeatherMap response into the app's condition shape", async () => {
    const fakeFetch = mockFetch({
      main: { temp: 74, feels_like: 73, humidity: 55 },
      wind: { speed: 6 },
      weather: [{ main: "Clear" }],
      rain: { "1h": 25.4 }, // 25.4mm = 1 in
    });

    const result = await fetchCurrentConditions(40.84, -74.58, "fake-key", fakeFetch);

    expect(result.tempF).toBe(74);
    expect(result.condition).toBe("Clear");
    expect(result.rainfallRateInPerHr).toBeCloseTo(1.0, 5);
    expect(result.isPrecipitating).toBe(true);
  });

  test("defaults rainfallRateInPerHr to 0 when there is no rain data", async () => {
    const fakeFetch = mockFetch({
      main: { temp: 60 },
      weather: [{ main: "Clouds" }],
    });

    const result = await fetchCurrentConditions(40.84, -74.58, "fake-key", fakeFetch);
    expect(result.rainfallRateInPerHr).toBe(0);
    expect(result.isPrecipitating).toBe(false);
  });

  test("throws a descriptive error when the request fails", async () => {
    const fakeFetch = mockFetch({}, false, 401);
    await expect(
      fetchCurrentConditions(40.84, -74.58, "bad-key", fakeFetch)
    ).rejects.toThrow("OpenWeatherMap request failed: 401");
  });
});

describe("fetchForecast", () => {
  test("maps forecast list entries into a simplified shape", async () => {
    const fakeFetch = mockFetch({
      list: [
        { dt_txt: "2026-08-01 12:00:00", main: { temp: 80 }, weather: [{ main: "Sunny" }] },
        { dt_txt: "2026-08-02 12:00:00", main: { temp: 75 }, weather: [{ main: "Rain" }] },
      ],
    });

    const result = await fetchForecast(40.84, -74.58, "fake-key", fakeFetch);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ time: "2026-08-01 12:00:00", tempF: 80, condition: "Sunny" });
  });

  test("returns an empty array when the response has no list", async () => {
    const fakeFetch = mockFetch({});
    const result = await fetchForecast(40.84, -74.58, "fake-key", fakeFetch);
    expect(result).toEqual([]);
  });
});

describe("fetchActiveNwsFloodZones", () => {
  test("returns zones that have an active flood-related alert", async () => {
    const fakeFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [{ properties: { event: "Flood Warning" } }],
      }),
    });

    const result = await fetchActiveNwsFloodZones(["NJZ014"], fakeFetch);
    expect(result).toEqual(["NJZ014"]);
  });

  test("excludes zones with no active flood alert", async () => {
    const fakeFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ features: [] }),
    });

    const result = await fetchActiveNwsFloodZones(["NJZ014"], fakeFetch);
    expect(result).toEqual([]);
  });

  test("skips zones whose request fails, without throwing", async () => {
    const fakeFetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
    const result = await fetchActiveNwsFloodZones(["NJZ014"], fakeFetch);
    expect(result).toEqual([]);
  });
});
