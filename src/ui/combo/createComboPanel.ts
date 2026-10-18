import { Text } from "pixi.js";
import { COMBO_STYLE } from "./constants/layout.constants";

export function createComboPanel(initialCombo: number) {
  const view = new Text({
    text: "",
    style: COMBO_STYLE,
  });

  view.anchor.set(0.5);
  view.eventMode = "none";

  function setCombo(combo: number) {
    view.text = `КОМБО х${combo}`;
    view.visible = combo > 0;
  }

  setCombo(initialCombo);

  return {
    view,
    setCombo,
  };
}
