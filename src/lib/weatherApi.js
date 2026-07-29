/**
 * weatherApi.js
 *
 * Thin wrapper around the external weather data sources. Every function
 * returns a plain JS object so it can be swapped for test fixtures
 * without touching any UI code. Real API keys are read from environment
 * variables - see .env.example.
 */

const OPEN_WEATHER_BASE = "https://api.openweathermap.org/data/2.5";
const NWS_BASE = "https://api.weather.gov";

async function fetchCurrentConditions(lat, lng, apiKey, fetchImpl = fetch) {
  const url = `${OPEN_WEATHER_BASE}/weather?lat=${lat}&lon=${lng}&units=imperial&appid=${apiKey}`;
  const res = await fetchImpl(url);
  if (!res.ok) {
    throw new Error(`OpenWeatherMap request failed: ${res.status}`);
  }
  const data = await res.json();

  return {
    tempF: data.main?.temp,
    feelsLikeF: data.main?.feels_like,
    humidity: data.main?.humidity,
    windMph: data.wind?.speed,
    condition: data.weather?.[0]?.main,
    // OpenWeatherMap's "rain.1h" gives mm in the last hour; convert to in/hr.
    rainfallRateInPerHr: data.rain?.["1h"] ? data.rain["1h"] / 25.4 : 0,
    isPrecipitating: Boolean(data.rain || data.snow),
  };
}

async function fetchForecast(lat, lng, apiKey, fetchImpl = fetch) {
  const url = `${OPEN_WEATHER_BASE}/forecast?lat=${lat}&lon=${lng}&units=imperial&appid=${apiKey}`;
  const res = await fetchImpl(url);
  if (!res.ok) {
    throw new Error(`OpenWeatherMap forecast request failed: ${res.status}`);
  }
  const data = await res.json();
  return (data.list || []).map((entry) => ({
    time: entry.dt_txt,
    tempF: entry.main?.temp,
    condition: entry.weather?.[0]?.main,
  }));
}

async function fetchActiveNwsFloodZones(zoneIds, fetchImpl = fetch) {
  const active = [];
  for (const zone of zoneIds) {
    const url = `${NWS_BASE}/alerts/active?zone=${zone}`;
    const res = await fetchImpl(url);
    if (!res.ok) continue;
    const data = await res.json();
    const hasFloodAlert = (data.features || []).some((f) =>
      /flood/i.test(f.properties?.event || "")
    );
    if (hasFloodAlert) active.push(zone);
  }
  return active;
}

module.exports = { fetchCurrentConditions, fetchForecast, fetchActiveNwsFloodZones };
