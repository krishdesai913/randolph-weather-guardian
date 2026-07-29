# Randolph Weather Guardian

A weather safety app built specifically for Randolph, New Jersey. It goes beyond a standard
forecast by using real, official data from the Township Engineer and the Office of Emergency
Management to warn residents before specific, known local hazards — like flooding and icy
roads — become dangerous. The app is designed with accessibility as a core principle, so it's
genuinely usable by everyone, including elderly residents and people with disabilities.

Built for the [Congressional App Challenge](https://www.congressionalappchallenge.us/).

## The core idea

Most weather apps show the same generic forecast to everyone in a wide area, but real danger
is often hyperlocal — one street floods every time it rains hard, while the rest of town is
fine. This app is built on three confirmed hazard zones in Randolph, sourced directly from the
Township Engineer and OEM Director:

| Spot | Trigger |
|---|---|
| Sussex Turnpike under Route 10 | Rainfall ≥ 1 in/hr |
| Route 10 westbound, Center Grove Rd to Jennifer Ave | Rainfall ≥ 1 in/hr |
| Franklin Road near the Denville border | Active NWS flood alert (tied to sustained rain + upstream dam releases) |

See `src/data/hazards.json` for the full data, including sources and notes.

## Features

- **Core weather** — current conditions, forecast, NWS severe alerts
- **Hyperlocal hazard alerts** — the three spots above, evaluated live against real thresholds
- **Accessibility layer** — larger text, high contrast, plain-language alerts, voice readout,
  "check on a neighbor" reminders
- **Winter layer** — the same hazard spots flagged for icy conditions using temperature and
  precipitation data

See `Randolph_Weather_Guardian_Workflow.docx` (in this repo) for the full feature writeup and
build workflow.

## Getting started

```bash
# Install dependencies
npm install

# Copy the environment template and add your API key
cp .env.example .env
# then edit .env and add a free OpenWeatherMap key: https://openweathermap.org/api

# Start the app (scan the QR code with Expo Go on your phone)
npm start
```

## Project structure

```
App.js                          Root component, tab navigation, data loading
src/data/hazards.json           The confirmed hazard database
src/lib/hazardEngine.js         Pure logic: compares conditions against thresholds
src/lib/plainLanguage.js        Converts raw numbers into plain-language guidance
src/lib/weatherApi.js           OpenWeatherMap + NWS API client
src/screens/                    TodayScreen, HazardMapScreen, AccessibilityScreen
__tests__/unit/                 Unit tests for the pure logic (hazardEngine, plainLanguage, weatherApi)
__tests__/integration/          Integration tests: data → engine → rendered screen
```

## Running tests

```bash
npm test                # run everything
npm run test:unit       # unit tests only
npm run test:integration # integration tests only
npm run test:coverage   # full suite with a coverage report
```

Tests also run automatically on every push via GitHub Actions (`.github/workflows/test.yml`).

## Data sources

- **Weather / forecast:** [OpenWeatherMap](https://openweathermap.org/api) (free tier, API key required)
- **Severe weather alerts:** [National Weather Service API](https://api.weather.gov) (free, no key required)
- **Hazard thresholds:** confirmed directly by Randolph Township's Engineer and OEM Director

## Roadmap

- Winter icy-road layer (built on the same hazard architecture)
- Grounded weather assistant — a narrow chatbot that answers questions using only the app's own
  live data
- "Report a hazard" community submission
- Two-way hazard data sharing with Randolph via the [Waze Connected Citizens Program](https://www.waze.com/ccp) — see the "Future roadmap" section of the project doc

## Acknowledgments

Hazard data confirmed by Randolph Township's Engineer and Office of Emergency Management
Director. Thank you for the research support.
