import type { Container, Sprite } from "pixi.js";

export interface GameLayoutTargets {
  background: Sprite;
  cauldron: Container;
  ingredients: Container;
  recipePanel: Container;
  scorePanel: Container;
  comboPanel: Container;
  timerPanel: Container;
}
