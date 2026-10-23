import type { Container } from "pixi.js";

export interface Scene {
  view: Container;
  update?: (deltaMs: number) => void;
  destroy: () => void;
}

export interface GameSceneOptions {
  onExit: () => void;
}
