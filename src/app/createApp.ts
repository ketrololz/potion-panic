import { Application } from "pixi.js";
import type { Container, Ticker } from "pixi.js";
import { createGameScene } from "../game/scenes/createGameScene";

import { fitScene } from "../game/layout/fitScene";
import { createDebugOverlay } from "../game/debug/createDebugOverlay";
import { createSceneManager } from "./createSceneManager";
import { createMenuScene } from "../game/scenes/createMenuScene";

export async function createApp(root: HTMLElement) {
  const app = new Application();

  await app.init({
    resizeTo: root,
    background: "#160d20",
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  });

  root.appendChild(app.canvas);

  let activeView: Container | undefined;
  let destroyDebug: (() => void) | undefined;

  function resize() {
    if (!activeView) return;

    fitScene(activeView, app.screen.width, app.screen.height);
  }

  const sceneManager = createSceneManager(app.stage, (scene) => {
    destroyDebug?.();
    destroyDebug = undefined;

    activeView = scene.view;

    resize();

    if (import.meta.env.DEV) {
      const targets = scene.view.children.filter(
        (child) => child.label !== "debug_hide",
      );

      destroyDebug = createDebugOverlay(app, targets);
    }
  });

  function showGame() {
    sceneManager.show(createGameScene).catch(console.error);
  }

  function update(ticker: Ticker) {
    sceneManager.update(ticker.deltaMS);
  }

  await sceneManager.show(() => createMenuScene(showGame));

  app.ticker.add(update);
  app.renderer.on("resize", resize);

  return {
    destroy() {
      destroyDebug?.();

      app.ticker.remove(update);
      app.renderer.off("resize", resize);

      sceneManager.destroy();

      app.destroy(true, { children: true });
    },
  };
}
