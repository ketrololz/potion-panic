import { Text } from "pixi.js";
import { TIMER_STYLE } from "./constants/layout.constants";

export function createTimerPanel(initialTimeMs: number) {
  const view = new Text({
    text: "",
    style: TIMER_STYLE,
  });

  view.anchor.set(0.5);
  view.eventMode = "none";

  let currentSeconds: number | undefined;

  function setTime(remainingMs: number) {
    const seconds = Math.max(0, Math.ceil(remainingMs / 1000));

    if (seconds === currentSeconds) {
      return;
    }

    currentSeconds = seconds;

    const minutesPart = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secondsPart = String(seconds % 60).padStart(2, "0");

    view.text = `${minutesPart}:${secondsPart}`;
  }

  setTime(initialTimeMs);

  return { view, setTime };
}
