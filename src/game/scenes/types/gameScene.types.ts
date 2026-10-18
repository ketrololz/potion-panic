import type { Container } from "pixi.js";

export interface GameScene {
  view: Container;
  update: (deltaMs: number) => void;
}
