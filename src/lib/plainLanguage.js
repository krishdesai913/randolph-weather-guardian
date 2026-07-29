/**
 * plainLanguage.js
 *
 * Converts raw weather numbers into short, plain-language guidance.
 * Kept separate from UI code so it can be unit tested directly and
 * reused by both the on-screen summary and the voice readout.
 */

function summarizeToday({ tempF, condition, activeAlertCount }) {
  if (typeof tempF !== "number") {
    return "Weather data isn't available right now.";
  }

  if (activeAlertCount > 0) {
    return `It's ${Math.round(tempF)}\u00B0F. ${activeAlertCount} hazard spot${
      activeAlertCount > 1 ? "s are" : " is"
    } flagged right now \u2014 check the hazard map before heading out.`;
  }

  if (tempF >= 90) {
    return `It's ${Math.round(tempF)}\u00B0F and dangerously hot. Stay inside during the afternoon if you can.`;
  }
  if (tempF <= 20) {
    return `It's ${Math.round(tempF)}\u00B0F and dangerously cold. Limit time outside and dress warmly.`;
  }

  return `It's ${Math.round(tempF)}\u00B0F. A good day to be outside.`;
}

function summarizeWindChill(windChillF) {
  if (typeof windChillF !== "number") return null;
  if (windChillF <= -15) {
    return "Frostbite risk is high. Avoid going outside if possible.";
  }
  if (windChillF <= 0) {
    return "Dangerously cold. Limit time outside and cover exposed skin.";
  }
  if (windChillF <= 20) {
    return "Cold enough that a warm coat is a good idea.";
  }
  return null;
}

module.exports = { summarizeToday, summarizeWindChill };
