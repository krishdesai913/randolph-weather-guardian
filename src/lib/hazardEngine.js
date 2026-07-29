/**
 * hazardEngine.js
 *
 * Pure logic for comparing live weather conditions against each hazard
 * spot's confirmed trigger threshold. No API calls, no React, no I/O -
 * this file is intentionally side-effect free so it's easy to unit test.
 */

const RISK = {
  CLEAR: "clear",
  WATCH: "watch",
  DANGER: "danger",
};

/**
 * Evaluate a single hazard against current conditions.
 *
 * @param {object} hazard - one entry from hazards.json
 * @param {object} conditions - current conditions, shape:
 *   {
 *     rainfallRateInPerHr: number,
 *     tempF: number,
 *     isPrecipitating: boolean,
 *     activeNwsFloodZones: string[]   // zone ids with an active flood watch/warning
 *   }
 * @param {"summer"|"winter"} [season="summer"]
 * @returns {"clear"|"watch"|"danger"}
 */
function evaluateHazard(hazard, conditions, season = "summer") {
  if (!hazard || !conditions) return RISK.CLEAR;

  if (season === "winter" && hazard.winterTrigger) {
    return evaluateWinterTrigger(hazard.winterTrigger, conditions);
  }

  const trigger = hazard.trigger;
  if (!trigger) return RISK.CLEAR;

  if (trigger.kind === "rainfall_rate") {
    return evaluateRainfallTrigger(trigger, conditions);
  }

  if (trigger.kind === "nws_flood_alert") {
    return evaluateNwsFloodTrigger(trigger, conditions);
  }

  return RISK.CLEAR;
}

function evaluateRainfallTrigger(trigger, conditions) {
  const rate = conditions.rainfallRateInPerHr ?? 0;
  if (rate >= trigger.value) return RISK.DANGER;
  // "Watch" band: within 30% of the threshold, building toward it.
  if (rate >= trigger.value * 0.7) return RISK.WATCH;
  return RISK.CLEAR;
}

function evaluateNwsFloodTrigger(trigger, conditions) {
  const activeZones = conditions.activeNwsFloodZones || [];
  if (activeZones.includes(trigger.zone)) return RISK.DANGER;
  return RISK.CLEAR;
}

function evaluateWinterTrigger(trigger, conditions) {
  const tempF = conditions.tempF;
  const precipitating = !!conditions.isPrecipitating;
  if (typeof tempF !== "number") return RISK.CLEAR;

  if (tempF <= trigger.maxTempF && (trigger.requiresPrecip ? precipitating : true)) {
    return RISK.DANGER;
  }
  if (tempF <= trigger.maxTempF + 4) {
    return RISK.WATCH;
  }
  return RISK.CLEAR;
}

/**
 * Evaluate every hazard in the database against current conditions.
 * Returns a list of { hazard, risk } in the same order as the input.
 */
function evaluateAllHazards(hazards, conditions, season = "summer") {
  return hazards.map((hazard) => ({
    hazard,
    risk: evaluateHazard(hazard, conditions, season),
  }));
}

/**
 * Build the plain-language alert text for a hazard currently at DANGER risk.
 * Returns null if the hazard isn't at danger level (no alert should fire).
 */
function buildAlertMessage(hazard, risk) {
  if (risk !== RISK.DANGER) return null;
  return {
    title: "Flood warning",
    body: hazard.alertText,
    suggestedAlternate: hazard.suggestedAlternate || null,
  };
}

module.exports = {
  RISK,
  evaluateHazard,
  evaluateAllHazards,
  buildAlertMessage,
};
