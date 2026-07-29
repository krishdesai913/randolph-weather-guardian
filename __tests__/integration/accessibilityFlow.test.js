import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import AccessibilityScreen from "../../src/screens/AccessibilityScreen";

// A tiny wrapper so the test exercises real state flow, not just a stubbed
// callback - closer to how App.js actually wires settings up.
function Wrapper() {
  const [settings, setSettings] = useState({
    largerText: false,
    highContrast: false,
    voiceReadout: true,
    neighborReminders: true,
  });
  function onChange(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }
  return <AccessibilityScreen settings={settings} onChange={onChange} />;
}

describe("Accessibility settings toggle flow", () => {
  test("toggling 'Larger text' flips its switch value", () => {
    render(<Wrapper />);
    const largerTextSwitch = screen.getByTestId("setting-switch-largerText");
    expect(largerTextSwitch.props.value).toBe(false);

    fireEvent(largerTextSwitch, "valueChange", true);

    expect(screen.getByTestId("setting-switch-largerText").props.value).toBe(true);
  });

  test("voice readout and neighbor reminders default to on", () => {
    render(<Wrapper />);
    expect(screen.getByTestId("setting-switch-voiceReadout").props.value).toBe(true);
    expect(screen.getByTestId("setting-switch-neighborReminders").props.value).toBe(true);
  });
});
