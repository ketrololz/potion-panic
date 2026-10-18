import { Text } from "pixi.js";
import { SCORE_LAYOUT } from "./constants/layout.constants";

export function createScorePanel(initialScore: number) {
  const view = new Text({
    text: String(initialScore),
    style: SCORE_LAYOUT,
  });

  view.anchor.set(0.5);

  function setScore(score: number) {
    view.text = String(score);
  }

  return {
    view,
    setScore,
  };
}
